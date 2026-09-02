export type AccessMode = "EHR_ACCESS" | "PHONE_SCREENING";

export type CaseStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "DECLINED"
  | "INTAKE_COMPLETE"
  | "REPORT_SUBMITTED";

export interface EhrCredentials {
  vendor: string;
  portalUrl: string;
  username: string;
  password: string;
}

export interface PhoneContact {
  contactName: string;
  phoneNumber: string;
  bestTimeToCall: string;
}

export interface InstitutionAccessProfile {
  institutionName: string;
  accessMode: AccessMode;
  ehr?: EhrCredentials;
  phoneContact?: PhoneContact;
}

export interface IntakeFormData {
  medicalHistory: string;
  medicationsAllergies: string;
  priorAnesthesiaComplications: string;
  labsImagingReviewed: string;
  asaClass: "I" | "II" | "III" | "IV" | "V";
  additionalTestingNeeded: boolean;
  additionalTestingNotes: string;
  appropriateForSetting: boolean;
  submittedAt: string;
}

export interface ReportFormData {
  anestheticPlan: string;
  recommendationsToSurgeon: string;
  riskLevel: "READY" | "OPTIMIZE" | "SPECIALIST";
  clearanceNotes: string;
  submittedAt: string;
}

export interface CaseAssignment {
  id: string;
  caseReference: string;
  clientReference: string;
  institutionName: string;
  serviceState: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  procedure: string;
  surgeryDate: string;
  complexity: "STANDARD" | "COMPLEX";
  status: CaseStatus;
  assignedTo?: string;
  assignedAt?: string;
  acceptedAt?: string;
  intake?: IntakeFormData;
  report?: ReportFormData;
}

export const STATE_COMPENSATION_RATES: Record<string, { standard: number; complexUplift: number }> = {
  CA: { standard: 300, complexUplift: 150 },
  NY: { standard: 325, complexUplift: 165 },
  TX: { standard: 275, complexUplift: 140 },
  FL: { standard: 270, complexUplift: 135 },
  DEFAULT: { standard: 250, complexUplift: 150 },
};

export function getPayoutForCase(record: CaseAssignment): number {
  const rate = STATE_COMPENSATION_RATES[record.serviceState] ?? STATE_COMPENSATION_RATES.DEFAULT;
  return rate.standard + (record.complexity === "COMPLEX" ? rate.complexUplift : 0);
}

// Hours from assignment to a delivered report; undefined if not yet delivered or never assigned.
export function getDeliveryHours(record: CaseAssignment): number | undefined {
  if (!record.assignedAt || !record.report?.submittedAt) return undefined;
  const start = new Date(record.assignedAt).getTime();
  const end = new Date(record.report.submittedAt).getTime();
  return Math.round((end - start) / (1000 * 60 * 60));
}

export const DOCTOR_ROSTER = ["Dr. Amara Chen", "Dr. Owen Bright", "Dr. Priya Shah"];

// Demo signed-in anesthesiologist identity; no per-request auth linking in this MVP.
export const CURRENT_DOCTOR = "Dr. Amara Chen";

export interface DoctorProfile {
  name: string;
  email: string;
  licenseNumber: string;
  licenseRegion: string;
  specialtyFocus: string;
  bio: string;
  licensedStates: string[];
  malpracticeCoverage: "PENDING" | "ACTIVE";
  malpracticePolicyId?: string;
}

export const doctorProfiles: Record<string, DoctorProfile> = {
  "Dr. Amara Chen": {
    name: "Dr. Amara Chen",
    email: "amara.chen@getpreop.test",
    licenseNumber: "CA-A-2026-4471",
    licenseRegion: "CA",
    specialtyFocus: "General & orthopedic anesthesia",
    bio: "Board-certified anesthesiologist with 9 years of virtual pre-op assessment experience.",
    licensedStates: ["CA", "NY"],
    malpracticeCoverage: "ACTIVE",
    malpracticePolicyId: "GPO-MAL-2026-1842",
  },
};

export interface DoctorSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoAcceptStandardCases: boolean;
  weeklyAvailabilityHours: number;
}

export const doctorSettings: Record<string, DoctorSettings> = {
  "Dr. Amara Chen": {
    emailNotifications: true,
    smsNotifications: false,
    autoAcceptStandardCases: false,
    weeklyAvailabilityHours: 20,
  },
};

export function getDoctorProfile(doctorName: string): DoctorProfile | undefined {
  return doctorProfiles[doctorName];
}

export function getDoctorSettings(doctorName: string): DoctorSettings {
  return doctorSettings[doctorName] ?? {
    emailNotifications: true,
    smsNotifications: false,
    autoAcceptStandardCases: false,
    weeklyAvailabilityHours: 20,
  };
}

export function updateDoctorSettings(doctorName: string, settings: DoctorSettings): DoctorSettings {
  doctorSettings[doctorName] = settings;
  return settings;
}

const institutionAccessProfiles: InstitutionAccessProfile[] = [
  {
    institutionName: "Meridian Surgical Center",
    accessMode: "EHR_ACCESS",
    ehr: {
      vendor: "Epic",
      portalUrl: "https://ehr.meridiansurgical.example.com",
      username: "getpreop.reviewer",
      password: "TempPass-2026!",
    },
  },
  {
    institutionName: "Lakeside Endoscopy Center",
    accessMode: "PHONE_SCREENING",
    phoneContact: {
      contactName: "Front Desk — Lakeside",
      phoneNumber: "(555) 214-9087",
      bestTimeToCall: "9am–4pm ET",
    },
  },
];

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function hoursFromNow(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

// Module-level mutable store: persists for the lifetime of the server process (no DB in this MVP).
const cases: CaseAssignment[] = [
  {
    id: "case-1",
    caseReference: "GPO-CA-260901-001",
    clientReference: "CL-48412",
    institutionName: "Meridian Surgical Center",
    serviceState: "CA",
    patientName: "Vogel, Stanley",
    patientId: "MRN-48412",
    procedure: "Transurethral resection of prostate",
    surgeryDate: daysFromNow(-3),
    complexity: "COMPLEX",
    status: "UNASSIGNED",
  },
  {
    id: "case-2",
    caseReference: "GPO-CA-260901-002",
    clientReference: "CL-48344",
    institutionName: "Meridian Surgical Center",
    serviceState: "CA",
    patientName: "Raghunathan, Priya",
    patientId: "MRN-48344",
    procedure: "Diagnostic laparoscopy",
    surgeryDate: daysFromNow(-1),
    complexity: "STANDARD",
    status: "UNASSIGNED",
  },
  {
    id: "case-3",
    caseReference: "GPO-NY-260901-003",
    clientReference: "CL-96812",
    institutionName: "Lakeside Endoscopy Center",
    serviceState: "NY",
    patientName: "Coleman, Ruth",
    patientId: "DOB 04/12/1968",
    patientPhone: "(555) 908-2231",
    procedure: "Screening colonoscopy",
    surgeryDate: daysFromNow(6),
    complexity: "STANDARD",
    status: "UNASSIGNED",
  },
  {
    id: "case-4",
    caseReference: "GPO-CA-260901-004",
    clientReference: "CL-48311",
    institutionName: "Meridian Surgical Center",
    serviceState: "CA",
    patientName: "Nkemdirim, Harold",
    patientId: "MRN-48311",
    procedure: "Total knee arthroplasty",
    surgeryDate: daysFromNow(1),
    complexity: "COMPLEX",
    status: "ASSIGNED",
    assignedTo: "Dr. Amara Chen",
    assignedAt: hoursFromNow(-6),
  },
  {
    id: "case-5",
    caseReference: "GPO-NY-260901-005",
    clientReference: "CL-97530",
    institutionName: "Lakeside Endoscopy Center",
    serviceState: "NY",
    patientName: "Faruk, Ibrahim",
    patientId: "DOB 11/30/1975",
    patientPhone: "(555) 447-6620",
    procedure: "EGD with biopsy",
    surgeryDate: daysFromNow(4),
    complexity: "STANDARD",
    status: "ACCEPTED",
    assignedTo: "Dr. Amara Chen",
    assignedAt: hoursFromNow(-30),
    acceptedAt: hoursFromNow(-28),
  },
  {
    id: "case-6",
    caseReference: "GPO-CA-260901-006",
    clientReference: "CL-48602",
    institutionName: "Meridian Surgical Center",
    serviceState: "CA",
    patientName: "Whitfield, Anna",
    patientId: "MRN-48602",
    procedure: "Laparoscopic cholecystectomy",
    surgeryDate: daysFromNow(9),
    complexity: "STANDARD",
    status: "REPORT_SUBMITTED",
    assignedTo: "Dr. Amara Chen",
    assignedAt: hoursFromNow(-72),
    acceptedAt: hoursFromNow(-70),
    intake: {
      medicalHistory: "No significant history",
      medicationsAllergies: "NKDA",
      priorAnesthesiaComplications: "None",
      labsImagingReviewed: "CBC, CMP WNL",
      asaClass: "I",
      additionalTestingNeeded: false,
      additionalTestingNotes: "",
      appropriateForSetting: true,
      submittedAt: hoursFromNow(-52),
    },
    report: {
      anestheticPlan: "General anesthesia, standard monitors",
      recommendationsToSurgeon: "Cleared, no restrictions",
      riskLevel: "READY",
      clearanceNotes: "ASA I, no barriers",
      submittedAt: hoursFromNow(-48),
    },
  },
  {
    id: "case-7",
    caseReference: "GPO-NY-260901-007",
    clientReference: "CL-98047",
    institutionName: "Lakeside Endoscopy Center",
    serviceState: "NY",
    patientName: "Osei, Kwame",
    patientId: "DOB 02/18/1980",
    patientPhone: "(555) 662-1904",
    procedure: "Colonoscopy with polypectomy",
    surgeryDate: daysFromNow(11),
    complexity: "COMPLEX",
    status: "REPORT_SUBMITTED",
    assignedTo: "Dr. Amara Chen",
    assignedAt: hoursFromNow(-96),
    acceptedAt: hoursFromNow(-94),
    intake: {
      medicalHistory: "Type 2 diabetes, well controlled",
      medicationsAllergies: "Metformin; NKDA",
      priorAnesthesiaComplications: "None",
      labsImagingReviewed: "A1c 6.8, CBC WNL",
      asaClass: "II",
      additionalTestingNeeded: false,
      additionalTestingNotes: "",
      appropriateForSetting: true,
      submittedAt: hoursFromNow(-70),
    },
    report: {
      anestheticPlan: "Deep sedation with propofol, monitored anesthesia care",
      recommendationsToSurgeon: "Cleared, hold metformin morning of procedure",
      riskLevel: "OPTIMIZE",
      clearanceNotes: "ASA II, diabetes optimization confirmed",
      submittedAt: hoursFromNow(-64),
    },
  },
];

export function getInstitutionAccessProfiles(): InstitutionAccessProfile[] {
  return institutionAccessProfiles;
}

export function getInstitutionAccessProfile(institutionName: string): InstitutionAccessProfile | undefined {
  return institutionAccessProfiles.find((p) => p.institutionName === institutionName);
}

export function upsertInstitutionAccessProfile(profile: InstitutionAccessProfile) {
  const idx = institutionAccessProfiles.findIndex((p) => p.institutionName === profile.institutionName);
  if (idx >= 0) {
    institutionAccessProfiles[idx] = profile;
  } else {
    institutionAccessProfiles.push(profile);
  }
  return profile;
}

export function getAllCases(): CaseAssignment[] {
  return cases;
}

export function getUnassignedCases(): CaseAssignment[] {
  return cases.filter((c) => c.status === "UNASSIGNED");
}

export function getCasesForDoctor(doctorName: string): CaseAssignment[] {
  return cases.filter((c) => c.assignedTo === doctorName);
}

export function getCaseById(id: string): CaseAssignment | undefined {
  return cases.find((c) => c.id === id);
}

export interface DoctorOverview {
  doctorName: string;
  totalAssigned: number;
  awaitingResponse: number;
  inProgress: number;
  completed: number;
  totalEarnings: number;
  avgDeliveryHours: number | null;
  needsAttention: CaseAssignment[];
  recentCompleted: CaseAssignment[];
}

export function getDoctorOverview(doctorName: string): DoctorOverview {
  const myCases = getCasesForDoctor(doctorName);
  const completedCases = myCases.filter((c) => c.status === "REPORT_SUBMITTED");
  const deliveryHours = completedCases
    .map((c) => getDeliveryHours(c))
    .filter((h): h is number => h !== undefined);

  return {
    doctorName,
    totalAssigned: myCases.length,
    awaitingResponse: myCases.filter((c) => c.status === "ASSIGNED").length,
    inProgress: myCases.filter((c) => c.status === "ACCEPTED" || c.status === "INTAKE_COMPLETE").length,
    completed: completedCases.length,
    totalEarnings: completedCases.reduce((sum, c) => sum + getPayoutForCase(c), 0),
    avgDeliveryHours: deliveryHours.length > 0 ? Math.round(deliveryHours.reduce((a, b) => a + b, 0) / deliveryHours.length) : null,
    needsAttention: myCases.filter((c) => c.status === "ASSIGNED" || c.status === "ACCEPTED"),
    recentCompleted: completedCases,
  };
}

export function assignCase(id: string, doctorName: string): CaseAssignment | undefined {
  const record = getCaseById(id);
  if (!record) return undefined;
  record.assignedTo = doctorName;
  record.status = "ASSIGNED";
  record.assignedAt = new Date().toISOString();
  return record;
}

export function respondToCase(id: string, accept: boolean): CaseAssignment | undefined {
  const record = getCaseById(id);
  if (!record) return undefined;
  if (accept) {
    record.status = "ACCEPTED";
    record.acceptedAt = new Date().toISOString();
  } else {
    record.status = "UNASSIGNED";
    record.assignedTo = undefined;
    record.assignedAt = undefined;
    record.acceptedAt = undefined;
  }
  return record;
}

export function submitIntake(id: string, intake: Omit<IntakeFormData, "submittedAt">): CaseAssignment | undefined {
  const record = getCaseById(id);
  if (!record) return undefined;
  record.intake = { ...intake, submittedAt: new Date().toISOString() };
  record.status = "INTAKE_COMPLETE";
  return record;
}

export function submitReport(id: string, report: Omit<ReportFormData, "submittedAt">): CaseAssignment | undefined {
  const record = getCaseById(id);
  if (!record) return undefined;
  record.report = { ...report, submittedAt: new Date().toISOString() };
  record.status = "REPORT_SUBMITTED";
  return record;
}
