import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Institution referrals are created only after verified payment." },
    { status: 403 },
  );
}
