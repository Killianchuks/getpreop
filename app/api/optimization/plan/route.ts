import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildOptimizationPlan, deriveReadinessStatus } from "@/lib/optimization";
import { optimizationRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = optimizationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid optimization payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const plannedDate = new Date(parsed.data.plannedDate);
  const plan = buildOptimizationPlan(parsed.data.riskFactors, plannedDate);
  const readiness = deriveReadinessStatus(parsed.data.riskFactors, plannedDate);

  if (parsed.data.patientProfileId) {
    await Promise.all(
      plan.map((task) =>
        prisma.optimizationTask.create({
          data: {
            patientProfileId: parsed.data.patientProfileId as string,
            surgeryCaseId: parsed.data.surgeryCaseId,
            title: task.title,
            description: task.description,
            ownerDiscipline: task.ownerDiscipline,
            dueDate: plannedDate,
          },
        }),
      ),
    );
  }

  return NextResponse.json({
    plan,
    readiness,
    generatedAt: new Date().toISOString(),
  });
}
