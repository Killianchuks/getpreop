import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { sendPatientUploadEmail } from "@/lib/email";

const emailNotificationSchema = z.object({
  patientProfileId: z.string().min(1),
  patientName: z.string().min(2),
  patientEmail: z.email(),
  uploadType: z.enum(["REPORT", "IMAGE", "DICOM", "NOTE"]),
  modality: z.string().min(2).nullable(),
  title: z.string().min(2),
  description: z.string().min(2).nullable(),
  fileName: z.string().min(1).nullable(),
  reference: z.string().min(4),
  uploadId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = emailNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid notification payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const notificationId = `ntf_${crypto.randomUUID()}`;
  const delivery = await sendPatientUploadEmail(parsed.data);

  await writeAuditLog({
    action: "PATIENT_EMAIL_NOTIFICATION_QUEUED",
    entityType: "PatientUploadNotification",
    entityId: notificationId,
    actorRole: "ANESTHESIOLOGIST",
    details: {
      ...parsed.data,
      notificationId,
      channel: "email",
      status: delivery.sent ? "sent" : "queued",
      deliveryMode: delivery.mode,
      provider: delivery.provider,
      messageId: delivery.sent ? delivery.messageId : null,
    },
  });

  return NextResponse.json(
    {
      notificationId,
      queued: !delivery.sent,
      sent: delivery.sent,
      status: delivery.sent ? "sent" : "queued",
      deliveryMode: delivery.mode,
      provider: delivery.provider,
      messageId: delivery.sent ? delivery.messageId : null,
      recipient: parsed.data.patientEmail,
      message: delivery.sent
        ? "Patient notification sent."
        : "Patient notification queued for delivery.",
    },
    { status: 201 },
  );
}
