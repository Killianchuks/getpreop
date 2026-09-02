"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const planDetailsMap: Record<
  string,
  { name: string; monthly: string; annual: string; annualTotal: string; desc: string }
> = {
  "per-case": {
    name: "Pay-As-You-Go Plan",
    monthly: "$339",
    annual: "$310",
    annualTotal: "$310 / case (annual agreement)",
    desc: "Billed on-demand per completed evaluation ($250 anesthesiologist fee + platform fee). $0 monthly recurring commitment.",
  },
  "asc-growth": {
    name: "Standard ASC Subscription",
    monthly: "$42,750",
    annual: "$39,750",
    annualTotal: "$477,000 / year",
    desc: "Includes up to 150 evaluations/month ($250 anesthesiologist fee + platform fee per case). Priority 24h SLA.",
  },
  enterprise: {
    name: "Enterprise Health System",
    monthly: "Custom",
    annual: "Custom",
    annualTotal: "Volume Tiered Contract",
    desc: "Multi-site facility management, direct EHR FHIR/HL7 integration, and custom SLAs. $250 anesthesiologist fee unchanged at any volume.",
  },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("plan") || "asc-growth";
  const billingCycle = searchParams.get("billing") || "annual";
  const userEmail = searchParams.get("email") || "admin@facility.org";

  const selectedPlan = planDetailsMap[planId] || planDetailsMap["asc-growth"];
  const isAnnual = billingCycle === "annual";

  // Price calculations
  const priceDisplay =
    planId === "enterprise"
      ? "Custom Contract"
      : planId === "per-case"
      ? isAnnual ? "$310.00" : "$339.00"
      : isAnnual
      ? "$477,000.00"
      : "$513,000.00";

  const billingTermText =
    planId === "enterprise"
      ? "Custom Enterprise Terms"
      : planId === "per-case"
      ? `Billed On-Demand ($${isAnnual ? "310" : "339"} per evaluation: $250 MD fee + platform fee)`
      : isAnnual
      ? "Billed Annually ($39,750/mo — $250 MD fee + $15 platform fee per case)"
      : "Billed Monthly ($42,750/mo — $250 MD fee + $35 platform fee per case)";

  // Form State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "ach" | "po">("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [poNumber, setPoNumber] = useState("");

  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planId,
          billingCycle: billingCycle,
          email: userEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Unable to create checkout session.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setProcessing(false);
      alert(error instanceof Error ? error.message : "Unable to process payment.");
    }
  }

  if (completed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-emerald-950">Subscription Activated!</h2>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Your payment was processed successfully. A confirmation receipt has been sent to <strong>{userEmail}</strong>.
        </p>
        <p className="text-xs font-semibold text-slate-600 pt-2">
          Redirecting to your Facility Command Center...
        </p>
      </div>
    );
  }

  const success = new URLSearchParams(window.location.search).get("success");
  const cancelled = new URLSearchParams(window.location.search).get("cancel");

  if (success === "1") {
    document.cookie = `getpreop_subscribed=true; path=/; max-age=${60 * 60 * 24 * 30}`;
    setTimeout(() => {
      router.push("/surgery-centers/dashboard");
    }, 1500);
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-emerald-950">Subscription Activated!</h2>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Your payment was processed successfully. A confirmation receipt has been sent to <strong>{userEmail}</strong>.
        </p>
        <p className="text-xs font-semibold text-slate-600 pt-2">
          Redirecting to your Facility Command Center...
        </p>
      </div>
    );
  }

  if (cancelled === "1") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <h2 className="text-2xl font-bold text-amber-900">Payment cancelled</h2>
        <p className="text-xs text-amber-800 leading-relaxed">
          Your checkout was cancelled. You can try again or choose a different payment option.
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Return to checkout
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] items-start">
      {/* Payment Gateway Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block rounded-md bg-teal-800 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              256-Bit Encrypted Payment
            </span>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Complete Subscription Payment</h1>
          </div>
          <span className="text-xs font-semibold text-slate-500">Step 2 of 2</span>
        </div>

        <form onSubmit={handlePayment} className="mt-6 space-y-6">
          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-xl border p-3 text-xs font-semibold transition ${
                  paymentMethod === "card"
                    ? "border-teal-700 bg-teal-50 text-teal-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("ach")}
                className={`rounded-xl border p-3 text-xs font-semibold transition ${
                  paymentMethod === "ach"
                    ? "border-teal-700 bg-teal-50 text-teal-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                ACH Direct Deposit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("po")}
                className={`rounded-xl border p-3 text-xs font-semibold transition ${
                  paymentMethod === "po"
                    ? "border-teal-700 bg-teal-50 text-teal-950 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Corporate PO
              </button>
            </div>
          </div>

          {/* Form Fields Based on Payment Method */}
          {paymentMethod === "card" ? (
            <div className="space-y-4">
              <label className="text-xs font-medium text-slate-800 block">
                Cardholder Name
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </label>

              <label className="text-xs font-medium text-slate-800 block">
                Card Number
                <input
                  type="text"
                  maxLength={19}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none tracking-widest"
                  placeholder="4532 •••• •••• 8892"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                <label className="text-xs font-medium text-slate-800 block">
                  Expiration
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </label>

                <label className="text-xs font-medium text-slate-800 block">
                  CVC Code
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="123"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                  />
                </label>

                <label className="text-xs font-medium text-slate-800 block">
                  ZIP Code
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="90210"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
          ) : paymentMethod === "ach" ? (
            <div className="space-y-4">
              <label className="text-xs font-medium text-slate-800 block">
                Bank Routing Number
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                  placeholder="9-Digit Routing Number"
                  required
                />
              </label>
              <label className="text-xs font-medium text-slate-800 block">
                Account Number
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                  placeholder="Bank Account Number"
                  required
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-xs font-medium text-slate-800 block">
                Purchase Order (PO) Number
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-teal-700 focus:outline-none"
                  placeholder="e.g. PO-2026-88492"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  required
                />
              </label>
              <p className="text-xs text-slate-500">
                An invoice will be generated and issued to your accounting department with 30-day payment terms.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-xl bg-teal-800 py-3.5 text-sm font-semibold text-white hover:bg-teal-900 transition disabled:opacity-60 shadow-md"
          >
            {processing ? "Processing Payment Security Check..." : `Pay ${priceDisplay} & Activate Subscription`}
          </button>
        </form>

        {/* Security Seals */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-500">
          <span>🔒 PCI-DSS Level 1 Certified</span>
          <span>🛡️ HIPAA Compliant Vault</span>
          <span>⚡ Immediate SLA Activation</span>
        </div>
      </section>

      {/* Order Summary Column */}
      <aside className="rounded-2xl border border-slate-200 bg-slate-900 p-6 md:p-8 text-white space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Order Summary</span>
          <h2 className="mt-2 text-2xl font-extrabold text-white">{selectedPlan.name}</h2>
          <p className="mt-1 text-xs text-slate-300">{selectedPlan.desc}</p>
        </div>

        <div className="space-y-3 border-t border-b border-slate-800 py-4 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Account User</span>
            <span className="font-semibold text-white">{userEmail}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Billing Term</span>
            <span className="font-semibold text-teal-300">{billingTermText}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Setup &amp; Onboarding Fee</span>
            <span className="font-semibold text-emerald-400">$0.00 (Waived)</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Healthcare Software Tax</span>
            <span className="font-semibold text-slate-400">Exempt</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-bold text-white">Total Due Today:</span>
          <span className="text-3xl font-black text-emerald-400">{priceDisplay}</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-white">Need an offline invoice or custom BAA?</p>
          <p className="text-[11px] text-slate-400">
            Our finance team can assist with vendor onboarding, ACH routing, and corporate contracts.
          </p>
          <Link href="/about" className="text-teal-400 font-semibold hover:underline block pt-1">
            Contact Enterprise Billing →
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="max-w-5xl mx-auto py-8">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading Checkout Gateway...</div>}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
