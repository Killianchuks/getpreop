import { NextResponse } from "next/server";

const snapshots = [
  {
    patientProfileId: "pat_a1",
    level: "NEEDS_OPTIMIZATION",
    blockers: ["cardiology_clearance", "glycemic_optimization"],
    nextMilestone: "2026-08-20T09:00:00.000Z",
  },
  {
    patientProfileId: "pat_a2",
    level: "READY",
    blockers: [],
    nextMilestone: "2026-08-11T10:00:00.000Z",
  },
  {
    patientProfileId: "pat_a3",
    level: "NEEDS_SPECIALIST_EVALUATION",
    blockers: ["active_smoking", "poor_functional_capacity", "pending_teleconsult"],
    nextMilestone: "2026-08-27T08:30:00.000Z",
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level");

  const data = level
    ? snapshots.filter((item) => item.level === level)
    : snapshots;

  return NextResponse.json({
    total: data.length,
    data,
  });
}
