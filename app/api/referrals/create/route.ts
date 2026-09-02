import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { getRoleFromCookieHeader } from "@/lib/request-role";
import { referralSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = referralSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid referral payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const slaHours = parsed.data.priority === "urgent" ? 24 : 48;

  const surgeryCenter = await prisma.surgeryCenter.upsert({
    where: { externalId: parsed.data.surgeryCenterId },
    update: { name: parsed.data.surgeryCenterName },
    create: {
      externalId: parsed.data.surgeryCenterId,
      name: parsed.data.surgeryCenterName,
    },
  });

  const referral = await prisma.referral.create({
    data: {
      surgeryCenterId: surgeryCenter.id,
      patientFullName: parsed.data.patientFullName,
      patientEmail: parsed.data.patientEmail,
      procedureName: parsed.data.procedureName,
      scheduledDate: new Date(parsed.data.scheduledDate),
      priority: parsed.data.priority,
      reportTurnaroundHours: slaHours,
    },
  });

  await writeAuditLog({
    action: "REFERRAL_CREATED",
    entityType: "Referral",
    entityId: referral.id,
    actorRole: getRoleFromCookieHeader(request.headers.get("cookie")),
    details: {
      surgeryCenterId: surgeryCenter.id,
      priority: parsed.data.priority,
      targetTurnaroundHours: slaHours,
    },
  });

  return NextResponse.json(
    {
      referralId: referral.id,
      status: "received",
      targetTurnaroundHours: slaHours,
      nextStep: "digital_intake_sent",
    },
    { status: 201 },
  );
}
