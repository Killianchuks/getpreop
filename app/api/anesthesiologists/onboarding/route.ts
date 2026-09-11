import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getUser(request: Request) {
  const email = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("getpreop_user="))
    ?.split("=")[1];
  if (!email) return null;
  return prisma.user.findUnique({ where: { email }, include: { anesthesiologistProfile: true } });
}

export async function GET(request: Request) {
  const user = await getUser(request);
  if (!user || user.role !== "ANESTHESIOLOGIST" || !user.anesthesiologistProfile) {
    return NextResponse.json({ error: "Anesthesiologist access required" }, { status: 403 });
  }
  return NextResponse.json({ user: { fullName: user.fullName, email: user.email }, profile: user.anesthesiologistProfile });
}

export async function PATCH(request: Request) {
  const user = await getUser(request);
  if (!user || user.role !== "ANESTHESIOLOGIST" || !user.anesthesiologistProfile) {
    return NextResponse.json({ error: "Anesthesiologist access required" }, { status: 403 });
  }

  const body = await request.json();
  const required = ["licenseNumber", "licenseRegion", "licenseExpiration", "specialtyFocus", "bio", "payoutAccountHolderName", "payoutAccountType", "payoutRoutingNumber", "payoutAccountNumber", "taxId"];
  if (required.some((field) => typeof body[field] !== "string" || !body[field].trim()) || !Array.isArray(body.licensedStates) || body.licensedStates.length === 0 || body.attested !== true) {
    return NextResponse.json({ error: "Complete every required onboarding field before submitting." }, { status: 400 });
  }

  const expiration = new Date(body.licenseExpiration);
  if (Number.isNaN(expiration.getTime()) || expiration <= new Date()) {
    return NextResponse.json({ error: "License expiration must be a future date." }, { status: 400 });
  }

  const profile = await prisma.anesthesiologistProfile.update({
    where: { userId: user.id },
    data: {
      licenseNumber: body.licenseNumber.trim(),
      licenseRegion: body.licenseRegion.trim().toUpperCase(),
      licenseExpiration: expiration,
      specialtyFocus: body.specialtyFocus.trim(),
      bio: body.bio.trim(),
      licensedStates: body.licensedStates.map((state: unknown) => String(state).trim().toUpperCase()),
      attestedAt: new Date(),
      payoutAccountHolderName: body.payoutAccountHolderName.trim(),
      payoutAccountType: body.payoutAccountType.trim(),
      payoutRoutingLast4: body.payoutRoutingNumber.trim().slice(-4),
      payoutAccountLast4: body.payoutAccountNumber.trim().slice(-4),
      taxIdLast4: body.taxId.trim().slice(-4),
      onboardingCompletedAt: new Date(),
      adminApprovedAt: null,
      verified: false,
    },
  });

  return NextResponse.json({ profile });
}