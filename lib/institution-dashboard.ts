import { prisma } from "@/lib/db";
import type { ReferralRecord, AnalyticsData } from "@/lib/institution-data";

export type InstitutionDashboardCase = {
  id: string;
  patient: string;
  procedure: string;
  surgeryDate: string;
  stage: string;
  risk: "READY" | "OPTIMIZE" | "SPECIALIST" | null;
  clearanceDeadline: string;
  surgeon: string;
};

export async function getInstitutionDashboardData(surgeryCenterId?: string | null) {
  if (!surgeryCenterId) return { cases: [] as InstitutionDashboardCase[], cancellations: [] };

  const referrals = await prisma.referral.findMany({
    where: { surgeryCenterId },
    orderBy: { scheduledDate: "asc" },
    include: { surgeryCases: { include: { readinessSummaries: { orderBy: { decidedAt: "desc" }, take: 1 } } } },
  });

  const cases = referrals.map((referral) => {
    const surgeryCase = referral.surgeryCases[0];
    const riskValue = surgeryCase?.readinessSummaries[0]?.level;
    const risk = riskValue === "READY" ? "READY" : riskValue === "OPTIMIZING" ? "OPTIMIZE" : riskValue === "NOT_READY" ? "SPECIALIST" : null;
    const surgeryDate = surgeryCase?.plannedDate ?? referral.scheduledDate;
    const stage = surgeryCase?.readinessSummaries[0] ? (risk === "READY" ? "CLEARED" : "ASSESSED") : referral.status === "intake_created" ? "INTAKE_PENDING" : "NEW_REFERRAL";
    return {
      id: referral.id,
      patient: referral.patientFullName,
      procedure: referral.procedureName,
      surgeryDate: surgeryDate.toISOString(),
      stage,
      risk,
      clearanceDeadline: new Date(referral.createdAt.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      surgeon: surgeryCase?.surgeonName ?? "Not assigned",
    } satisfies InstitutionDashboardCase;
  });

  return { cases, cancellations: [] };
}

export async function getInstitutionReferrals(surgeryCenterId?: string | null): Promise<ReferralRecord[]> {
  if (!surgeryCenterId) return [];
  const referrals = await prisma.referral.findMany({
    where: { surgeryCenterId },
    orderBy: { scheduledDate: "asc" },
    include: {
      surgeryCases: {
        include: {
          patientProfile: { select: { dateOfBirth: true } },
          readinessSummaries: { orderBy: { decidedAt: "desc" }, take: 1 },
        },
      },
    },
  });

  return referrals.map((referral) => {
    const surgeryCase = referral.surgeryCases[0];
    const readiness = surgeryCase?.readinessSummaries[0];
    const risk = readiness?.level === "READY" ? "READY" : readiness?.level === "OPTIMIZING" ? "OPTIMIZE" : readiness?.level === "NOT_READY" ? "SPECIALIST" : null;
    const surgeryDate = surgeryCase?.plannedDate ?? referral.scheduledDate;
    const age = surgeryCase?.patientProfile?.dateOfBirth ? Math.floor((Date.now() - surgeryCase.patientProfile.dateOfBirth.getTime()) / 31_557_600_000) : 0;
    const stage = readiness ? (risk === "READY" ? "CLEARED" : "ASSESSED") : referral.status === "intake_created" ? "INTAKE_PENDING" : "NEW_REFERRAL";
    return {
      id: referral.id,
      patient: referral.patientFullName,
      mrn: `REF-${referral.id.slice(-6).toUpperCase()}`,
      age,
      asaClass: null,
      complex: referral.priority === "urgent",
      procedure: referral.procedureName,
      surgeon: surgeryCase?.surgeonName ?? "Not assigned",
      surgeryDate,
      clearanceDeadline: new Date(referral.createdAt.getTime() + 48 * 60 * 60 * 1000),
      stage,
      risk,
    } satisfies ReferralRecord;
  });
}

export async function getInstitutionAnalytics(surgeryCenterId?: string | null): Promise<AnalyticsData> {
  const referrals = await getInstitutionReferrals(surgeryCenterId);
  const resolved = referrals.filter((referral) => referral.stage === "CLEARED" || referral.stage === "REPORT_DELIVERED");
  const surgeons = Array.from(new Set(referrals.map((referral) => referral.surgeon)));
  return {
    turnaroundBuckets: [
      { label: "< 24h", count: resolved.length },
      { label: "24-48h", count: 0 },
      { label: "48-72h", count: 0 },
      { label: "> 72h", count: 0 },
    ],
    riskMix: [
      { label: "Ready", count: referrals.filter((referral) => referral.risk === "READY").length },
      { label: "Needs specialist", count: referrals.filter((referral) => referral.risk === "SPECIALIST").length },
      { label: "Needs optimization", count: referrals.filter((referral) => referral.risk === "OPTIMIZE").length },
    ],
    cancellationsOverTime: [],
    volumeBySurgeon: surgeons.map((surgeon) => ({ surgeon: surgeon.replace(/^Dr\. /, ""), cleared: referrals.filter((referral) => referral.surgeon === surgeon && resolved.includes(referral)).length, pending: referrals.filter((referral) => referral.surgeon === surgeon && !resolved.includes(referral)).length })),
  };
}