import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashVerificationCode } from "@/lib/email-verification";

const destinationByRole = {
  PATIENT: "/patients/portal",
  SURGERY_CENTER: "/surgery-centers/dashboard",
  ANESTHESIOLOGIST: "/anesthesiologists/workspace",
  ADMIN: "/admin",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!email || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the six-digit verification code." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Verification request not found." }, { status: 404 });
    if (user.emailVerifiedAt) return NextResponse.json({ success: true, role: user.role });

    const verification = await prisma.emailVerificationCode.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!verification || verification.expiresAt < new Date() || hashVerificationCode(code) !== verification.codeHash) {
      return NextResponse.json({ error: "That code is invalid or expired." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.emailVerificationCode.update({ where: { id: verification.id }, data: { consumedAt: new Date() } }),
      prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
    ]);

    const redirectTo = user.role === "ANESTHESIOLOGIST" ? "/anesthesiologists/workspace/onboarding" : destinationByRole[user.role];
    const response = NextResponse.json({ success: true, role: user.role, redirectTo });
    response.cookies.set("getpreop_role", user.role, { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    response.cookies.set("getpreop_user", user.email, { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    return response;
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Verification service is temporarily unavailable." }, { status: 503 });
  }
}
