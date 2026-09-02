import { prisma } from "@/lib/db";

export interface SurgeryCenterDashboardData {
  metrics: Array<{ label: string; value: string }>;
  queue: Array<{
    patient: string;
    procedure: string;
    readiness: string;
    reportEta: string;
  }>;
  source: "live" | "fallback";
}

export interface AnesthesiologistDashboardData {
  stack: string[];
  slate: Array<{
    patient: string;
    stateMatch: string;
    readiness: string;
    billing: string;
  }>;
  source: "live" | "fallback";
}

export interface PatientDashboardData {
  tools: string[];
  instructions: string[];
  source: "live" | "fallback";
}

const stackTemplate = [
  "License verification with state/province matching",
  "Calendar and telehealth session management",
  "Standardized documentation templates",
  "Secure telehealth workflow and billing support",
  "Peer quality review and case calibration",
];

const toolTemplate = [
  "Simple appointment scheduling",
  "Secure medical record upload",
  "Video consultation access",
  "Personalized preoperative instructions",
  "Direct anesthesia Q&A secure messaging",
];

export async function getSurgeryCenterDashboardData(): Promise<SurgeryCenterDashboardData> {
  try {
    const [
      totalReferrals,
      urgentReferrals,
      reportsUnder48Hours,
      reports,
      upcomingCases,
    ] = await Promise.all([
      prisma.referral.count(),
      prisma.referral.count({ where: { priority: "urgent" } }),
      prisma.preopReport.count({ where: { turnaroundHours: { lte: 48 } } }),
      prisma.preopReport.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.surgeryCase.count({ where: { plannedDate: { gte: new Date() } } }),
    ]);

    const queue = reports.map((report) => ({
      patient: report.patientFullName,
      procedure: report.procedureName,
      readiness: report.readinessLevel.replaceAll("_", " "),
      reportEta: `${report.turnaroundHours}h`,
    }));

    return {
      metrics: [
        { label: "Total referrals", value: String(totalReferrals) },
        { label: "Urgent referrals", value: String(urgentReferrals) },
        { label: "Reports within 48h", value: String(reportsUnder48Hours) },
        { label: "Upcoming surgery cases", value: String(upcomingCases) },
      ],
      queue,
      source: "live",
    };
  } catch {
    return {
      metrics: [
        { label: "Total referrals", value: "0" },
        { label: "Urgent referrals", value: "0" },
        { label: "Reports within 48h", value: "0" },
        { label: "Upcoming surgery cases", value: "0" },
      ],
      queue: [],
      source: "fallback",
    };
  }
}

export async function getAnesthesiologistDashboardData(): Promise<AnesthesiologistDashboardData> {
  try {
    const [consultations, profiles, reports] = await Promise.all([
      prisma.teleconsultation.findMany({
        orderBy: { scheduledStart: "asc" },
        take: 5,
        include: {
          patientProfile: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.anesthesiologistProfile.count({ where: { verified: true } }),
      prisma.preopReport.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const latestReadinessByPatient = new Map<string, string>();
    for (const report of reports) {
      if (report.patientProfileId && !latestReadinessByPatient.has(report.patientProfileId)) {
        latestReadinessByPatient.set(report.patientProfileId, report.readinessLevel);
      }
    }

    const slate = consultations.map((consultation) => ({
      patient: consultation.patientProfile.user.fullName,
      stateMatch: profiles > 0 ? "Verified license" : "Verification pending",
      readiness: latestReadinessByPatient.get(consultation.patientProfileId)?.replaceAll("_", " ") ?? "PENDING",
      billing: consultation.status === "COMPLETED" ? "Ready" : "Pending",
    }));

    return {
      stack: stackTemplate,
      slate,
      source: "live",
    };
  } catch {
    return {
      stack: stackTemplate,
      slate: [],
      source: "fallback",
    };
  }
}

export async function getPatientDashboardData(): Promise<PatientDashboardData> {
  try {
    const [latestReport, totalMessages, totalAppointments] = await Promise.all([
      prisma.preopReport.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.secureMessage.count(),
      prisma.teleconsultation.count(),
    ]);

    const instructions = latestReport?.medicationInstructions?.length
      ? latestReport.medicationInstructions
      : [
          "Stop herbal supplements 7 days before surgery unless instructed otherwise.",
          "Do not eat solid food after midnight before surgery.",
          "Take blood pressure medications with a sip of water unless advised otherwise.",
          "Upload any outside cardiac or pulmonary records before your teleconsult.",
        ];

    return {
      tools: [
        ...toolTemplate,
        `Appointments tracked: ${totalAppointments}`,
        `Secure messages exchanged: ${totalMessages}`,
      ],
      instructions,
      source: "live",
    };
  } catch {
    return {
      tools: toolTemplate,
      instructions: [
        "Stop herbal supplements 7 days before surgery unless instructed otherwise.",
        "Do not eat solid food after midnight before surgery.",
        "Take blood pressure medications with a sip of water unless advised otherwise.",
        "Upload any outside cardiac or pulmonary records before your teleconsult.",
      ],
      source: "fallback",
    };
  }
}
