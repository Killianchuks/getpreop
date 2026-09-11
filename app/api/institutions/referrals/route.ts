import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getInstitutionReferrals } from "@/lib/institution-dashboard";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SURGERY_CENTER") return NextResponse.json({ error: "Institution access required" }, { status: 403 });
  return NextResponse.json({ referrals: await getInstitutionReferrals(user.surgeryCenterId) });
}