import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        anesthesiologistProfile: { select: { licenseRegion: true } },
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
      })),
    });
  } catch (error) {
    console.error("Admin users query failed:", error);
    return NextResponse.json({ error: "Unable to load registered users." }, { status: 503 });
  }
}
