import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid login payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Please verify your email before signing in.", verificationRequired: true },
        { status: 403 },
      );
    }

    const validPassword = await compare(parsed.data.password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

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

    return response;
  } catch (error) {
    console.error("Login service error:", error);
    return NextResponse.json(
      { error: "Login service is temporarily unavailable. Check the production database configuration." },
      { status: 503 },
    );
  }
}
