import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { estimateCancellationReduction, scorePreopRisk } from "@/lib/risk";
import { riskRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = riskRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid risk score payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const risk = scorePreopRisk(parsed.data);

  if (parsed.data.patientProfileId) {
    await prisma.riskAssessment.create({
      data: {
        patientProfileId: parsed.data.patientProfileId,
        surgeryCaseId: parsed.data.surgeryCaseId,
        asaClass: risk.asaClass,
        cancellationRisk: risk.cancellationRisk,
        factors: risk.factors,
      },
    });
  }

  return NextResponse.json({
    ...risk,
    modeledCancellationReduction: estimateCancellationReduction(risk.cancellationRisk),
  });
}
