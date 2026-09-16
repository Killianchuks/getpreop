import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url") || "https://www.getpreop.com";
  const id = url.searchParams.get("id");

  // Validate redirect target to prevent open redirect vulnerabilities
  let safeTarget = "https://www.getpreop.com";
  try {
    const parsedTarget = new URL(target);
    if (parsedTarget.hostname.endsWith("getpreop.com") || parsedTarget.hostname === "localhost") {
      safeTarget = target;
    }
  } catch {
    safeTarget = "https://www.getpreop.com";
  }

  if (id) {
    try {
      const emailLog = await prisma.emailLog.findUnique({ where: { id } });
      if (emailLog) {
        const now = new Date();
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "CLICKED",
            clickedAt: now,
            openedAt: emailLog.openedAt || now,
            deliveredAt: emailLog.deliveredAt || now,
          },
        });

        // Also update associated BusinessDevelopmentMessage
        const bdMessage = await prisma.businessDevelopmentMessage.findFirst({
          where: {
            OR: [
              { emailLogId: emailLog.id },
              ...(emailLog.providerMessageId ? [{ providerMessageId: emailLog.providerMessageId }] : []),
            ],
          },
        });

        if (bdMessage) {
          await prisma.businessDevelopmentMessage.update({
            where: { id: bdMessage.id },
            data: {
              status: "CLICKED",
              openedAt: bdMessage.openedAt || now,
              deliveredAt: bdMessage.deliveredAt || now,
            },
          });
        }
      }
    } catch (error) {
      console.error("Click tracking error:", error);
    }
  }

  return NextResponse.redirect(safeTarget);
}
