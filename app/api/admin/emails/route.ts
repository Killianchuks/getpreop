import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendDeliverabilityTestEmail, sendDeliverableEmail, EmailCategory } from "@/lib/email-service";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const status = url.searchParams.get("status") || "all";
    const category = url.searchParams.get("category") || "all";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 200);
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    const where: Prisma.EmailLogWhereInput = {};

    if (search) {
      where.OR = [
        { recipientEmail: { contains: search, mode: "insensitive" } },
        { recipientName: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { providerMessageId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.status = status as Prisma.EnumEmailDeliveryStatusFilter["equals"];
    }

    if (category !== "all") {
      where.category = category;
    }

    const [logs, total, totalCount, deliveredCount, openedCount, clickedCount, bouncedCount, spamCount, failedCount] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.emailLog.count({ where }),
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: { in: ["DELIVERED", "OPENED", "CLICKED"] } } }),
      prisma.emailLog.count({ where: { status: { in: ["OPENED", "CLICKED"] } } }),
      prisma.emailLog.count({ where: { status: "CLICKED" } }),
      prisma.emailLog.count({ where: { status: "BOUNCED" } }),
      prisma.emailLog.count({ where: { status: "SPAM_COMPLAINT" } }),
      prisma.emailLog.count({ where: { status: "FAILED" } }),
    ]);

    const deliveryRate = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;
    const openRate = deliveredCount > 0 ? Math.round((openedCount / deliveredCount) * 100) : 0;
    const bounceRate = totalCount > 0 ? Number(((bouncedCount / totalCount) * 100).toFixed(1)) : 0;

    const dnsConfig = {
      fromEmail: process.env.MAILERSEND_FROM_EMAIL || "contact@getpreop.com",
      fromName: process.env.MAILERSEND_FROM_NAME || "GetPreOp",
      hasMailerSend: Boolean(process.env.MAILERSEND_API_KEY),
      hasSmtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
      recommendedRecords: [
        {
          type: "TXT (SPF)",
          host: "@",
          value: "v=spf1 include:_spf.mailersend.net ~all",
          purpose: "Authorizes MailerSend mail servers to send on behalf of your domain.",
          status: "Required for Google/Yahoo inbox placement",
        },
        {
          type: "TXT (DKIM)",
          host: "mlsn._domainkey",
          value: "k=rsa; p=[Your MailerSend Domain Public Key]",
          purpose: "Cryptographic signature verifying emails originate untampered from GetPreOp.",
          status: "Required by Gmail/Yahoo 2024+ sender policy",
        },
        {
          type: "TXT (DMARC)",
          host: "_dmarc",
          value: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@getpreop.com; pct=100; adkim=r; aspf=r",
          purpose: "Protects your domain reputation from spoofing & phishing.",
          status: "Mandatory for zero-spam deliverability",
        },
        {
          type: "MX / Return-Path",
          host: "em",
          value: "feedback-smtp.mailersend.net (Priority 10)",
          purpose: "Custom Return-Path alignment prevents DMARC alignment failures.",
          status: "Recommended for 100% inbox placement",
        },
      ],
    };

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalSent: totalCount,
        delivered: deliveredCount,
        deliveryRate,
        opened: openedCount,
        openRate,
        clicked: clickedCount,
        bounced: bouncedCount,
        bounceRate,
        spamComplaints: spamCount,
        failed: failedCount,
      },
      dnsConfig,
    });
  } catch (error) {
    console.error("Failed to load email tracking data:", error);
    return NextResponse.json({ error: "Failed to retrieve email logs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === "send_test") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Provide a valid email address for the test." }, { status: 400 });
      }

      const result = await sendDeliverabilityTestEmail(email);
      return NextResponse.json({
        success: result.success,
        message: result.success ? `Test email dispatched to ${email}` : `Test email failed: ${result.error}`,
        result,
      });
    }

    if (action === "resend") {
      const logId = body.logId;
      if (!logId) return NextResponse.json({ error: "Missing log ID to resend." }, { status: 400 });

      const original = await prisma.emailLog.findUnique({ where: { id: logId } });
      if (!original) return NextResponse.json({ error: "Original email log not found." }, { status: 404 });

      const result = await sendDeliverableEmail({
        to: original.recipientEmail,
        toName: original.recipientName || undefined,
        subject: original.subject,
        html: original.bodyHtml || `<p>${original.bodyText || original.subject}</p>`,
        text: original.bodyText || original.subject,
        category: (original.category as EmailCategory) || "GENERAL",
        metadata: {
          resendOf: original.id,
          originalCreatedAt: original.createdAt,
        },
      });

      return NextResponse.json({
        success: result.success,
        message: result.success ? "Message resent successfully." : `Resend failed: ${result.error}`,
        result,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Email admin action failed:", error);
    return NextResponse.json({ error: "Action processing failed." }, { status: 500 });
  }
}
