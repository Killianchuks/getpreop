import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

  const response = NextResponse.json(
    {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institutionTypes: parsed.data.institutionTypes,
        isHospitalNetwork: parsed.data.isHospitalNetwork,
        plan: parsed.data.plan,
        billingCycle: parsed.data.billingCycle,
      },
    },
    { status: 201 },
  );

  response.cookies.set("getpreop_role", user.role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  response.cookies.set("getpreop_user", user.email, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  if (parsed.data.plan) {
    response.cookies.set("getpreop_plan", parsed.data.plan, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  if (parsed.data.billingCycle) {
    response.cookies.set("getpreop_billing", parsed.data.billingCycle, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
