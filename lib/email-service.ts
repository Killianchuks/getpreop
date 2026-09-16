import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { buildDeliverableEmailLayout, buildTestEmailContent } from "@/lib/email-templates";

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

const DEFAULT_FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL || "contact@getpreop.com";
const DEFAULT_FROM_NAME = process.env.MAILERSEND_FROM_NAME || "GetPreOp";
const DEFAULT_REPLY_TO = process.env.MAILERSEND_REPLY_TO_EMAIL || "support@getpreop.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.getpreop.com";

function hasSmtpConfiguration() {
  return Boolean(
    process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USER
      && process.env.SMTP_PASS
      && process.env.SMTP_FROM,
  );
}

/**
 * Standard RFC 8058 and Anti-Spam headers to ensure highest inbox delivery rates.
 */
function buildDeliverabilityHeaders(recipientEmail: string, logId: string) {
  const unsubscribeUrl = `${APP_URL}/api/email/unsubscribe?email=${encodeURIComponent(recipientEmail)}&id=${logId}`;
  return {
    "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@getpreop.com?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    "Feedback-ID": "getpreop:transactional:v1",
    "X-Entity-Ref-ID": logId,
    "X-Auto-Response-Suppress": "OOF, AutoReply",
  };
}

/**
 * Sends an email with deliverability optimizations, anti-spam headers, and persistent tracking in EmailLog.
 */
export async function sendDeliverableEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const to = options.to.trim().toLowerCase();
  const fromEmail = options.fromEmail || DEFAULT_FROM_EMAIL;
  const fromName = options.fromName || DEFAULT_FROM_NAME;
  const replyTo = options.replyTo || DEFAULT_REPLY_TO;
  const apiKey = process.env.MAILERSEND_API_KEY;

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

  const deliverabilityHeaders = buildDeliverabilityHeaders(to, logId);

  // 2. Primary Provider: MailerSend REST API
  if (apiKey) {
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
          html: options.html,
          headers: Object.entries(deliverabilityHeaders).map(([key, value]) => ({
            key,
            value,
          })),
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
        if (logId && !logId.startsWith("fallback_")) {
          await prisma.emailLog.update({
            where: { id: logId },
            data: {
              status: "SENT",
              providerMessageId,
              sentAt: new Date(),
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

      // If MailerSend returned an error status:
      const errorMsg = `MailerSend API failed (${response.status}): ${responseText || response.statusText}`;
      console.warn(errorMsg, "Falling back to SMTP if available.");

      if (logId && !logId.startsWith("fallback_")) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: "FAILED",
            errorMessage: errorMsg,
          },
        });
      }
    } catch (apiError: unknown) {
      console.error("MailerSend request exception:", apiError);
    }
  }

  // 3. Secondary Provider: SMTP (Nodemailer)
  if (hasSmtpConfiguration()) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${process.env.SMTP_FROM || fromEmail}>`,
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
      console.error("SMTP error:", smtpErr);
      if (logId && !logId.startsWith("fallback_")) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: "FAILED",
            errorMessage: errorMsg,
          },
        });
      }
      return {
        success: false,
        logId,
        provider: "smtp",
        providerMessageId: null,
        status: "FAILED",
        error: errorMsg,
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
  const failureMessage = "No email provider configured or available. Please configure MAILERSEND_API_KEY or SMTP settings.";
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
  const { html, text } = buildTestEmailContent(toEmail);
  return sendDeliverableEmail({
    to: toEmail,
    subject: "GetPreOp Email Deliverability & SPF/DKIM Test",
    html,
    text,
    category: "TEST",
    metadata: { testType: "DELIVERABILITY_VERIFICATION", timestamp: new Date().toISOString() },
  });
}
