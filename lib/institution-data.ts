import { differenceInCalendarDays, differenceInHours, format } from "date-fns";

export type ReferralStage =
  | "NEW_REFERRAL"
  | "INTAKE_PENDING"
  | "INTAKE_COMPLETE"
  | "ASSIGNED"
  | "CONSULT_SCHEDULED"
  | "ASSESSED"
  | "REPORT_DELIVERED"
  | "CLEARED"
  | "ON_HOLD";

export const STAGE_ORDER: { stage: ReferralStage; label: string }[] = [
  { stage: "NEW_REFERRAL", label: "New referral" },
  { stage: "INTAKE_PENDING", label: "Intake pending" },
  { stage: "INTAKE_COMPLETE", label: "Intake complete" },
  { stage: "ASSIGNED", label: "Assigned" },
  { stage: "CONSULT_SCHEDULED", label: "Consult scheduled" },
  { stage: "ASSESSED", label: "Assessed" },
  { stage: "REPORT_DELIVERED", label: "Report delivered" },
  { stage: "CLEARED", label: "Cleared" },
  { stage: "ON_HOLD", label: "On hold" },
];

const RESOLVED_STAGES: ReferralStage[] = ["REPORT_DELIVERED", "CLEARED"];

export type RiskLevel = "READY" | "OPTIMIZE" | "SPECIALIST" | null;

export interface ReferralRecord {
  id: string;
  patient: string;
  mrn: string;
  age: number;
  asaClass: "I" | "II" | "III" | "IV" | null;
  complex: boolean;
  procedure: string;
  surgeon: string;
  surgeryDate: Date;
  clearanceDeadline: Date;
  stage: ReferralStage;
  risk: RiskLevel;
}

function daysFromNow(days: number, hours = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date;
}

export const referralSeed: ReferralRecord[] = [
  {
    id: "ref-48412",
    patient: "Vogel, Stanley",
    mrn: "MRN-48412",
    age: 82,
    asaClass: "IV",
    complex: true,
    procedure: "Transurethral resection of prostate",
    surgeon: "Dr. Owen Hartley",
    surgeryDate: daysFromNow(-3),
    clearanceDeadline: daysFromNow(-27),
    stage: "ASSIGNED",
    risk: "SPECIALIST",
  },
  {
    id: "ref-48344",
    patient: "Raghunathan, Priya",
    mrn: "MRN-48344",
    age: 37,
    asaClass: "II",
    complex: false,
    procedure: "Diagnostic laparoscopy",
    surgeon: "Dr. Imani Blake",
    surgeryDate: daysFromNow(-1),
    clearanceDeadline: daysFromNow(-25),
    stage: "INTAKE_COMPLETE",
    risk: "SPECIALIST",
  },
  {
    id: "ref-48530",
    patient: "Nguyen, Tessa",
    mrn: "MRN-48530",
    age: 34,
    asaClass: "I",
    complex: false,
    procedure: "Arthroscopic meniscus repair",
    surgeon: "Dr. Nadia Farrow",
    surgeryDate: daysFromNow(5),
    clearanceDeadline: daysFromNow(-2),
    stage: "CLEARED",
    risk: "READY",
  },
  {
    id: "ref-48390",
    patient: "Boyd, Walter",
    mrn: "MRN-48390",
    age: 73,
    asaClass: "III",
    complex: true,
    procedure: "Inguinal hernia repair",
    surgeon: "Dr. Reed Coleman",
    surgeryDate: daysFromNow(8),
    clearanceDeadline: daysFromNow(-16),
    stage: "CONSULT_SCHEDULED",
    risk: "SPECIALIST",
  },
  {
    id: "ref-48210-a",
    patient: "Alvarez, Robert",
    mrn: "MRN-48210",
    age: 68,
    asaClass: "III",
    complex: false,
    procedure: "Laparoscopic cholecystectomy",
    surgeon: "Dr. Reed Coleman",
    surgeryDate: daysFromNow(14),
    clearanceDeadline: daysFromNow(-4),
    stage: "REPORT_DELIVERED",
    risk: "OPTIMIZE",
  },
  {
    id: "ref-48311",
    patient: "Nkemdirim, Harold",
    mrn: "MRN-48311",
    age: 80,
    asaClass: "IV",
    complex: true,
    procedure: "Total knee arthroplasty",
    surgeon: "Dr. Nadia Farrow",
    surgeryDate: daysFromNow(1),
    clearanceDeadline: daysFromNow(0, -37),
    stage: "ASSESSED",
    risk: "SPECIALIST",
  },
  {
    id: "ref-48210-b",
    patient: "Alvarez, Robert",
    mrn: "MRN-48210",
    age: 68,
    asaClass: null,
    complex: false,
    procedure: "Screening colonoscopy",
    surgeon: "Dr. Yusuf Demir",
    surgeryDate: daysFromNow(22),
    clearanceDeadline: daysFromNow(19),
    stage: "INTAKE_PENDING",
    risk: null,
  },
];

export const cancellationSeed = [
  {
    id: "cxl-1",
    patient: "Whitmore, Elaine",
    procedure: "Laparoscopic appendectomy",
    surgeryDate: daysFromNow(-40),
    reason: "Uncleared cardiac risk discovered day-of",
    preventable: true,
  },
  {
    id: "cxl-2",
    patient: "Park, Simon",
    procedure: "Rotator cuff repair",
    surgeryDate: daysFromNow(-33),
    reason: "Patient no-show",
    preventable: false,
  },
  {
    id: "cxl-3",
    patient: "Delgado, Marisol",
    procedure: "Hemorrhoidectomy",
    surgeryDate: daysFromNow(-20),
    reason: "Missed NPO instructions",
    preventable: true,
  },
  {
    id: "cxl-4",
    patient: "Achebe, Ifeoma",
    procedure: "Cataract extraction",
    surgeryDate: daysFromNow(-9),
    reason: "Anticoagulant not held before surgery",
    preventable: true,
  },
];

export interface ClearanceStatus {
  status: "overdue" | "on-track" | "met";
  label: string;
}

export function computeClearance(referral: ReferralRecord): ClearanceStatus {
  if (RESOLVED_STAGES.includes(referral.stage)) {
    return { status: "met", label: "Met" };
  }

  const now = new Date();
  const hoursUntil = differenceInHours(referral.clearanceDeadline, now);

  if (hoursUntil < 0) {
    const daysOverdue = Math.abs(differenceInCalendarDays(now, referral.clearanceDeadline));
    if (daysOverdue < 1) {
      return { status: "overdue", label: `Overdue ${Math.abs(hoursUntil)}h ago` };
    }
    return { status: "overdue", label: `Overdue ${daysOverdue}d ago` };
  }

  const daysUntil = differenceInCalendarDays(referral.clearanceDeadline, now);
  if (daysUntil < 1) {
    return { status: "on-track", label: `On track ${hoursUntil}h left` };
  }
  return { status: "on-track", label: `On track in ${daysUntil}d` };
}

export function formatSurgeryDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export interface InstitutionOverview {
  facilityName: string;
  clinicianName: string;
  metrics: {
    activeReferrals: number;
    clearanceAtRisk: number;
    readyPct: number;
    avgTurnaroundHours: number;
  };
  needsAttention: ReferralRecord[];
  riskMix: { specialist: number; optimize: number; ready: number };
  upcoming: ReferralRecord[];
}

export function getInstitutionOverview(): InstitutionOverview {
  const referrals = referralSeed;
  const activeReferrals = referrals.filter((r) => !RESOLVED_STAGES.includes(r.stage) && r.stage !== "ON_HOLD").length;
  const clearanceAtRisk = referrals.filter((r) => {
    const clearance = computeClearance(r);
    return clearance.status === "overdue" || (clearance.status === "on-track" && clearance.label.includes("h left"));
  }).length;

  const assessedOrBeyond = referrals.filter((r) =>
    ["ASSESSED", "REPORT_DELIVERED", "CLEARED"].includes(r.stage)
  );
  const readyCount = assessedOrBeyond.filter((r) => r.risk === "READY").length;
  const readyPct = assessedOrBeyond.length > 0 ? Math.round((readyCount / assessedOrBeyond.length) * 100) : 0;

  const avgTurnaroundHours = 42;

  const needsAttention = referrals
    .filter((r) => computeClearance(r).status === "overdue")
    .sort((a, b) => a.clearanceDeadline.getTime() - b.clearanceDeadline.getTime());

  const riskMix = {
    specialist: referrals.filter((r) => r.risk === "SPECIALIST").length,
    optimize: referrals.filter((r) => r.risk === "OPTIMIZE").length,
    ready: referrals.filter((r) => r.risk === "READY").length,
  };

  const upcoming = referrals
    .filter((r) => r.surgeryDate.getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => a.surgeryDate.getTime() - b.surgeryDate.getTime());

  return {
    facilityName: "Meridian Surgical Center",
    clinicianName: "Dana Whitfield",
    metrics: { activeReferrals, clearanceAtRisk, readyPct, avgTurnaroundHours },
    needsAttention,
    riskMix,
    upcoming,
  };
}

export function getReferrals(): ReferralRecord[] {
  return referralSeed;
}

export function getCancellations() {
  return cancellationSeed;
}

export interface AnalyticsData {
  turnaroundBuckets: { label: string; count: number }[];
  riskMix: { label: string; count: number }[];
  cancellationsOverTime: { month: string; total: number; preventable: number }[];
  volumeBySurgeon: { surgeon: string; cleared: number; pending: number }[];
}

export function getAnalytics(): AnalyticsData {
  const referrals = referralSeed;

  const turnaroundBuckets = [
    { label: "< 24h", count: 0 },
    { label: "24-48h", count: referrals.filter((r) => RESOLVED_STAGES.includes(r.stage)).length },
    { label: "48-72h", count: 0 },
    { label: "> 72h", count: 0 },
  ];

  const riskMix = [
    { label: "Ready", count: referrals.filter((r) => r.risk === "READY").length },
    { label: "Needs specialist", count: referrals.filter((r) => r.risk === "SPECIALIST").length },
    { label: "Needs optimization", count: referrals.filter((r) => r.risk === "OPTIMIZE").length },
  ];

  const cancellations = cancellationSeed;
  const cancellationsOverTime = [
    { month: format(daysFromNow(-60), "MMM"), total: 4, preventable: 4 },
    { month: format(daysFromNow(-30), "MMM"), total: 4, preventable: 3 },
    { month: format(new Date(), "MMM"), total: cancellations.length, preventable: cancellations.filter((c) => c.preventable).length },
  ];

  const surgeons = Array.from(new Set(referrals.map((r) => r.surgeon)));
  const volumeBySurgeon = surgeons.map((surgeon) => {
    const cases = referrals.filter((r) => r.surgeon === surgeon);
    return {
      surgeon: surgeon.replace("Dr. ", ""),
      cleared: cases.filter((r) => RESOLVED_STAGES.includes(r.stage)).length,
      pending: cases.filter((r) => !RESOLVED_STAGES.includes(r.stage)).length,
    };
  });

  return { turnaroundBuckets, riskMix, cancellationsOverTime, volumeBySurgeon };
}
