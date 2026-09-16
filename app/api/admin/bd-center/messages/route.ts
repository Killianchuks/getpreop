import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildBDOutreachEmailContent } from "@/lib/email-templates";
import { sendDeliverableEmail } from "@/lib/email-service";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contactIds = Array.isArray(body.contactIds) ? body.contactIds.filter((value: unknown) => typeof value === "string") : [];
    const subject = typeof body.subject === "string" ? body.subject.trim() : "GetPreOp Partnership";
    const messageBody = typeof body.body === "string" ? body.body : "";
    const channel = typeof body.channel === "string" ? body.channel : "EMAIL";

    if (!contactIds.length || !messageBody.trim()) {
      return NextResponse.json({ error: "Select at least one contact and provide a message body." }, { status: 400 });
    }

    const contacts = await prisma.businessDevelopmentContact.findMany({
      where: { id: { in: contactIds } },
      select: { id: true, email: true, contactName: true, jobTitle: true, salutation: true, organizationName: true },
    });

    let sent = 0;

    for (const contact of contacts) {
      const email = contact.email?.trim().toLowerCase();
      if (!email) continue;

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
    }

    return NextResponse.json({
      sent,
      message: `${sent} message${sent === 1 ? "" : "s"} processed successfully with inbox tracking.`,
    });
  } catch (error) {
    console.error("BD messaging failed:", error);
    return NextResponse.json({ error: "Unable to process messages." }, { status: 500 });
  }
}
