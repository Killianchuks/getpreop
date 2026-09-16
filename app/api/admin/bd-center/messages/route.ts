import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildBDOutreachEmailContent } from "@/lib/email-templates";
import { sendDeliverableEmail, sendDeliverableBulkEmails } from "@/lib/email-service";

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
      const limit = typeof body.limit === "number" ? Math.min(body.limit, 400) : 100;
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

      const bulkItems = [];
      for (const msg of failedMessages) {
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

        bulkItems.push({
          to: email,
          toName: renderedContactName,
          subject: msg.subject,
          html,
          text,
          category: "BD_OUTREACH" as const,
          bdMessageId: msg.id,
          contactId: msg.contact.id,
          metadata: {
            contactId: msg.contact.id,
            bdMessageId: msg.id,
            organizationName: msg.contact.organizationName,
            isRetry: true,
          },
        });
      }

      const bulkResult = await sendDeliverableBulkEmails(bulkItems);
      const remainingFailed = await prisma.businessDevelopmentMessage.count({ where: { status: "FAILED" } });

      return NextResponse.json({
        sent: bulkResult.sent,
        failed: bulkResult.failed,
        remainingFailed,
        message: `Processed ${bulkResult.sent} sent, ${bulkResult.failed} failed. ${remainingFailed} remaining to retry.`,
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

    let skipped = 0;
    const eligibleContacts = [];

    for (const contact of contacts) {
      const email = contact.email?.trim().toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

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

      eligibleContacts.push(contact);
    }

    if (eligibleContacts.length === 0) {
      return NextResponse.json({
        sent: 0,
        failed: 0,
        skipped,
        message: `0 messages sent. All ${skipped} selected contact(s) were excluded as already sent/delivered/unsubscribed.`,
      });
    }

    // 1. Pre-create BD message records
    const bulkItems = [];
    for (const contact of eligibleContacts) {
      const email = contact.email!.trim().toLowerCase();
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

      bulkItems.push({
        to: email,
        toName: renderedContactName,
        subject: renderedSubject,
        html,
        text,
        category: "BD_OUTREACH" as const,
        bdMessageId: messageRecord.id,
        contactId: contact.id,
        metadata: {
          contactId: contact.id,
          bdMessageId: messageRecord.id,
          organizationName: contact.organizationName,
        },
      });
    }

    // 2. Chunk in batches of 400 and dispatch via /v1/bulk-email
    let totalSent = 0;
    let totalFailed = 0;
    const chunkSize = 400;

    for (let i = 0; i < bulkItems.length; i += chunkSize) {
      const chunk = bulkItems.slice(i, i + chunkSize);
      const bulkResult = await sendDeliverableBulkEmails(chunk);
      totalSent += bulkResult.sent;
      totalFailed += bulkResult.failed;
    }

    return NextResponse.json({
      sent: totalSent,
      failed: totalFailed,
      skipped,
      message: `${totalSent} message${totalSent === 1 ? "" : "s"} sent successfully.${skipped > 0 ? ` (${skipped} excluded as already sent/delivered/unsubscribed)` : ""}${totalFailed > 0 ? ` (${totalFailed} failed)` : ""}`,
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
