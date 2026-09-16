/**
 * High-deliverability HTML & Plain Text email template builders.
 * Designed to satisfy strict anti-spam filters (SpamAssassin, Gmail, Yahoo, Microsoft 365)
 * by including proper MIME structure, preheader text, responsive tables,
 * CAN-SPAM physical address footer, and List-Unsubscribe links.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.getpreop.com";
const COMPANY_NAME = "GetPreOp";
const PHYSICAL_ADDRESS = "GetPreOp Inc., 100 Medical Center Way, Suite 400, Boston, MA 02115";
const SUPPORT_EMAIL = process.env.MAILERSEND_REPLY_TO_EMAIL || "support@getpreop.com";

interface EmailLayoutOptions {
  title: string;
  preheader: string;
  contentHtml: string;
  contentText: string;
  recipientEmail?: string;
  showUnsubscribe?: boolean;
  categoryNote?: string;
}

export function buildDeliverableEmailLayout(options: EmailLayoutOptions): { html: string; text: string } {
  const unsubscribeUrl = `${APP_URL}/api/email/unsubscribe?email=${encodeURIComponent(options.recipientEmail ?? "")}`;
  const categoryNote = options.categoryNote ?? "This is an important transactional message regarding your GetPreOp account or clinical care.";

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${options.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #0f766e; padding: 24px 32px; text-align: left; }
    .header-title { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
    .header-sub { color: #ccfbf1; font-size: 12px; margin: 4px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .code-box { background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-digits { font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #0f766e; margin: 0; font-family: 'Courier New', Courier, monospace; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 16px; }
    .footer { background-color: #f1f5f9; padding: 24px 32px; font-size: 12px; line-height: 1.5; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #0f766e; text-decoration: underline; }
    .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; max-height: 0; max-width: 0; overflow: hidden; mso-hide: all; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .content { padding: 24px 20px !important; }
      .header { padding: 20px !important; }
      .footer { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;">
  <!-- Preheader text prevents mail clients from showing code/links in preview snippet -->
  <div class="preheader" style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${options.preheader}
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;">
          <!-- Header -->
          <tr>
            <td class="header" style="background-color:#0f766e;padding:24px 32px;">
              <h1 class="header-title" style="color:#ffffff;font-size:22px;font-weight:700;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${COMPANY_NAME}</h1>
              <p class="header-sub" style="color:#ccfbf1;font-size:11px;margin:4px 0 0 0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Anesthesiology-Led Preoperative Assessment</p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content" style="padding:32px;font-size:15px;line-height:1.6;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              ${options.contentHtml}
            </td>
          </tr>

          <!-- Footer (CAN-SPAM / GDPR / RFC Compliance) -->
          <tr>
            <td class="footer" style="background-color:#f1f5f9;padding:24px 32px;font-size:12px;line-height:1.5;color:#64748b;border-top:1px solid #e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <p style="margin:0 0 8px 0;"><strong>${COMPANY_NAME}</strong> &bull; ${PHYSICAL_ADDRESS}</p>
              <p style="margin:0 0 8px 0;">${categoryNote}</p>
              <p style="margin:0 0 8px 0;">Need help? Contact support at <a href="mailto:${SUPPORT_EMAIL}" style="color:#0f766e;text-decoration:underline;">${SUPPORT_EMAIL}</a></p>
              ${options.showUnsubscribe ? `<p style="margin:8px 0 0 0;"><a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline;font-size:11px;">Unsubscribe or update preferences</a></p>` : ""}
              <p style="margin:12px 0 0 0;font-size:11px;color:#94a3b8;">Confidentiality Notice: This email and any attachments may contain confidential or legally privileged clinical information intended solely for the recipient.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${COMPANY_NAME} - Anesthesiology-Led Preoperative Assessment`,
    "============================================================",
    "",
    options.contentText,
    "",
    "------------------------------------------------------------",
    `${COMPANY_NAME} | ${PHYSICAL_ADDRESS}`,
    categoryNote,
    `Support: ${SUPPORT_EMAIL}`,
    options.showUnsubscribe ? `Unsubscribe: ${unsubscribeUrl}` : "",
    "",
    "Confidentiality Notice: This email may contain confidential clinical information.",
  ].filter(Boolean).join("\n");

  return { html, text };
}

export function buildVerificationEmailContent(code: string, recipientEmail: string) {
  const title = "Verify your GetPreOp account";
  const preheader = `Your 6-digit verification code is ${code}. It expires in 15 minutes.`;

  const contentHtml = `
    <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;margin-bottom:12px;">Confirm your email address</h2>
    <p style="margin:0 0 16px 0;">Welcome to GetPreOp. Use the secure verification code below to verify your account and complete your sign in:</p>
    
    <div style="background-color:#f0fdfa;border:2px dashed #0d9488;border-radius:8px;padding:20px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:#0f766e;">Verification Code</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:10px;color:#0f766e;margin:6px 0;font-family:'Courier New',Courier,monospace;">${code}</div>
      <p style="margin:4px 0 0 0;font-size:12px;color:#64748b;">Valid for <strong>15 minutes</strong></p>
    </div>

    <p style="margin:16px 0 0 0;font-size:13px;color:#64748b;">If you did not request this verification code, please ignore this email or contact support if you have security concerns.</p>
  `;

  const contentText = [
    "Confirm your email address",
    "",
    "Welcome to GetPreOp. Use the secure verification code below to complete your sign in:",
    "",
    `VERIFICATION CODE: ${code}`,
    "(This code expires in 15 minutes)",
    "",
    "If you did not request this code, you can safely ignore this email.",
  ].join("\n");

  return buildDeliverableEmailLayout({
    title,
    preheader,
    contentHtml,
    contentText,
    recipientEmail,
    showUnsubscribe: false,
    categoryNote: "This security verification code was requested for your GetPreOp account.",
  });
}

export function buildPatientUploadEmailContent(input: {
  patientName: string;
  patientEmail: string;
  title: string;
  description: string | null;
  uploadType: "REPORT" | "IMAGE" | "DICOM" | "NOTE";
  modality: string | null;
  fileName: string | null;
  reference: string;
}) {
  const title = `New Pre-Op Document Uploaded: ${input.title}`;
  const preheader = `A new pre-operative clinical document has been uploaded for reference ${input.reference}.`;

  const contentHtml = `
    <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;margin-bottom:12px;">Pre-Op Document Update</h2>
    <p style="margin:0 0 16px 0;">Hello <strong>${input.patientName}</strong>,</p>
    <p style="margin:0 0 16px 0;">A new clinical record has been uploaded to your GetPreOp preoperative evaluation case file:</p>

    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size:14px;">
        <tr>
          <td style="width:130px;color:#64748b;font-weight:600;">Reference:</td>
          <td style="color:#0f172a;font-weight:700;">${input.reference}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-weight:600;">Document Title:</td>
          <td style="color:#0f172a;">${input.title}</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-weight:600;">Document Type:</td>
          <td style="color:#0f172a;"><span style="background-color:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;">${input.uploadType}</span></td>
        </tr>
        ${input.modality ? `<tr><td style="color:#64748b;font-weight:600;">Imaging Modality:</td><td style="color:#0f172a;">${input.modality}</td></tr>` : ""}
        ${input.fileName ? `<tr><td style="color:#64748b;font-weight:600;">Attached File:</td><td style="color:#0f172a;">${input.fileName}</td></tr>` : ""}
        ${input.description ? `<tr><td style="color:#64748b;font-weight:600;">Notes:</td><td style="color:#0f172a;">${input.description}</td></tr>` : ""}
      </table>
    </div>

    <p style="margin:16px 0 0 0;">Please log in to your patient portal to review your case status, optimization checklist, and anesthesia readiness plan.</p>
    
    <div style="margin:24px 0 12px 0;">
      <a href="${APP_URL}/patients/portal" style="display:inline-block;background-color:#0f766e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">View Patient Portal</a>
    </div>
  `;

  const contentText = [
    `Hello ${input.patientName},`,
    "",
    "A new pre-operative clinical document has been uploaded to your GetPreOp case file:",
    "",
    `Reference: ${input.reference}`,
    `Document Title: ${input.title}`,
    `Document Type: ${input.uploadType}`,
    input.modality ? `Imaging Modality: ${input.modality}` : "",
    input.fileName ? `Attached File: ${input.fileName}` : "",
    input.description ? `Notes: ${input.description}` : "",
    "",
    `Log in to view your portal: ${APP_URL}/patients/portal`,
  ].filter(Boolean).join("\n");

  return buildDeliverableEmailLayout({
    title,
    preheader,
    contentHtml,
    contentText,
    recipientEmail: input.patientEmail,
    showUnsubscribe: false,
    categoryNote: "You are receiving this clinical notification regarding your scheduled preoperative case.",
  });
}

export function buildBDOutreachEmailContent(input: {
  contactName: string;
  recipientEmail: string;
  organizationName: string;
  subject: string;
  messageBody: string;
}) {
  const preheader = input.messageBody.slice(0, 100).replace(/\n/g, " ");

  const formattedHtmlBody = input.messageBody
    .split("\n\n")
    .map((paragraph) => `<p style="margin:0 0 16px 0;">${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");

  const contentHtml = `
    <div style="font-size:15px;line-height:1.6;color:#334155;">
      ${formattedHtmlBody}
    </div>
    <div style="margin:24px 0 0 0;padding-top:16px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-weight:600;color:#0f172a;">GetPreOp Partnerships Team</p>
      <p style="margin:2px 0 0 0;font-size:13px;color:#64748b;">Virtual Anesthesiology Preoperative Care &bull; <a href="${APP_URL}" style="color:#0f766e;">getpreop.com</a></p>
    </div>
  `;

  return buildDeliverableEmailLayout({
    title: input.subject,
    preheader,
    contentHtml,
    contentText: input.messageBody,
    recipientEmail: input.recipientEmail,
    showUnsubscribe: true,
    categoryNote: `You are receiving this partnership outreach from GetPreOp regarding ${input.organizationName || "preoperative coordination"}.`,
  });
}

export function buildTestEmailContent(recipientEmail: string) {
  const title = "GetPreOp Deliverability Test Email";
  const preheader = "Verification of SPF, DKIM, DMARC, and email inbox delivery.";

  const contentHtml = `
    <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;margin-bottom:12px;">Email Delivery & Authentication Test</h2>
    <p style="margin:0 0 16px 0;">This test email verifies that your GetPreOp transactional email service is properly configured with:</p>

    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
      <ul style="margin:0;padding-left:20px;color:#334155;font-size:14px;line-height:1.8;">
        <li><strong>MIME Multipart / Alternative:</strong> Full HTML + Plain Text synchronization</li>
        <li><strong>RFC 8058 One-Click List-Unsubscribe:</strong> Configured for Gmail and Yahoo compliance</li>
        <li><strong>Anti-Spam Headers:</strong> Feedback-ID, X-Entity-Ref-ID, and Reply-To verification</li>
        <li><strong>CAN-SPAM / GDPR Compliance:</strong> Verified physical address and clear opt-out</li>
      </ul>
    </div>

    <p style="margin:16px 0 0 0;font-size:14px;color:#64748b;">If you see this in your primary inbox, your sending domain authentication (SPF/DKIM/DMARC) is working properly.</p>
  `;

  const contentText = [
    "GetPreOp Email Delivery & Authentication Test",
    "--------------------------------------------",
    "This test verifies that transactional emails are properly configured with:",
    "- MIME multipart/alternative structure",
    "- RFC 8058 List-Unsubscribe headers",
    "- Anti-Spam compliance headers and plain text fallbacks",
    "- Verified physical address footer",
  ].join("\n");

  return buildDeliverableEmailLayout({
    title,
    preheader,
    contentHtml,
    contentText,
    recipientEmail,
    showUnsubscribe: false,
    categoryNote: "This is an automated system test message from the GetPreOp administration panel.",
  });
}
