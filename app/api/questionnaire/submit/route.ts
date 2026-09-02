import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { questionnaireSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = questionnaireSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid questionnaire payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const questionnaire = await prisma.questionnaireResponse.create({
    data: {
      patientProfileId: parsed.data.patientProfileId,
      surgeryCaseId: parsed.data.surgeryCaseId,
      payload: parsed.data,
    },
  });

  return NextResponse.json({
    questionnaireId: questionnaire.id,
    submittedAt: questionnaire.submittedAt.toISOString(),
    status: "accepted",
  }, { status: 201 });
}
