import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 1x1 transparent GIF bytes
const TRANSPARENT_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const emailLog = await prisma.emailLog.findUnique({ where: { id } });
      if (emailLog) {
        const now = new Date();
        const currentStatus = emailLog.status;
        const newStatus =
          currentStatus === "CLICKED"
            ? "CLICKED"
            : currentStatus === "OPENED"
            ? "OPENED"
            : "OPENED";

        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: newStatus,
            openedAt: emailLog.openedAt || now,
            deliveredAt: emailLog.deliveredAt || now,
          },
        });

        // Also update any associated BusinessDevelopmentMessage
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
              status: bdMessage.status === "CLICKED" ? "CLICKED" : "OPENED",
              openedAt: bdMessage.openedAt || now,
              deliveredAt: bdMessage.deliveredAt || now,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Open tracking pixel error:", error);
  }

  return new NextResponse(TRANSPARENT_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": TRANSPARENT_PIXEL.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
