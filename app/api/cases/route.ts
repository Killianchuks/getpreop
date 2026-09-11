import { NextResponse } from "next/server";
import {
  getAllCases,
  getCasesForDoctor,
  getDeliveryHours,
  getPayoutForCase,
  getUnassignedCases,
  type CaseAssignment,
} from "@/lib/case-assignment-data";
import { prisma } from "@/lib/db";

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
    const cookieHeader = request.headers.get("cookie") ?? "";
    const email = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("getpreop_user="))
      ?.split("=")[1];

    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { fullName: true, role: true, anesthesiologistProfile: { select: { adminApprovedAt: true } } },
    });

    if (!user || user.role !== "ANESTHESIOLOGIST") {
      return NextResponse.json({ error: "Anesthesiologist access required" }, { status: 403 });
    }
    if (!user.anesthesiologistProfile?.adminApprovedAt) {
      return NextResponse.json({ error: "Clinician approval required" }, { status: 403 });
    }

    return NextResponse.json({ cases: getCasesForDoctor(user.fullName).map(withEarnings), doctor: user.fullName });
  }
  return NextResponse.json({ cases: getAllCases().map(withEarnings) });
}
