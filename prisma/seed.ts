import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

async function main() {
  const demoPasswordHash = await hash("Getpreop123!", 10);

  const surgeryCenter = await prisma.surgeryCenter.upsert({
    where: { externalId: "asc-west-001" },
    update: { name: "Westside Ambulatory Surgery Center" },
    create: {
      externalId: "asc-west-001",
      name: "Westside Ambulatory Surgery Center",
    },
  });

  const anesthesiologistUser = await prisma.user.upsert({
    where: { email: "dr.liu@getpreop.test" },
    update: {
      fullName: "Dr. Amy Liu",
      role: "ANESTHESIOLOGIST",
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "dr.liu@getpreop.test",
      fullName: "Dr. Amy Liu",
      role: "ANESTHESIOLOGIST",
      passwordHash: demoPasswordHash,
    },
  });

  await prisma.user.upsert({
    where: { email: "operations@westsideasc.test" },
    update: {
      fullName: "Westside ASC Operations",
      role: "SURGERY_CENTER",
      passwordHash: demoPasswordHash,
      surgeryCenterId: surgeryCenter.id,
    },
    create: {
      email: "operations@westsideasc.test",
      fullName: "Westside ASC Operations",
      role: "SURGERY_CENTER",
      passwordHash: demoPasswordHash,
      surgeryCenterId: surgeryCenter.id,
    },
  });

  await prisma.anesthesiologistProfile.upsert({
    where: { userId: anesthesiologistUser.id },
    update: {
      licenseNumber: "NY-A-2026-1138",
      licenseRegion: "NY",
      verified: true,
      verificationDate: new Date(),
    },
    create: {
      userId: anesthesiologistUser.id,
      licenseNumber: "NY-A-2026-1138",
      licenseRegion: "NY",
      verified: true,
      verificationDate: new Date(),
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "taylor.morgan@getpreop.test" },
    update: {
      fullName: "Taylor Morgan",
      role: "PATIENT",
      passwordHash: demoPasswordHash,
    },
    create: {
      email: "taylor.morgan@getpreop.test",
      fullName: "Taylor Morgan",
      role: "PATIENT",
      passwordHash: demoPasswordHash,
    },
  });

  const patientProfile = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {
      dateOfBirth: new Date("1982-05-12T00:00:00.000Z"),
      sexAtBirth: "FEMALE",
      languagePreference: "English",
    },
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date("1982-05-12T00:00:00.000Z"),
      sexAtBirth: "FEMALE",
      languagePreference: "English",
    },
  });

  const existingReferral = await prisma.referral.findFirst({
    where: {
      surgeryCenterId: surgeryCenter.id,
      patientEmail: "taylor.morgan@getpreop.test",
      procedureName: "Knee arthroscopy",
    },
    orderBy: { createdAt: "desc" },
  });

  const referral = existingReferral ?? (await prisma.referral.create({
    data: {
      surgeryCenterId: surgeryCenter.id,
      patientProfileId: patientProfile.id,
      patientFullName: "Taylor Morgan",
      patientEmail: "taylor.morgan@getpreop.test",
      procedureName: "Knee arthroscopy",
      scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      priority: "standard",
      status: "intake_created",
      reportTurnaroundHours: 24,
    },
  }));

  const existingCase = await prisma.surgeryCase.findFirst({
    where: {
      patientProfileId: patientProfile.id,
      referralId: referral.id,
      procedureName: "Knee arthroscopy",
    },
    orderBy: { createdAt: "desc" },
  });

  const surgeryCase = existingCase ?? (await prisma.surgeryCase.create({
    data: {
      patientProfileId: patientProfile.id,
      referralId: referral.id,
      procedureName: "Knee arthroscopy",
      plannedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      facilityName: "Westside Ambulatory Surgery Center",
      surgeonName: "Dr. Martin Cole",
      anesthesiaType: "General",
      cancellationRisk: 18,
    },
  }));

  const existingConsult = await prisma.teleconsultation.findFirst({
    where: {
      patientProfileId: patientProfile.id,
      consultantId: anesthesiologistUser.id,
      status: "SCHEDULED",
    },
  });

  if (!existingConsult) {
    await prisma.teleconsultation.create({
      data: {
        patientProfileId: patientProfile.id,
        consultantId: anesthesiologistUser.id,
        scheduledStart: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        scheduledEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 45),
        status: "SCHEDULED",
        notes: "Discuss diabetes medication and fasting protocol",
      },
    });
  }

  const existingReport = await prisma.preopReport.findFirst({
    where: {
      referralId: referral.id,
      patientProfileId: patientProfile.id,
      surgeryCaseId: surgeryCase.id,
    },
  });

  if (!existingReport) {
    await prisma.preopReport.create({
      data: {
        referralId: referral.id,
        patientProfileId: patientProfile.id,
        surgeryCaseId: surgeryCase.id,
        patientFullName: "Taylor Morgan",
        procedureName: "Knee arthroscopy",
        surgeryDate: surgeryCase.plannedDate,
        readinessLevel: "NEEDS_OPTIMIZATION",
        asaClass: "II",
        cancellationRisk: 18,
        safetyRisk: 20,
        medicationInstructions: [
          "Hold oral hypoglycemic medication on the morning of surgery unless instructed otherwise.",
          "Continue beta blockers with a sip of water.",
        ],
        specialistRecommendations: [],
        summary: "Patient is appropriate for optimization pathway prior to surgery.",
        turnaroundHours: 24,
      },
    });
  }

  const existingMessage = await prisma.secureMessage.findFirst({
    where: {
      conversationId: `conv_${patientProfile.id}`,
      senderRole: "PATIENT",
      message: "Can I take my diabetes medications the morning of surgery?",
    },
  });

  if (!existingMessage) {
    await prisma.secureMessage.create({
      data: {
        conversationId: `conv_${patientProfile.id}`,
        patientProfileId: patientProfile.id,
        senderRole: "PATIENT",
        message: "Can I take my diabetes medications the morning of surgery?",
      },
    });
  }

  console.log("Seed complete: sample surgery center, anesthesiologist, and patient journey created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
