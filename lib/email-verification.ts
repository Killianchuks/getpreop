import { createHash, randomInt } from "node:crypto";

export function createVerificationCode() {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  return { code, codeHash: hashVerificationCode(code) };
}

export function hashVerificationCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendVerificationEmail(email: string, code: string) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL ?? "contact@getpreop.com";
  const fromName = process.env.MAILERSEND_FROM_NAME ?? "GetPreOp";

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") return { sent: false, developmentCode: code };
    throw new Error("MAILERSEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email }],
      subject: "Verify your GetPreOp account",
      text: `Your GetPreOp verification code is ${code}. It expires in 15 minutes.`,
      html: `<p>Your GetPreOp verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 15 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`MailerSend verification email failed with status ${response.status}`);
  }

  return { sent: true };
}
