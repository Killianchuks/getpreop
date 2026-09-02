import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid onboarding payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: {
      fullName: parsed.data.fullName,
      role: "PATIENT",
    },
    create: {
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: "PATIENT",
    },
  });

  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: user.id },
    update: {
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      sexAtBirth: parsed.data.sexAtBirth,
    },
    create: {
      userId: user.id,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      sexAtBirth: parsed.data.sexAtBirth,
    },
  });

  const surgeryCase = await prisma.surgeryCase.create({
    data: {
      patientProfileId: patientProfile.id,
      referralId: parsed.data.referralId,
      procedureName: parsed.data.procedureName,
      plannedDate: new Date(parsed.data.plannedDate),
      facilityName: parsed.data.facilityName,
    },
  });

  if (parsed.data.referralId) {
    await prisma.referral.update({
      where: { id: parsed.data.referralId },
      data: {
        patientProfileId: patientProfile.id,
        status: "intake_created",
      },
    });
  }

  return NextResponse.json({
    patientProfileId: patientProfile.id,
    surgeryCaseId: surgeryCase.id,
    status: "intake_created",
  }, { status: 201 });
}
