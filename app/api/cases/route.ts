import { NextResponse } from "next/server";
import {
  CURRENT_DOCTOR,
  getAllCases,
  getCasesForDoctor,
  getDeliveryHours,
  getPayoutForCase,
  getUnassignedCases,
  type CaseAssignment,
} from "@/lib/case-assignment-data";

function withEarnings(record: CaseAssignment) {
  return {
    ...record,
    payout: getPayoutForCase(record),
    deliveryHours: getDeliveryHours(record),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "all";

  if (scope === "unassigned") {
    return NextResponse.json({ cases: getUnassignedCases().map(withEarnings) });
  }
  if (scope === "mine") {
    return NextResponse.json({ cases: getCasesForDoctor(CURRENT_DOCTOR).map(withEarnings), doctor: CURRENT_DOCTOR });
  }
  return NextResponse.json({ cases: getAllCases().map(withEarnings) });
}
