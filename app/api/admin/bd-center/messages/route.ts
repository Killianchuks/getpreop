import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildBDOutreachEmailContent } from "@/lib/email-templates";
import { sendDeliverableEmail } from "@/lib/email-service";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Matches physician indicators in a job title (e.g. "Dr.", "MD", "DO", "Physician") as whole words.
const DOCTOR_TITLE_PATTERN = /\b(dr\.?|md|do|physician|surgeon|anesthesiologist|doctor)\b/i;

const formatContactName = (contact: { contactName: string | null; jobTitle: string | null; salutation: string | null }) => {
  const name = contact.contactName?.trim();
  if (!name) return "there";

  const addressAsDoctor = contact.salutation === "DOCTOR"
    || (contact.salutation !== "NAME" && DOCTOR_TITLE_PATTERN.test(contact.jobTitle ?? ""));

  if (!addressAsDoctor) return name;
  return /^(dr\.?|doctor)\b/i.test(name) ? name : `Dr. ${name}`;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "send";

    // Action: Retry failed messages
    if (action === "retry_failed") {
      const limit = typeof body.limit === "number" ? Math.min(body.limit, 100) : 50;
      const failedMessages = await prisma.businessDevelopmentMessage.findMany({
        where: { status: "FAILED" },
        include: {
          contact: {
            select: { id: true, email: true, contactName: true, jobTitle: true, salutation: true, organizationName: true },
          },
        },
        take: limit,
        orderBy: { createdAt: "asc" },
      });

      if (failedMessages.length === 0) {
        return NextResponse.json({ sent: 0, message: "No failed messages to retry." });
      }

      let sent = 0;
      let failed = 0;

      for (let i = 0; i < failedMessages.length; i++) {
        const msg = failedMessages[i];
        const email = msg.contact?.email?.trim().toLowerCase();
        if (!email) continue;

        const renderedContactName = formatContactName(msg.contact);
        const { html, text } = buildBDOutreachEmailContent({
          contactName: renderedContactName,
          recipientEmail: email,
          organizationName: msg.contact.organizationName ?? "your practice",
          subject: msg.subject,
          messageBody: msg.body,
        });

        const sendResult = await sendDeliverableEmail({
          to: email,
          toName: renderedContactName,
          subject: msg.subject,
          html,
          text,
          category: "BD_OUTREACH",
          metadata: {
            contactId: msg.contact.id,
            bdMessageId: msg.id,
            organizationName: msg.contact.organizationName,
            isRetry: true,
          },
        });

        if (sendResult.success) {
          sent++;
          await prisma.businessDevelopmentMessage.update({
            where: { id: msg.id },
            data: {
              status: "SENT",
              providerMessageId: sendResult.providerMessageId,
              emailLogId: sendResult.logId,
              errorMessage: null,
              sentAt: new Date(),
            },
          });
          await prisma.businessDevelopmentContact.update({
            where: { id: msg.contact.id },
            data: { status: "CONTACTED", lastContactedAt: new Date() },
          });
        } else {
          failed++;
          await prisma.businessDevelopmentMessage.update({
            where: { id: msg.id },
            data: {
              status: "FAILED",
              errorMessage: sendResult.error || "Retry failed",
            },
          });
        }

        // Rate-limit throttle: pause 125ms (~8 req/sec) to stay comfortably under the 10 req/sec limit
        if (i < failedMessages.length - 1) {
          await sleep(125);
        }
      }

      const remainingFailed = await prisma.businessDevelopmentMessage.count({ where: { status: "FAILED" } });

      return NextResponse.json({
        sent,
        failed,
        remainingFailed,
        message: `Processed ${sent} sent, ${failed} failed. ${remainingFailed} remaining to retry.`,
      });
    }

    // Action: Standard send/bulk send
    const contactIds = Array.isArray(body.contactIds) ? body.contactIds.filter((value: unknown) => typeof value === "string") : [];
    const subject = typeof body.subject === "string" ? body.subject.trim() : "GetPreOp Partnership";
    const messageBody = typeof body.body === "string" ? body.body : "";
    const channel = typeof body.channel === "string" ? body.channel : "EMAIL";
    const excludeSentOrDelivered = body.excludeSentOrDelivered !== false;

    if (!contactIds.length || !messageBody.trim()) {
      return NextResponse.json({ error: "Select at least one contact and provide a message body." }, { status: 400 });
    }

    const contacts = await prisma.businessDevelopmentContact.findMany({
      where: { id: { in: contactIds } },
      select: {
        id: true,
        email: true,
        contactName: true,
        jobTitle: true,
        salutation: true,
        organizationName: true,
        status: true,
        messages: {
          select: { status: true },
        },
      },
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const email = contact.email?.trim().toLowerCase();
      if (!email) continue;

      if (contact.status === "UNSUBSCRIBED") {
        skipped++;
        continue;
      }

      if (
        excludeSentOrDelivered &&
        contact.messages.some((m) =>
          ["SENT", "DELIVERED", "OPENED", "CLICKED"].includes(m.status)
        )
      ) {
        skipped++;
        continue;
      }

      const renderedContactName = formatContactName(contact);
      const renderedSubject = subject.replace(/\{\{contactName\}\}/g, renderedContactName);
      const renderedBody = messageBody
        .replace(/\{\{contactName\}\}/g, renderedContactName)
        .replace(/\{\{organizationName\}\}/g, contact.organizationName ?? "your team");

      const messageRecord = await prisma.businessDevelopmentMessage.create({
        data: {
          contactId: contact.id,
          subject: renderedSubject,
          body: renderedBody,
          channel,
          status: "SENDING",
        },
      });

      const { html, text } = buildBDOutreachEmailContent({
        contactName: renderedContactName,
        recipientEmail: email,
        organizationName: contact.organizationName ?? "your practice",
        subject: renderedSubject,
        messageBody: renderedBody,
      });

      const sendResult = await sendDeliverableEmail({
        to: email,
        toName: renderedContactName,
        subject: renderedSubject,
        html,
        text,
        category: "BD_OUTREACH",
        metadata: {
          contactId: contact.id,
          bdMessageId: messageRecord.id,
          organizationName: contact.organizationName,
        },
      });

      const finalStatus = sendResult.success ? "SENT" : "FAILED";
      if (sendResult.success) {
        sent += 1;
      } else {
        failed += 1;
      }

      await prisma.businessDevelopmentMessage.update({
        where: { id: messageRecord.id },
        data: {
          status: finalStatus,
          providerMessageId: sendResult.providerMessageId,
          emailLogId: sendResult.logId,
          errorMessage: sendResult.error || null,
          sentAt: sendResult.success ? new Date() : null,
        },
      });

      if (sendResult.success) {
        await prisma.businessDevelopmentContact.update({
          where: { id: contact.id },
          data: { status: "CONTACTED", lastContactedAt: new Date() },
        });
      }

      // Rate-limit throttle: pause 125ms (~8 req/sec) to stay comfortably under the 10 req/sec limit
      if (i < contacts.length - 1) {
        await sleep(125);
      }
    }

    return NextResponse.json({
      sent,
      failed,
      skipped,
      message: `${sent} message${sent === 1 ? "" : "s"} processed successfully.${skipped > 0 ? ` (${skipped} excluded as already sent/delivered/unsubscribed)` : ""}${failed > 0 ? ` (${failed} failed, you can retry from BD Center)` : ""}`,
    });
  } catch (error) {
    console.error("BD messaging failed:", error);
    return NextResponse.json({ error: "Unable to process messages." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : null;
    const ids = Array.isArray(body.ids) ? body.ids.filter((val: unknown) => typeof val === "string") : [];
    const deleteFailedOnly = Boolean(body.deleteFailedOnly);

    if (id) {
      const msg = await prisma.businessDevelopmentMessage.findUnique({ where: { id } });
      if (msg?.emailLogId) {
        await prisma.emailLog.delete({ where: { id: msg.emailLogId } }).catch(() => {});
      }
      await prisma.businessDevelopmentMessage.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Message deleted." });
    }

    if (ids.length > 0) {
      await prisma.businessDevelopmentMessage.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, deleted: ids.length, message: `${ids.length} messages deleted.` });
    }

    if (deleteFailedOnly) {
      const res = await prisma.businessDevelopmentMessage.deleteMany({
        where: { status: "FAILED" },
      });
      return NextResponse.json({ success: true, deleted: res.count, message: `${res.count} failed messages cleared.` });
    }

    return NextResponse.json({ error: "Provide a message ID or IDs to delete." }, { status: 400 });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
