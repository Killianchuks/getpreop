import { createHash, randomInt } from "node:crypto";
import { buildVerificationEmailContent } from "@/lib/email-templates";
import { sendDeliverableEmail } from "@/lib/email-service";

export function createVerificationCode() {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  return { code, codeHash: hashVerificationCode(code) };
}

export function hashVerificationCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendVerificationEmail(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { html, text } = buildVerificationEmailContent(code, normalizedEmail);

  const result = await sendDeliverableEmail({
    to: normalizedEmail,
    subject: "Verify your GetPreOp account",
    html,
    text,
    category: "VERIFICATION_CODE",
    metadata: {
      type: "SECURITY_VERIFICATION",
    },
  });

  if (!result.success && process.env.NODE_ENV !== "production") {
    return { sent: false, developmentCode: code, logId: result.logId };
  }

  if (!result.success) {
    throw new Error(result.error || "Failed to deliver verification email");
  }

  return {
    sent: true,
    logId: result.logId,
    messageId: result.providerMessageId,
    provider: result.provider,
    ...(result.provider === "mock" ? { developmentCode: code } : {}),
  };
}
