import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { secureMessageSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = secureMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid secure message payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const message = await prisma.secureMessage.create({
    data: {
      conversationId: parsed.data.conversationId,
      patientProfileId: parsed.data.patientProfileId,
      senderRole: parsed.data.senderRole,
      message: parsed.data.message,
    },
  });

  await writeAuditLog({
    action: "SECURE_MESSAGE_SENT",
    entityType: "SecureMessage",
    entityId: message.id,
    actorRole: parsed.data.senderRole,
    details: {
      conversationId: parsed.data.conversationId,
      patientProfileId: parsed.data.patientProfileId,
    },
  });

  return NextResponse.json({
    messageId: message.id,
    delivered: true,
    deliveredAt: message.createdAt.toISOString(),
  }, { status: 201 });
}
