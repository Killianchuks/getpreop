import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { getRoleFromCookieHeader } from "@/lib/request-role";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  if (!stripe) return NextResponse.json({ error: "Stripe secret key is not configured." }, { status: 500 });

  const { sessionId } = await request.json();
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment has not completed." }, { status: 402 });
    }

    const draft = await prisma.referralPaymentDraft.findUnique({ where: { stripeCheckoutSessionId: session.id } });
    if (!draft || session.metadata?.referralPaymentDraftId !== draft.id) {
      return NextResponse.json({ error: "Referral payment record was not found." }, { status: 404 });
    }

    const existing = await prisma.referral.findUnique({ where: { stripeCheckoutSessionId: session.id } });
    if (existing) return NextResponse.json({ referralId: existing.id, status: existing.status });

    const slaHours = draft.priority === "urgent" ? 24 : 48;
    const surgeryCenter = await prisma.surgeryCenter.upsert({
      where: { externalId: draft.surgeryCenterId },
      update: { name: draft.surgeryCenterName },
      create: { externalId: draft.surgeryCenterId, name: draft.surgeryCenterName },
    });
    const referral = await prisma.referral.create({
      data: {
        stripeCheckoutSessionId: session.id,
        surgeryCenterId: surgeryCenter.id,
        patientFullName: draft.patientFullName,
        patientEmail: draft.patientEmail,
        patientPhone: draft.patientPhone,
        medicalHistory: draft.medicalHistory,
        supportingNoteName: draft.supportingNoteName,
        supportingNoteType: draft.supportingNoteType,
        supportingNoteContent: draft.supportingNoteContent,
        procedureName: draft.procedureName,
        scheduledDate: draft.scheduledDate,
        priority: draft.priority,
        reportTurnaroundHours: slaHours,
      },
    });
    await prisma.referralPaymentDraft.update({ where: { id: draft.id }, data: { status: "PAID", referralId: referral.id } });
    await writeAuditLog({
      action: "REFERRAL_CREATED",
      entityType: "Referral",
      entityId: referral.id,
      actorRole: getRoleFromCookieHeader(request.headers.get("cookie")),
      details: { surgeryCenterId: surgeryCenter.id, priority: draft.priority, targetTurnaroundHours: slaHours, stripeCheckoutSessionId: session.id },
    });
    return NextResponse.json({ referralId: referral.id, status: "received" }, { status: 201 });
  } catch (error) {
    console.error("Referral payment completion failed:", error);
    return NextResponse.json({ error: "Unable to verify payment and create the referral." }, { status: 500 });
  }
}