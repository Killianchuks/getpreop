import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const formatContactName = (contactName: string | null) => {
  const name = contactName?.trim();
  if (!name) return "there";
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
      select: { id: true, email: true, contactName: true, organizationName: true },
    });

    let sent = 0;
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL ?? "contact@getpreop.com";
    const fromName = process.env.MAILERSEND_FROM_NAME ?? "GetPreOp";

    for (const contact of contacts) {
      const email = contact.email?.trim();
      if (!email) continue;

      const renderedContactName = formatContactName(contact.contactName);
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
          status: apiKey ? "SENDING" : "QUEUED",
        },
      });

      let finalStatus = "QUEUED";

      if (apiKey) {
        const response = await fetch("https://api.mailersend.com/v1/email", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: { email: fromEmail, name: fromName },
            to: [{ email }],
            subject: renderedSubject,
            text: renderedBody,
            html: `<p>${renderedBody.replace(/\n/g, "<br />")}</p>`,
          }),
        });

        if (response.ok) {
          finalStatus = "SENT";
          sent += 1;
        }
      } else {
        finalStatus = "QUEUED";
      }

      await prisma.businessDevelopmentMessage.update({
        where: { id: messageRecord.id },
        data: {
          status: finalStatus,
          sentAt: finalStatus === "SENT" ? new Date() : null,
        },
      });

      if (finalStatus === "SENT") {
        await prisma.businessDevelopmentContact.update({
          where: { id: contact.id },
          data: { status: "CONTACTED", lastContactedAt: new Date() },
        });
      }
    }

    return NextResponse.json({ sent, message: apiKey ? "Messages sent successfully." : "Messages queued for delivery." });
  } catch (error) {
    console.error("BD messaging failed:", error);
    return NextResponse.json({ error: "Unable to queue messages." }, { status: 500 });
  }
}
