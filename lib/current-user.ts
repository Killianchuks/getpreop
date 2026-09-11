import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const email = cookieStore.get("getpreop_user")?.value;
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      surgeryCenterId: true,
      anesthesiologistProfile: {
        select: {
          licenseNumber: true,
          licenseRegion: true,
          licenseExpiration: true,
          specialtyFocus: true,
          bio: true,
          licensedStates: true,
          attestedAt: true,
          payoutAccountHolderName: true,
          payoutAccountType: true,
          payoutRoutingLast4: true,
          payoutAccountLast4: true,
          taxIdLast4: true,
          onboardingCompletedAt: true,
          adminApprovedAt: true,
          verified: true,
        },
      },
      surgeryCenter: { select: { name: true } },
    },
  });
}