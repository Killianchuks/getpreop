import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const editableRoles = ["PATIENT", "SURGERY_CENTER", "ANESTHESIOLOGIST", "ADMIN"] as const;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        anesthesiologistProfile: { select: { licenseRegion: true, onboardingCompletedAt: true, adminApprovedAt: true, malpracticeInsuranceStatus: true, documents: { select: { documentType: true, fileName: true } } } },
        surgeryCenter: { select: { name: true } },
      },
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role === "SURGERY_CENTER" ? "Surgery center" : user.role === "ANESTHESIOLOGIST" ? "Anesthesiologist" : user.role === "PATIENT" ? "Patient" : "Admin",
        region: user.anesthesiologistProfile?.licenseRegion ?? user.surgeryCenter?.name ?? "Not provided",
        joined: user.createdAt.toISOString(),
        verified: Boolean(user.emailVerifiedAt),
        active: Boolean(user.passwordHash),
        onboardingComplete: Boolean(user.anesthesiologistProfile?.onboardingCompletedAt),
        adminApproved: Boolean(user.anesthesiologistProfile?.adminApprovedAt),
        evidence: user.anesthesiologistProfile?.documents ?? [],
        malpracticeInsuranceStatus: user.anesthesiologistProfile?.malpracticeInsuranceStatus ?? null,
      })),
    });
  } catch (error) {
    console.error("Admin users query failed:", error);
    return NextResponse.json({ error: "Unable to load registered users." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (body.action === "approve") {
      const profile = await prisma.anesthesiologistProfile.findUnique({ where: { userId: id } });
      if (!profile?.onboardingCompletedAt) return NextResponse.json({ error: "This clinician has not completed onboarding." }, { status: 400 });
      await prisma.anesthesiologistProfile.update({ where: { userId: id }, data: { adminApprovedAt: new Date(), verified: true, verificationDate: new Date() } });
      return NextResponse.json({ approved: true, id });
    }
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!id || !fullName || !email || !editableRoles.includes(role as (typeof editableRoles)[number])) {
      return NextResponse.json({ error: "A valid name, email, and role are required." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { fullName, email, role: role as (typeof editableRoles)[number] },
    });

    return NextResponse.json({ user: { id: user.id, name: user.fullName, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Admin user update failed:", error);
    return NextResponse.json({ error: "Unable to update this user." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "A user id is required." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error("Admin user deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete this user." }, { status: 400 });
  }
}
