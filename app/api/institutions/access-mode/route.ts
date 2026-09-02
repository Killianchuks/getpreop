import { NextResponse } from "next/server";
import {
  getInstitutionAccessProfile,
  getInstitutionAccessProfiles,
  upsertInstitutionAccessProfile,
} from "@/lib/case-assignment-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const institutionName = searchParams.get("institution");

  if (institutionName) {
    const profile = getInstitutionAccessProfile(institutionName);
    return NextResponse.json({ profile: profile ?? null });
  }
  return NextResponse.json({ profiles: getInstitutionAccessProfiles() });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.institutionName || !body.accessMode) {
    return NextResponse.json({ error: "institutionName and accessMode are required" }, { status: 400 });
  }
  const profile = upsertInstitutionAccessProfile(body);
  return NextResponse.json({ profile });
}
