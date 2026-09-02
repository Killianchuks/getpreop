import { addDays, formatISO } from "date-fns";
import type { OptimizationTaskPlan, ReadinessSnapshot } from "@/lib/types";

export function buildOptimizationPlan(
  riskFactors: string[],
  plannedDate: Date,
): OptimizationTaskPlan[] {
  const tasks: OptimizationTaskPlan[] = [];

  if (riskFactors.includes("cardiopulmonary_comorbidity")) {
    tasks.push({
      title: "Cardiopulmonary clearance",
      description: "Obtain updated ECG/echo and specialist optimization recommendations.",
      ownerDiscipline: "Cardiology/Pulmonology",
      urgency: "PRIORITY",
    });
  }

  if (riskFactors.includes("active_smoking")) {
    tasks.push({
      title: "Smoking cessation pathway",
      description: "Enroll in accelerated cessation support and nicotine replacement counseling.",
      ownerDiscipline: "Primary Care",
      urgency: "ROUTINE",
    });
  }

  if (riskFactors.includes("diabetes")) {
    tasks.push({
      title: "Glycemic optimization",
      description: "Document perioperative insulin plan and improve pre-op glucose control.",
      ownerDiscipline: "Endocrinology",
      urgency: "PRIORITY",
    });
  }

  if (riskFactors.includes("poor_functional_capacity")) {
    tasks.push({
      title: "Functional prehabilitation",
      description: "Start prehabilitation and evaluate exertional symptoms before surgery.",
      ownerDiscipline: "Periop Medicine",
      urgency: "ROUTINE",
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      title: "Standard pre-op review",
      description: "Proceed with routine anesthesia-led readiness confirmation.",
      ownerDiscipline: "Anesthesiology",
      urgency: "ROUTINE",
    });
  }

  return tasks;
}

export function deriveReadinessStatus(
  blockers: string[],
  plannedDate: Date,
): ReadinessSnapshot {
  if (blockers.length >= 3) {
    return {
      level: "NEEDS_SPECIALIST_EVALUATION",
      blockers,
      nextMilestone: formatISO(addDays(plannedDate, -21)),
    };
  }

  if (blockers.length > 0) {
    return {
      level: "NEEDS_OPTIMIZATION",
      blockers,
      nextMilestone: formatISO(addDays(plannedDate, -10)),
    };
  }

  return {
    level: "READY",
    blockers: [],
    nextMilestone: formatISO(addDays(plannedDate, -3)),
  };
}
