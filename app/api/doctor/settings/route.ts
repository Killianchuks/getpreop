import { NextResponse } from "next/server";
import { CURRENT_DOCTOR, getDoctorSettings, updateDoctorSettings } from "@/lib/case-assignment-data";

export async function GET() {
  return NextResponse.json({ settings: getDoctorSettings(CURRENT_DOCTOR) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const settings = updateDoctorSettings(CURRENT_DOCTOR, {
    emailNotifications: Boolean(body.emailNotifications),
    smsNotifications: Boolean(body.smsNotifications),
    autoAcceptStandardCases: Boolean(body.autoAcceptStandardCases),
    weeklyAvailabilityHours: Number(body.weeklyAvailabilityHours) || 0,
  });
  return NextResponse.json({ settings });
}
