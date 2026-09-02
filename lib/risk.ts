import { type RiskScore } from "@/lib/types";

interface RiskInput {
  age: number;
  bmi: number;
  hasCardiopulmonaryDisease: boolean;
  hasDiabetes: boolean;
  currentSmoker: boolean;
  priorAnesthesiaComplication: boolean;
  functionalCapacityMets: number;
}

export function scorePreopRisk(input: RiskInput): RiskScore {
  let cancellationPoints = 0;
  let safetyPoints = 0;
  const factors: string[] = [];

  if (input.age >= 75) {
    cancellationPoints += 12;
    safetyPoints += 10;
    factors.push("advanced_age");
  }

  if (input.bmi >= 40) {
    cancellationPoints += 15;
    safetyPoints += 18;
    factors.push("morbid_obesity");
  }

  if (input.hasCardiopulmonaryDisease) {
    cancellationPoints += 20;
    safetyPoints += 24;
    factors.push("cardiopulmonary_comorbidity");
  }

  if (input.hasDiabetes) {
    cancellationPoints += 8;
    safetyPoints += 8;
    factors.push("diabetes");
  }

  if (input.currentSmoker) {
    cancellationPoints += 7;
    safetyPoints += 6;
    factors.push("active_smoking");
  }

  if (input.priorAnesthesiaComplication) {
    cancellationPoints += 14;
    safetyPoints += 16;
    factors.push("prior_anesthesia_complication");
  }

  if (input.functionalCapacityMets < 4) {
    cancellationPoints += 16;
    safetyPoints += 16;
    factors.push("poor_functional_capacity");
  }

  const cancellationRisk = Math.min(95, Math.max(5, cancellationPoints));
  const safetyRisk = Math.min(95, Math.max(5, safetyPoints));

  let asaClass: RiskScore["asaClass"] = "I";
  if (safetyRisk >= 55) asaClass = "IV";
  else if (safetyRisk >= 35) asaClass = "III";
  else if (safetyRisk >= 15) asaClass = "II";

  const additionalWorkup: string[] = [];

  if (input.hasCardiopulmonaryDisease) {
    additionalWorkup.push("Cardiology/Pulmonology specialist review");
  }

  if (input.priorAnesthesiaComplication) {
    additionalWorkup.push("Focused anesthesiology chart review before teleconsult");
  }

  if (input.functionalCapacityMets < 4) {
    additionalWorkup.push("Functional status workup and prehabilitation referral");
  }

  let readinessLevel: RiskScore["readinessLevel"] = "READY";

  if (safetyRisk >= 55 || input.hasCardiopulmonaryDisease || input.priorAnesthesiaComplication) {
    readinessLevel = "NEEDS_SPECIALIST_EVALUATION";
  } else if (safetyRisk >= 20 || cancellationRisk >= 20 || factors.length > 0) {
    readinessLevel = "NEEDS_OPTIMIZATION";
  }

  return {
    asaClass,
    cancellationRisk,
    safetyRisk,
    factors,
    readinessLevel,
    additionalWorkup,
  };
}

export function estimateCancellationReduction(cancellationRisk: number): number {
  const modeledReduction = cancellationRisk * 0.42;
  return Number(Math.min(40, Math.max(5, modeledReduction)).toFixed(1));
}
