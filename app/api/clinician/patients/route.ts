import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const fallbackPatients = [
  {
    patientProfileId: "pp_taylor_morgan",
    fullName: "Taylor Morgan",
    email: "taylor.morgan@getpreop.test",
    reference: "MEDS-20260810-000017",
  },
  {
    patientProfileId: "pp_m_santos",
    fullName: "M. Santos",
    email: "m.santos@getpreop.test",
    reference: "MEDS-20260810-000018",
  },
];

export async function GET() {
  try {
    const profiles = await prisma.patientProfile.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        referrals: {
          select: {
            id: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });

    const patients = profiles.map((profile) => ({
      patientProfileId: profile.id,
      fullName: profile.user.fullName,
      email: profile.user.email,
      reference: profile.referrals[0]?.id ?? `REF-${profile.id.slice(0, 10).toUpperCase()}`,
    }));

    return NextResponse.json({
      source: "database",
      patients,
    });
  } catch {
    return NextResponse.json({
      source: "fallback",
      patients: fallbackPatients,
    });
  }
}
