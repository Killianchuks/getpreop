import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVerificationCode, sendVerificationEmail } from "@/lib/email-verification";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signup payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 10);

  let surgeryCenterId: string | undefined = undefined;

  if (parsed.data.role === "SURGERY_CENTER") {
    const extId = `sc_${Date.now()}`;
    const sc = await prisma.surgeryCenter.create({
      data: {
        externalId: extId,
        name: parsed.data.fullName,
      },
    });
    surgeryCenterId = sc.id;
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: parsed.data.fullName,
          role: parsed.data.role,
          passwordHash,
          surgeryCenterId: surgeryCenterId ?? existing.surgeryCenterId,
        },
      })
    : await prisma.user.create({
        data: {
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          role: parsed.data.role,
          passwordHash,
          surgeryCenterId,
        },
      });

  const { code, codeHash } = createVerificationCode();
  await prisma.emailVerificationCode.deleteMany({ where: { userId: user.id, consumedAt: null } });
  await prisma.emailVerificationCode.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  try {
    const emailResult = await sendVerificationEmail(user.email, code);
    return NextResponse.json(
      {
        success: true,
        verificationRequired: true,
        email: user.email,
        role: user.role,
        ...(emailResult.developmentCode ? { developmentCode: emailResult.developmentCode } : {}),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup verification email error:", error);
    return NextResponse.json(
      { error: "Account created, but we could not send the verification email. Please try again." },
      { status: 503 },
    );
  }
}
