import { NextResponse } from "next/server";
import type { OnePageReport } from "@/lib/types";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { getRoleFromCookieHeader } from "@/lib/request-role";
import { scorePreopRisk } from "@/lib/risk";
import { onePageReportRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = onePageReportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid report request payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const risk = scorePreopRisk(parsed.data);

  const specialistRecommendations = risk.readinessLevel === "NEEDS_SPECIALIST_EVALUATION"
    ? risk.additionalWorkup
    : [];

  const medicationInstructions = [
    "Stop NSAIDs 5 days before surgery unless surgeon advises otherwise.",
    "Continue beta blockers and inhalers on day of surgery with a small sip of water.",
    "Follow center-specific fasting and diabetic medication protocol.",
  ];

  const summary =
    risk.readinessLevel === "READY"
      ? "Patient is ready for surgery with standard anesthesia planning."
      : risk.readinessLevel === "NEEDS_OPTIMIZATION"
        ? "Patient needs targeted optimization tasks before final clearance."
        : "Patient needs specialist evaluation before anesthesia clearance.";

  const savedReport = await prisma.preopReport.create({
    data: {
      referralId: parsed.data.referralId,
      patientProfileId: parsed.data.patientProfileId,
      surgeryCaseId: parsed.data.surgeryCaseId,
      patientFullName: parsed.data.patientFullName,
      procedureName: parsed.data.procedureName,
      surgeryDate: new Date(parsed.data.surgeryDate),
      readinessLevel: risk.readinessLevel,
      asaClass: risk.asaClass,
      cancellationRisk: risk.cancellationRisk,
      safetyRisk: risk.safetyRisk,
      medicationInstructions,
      specialistRecommendations,
      summary,
      turnaroundHours: 24,
    },
  });

  await writeAuditLog({
    action: "PREOP_REPORT_GENERATED",
    entityType: "PreopReport",
    entityId: savedReport.id,
    actorRole: getRoleFromCookieHeader(request.headers.get("cookie")),
    details: {
      referralId: parsed.data.referralId,
      patientProfileId: parsed.data.patientProfileId,
      readinessLevel: risk.readinessLevel,
      turnaroundHours: 24,
    },
  });

  const report: OnePageReport = {
    reportId: savedReport.id,
    turnaroundHours: 24,
    patient: {
      fullName: parsed.data.patientFullName,
      procedureName: parsed.data.procedureName,
      surgeryDate: parsed.data.surgeryDate,
    },
    risk,
    medicationInstructions,
    specialistRecommendations,
    anesthesiaQuestions: parsed.data.anesthesiaQuestions,
    summary,
  };

  return NextResponse.json(report, { status: 201 });
}
