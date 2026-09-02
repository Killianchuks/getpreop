import { NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["PATIENT", "SURGERY_CENTER", "ANESTHESIOLOGIST", "ADMIN"]),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Demo role switching is disabled in production." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = roleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid role selection", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    selectedRole: parsed.data.role,
  });

  response.cookies.set("getpreop_role", parsed.data.role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
