import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const planPriceMap: Record<string, { annual: number; monthly: number; label: string }> = {
  "per-case": {
    annual: 31000,
    monthly: 33900,
    label: "Pay-As-You-Go Plan",
  },
  "asc-growth": {
    annual: 47700000,
    monthly: 51300000,
    label: "Standard ASC Subscription",
  },
  enterprise: {
    annual: 25000000,
    monthly: 25000000,
    label: "Enterprise Health System",
  },
};

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const planId = body.planId ?? "asc-growth";
    const billingCycle = body.billingCycle ?? "annual";
    const email = body.email ?? "admin@facility.org";

    const selectedPlan = planPriceMap[planId] ?? planPriceMap["asc-growth"];
    const isRecurring = planId !== "enterprise";
    const amount = billingCycle === "annual" ? selectedPlan.annual : selectedPlan.monthly;
    const interval = billingCycle === "annual" ? "year" : "month";

    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? "subscription" : "payment",
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/checkout?cancel=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            ...(isRecurring
              ? {
                  recurring: { interval },
                }
              : {}),
            product_data: {
              name: selectedPlan.label,
              description: isRecurring
                ? "GetPreOp facility subscription"
                : "GetPreOp enterprise contract",
            },
          },
        },
      ],
      metadata: {
        planId,
        billingCycle,
        email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Unable to create Stripe checkout session." },
      { status: 500 },
    );
  }
}
