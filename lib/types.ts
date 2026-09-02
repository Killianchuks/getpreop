export type PatientRole =
  | "PATIENT"
  | "SURGERY_CENTER"
  | "ANESTHESIOLOGIST"
  | "ADMIN";
export type ReadinessLevel =
  | "READY"
  | "NEEDS_OPTIMIZATION"
  | "NEEDS_SPECIALIST_EVALUATION";

export interface IntakePayload {
  fullName: string;
  email: string;
  procedureName: string;
  plannedDate: string;
  facilityName: string;
  age: number;
  bmi: number;
  hasCardiopulmonaryDisease: boolean;
  hasDiabetes: boolean;
  currentSmoker: boolean;
  priorAnesthesiaComplication: boolean;
  functionalCapacityMets: number;
}

export interface RiskScore {
  asaClass: "I" | "II" | "III" | "IV";
  cancellationRisk: number;
  safetyRisk: number;
  factors: string[];
  readinessLevel: ReadinessLevel;
  additionalWorkup: string[];
}

export interface OptimizationTaskPlan {
  title: string;
  description: string;
  ownerDiscipline: string;
  urgency: "ROUTINE" | "PRIORITY";
}

export interface ReadinessSnapshot {
  level: ReadinessLevel;
  blockers: string[];
  nextMilestone: string;
}

export interface OnePageReport {
  reportId: string;
  turnaroundHours: number;
  patient: {
    fullName: string;
    procedureName: string;
    surgeryDate: string;
  };
  risk: RiskScore;
  medicationInstructions: string[];
  specialistRecommendations: string[];
  anesthesiaQuestions: string[];
  summary: string;
}
