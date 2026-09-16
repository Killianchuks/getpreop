import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

interface MailerSendWebhookPayload {
  type?: string;
  created_at?: string;
  data?: {
    id?: string;
    email?: {
      id?: string;
      recipient?: {
        email?: string;
      };
      status?: string;
    };
    message?: {
      id?: string;
    };
    recipient?: {
      email?: string;
    };
    morph?: {
      id?: string;
      reason?: string;
    };
    reason?: string;
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MailerSendWebhookPayload;
    const eventType = payload.type || "";
    const eventTime = payload.created_at ? new Date(payload.created_at) : new Date();

    const providerMessageId =
      payload.data?.email?.id
      || payload.data?.message?.id
      || payload.data?.id
      || null;

    const recipientEmail =
      payload.data?.email?.recipient?.email
      || payload.data?.recipient?.email
      || null;

    if (!eventType) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    // Attempt to match EmailLog record by messageId or by recent recipient email
    let emailLog = providerMessageId
      ? await prisma.emailLog.findFirst({
          where: { providerMessageId },
        })
      : null;

    if (!emailLog && recipientEmail) {
      emailLog = await prisma.emailLog.findFirst({
        where: {
          recipientEmail: recipientEmail.toLowerCase(),
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (emailLog) {
      if (eventType.includes("delivered")) {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "DELIVERED",
            deliveredAt: eventTime,
          },
        });
      } else if (eventType.includes("opened")) {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "OPENED",
            openedAt: emailLog.openedAt || eventTime,
            deliveredAt: emailLog.deliveredAt || eventTime,
          },
        });
      } else if (eventType.includes("clicked")) {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "CLICKED",
            clickedAt: eventTime,
            openedAt: emailLog.openedAt || eventTime,
          },
        });
      } else if (eventType.includes("bounced") || eventType.includes("hard_bounced") || eventType.includes("soft_bounced")) {
        const bounceReason = payload.data?.reason || payload.data?.morph?.reason || "Email address bounced or rejected by recipient server";
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "BOUNCED",
            errorMessage: bounceReason,
          },
        });
      } else if (eventType.includes("spam_complaint")) {
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: "SPAM_COMPLAINT",
            errorMessage: "Recipient reported this email as spam",
          },
        });
      }

      // If tied to a BusinessDevelopmentMessage, sync status too
      if (providerMessageId) {
        const bdMessage = await prisma.businessDevelopmentMessage.findFirst({
          where: {
            OR: [
              { providerMessageId },
              { emailLogId: emailLog.id },
            ],
          },
        });

        if (bdMessage) {
          const bdStatus = eventType.includes("bounced")
            ? "BOUNCED"
            : eventType.includes("opened") || eventType.includes("clicked")
              ? "OPENED"
              : eventType.includes("delivered")
                ? "DELIVERED"
                : bdMessage.status;

          await prisma.businessDevelopmentMessage.update({
            where: { id: bdMessage.id },
            data: {
              status: bdStatus,
              deliveredAt: eventType.includes("delivered") ? eventTime : bdMessage.deliveredAt,
              openedAt: eventType.includes("opened") || eventType.includes("clicked") ? eventTime : bdMessage.openedAt,
              errorMessage: eventType.includes("bounced") ? (payload.data?.reason ?? "Bounced") : bdMessage.errorMessage,
            },
          });
        }
      }
    }

    await writeAuditLog({
      action: "EMAIL_DELIVERY_WEBHOOK_RECEIVED",
      entityType: "EmailWebhook",
      entityId: providerMessageId || emailLog?.id || "unknown",
      actorRole: "SYSTEM",
      details: {
        eventType,
        recipientEmail,
        providerMessageId,
        matchedLogId: emailLog?.id || null,
      },
    });

    return NextResponse.json({ received: true, event: eventType });
  } catch (err) {
    console.error("MailerSend webhook error:", err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
