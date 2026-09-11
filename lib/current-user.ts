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
      anesthesiologistProfile: { select: { licenseRegion: true } },
      surgeryCenter: { select: { name: true } },
    },
  });
}