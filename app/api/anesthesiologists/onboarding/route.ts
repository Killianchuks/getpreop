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

  const body = await request.formData();
  const text = (field: string) => String(body.get(field) ?? "").trim();
  const licensedStates = body.getAll("licensedStates").map((state) => String(state).trim().toUpperCase()).filter(Boolean);
  const licenseEvidence = body.get("licenseEvidence");
  const credentialEvidence = body.get("credentialEvidence");
  const malpracticeEvidence = body.get("malpracticeEvidence");
  const malpracticeStatus = text("malpracticeInsuranceStatus");
  const required = ["licenseNumber", "licenseRegion", "licenseExpiration", "specialtyFocus", "bio", "payoutAccountHolderName", "payoutAccountType", "bankName", "payoutRoutingNumber", "payoutAccountNumber", "taxId"];
  if (required.some((field) => !text(field)) || licensedStates.length === 0 || body.get("attested") !== "true" || !(licenseEvidence instanceof File) || licenseEvidence.size === 0 || !(credentialEvidence instanceof File) || credentialEvidence.size === 0 || !["HAVE", "NONE"].includes(malpracticeStatus)) {
    return NextResponse.json({ error: "Complete every required onboarding field before submitting." }, { status: 400 });
  }

  if (malpracticeStatus === "HAVE" && (!(malpracticeEvidence instanceof File) || malpracticeEvidence.size === 0 || !text("malpracticeProvider") || !text("malpracticePolicyNumber"))) {
    return NextResponse.json({ error: "Provide malpractice insurance details and evidence, or select that you do not have coverage." }, { status: 400 });
  }

  const documents: File[] = [licenseEvidence, credentialEvidence, ...(malpracticeStatus === "HAVE" ? [malpracticeEvidence] : [])].filter((file): file is File => file instanceof File);
  if (documents.some((file) => file instanceof File && (file.size > 5_000_000 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)))) {
    return NextResponse.json({ error: "Evidence files must be PDF, JPG, or PNG files no larger than 5 MB." }, { status: 400 });
  }

  const expiration = new Date(text("licenseExpiration"));
  if (Number.isNaN(expiration.getTime()) || expiration <= new Date()) {
    return NextResponse.json({ error: "License expiration must be a future date." }, { status: 400 });
  }

  const profile = await prisma.anesthesiologistProfile.update({
    where: { userId: user.id },
    data: {
      licenseNumber: text("licenseNumber"),
      licenseRegion: text("licenseRegion").toUpperCase(),
      licenseExpiration: expiration,
      specialtyFocus: text("specialtyFocus"),
      bio: text("bio"),
      licensedStates,
      attestedAt: new Date(),
      payoutAccountHolderName: text("payoutAccountHolderName"),
      payoutAccountType: text("payoutAccountType"),
      bankName: text("bankName"),
      payoutRoutingLast4: text("payoutRoutingNumber").slice(-4),
      payoutAccountLast4: text("payoutAccountNumber").slice(-4),
      taxIdLast4: text("taxId").slice(-4),
      malpracticeInsuranceStatus: malpracticeStatus,
      malpracticeProvider: malpracticeStatus === "HAVE" ? text("malpracticeProvider") : null,
      malpracticePolicyNumber: malpracticeStatus === "HAVE" ? text("malpracticePolicyNumber") : null,
      onboardingCompletedAt: new Date(),
      adminApprovedAt: null,
      verified: false,
    },
  });

  const documentTypes = ["LICENSE", "CREDENTIALING", "MALPRACTICE"];
  const documentData = await Promise.all(documents.map(async (file, index) => ({
    profileId: profile.id,
    documentType: documentTypes[index],
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    content: Buffer.from(await file.arrayBuffer()),
  })));
  await prisma.$transaction(documentData.map((document) => prisma.clinicianDocument.upsert({
    where: { profileId_documentType: { profileId: document.profileId, documentType: document.documentType } },
    update: document,
    create: document,
  })));

  return NextResponse.json({ profile });
}