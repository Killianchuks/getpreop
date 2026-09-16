import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { buildTestEmailContent } from "@/lib/email-templates";

export type EmailCategory = "VERIFICATION_CODE" | "PATIENT_UPLOAD" | "BD_OUTREACH" | "TEST" | "NOTIFICATION" | "GENERAL";

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  category: EmailCategory;
  metadata?: Record<string, unknown>;
  replyTo?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface SendEmailResult {
  success: boolean;
  logId: string;
  provider: "mailersend" | "smtp" | "mock" | "none";
  providerMessageId: string | null;
  status: "SENT" | "QUEUED" | "FAILED";
  error?: string;
  developmentCode?: string;
}

export interface BulkSendItem {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  category: EmailCategory;
  metadata?: Record<string, unknown>;
  replyTo?: string;
  fromName?: string;
  fromEmail?: string;
  bdMessageId?: string;
  contactId?: string;
}

function getCleanEnv(key: string, fallback = ""): string {
  const val = process.env[key];
  if (!val) return fallback;
  return val.replace(/\\n/g, "").replace(/[\r\n]+/g, "").trim() || fallback;
}

function hasSmtpConfiguration() {
  return Boolean(
    getCleanEnv("SMTP_HOST")
      && getCleanEnv("SMTP_PORT")
      && getCleanEnv("SMTP_USER")
      && getCleanEnv("SMTP_PASS")
      && getCleanEnv("SMTP_FROM"),
  );
}

/**
 * Standard RFC 8058 and Anti-Spam headers to ensure highest inbox delivery rates.
 */
function buildDeliverabilityHeaders(recipientEmail: string, logId: string) {
  const appUrl = getCleanEnv("NEXT_PUBLIC_APP_URL", "https://www.getpreop.com");
  const unsubscribeUrl = `${appUrl}/api/email/unsubscribe?email=${encodeURIComponent(recipientEmail)}&id=${logId}`;
  return {
    "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@getpreop.com?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    "Feedback-ID": "getpreop:transactional:v1",
    "X-Entity-Ref-ID": logId,
    "X-Auto-Response-Suppress": "OOF, AutoReply",
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends an email with deliverability optimizations, anti-spam headers, rate-limit retry backoff, and persistent tracking in EmailLog.
 */
export async function sendDeliverableEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const to = options.to.trim().toLowerCase();
  const fromEmail = options.fromEmail?.trim() || getCleanEnv("MAILERSEND_FROM_EMAIL", "contact@getpreop.com");
  const fromName = options.fromName?.trim() || getCleanEnv("MAILERSEND_FROM_NAME", "GetPreOp");
  const replyTo = options.replyTo?.trim() || getCleanEnv("MAILERSEND_REPLY_TO_EMAIL", "support@getpreop.com");
  const apiKey = getCleanEnv("MAILERSEND_API_KEY");

  let lastError: string | null = null;

  // 1. Initial DB Log record creation
  let logId = "";
  try {
    const logRecord = await prisma.emailLog.create({
      data: {
        recipientEmail: to,
        recipientName: options.toName || null,
        subject: options.subject,
        category: options.category,
        provider: apiKey ? "mailersend" : hasSmtpConfiguration() ? "smtp" : "mock",
        status: "SENDING",
        bodyText: options.text,
        bodyHtml: options.html,
        metadata: options.metadata ? (options.metadata as object) : undefined,
      },
    });
    logId = logRecord.id;
  } catch (dbErr) {
    console.error("Failed to initialize EmailLog in DB:", dbErr);
    logId = `fallback_${Date.now()}`;
  }

  // Inject tracking pixel into HTML body if not already present
  let processedHtml = options.html;
  if (logId && !logId.startsWith("fallback_")) {
    const appUrl = getCleanEnv("NEXT_PUBLIC_APP_URL", "https://www.getpreop.com");
    const trackingPixel = `<img src="${appUrl}/api/email/track-open?id=${logId}" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin:0!important;padding:0!important;display:block;" />`;
    if (!processedHtml.includes("/api/email/track-open")) {
      processedHtml = processedHtml.includes("</body>")
        ? processedHtml.replace("</body>", `${trackingPixel}</body>`)
        : `${processedHtml}${trackingPixel}`;
    }

    // Update the stored HTML with the tracking pixel
    await prisma.emailLog.update({
      where: { id: logId },
      data: { bodyHtml: processedHtml },
    }).catch(() => {});
  }

  const deliverabilityHeaders = buildDeliverabilityHeaders(to, logId);

  // 2. Primary Provider: MailerSend REST API with rate-limit retry & backoff
  if (apiKey) {
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        const response = await fetch("https://api.mailersend.com/v1/email", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            from: {
              email: fromEmail,
              name: fromName,
            },
            to: [
              {
                email: to,
                name: options.toName || to,
              },
            ],
            reply_to: {
              email: replyTo,
              name: fromName,
            },
            subject: options.subject,
            text: options.text,
            html: processedHtml,
            tags: [options.category.toLowerCase().replace(/_/g, "-")],
          }),
        });

        const responseText = await response.text();
        let responseJson: Record<string, unknown> = {};
        try {
          if (responseText) responseJson = JSON.parse(responseText);
        } catch {
          // non-json response body
        }

        const headerMessageId = response.headers.get("x-message-id");
        const providerMessageId = headerMessageId || (typeof responseJson.message_id === "string" ? responseJson.message_id : `ms_${Date.now()}`);

        if (response.ok || response.status === 202) {
          success = true;
          if (logId && !logId.startsWith("fallback_")) {
            await prisma.emailLog.update({
              where: { id: logId },
              data: {
                status: "SENT",
                providerMessageId,
                sentAt: new Date(),
                errorMessage: null,
              },
            });
          }
          return {
            success: true,
            logId,
            provider: "mailersend",
            providerMessageId,
            status: "SENT",
          };
        }

        // If rate-limited (HTTP 429), back off and retry
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get("retry-after");
          const waitTime = retryAfterHeader ? Number(retryAfterHeader) * 1000 : attempt * 1200;
          console.warn(`MailerSend rate-limited (429). Backing off for ${waitTime}ms before retry ${attempt}/${maxRetries}...`);
          await sleep(waitTime);
          continue;
        }

        // Other HTTP error
        lastError = `MailerSend API error (${response.status}): ${responseText || response.statusText}`;
        console.warn(lastError, "Falling back if available.");
        break;
      } catch (apiError: unknown) {
        lastError = apiError instanceof Error ? apiError.message : "MailerSend network request error";
        console.error("MailerSend request exception:", apiError);
        await sleep(attempt * 1000);
      }
    }

    if (!success && logId && !logId.startsWith("fallback_")) {
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: "FAILED",
          errorMessage: lastError,
        },
      });
    }
  }

  // 3. Secondary Provider: SMTP (Nodemailer)
  if (hasSmtpConfiguration()) {
    try {
      const transporter = nodemailer.createTransport({
        host: getCleanEnv("SMTP_HOST"),
        port: Number(getCleanEnv("SMTP_PORT")),
        secure: getCleanEnv("SMTP_SECURE") === "true",
        auth: {
          user: getCleanEnv("SMTP_USER"),
          pass: getCleanEnv("SMTP_PASS"),
        },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${getCleanEnv("SMTP_FROM", fromEmail)}>`,
        to: options.toName ? `"${options.toName}" <${to}>` : to,
        replyTo: `"${fromName}" <${replyTo}>`,
        subject: options.subject,
        text: options.text,
        html: options.html,
        headers: deliverabilityHeaders,
      });

      const providerMessageId = info.messageId || `smtp_${Date.now()}`;

      if (logId && !logId.startsWith("fallback_")) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            provider: "smtp",
            status: "SENT",
            providerMessageId,
            sentAt: new Date(),
            errorMessage: null,
          },
        });
      }

      return {
        success: true,
        logId,
        provider: "smtp",
        providerMessageId,
        status: "SENT",
      };
    } catch (smtpErr: unknown) {
      const errorMsg = smtpErr instanceof Error ? smtpErr.message : "SMTP sending failed";
      lastError = `SMTP error: ${errorMsg}`;
      console.error("SMTP error:", smtpErr);
      if (logId && !logId.startsWith("fallback_")) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: "FAILED",
            errorMessage: lastError,
          },
        });
      }
      return {
        success: false,
        logId,
        provider: "smtp",
        providerMessageId: null,
        status: "FAILED",
        error: lastError,
      };
    }
  }

  // 4. Non-production / Simulated Development Mode
  if (process.env.NODE_ENV !== "production") {
    const mockMessageId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    if (logId && !logId.startsWith("fallback_")) {
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          provider: "mock",
          status: "SENT",
          providerMessageId: mockMessageId,
          sentAt: new Date(),
        },
      });
    }
    return {
      success: true,
      logId,
      provider: "mock",
      providerMessageId: mockMessageId,
      status: "SENT",
    };
  }

  // If in production and no mail provider succeeded:
  const failureMessage = lastError || "No email provider configured or available. Please configure MAILERSEND_API_KEY or SMTP settings.";
  if (logId && !logId.startsWith("fallback_")) {
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: "FAILED",
        errorMessage: failureMessage,
      },
    });
  }

  return {
    success: false,
    logId,
    provider: "none",
    providerMessageId: null,
    status: "FAILED",
    error: failureMessage,
  };
}

/**
 * Sends a live deliverability test email to check SPF, DKIM, and inbox placement.
 */
export async function sendDeliverabilityTestEmail(toEmail: string) {
  const recipientEmail = toEmail.trim().toLowerCase();
  const { html, text } = buildTestEmailContent(recipientEmail);

  return sendDeliverableEmail({
    to: recipientEmail,
    subject: "GetPreOp Email Deliverability & SPF/DKIM Test",
    html,
    text,
    category: "TEST",
    metadata: { testType: "DELIVERABILITY_VERIFICATION", timestamp: new Date().toISOString() },
  });
}

/**
 * Sends a batch of up to 500 emails in a single HTTP request using MailerSend Bulk API (/v1/bulk-email).
 * Bypasses the 10 requests/minute rate limit while ensuring full individual open/click tracking.
 */
export async function sendDeliverableBulkEmails(items: BulkSendItem[]): Promise<{
  sent: number;
  failed: number;
  results: Array<{ email: string; success: boolean; logId: string; error?: string }>;
}> {
  if (!items.length) {
    return { sent: 0, failed: 0, results: [] };
  }

  const apiKey = getCleanEnv("MAILERSEND_API_KEY");
  const defaultFromEmail = getCleanEnv("MAILERSEND_FROM_EMAIL", "contact@getpreop.com");
  const defaultFromName = getCleanEnv("MAILERSEND_FROM_NAME", "GetPreOp");
  const defaultReplyTo = getCleanEnv("MAILERSEND_REPLY_TO_EMAIL", "support@getpreop.com");
  const appUrl = getCleanEnv("NEXT_PUBLIC_APP_URL", "https://www.getpreop.com");

  // 1. Pre-create EmailLog entries in DB so each email gets a tracking pixel and log ID
  const preparedItems: Array<{
    item: BulkSendItem;
    logId: string;
    html: string;
  }> = [];

  for (const item of items) {
    const to = item.to.trim().toLowerCase();
    let logId = "";
    try {
      const logRecord = await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          recipientName: item.toName || null,
          subject: item.subject,
          category: item.category,
          provider: apiKey ? "mailersend" : "mock",
          status: "SENDING",
          bodyText: item.text,
          bodyHtml: item.html,
          metadata: item.metadata ? (item.metadata as object) : undefined,
        },
      });
      logId = logRecord.id;
    } catch {
      logId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }

    // Embed open tracking pixel
    let processedHtml = item.html;
    if (logId && !logId.startsWith("fallback_")) {
      const trackingPixel = `<img src="${appUrl}/api/email/track-open?id=${logId}" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin:0!important;padding:0!important;display:block;" />`;
      if (!processedHtml.includes("/api/email/track-open")) {
        processedHtml = processedHtml.includes("</body>")
          ? processedHtml.replace("</body>", `${trackingPixel}</body>`)
          : `${processedHtml}${trackingPixel}`;
      }

      await prisma.emailLog.update({
        where: { id: logId },
        data: { bodyHtml: processedHtml },
      }).catch(() => {});
    }

    preparedItems.push({ item, logId, html: processedHtml });
  }

  // 2. Build MailerSend /v1/bulk-email payload
  if (apiKey) {
    const bulkPayload = preparedItems.map(({ item, html }) => {
      const to = item.to.trim().toLowerCase();
      const fromEmail = item.fromEmail?.trim() || defaultFromEmail;
      const fromName = item.fromName?.trim() || defaultFromName;
      const replyTo = item.replyTo?.trim() || defaultReplyTo;

      return {
        from: { email: fromEmail, name: fromName },
        to: [{ email: to, name: item.toName || to }],
        reply_to: { email: replyTo, name: fromName },
        subject: item.subject,
        text: item.text,
        html,
        tags: [item.category.toLowerCase().replace(/_/g, "-")],
      };
    });

    try {
      const response = await fetch("https://api.mailersend.com/v1/bulk-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(bulkPayload),
      });

      const responseText = await response.text();
      let responseJson: Record<string, unknown> = {};
      try {
        if (responseText) responseJson = JSON.parse(responseText);
      } catch {
        // non-json response
      }

      const bulkEmailId = typeof responseJson.bulk_email_id === "string" ? responseJson.bulk_email_id : `bulk_${Date.now()}`;

      if (response.ok || response.status === 202) {
        // Mark all prepared items as SENT
        const logIds = preparedItems.map((p) => p.logId).filter((id) => !id.startsWith("fallback_"));
        if (logIds.length > 0) {
          await prisma.emailLog.updateMany({
            where: { id: { in: logIds } },
            data: {
              status: "SENT",
              providerMessageId: bulkEmailId,
              sentAt: new Date(),
              errorMessage: null,
            },
          });
        }

        // Update corresponding BD messages
        const bdIds = preparedItems.map((p) => p.item.bdMessageId).filter((id): id is string => Boolean(id));
        if (bdIds.length > 0) {
          await prisma.businessDevelopmentMessage.updateMany({
            where: { id: { in: bdIds } },
            data: {
              status: "SENT",
              providerMessageId: bulkEmailId,
              sentAt: new Date(),
              errorMessage: null,
            },
          });
        }

        // Update corresponding BD contacts
        const contactIds = preparedItems.map((p) => p.item.contactId).filter((id): id is string => Boolean(id));
        if (contactIds.length > 0) {
          await prisma.businessDevelopmentContact.updateMany({
            where: { id: { in: contactIds } },
            data: {
              status: "CONTACTED",
              lastContactedAt: new Date(),
            },
          });
        }

        return {
          sent: preparedItems.length,
          failed: 0,
          results: preparedItems.map((p) => ({
            email: p.item.to,
            success: true,
            logId: p.logId,
          })),
        };
      }

      // If bulk API failed
      const errorMsg = `Bulk API error (${response.status}): ${responseText || response.statusText}`;
      console.error(errorMsg);

      const logIds = preparedItems.map((p) => p.logId).filter((id) => !id.startsWith("fallback_"));
      if (logIds.length > 0) {
        await prisma.emailLog.updateMany({
          where: { id: { in: logIds } },
          data: { status: "FAILED", errorMessage: errorMsg },
        });
      }

      const bdIds = preparedItems.map((p) => p.item.bdMessageId).filter((id): id is string => Boolean(id));
      if (bdIds.length > 0) {
        await prisma.businessDevelopmentMessage.updateMany({
          where: { id: { in: bdIds } },
          data: { status: "FAILED", errorMessage: errorMsg },
        });
      }

      return {
        sent: 0,
        failed: preparedItems.length,
        results: preparedItems.map((p) => ({
          email: p.item.to,
          success: false,
          logId: p.logId,
          error: errorMsg,
        })),
      };
    } catch (bulkErr: unknown) {
      const errorMsg = bulkErr instanceof Error ? bulkErr.message : "Bulk API network failure";
      console.error("Bulk API exception:", bulkErr);

      const logIds = preparedItems.map((p) => p.logId).filter((id) => !id.startsWith("fallback_"));
      if (logIds.length > 0) {
        await prisma.emailLog.updateMany({
          where: { id: { in: logIds } },
          data: { status: "FAILED", errorMessage: errorMsg },
        });
      }

      return {
        sent: 0,
        failed: preparedItems.length,
        results: preparedItems.map((p) => ({
          email: p.item.to,
          success: false,
          logId: p.logId,
          error: errorMsg,
        })),
      };
    }
  }

  // Non-production fallback
  const logIds = preparedItems.map((p) => p.logId).filter((id) => !id.startsWith("fallback_"));
  if (logIds.length > 0) {
    await prisma.emailLog.updateMany({
      where: { id: { in: logIds } },
      data: {
        status: "SENT",
        provider: "mock",
        providerMessageId: `mock_bulk_${Date.now()}`,
        sentAt: new Date(),
      },
    });
  }

  return {
    sent: preparedItems.length,
    failed: 0,
    results: preparedItems.map((p) => ({
      email: p.item.to,
      success: true,
      logId: p.logId,
    })),
  };
}
