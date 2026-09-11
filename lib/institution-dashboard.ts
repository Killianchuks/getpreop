import { prisma } from "@/lib/db";

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