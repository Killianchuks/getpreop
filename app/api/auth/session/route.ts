import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const roleToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("getpreop_role="));
  const userToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("getpreop_user="));

  const role = roleToken?.split("=")[1];
  const email = userToken?.split("=")[1];

  if (!role || !email) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Auth bootstrap endpoint placeholder.",
    },
    { status: 501 },
  );
}
