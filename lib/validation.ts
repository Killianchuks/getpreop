import { z } from "zod";

export const onboardingSchema = z.object({
  referralId: z.string().optional(),
  fullName: z.string().min(2),
  email: z.email(),
  dateOfBirth: z.iso.datetime(),
  sexAtBirth: z.enum(["MALE", "FEMALE", "INTERSEX", "UNDISCLOSED"]),
  procedureName: z.string().min(3),
  plannedDate: z.iso.datetime(),
  facilityName: z.string().min(2),
});

export const questionnaireSchema = z.object({
  patientProfileId: z.string().min(1),
  surgeryCaseId: z.string().optional(),
  age: z.number().int().min(18).max(120),
  bmi: z.number().min(10).max(80),
  hasCardiopulmonaryDisease: z.boolean(),
  hasDiabetes: z.boolean(),
  currentSmoker: z.boolean(),
  priorAnesthesiaComplication: z.boolean(),
  functionalCapacityMets: z.number().min(1).max(20),
});

export const riskRequestSchema = z.object({
  patientProfileId: z.string().optional(),
  surgeryCaseId: z.string().optional(),
  age: z.number().int().min(18).max(120),
  bmi: z.number().min(10).max(80),
  hasCardiopulmonaryDisease: z.boolean(),
  hasDiabetes: z.boolean(),
  currentSmoker: z.boolean(),
  priorAnesthesiaComplication: z.boolean(),
  functionalCapacityMets: z.number().min(1).max(20),
});

export const optimizationRequestSchema = z.object({
  patientProfileId: z.string().optional(),
  surgeryCaseId: z.string().optional(),
  riskFactors: z.array(z.string()).min(1),
  plannedDate: z.iso.datetime(),
});

export const referralSchema = z.object({
  surgeryCenterId: z.string().min(1),
  surgeryCenterName: z.string().min(2),
  patientFullName: z.string().min(2),
  patientEmail: z.email(),
  procedureName: z.string().min(3),
  scheduledDate: z.iso.datetime(),
  priority: z.enum(["standard", "urgent"]).default("standard"),
});

export const consultationScheduleSchema = z.object({
  patientProfileId: z.string().min(1),
  preferredDate: z.iso.datetime(),
  timezone: z.string().min(2),
  questionForAnesthesia: z.string().min(5).optional(),
});

export const secureMessageSchema = z.object({
  conversationId: z.string().min(1),
  patientProfileId: z.string().optional(),
  senderRole: z.enum(["PATIENT", "ANESTHESIOLOGIST", "SURGERY_CENTER"]),
  message: z.string().min(2).max(2000),
});

export const onePageReportRequestSchema = z.object({
  referralId: z.string().optional(),
  patientProfileId: z.string().optional(),
  surgeryCaseId: z.string().optional(),
  patientFullName: z.string().min(2),
  procedureName: z.string().min(3),
  surgeryDate: z.iso.datetime(),
  age: z.number().int().min(18).max(120),
  bmi: z.number().min(10).max(80),
  hasCardiopulmonaryDisease: z.boolean(),
  hasDiabetes: z.boolean(),
  currentSmoker: z.boolean(),
  priorAnesthesiaComplication: z.boolean(),
  functionalCapacityMets: z.number().min(1).max(20),
  anesthesiaQuestions: z.array(z.string()).default([]),
});

export const signUpSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8).max(128),
  role: z.enum(["PATIENT", "SURGERY_CENTER", "ANESTHESIOLOGIST", "ADMIN"]),
  institutionTypes: z.array(z.string()).optional().default([]),
  isHospitalNetwork: z.boolean().optional().default(false),
  plan: z.string().optional().default("asc-growth"),
  billingCycle: z.enum(["monthly", "annual"]).optional().default("annual"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});
