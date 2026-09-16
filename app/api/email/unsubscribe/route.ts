import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const emailParam = url.searchParams.get("email");
    const idParam = url.searchParams.get("id");

    let recipientEmail = emailParam;

    if (!recipientEmail && idParam) {
      const log = await prisma.emailLog.findUnique({ where: { id: idParam } });
      if (log) recipientEmail = log.recipientEmail;
    }

    if (recipientEmail) {
      const normalizedEmail = recipientEmail.trim().toLowerCase();
      // Update BD Contact if matched
      await prisma.businessDevelopmentContact.updateMany({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
        data: { status: "UNSUBSCRIBED" },
      });

      await writeAuditLog({
        action: "EMAIL_UNSUBSCRIBE_PROCESSED",
        entityType: "EmailUnsubscribe",
        entityId: normalizedEmail,
        actorRole: "RECIPIENT",
        details: { email: normalizedEmail, oneClick: true },
      });
    }

    return NextResponse.json({ success: true, message: "Unsubscribe recorded successfully." });
  } catch (error) {
    console.error("Unsubscribe POST error:", error);
    return NextResponse.json({ error: "Failed to process unsubscribe." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const emailParam = url.searchParams.get("email") || "";
  const idParam = url.searchParams.get("id") || "";

  if (emailParam || idParam) {
    let targetEmail = emailParam;
    if (!targetEmail && idParam) {
      const log = await prisma.emailLog.findUnique({ where: { id: idParam } });
      if (log) targetEmail = log.recipientEmail;
    }

    if (targetEmail) {
      const normalizedEmail = targetEmail.trim().toLowerCase();
      await prisma.businessDevelopmentContact.updateMany({
        where: { email: { equals: normalizedEmail, mode: "insensitive" } },
        data: { status: "UNSUBSCRIBED" },
      });

      await writeAuditLog({
        action: "EMAIL_UNSUBSCRIBE_PROCESSED",
        entityType: "EmailUnsubscribe",
        entityId: normalizedEmail,
        actorRole: "RECIPIENT",
        details: { email: normalizedEmail, oneClick: false },
      });
    }
  }

  // Redirect to friendly confirmation page
  return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(emailParam)}`, request.url));
}
