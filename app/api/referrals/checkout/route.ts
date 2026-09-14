import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { referralSchema } from "@/lib/validation";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const REFERRAL_FEE_CENTS = 35_000;

function resolveAppUrl(candidate: string | undefined): string {
  const raw = candidate?.trim();
  if (!raw) return "https://www.getpreop.com";

  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.origin;
  } catch {
    // ignore invalid env values and fall back to the production domain
  }

  return "https://www.getpreop.com";
}

const supportingNoteSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(3).max(100),
  content: z.string().min(1).max(7_000_000),
}).optional();

export async function POST(request: Request) {
  if (!stripe) return NextResponse.json({ error: "Stripe secret key is not configured." }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid referral request." }, { status: 400 });
  }

  const rawSupportingNote = body.supportingNote;
  const normalizedBody = {
    ...body,
    facilityEmail: typeof body.facilityEmail === "string" ? body.facilityEmail.trim() : body.facilityEmail,
    patientPhone: typeof body.patientPhone === "string" ? body.patientPhone.trim() : body.patientPhone,
    priority: typeof body.priority === "string" && body.priority.length > 0 ? body.priority : "standard",
    scheduledDate: (() => {
      const value = body.scheduledDate;
      if (typeof value !== "string" || value.length === 0) return undefined;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    })(),
    supportingNote: rawSupportingNote == null || rawSupportingNote === "" ? undefined : rawSupportingNote,
  };

  const referral = referralSchema.safeParse(normalizedBody);
  const facilityEmail = z.email().safeParse(normalizedBody.facilityEmail);
  const supportingNote = normalizedBody.supportingNote == null ? { success: true, data: undefined } : supportingNoteSchema.safeParse(normalizedBody.supportingNote);

  if (!referral.success || !facilityEmail.success || !supportingNote.success) {
    return NextResponse.json({ error: "Enter valid referral and facility billing details." }, { status: 400 });
  }

  try {
    const draft = await prisma.referralPaymentDraft.create({
      data: {
        ...referral.data,
        facilityEmail: facilityEmail.data,
        supportingNoteName: supportingNote.data?.name,
        supportingNoteType: supportingNote.data?.type,
        supportingNoteContent: supportingNote.data ? Buffer.from(supportingNote.data.content, "base64") : undefined,
      },
    });
    const baseUrl = resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL);
    const successUrl = `${baseUrl}/surgery-centers/dashboard/referrals/new?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/surgery-centers/dashboard/referrals/new?payment=cancelled`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: facilityEmail.data,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: REFERRAL_FEE_CENTS,
          product_data: {
            name: "GetPreOp case referral",
            description: "Preoperative assessment and readiness planning for one referral.",
          },
        },
      }],
      metadata: { referralPaymentDraftId: draft.id },
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    await prisma.referralPaymentDraft.update({
      where: { id: draft.id },
      data: { stripeCheckoutSessionId: session.id },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown checkout error";
    console.error("Referral checkout session creation failed:", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });
    return NextResponse.json({
      error: "Unable to start secure payment.",
      details: message,
    }, { status: 500 });
  }
}