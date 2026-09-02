"use client";

import Link from "next/link";
import { useState } from "react";

// Fixed physician pass-through fee: what the market pays anesthesiologists per virtual assessment.
// This never gets "discounted" — only the platform fee portion changes with plan/billing cycle.
const ANESTHESIOLOGIST_FEE = 250;

// Assessment complexity tiers (physician pass-through only), per US clinic-fee benchmarks
const assessmentTiers = [
  { name: "Basic chart review (10–15 min)", fee: 150 },
  { name: "Standard assessment (20–30 min)", fee: 250 },
  { name: "Comprehensive assessment (30–45 min)", fee: 325 },
  { name: "Complex / high-risk patient", fee: 450 },
  { name: "Follow-up / clearance after testing", fee: 140 },
  { name: "Same-day / urgent assessment", fee: 425 },
];

const pricingTiers = [
  {
    name: "Pay-As-You-Go",
    id: "per-case",
    tagline: "For variable volume centers & clinics testing virtual pre-op",
    monthlyDisplay: "$339",
    monthlyPeriod: "/ completed case",
    annualDisplay: "$310",
    annualPeriod: "/ completed case",
    monthlySubtext: "$250 anesthesiologist fee + $89 platform fee • $0 monthly commitment",
    annualSubtext: "$250 anesthesiologist fee + $60 platform fee (annual volume agreement)",
    popular: false,
    badge: "On-Demand",
    features: [
      "$250 board-certified anesthesiologist professional fee, paid per case",
      "Standard 10-minute digital health intake",
      "Automated clinical risk stratification",
      "24–48 hour standardized 1-page report SLA",
      "Automated patient SMS & email reminders",
      "Secure patient-anesthesia messaging",
      "Zero monthly commitments or minimums",
    ],
    ctaText: "Start Pay-As-You-Go",
  },
  {
    name: "Standard ASC",
    id: "asc-growth",
    tagline: "For high-volume ambulatory surgery centers seeking zero OR delay",
    monthlyDisplay: "$42,750",
    monthlyPeriod: "/ month ($513,000 / year)",
    annualDisplay: "$39,750",
    annualPeriod: "/ month ($477,000 / year)",
    monthlySubtext: "150 cases incl. • $250 MD fee + $35 platform fee/case ($285 effective)",
    annualSubtext: "150 cases incl. • $250 MD fee + $15 platform fee/case ($265 effective)",
    popular: true,
    badge: "Most Popular",
    features: [
      "Up to 150 cases/month included ($250 MD fee + platform fee per case)",
      "Overage billed at the same effective per-case rate beyond 150",
      "Priority 24-hour pre-op clearance report turnaround",
      "Real-time facility readiness & cancellation dashboard",
      "Smart state-licensed anesthesiologist routing",
      "EHR-ready 1-page PDF export & intake synthesis",
      "Monthly cancellation risk analytics report",
      "Dedicated clinical support contact",
    ],
    ctaText: "Get Started with Standard",
  },
  {
    name: "Enterprise Health System",
    id: "enterprise",
    tagline: "For multi-site hospital networks & large surgical management groups",
    monthlyDisplay: "Custom",
    monthlyPeriod: "/ month (Custom Volume Contract)",
    annualDisplay: "Custom",
    annualPeriod: "/ year (Enterprise Volume Contract)",
    monthlySubtext: "$250 MD fee + platform fee scaling down to ~$12/case at 1,500+ cases/mo",
    annualSubtext: "$250 MD fee + platform fee scaling down to ~$10/case at 1,500+ cases/mo",
    popular: false,
    badge: "Multi-Facility",
    features: [
      "Same $250 anesthesiologist fee at any volume — physician pay is never cut",
      "Platform fee drops as low as ~$10–12/case at enterprise scale",
      "Unlimited multi-facility network management",
      "Custom EHR integration (Epic, Cerner, MEDITECH)",
      "Custom clinical risk threshold & protocol calibration",
      "Dedicated Account Manager & clinical quality auditor",
      "Signed BAA & guaranteed 99.9% uptime SLA",
    ],
    ctaText: "Request Enterprise Contract",
  },
];

// Realistic facility category averages based on US surgical data
const facilityCategories = [
  {
    id: "asc-general",
    label: "Ambulatory Surgery Centers (ASCs)",
    avgCostPerCancellation: 3200,
    typicalVolume: 140,
    cancellationRate: 4.5,
    note: "High turnover, mixed procedures (ortho, GI, general). Cancelled slots waste block time & nurse overtime.",
  },
  {
    id: "hospitals",
    label: "Hospitals & University Teaching Hospitals",
    avgCostPerCancellation: 4800,
    typicalVolume: 250,
    cancellationRate: 5.5,
    note: "High acuity (cardiac, spine, vascular). Late cancellations waste inpatient beds, anesthesia staffing & OR overhead.",
  },
  {
    id: "endoscopy-gi",
    label: "Endoscopy & GI Surgery Centers",
    avgCostPerCancellation: 1800,
    typicalVolume: 220,
    cancellationRate: 6.0,
    note: "High volume (colonoscopies/EGDs). Uncleared propofol/NPO holds disrupt tight 20-minute procedure slots.",
  },
  {
    id: "ortho-joint",
    label: "Orthopedic & Joint Specialty Clinics",
    avgCostPerCancellation: 4500,
    typicalVolume: 90,
    cancellationRate: 4.0,
    note: "High margin joint replacements. Unchecked cardiac/medication clearance leads to costly day-of-surgery holds.",
  },
  {
    id: "dental-pediatric",
    label: "Dental & Pediatric Surgery Centers",
    avgCostPerCancellation: 2200,
    typicalVolume: 120,
    cancellationRate: 4.8,
    note: "Sedation & airway clearance critical for pediatric & complex cases. Last-minute holds freeze specialized equipment.",
  },
  {
    id: "ophthalmology",
    label: "Ophthalmology Centers",
    avgCostPerCancellation: 2000,
    typicalVolume: 180,
    cancellationRate: 5.0,
    note: "High-volume cataract & eye surgery requiring standardized pre-op risk clearance.",
  },
  {
    id: "plastic-reconstructive",
    label: "Plastic & Reconstructive Surgery Clinics",
    avgCostPerCancellation: 3800,
    typicalVolume: 75,
    cancellationRate: 4.2,
    note: "Elective procedures requiring structured anesthesia risk assessment.",
  },
  {
    id: "ir-cardiology",
    label: "Interventional Radiology & Cath Labs",
    avgCostPerCancellation: 4200,
    typicalVolume: 110,
    cancellationRate: 5.2,
    note: "Minimally invasive procedures & TAVR/EP cases using deep sedation.",
  },
  {
    id: "womens-obgyn",
    label: "Women’s Health & OB-GYN Centers",
    avgCostPerCancellation: 2800,
    typicalVolume: 100,
    cancellationRate: 4.6,
    note: "Hysteroscopy, D&C, and specialized outpatient OB-GYN interventions.",
  },
  {
    id: "pain-fertility",
    label: "Pain Management & Fertility / IVF Centers",
    avgCostPerCancellation: 2400,
    typicalVolume: 85,
    cancellationRate: 4.0,
    note: "Egg retrieval & interventional procedures requiring sedation screening.",
  },
];

const featureMatrix = [
  { feature: "Digital Health Questionnaire (<10 mins)", perCase: "✓", standard: "✓", enterprise: "✓" },
  { feature: "Automated Risk Stratification (Ready / Optimize)", perCase: "✓", standard: "✓", enterprise: "✓" },
  { feature: "Standardized 1-Page Pre-Op Clearance PDF", perCase: "✓", standard: "✓", enterprise: "✓" },
  { feature: "Report Turnaround SLA", perCase: "24–48 Hours", standard: "Priority 24 Hours", enterprise: "Guaranteed Custom SLA" },
  { feature: "Anesthesiologist Professional Fee", perCase: "$250 / case", standard: "$250 / case", enterprise: "$250 / case" },
  { feature: "GetPreOp Platform Fee (per case)", perCase: "$89 (mo) / $60 (yr)", standard: "$35 (mo) / $15 (yr)", enterprise: "As low as $10–12" },
  { feature: "Total Effective Rate", perCase: "$339 (mo) / $310 (yr)", standard: "$285 (mo) / $265 (yr)", enterprise: "As low as ~$260/case" },
  { feature: "Facility Readiness Dashboard", perCase: "Basic", standard: "Advanced", enterprise: "Multi-Site Command Center" },
  { feature: "EHR Integration (Epic, Cerner, etc.)", perCase: "Manual PDF Export", standard: "EHR-Ready 1-Page PDF", enterprise: "Direct HL7 / FHIR API Integration" },
  { feature: "Cancellation Risk Analytics", perCase: "—", standard: "Monthly Summary", enterprise: "Real-Time Predictive Analytics" },
  { feature: "Dedicated Account Management", perCase: "—", standard: "Standard Support", enterprise: "Dedicated Clinical Lead & BAA" },
];

const faqs = [
  {
    q: "Why does the anesthesiologist get paid $250 per case, and how does GetPreOp still make money?",
    a: "$250 is the market rate board-certified anesthesiologists expect for a standard 20–30 minute virtual pre-anesthesia assessment — it's non-negotiable pass-through compensation, not a platform fee. GetPreOp adds a separate, much smaller platform fee ($89/case on-demand, down to $15/case on the Standard ASC annual plan) to cover the software, risk-stratification engine, EHR-ready reporting, and licensure-matched scheduling. Physician pay is never cut to create a discount — only our platform fee is.",
  },
  {
    q: "Why does the price only drop a small amount when I switch to annual billing?",
    a: "Because most of the per-case price ($250 of it) is the anesthesiologist's fixed professional fee, which does not change with volume or billing cycle. Annual billing discounts apply only to GetPreOp's platform fee — for example, on the Standard ASC plan the platform fee drops from $35/case to $15/case, while the $250 physician fee stays the same.",
  },
  {
    q: "How is the Standard ASC monthly price calculated?",
    a: "$42,750/month covers 150 cases at $285/case ($250 anesthesiologist fee + $35 platform fee). Billed annually, the platform fee drops to $15/case ($265/case effective), for $39,750/month ($477,000/year) — a real $36,000/year savings on the portion GetPreOp controls.",
  },
  {
    q: "How does GetPreOp generate ROI for our surgical facility?",
    a: "Preventing day-of-surgery cancellations recovers lost OR block time, staff overtime, and procedural revenue. At high-acuity or high-cancellation-rate facilities, avoided cancellations can offset or exceed the program cost. At lower-volume or lower-cancellation facilities, the direct cancellation savings alone may not cover the full physician + platform cost — the program's value there also comes from standardized safety review, reduced administrative burden on your in-house team, and compliance documentation.",
  },
  {
    q: "Can we integrate GetPreOp with our existing EHR system?",
    a: "Yes. Every completed evaluation produces an EHR-ready, standardized 1-page PDF clearance summary that can be attached directly to the patient's chart. For Enterprise clients, we offer direct HL7/FHIR API integration with Epic, Cerner, MEDITECH, and surgical scheduling software.",
  },
  {
    q: "Is GetPreOp HIPAA compliant?",
    a: "Absolutely. All data in transit and at rest is encrypted according to HIPAA security standards. We execute Business Associate Agreements (BAAs) with all participating institutions and health systems.",
  },
  {
    q: "What happens if we exceed the 150 cases included in the Standard ASC tier?",
    a: "Additional cases beyond 150 are billed at the same effective per-case rate as your plan ($285/case monthly, $265/case annual) — there is no separate overage penalty.",
  },
];

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  // Interactive Realistic ROI Calculator State
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("asc-general");
  const selectedFacility = facilityCategories.find((f) => f.id === selectedFacilityId) || facilityCategories[0];

  const [monthlyCases, setMonthlyCases] = useState<number>(selectedFacility.typicalVolume);
  const [cancellationRate, setCancellationRate] = useState<number>(selectedFacility.cancellationRate);
  const [costPerCancellation, setCostPerCancellation] = useState<number>(selectedFacility.avgCostPerCancellation);

  // Handle facility preset selection
  function handleFacilityChange(facilityId: string) {
    setSelectedFacilityId(facilityId);
    const fac = facilityCategories.find((f) => f.id === facilityId);
    if (fac) {
      setMonthlyCases(fac.typicalVolume);
      setCancellationRate(fac.cancellationRate);
      setCostPerCancellation(fac.avgCostPerCancellation);
    }
  }

  // Realistic ROI Calculations
  const annualCancellationsWithout = Math.round((monthlyCases * 12) * (cancellationRate / 100));

  // Assume GetPreOp reduces cancellations by 75%
  const estimatedCancellationsSaved = Math.round(annualCancellationsWithout * 0.75);
  const annualRevenueProtected = estimatedCancellationsSaved * costPerCancellation;

  // Total program cost = $250 anesthesiologist fee (fixed) + platform fee (only this part is discounted/scaled)
  const payAsYouGoPlatformFee = annualBilling ? 60 : 89;
  const standardAscPlatformFee = annualBilling ? 15 : 35;
  const payAsYouGoCost = monthlyCases * (ANESTHESIOLOGIST_FEE + payAsYouGoPlatformFee) * 12;
  const standardAscCost = monthlyCases * (ANESTHESIOLOGIST_FEE + standardAscPlatformFee) * 12;

  const annualGetPreOpCost = Math.min(payAsYouGoCost, standardAscCost);
  const annualPhysicianCost = monthlyCases * ANESTHESIOLOGIST_FEE * 12;
  const annualPlatformCost = annualGetPreOpCost - annualPhysicianCost;
  const netAnnualImpact = annualRevenueProtected - annualGetPreOpCost;

  return (
    <main className="space-y-10">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm text-center max-w-3xl mx-auto">
        <span className="inline-block rounded-md bg-teal-800 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
          Competitive &amp; Transparent Pricing
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Fair Physician Pay. Transparent Platform Fees. Real Cancellation Protection.
        </h1>
        <p className="mt-3 text-xs text-slate-600 leading-relaxed">
          Every plan pays anesthesiologists the market rate of $250/case. GetPreOp's platform fee — the only part that changes by plan or billing cycle — covers the software, risk engine, and reporting.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit mx-auto">
          <button
            type="button"
            onClick={() => setAnnualBilling(false)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              !annualBilling
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>

          <button
            type="button"
            onClick={() => setAnnualBilling(true)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              annualBilling
                ? "bg-teal-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-800">
              Platform fee only — MD pay unchanged
            </span>
          </button>
        </div>
      </section>

      {/* Anesthesiologist Fee Transparency Panel */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">How Our Two-Part Pricing Works</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-2xl">
          Every price on this page is made of two components: a fixed <strong>Anesthesiologist Professional Fee</strong> (paid
          directly to the physician performing the assessment, at market rate) and a <strong>GetPreOp Platform Fee</strong>
          (our margin, covering software, scheduling, and reporting). Only the platform fee changes by plan.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800">
                <th className="p-3 font-bold">Assessment Type</th>
                <th className="p-3 font-bold">Anesthesiologist Professional Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessmentTiers.map((tier) => (
                <tr key={tier.name} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-semibold text-slate-800">{tier.name}</td>
                  <td className="p-3 font-semibold text-teal-800">${tier.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500 italic">
          Pricing throughout this page uses the $250 Standard Assessment rate as the baseline. Complex/urgent cases are billed
          at the corresponding physician fee shown above, plus the same platform fee for your plan.
        </p>
      </section>

      {/* Pricing Cards Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`flex flex-col justify-between rounded-2xl border p-7 transition ${
              tier.popular
                ? "border-teal-800 bg-slate-900 text-white shadow-md"
                : "border-slate-200 bg-white text-slate-900 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    tier.popular
                      ? "bg-teal-400 text-slate-950"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tier.badge}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${tier.popular ? "text-amber-300" : "text-slate-500"}`}>
                  {annualBilling ? "Annual Billing" : "Monthly Billing"}
                </span>
              </div>

              <h3 className={`mt-4 text-xl font-bold ${tier.popular ? "text-white" : "text-slate-900"}`}>
                {tier.name}
              </h3>
              <p className={`mt-1 text-xs ${tier.popular ? "text-slate-300" : "text-slate-500"}`}>
                {tier.tagline}
              </p>

              {/* Price & Period Display */}
              <div className="mt-6 border-t border-b border-slate-200/20 py-4">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {annualBilling ? tier.annualDisplay : tier.monthlyDisplay}
                  </span>
                  <span className={`text-xs font-semibold ${tier.popular ? "text-teal-300" : "text-slate-600"}`}>
                    {annualBilling ? tier.annualPeriod : tier.monthlyPeriod}
                  </span>
                </div>
                <p className={`mt-2 text-[11px] font-medium leading-normal ${tier.popular ? "text-slate-300" : "text-teal-800"}`}>
                  {annualBilling ? tier.annualSubtext : tier.monthlySubtext}
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-xs">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span className={`font-bold ${tier.popular ? "text-teal-400" : "text-teal-800"}`}>✓</span>
                    <span className={tier.popular ? "text-slate-200" : "text-slate-700"}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href={`/signup?role=SURGERY_CENTER&plan=${tier.id}&billing=${annualBilling ? "annual" : "monthly"}`}
                className={`block w-full rounded-lg py-3 text-center text-xs font-semibold transition ${
                  tier.popular
                    ? "bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-xs"
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                }`}
              >
                {tier.ctaText} ({annualBilling ? "Annual" : "Monthly"})
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Realistic Institutional Financial Impact & Facility Selection */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm space-y-8">
        <div>
          <span className="inline-block rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
            Real US Clinical Financial Model
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            Projected Operating Room Financial Impact &amp; Revenue Saved
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Select your specific facility type to see realistic cost-of-cancellation averages based on US surgical data.
          </p>
        </div>

        {/* Facility Type Selector Dropdown */}
        <div className="rounded-xl border border-teal-800/20 bg-teal-50/50 p-5 space-y-3">
          <label className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
            1. Select Your Facility Category
          </label>
          <select
            value={selectedFacilityId}
            onChange={(e) => handleFacilityChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-bold text-slate-900 focus:border-teal-700 focus:outline-none shadow-xs cursor-pointer"
          >
            {facilityCategories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} (Avg. Lost Revenue: ${f.avgCostPerCancellation.toLocaleString()}/case)
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-600 font-medium italic pt-1">
            💡 Clinical Insight: {selectedFacility.note}
          </p>
        </div>

        {/* Interactive Sliders & Results Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          {/* Sliders Input Column */}
          <div className="space-y-6 rounded-xl border border-slate-100 bg-slate-50/70 p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              2. Fine-Tune Facility Parameters
            </p>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                <span>Monthly Procedural Volume:</span>
                <span className="text-teal-800 font-bold">{monthlyCases} cases / month</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={monthlyCases}
                onChange={(e) => setMonthlyCases(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                <span>Day-of-Surgery Cancellation Rate:</span>
                <span className="text-teal-800 font-bold">{cancellationRate}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={cancellationRate}
                onChange={(e) => setCancellationRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-2">
                <span>Avg. Lost Margin per Cancelled Surgery:</span>
                <span className="text-teal-800 font-bold">${costPerCancellation.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="100"
                value={costPerCancellation}
                onChange={(e) => setCostPerCancellation(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-800"
              />
            </div>
          </div>

          {/* Clean Professional Financial Impact Results */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-white space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Projected Financial Impact Summary
              </span>
              <p className="mt-1 text-xs text-slate-400">
                Based on {monthlyCases * 12} annual cases at {selectedFacility.label}.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Baseline Annual Cancellation Revenue Loss
                </p>
                <p className="text-2xl font-bold text-slate-200 mt-1">
                  -${(annualCancellationsWithout * costPerCancellation).toLocaleString()} / year
                </p>
                <p className="text-[11px] text-slate-400">
                  {annualCancellationsWithout} cancelled surgeries/yr ({cancellationRate}% baseline rate × ${costPerCancellation.toLocaleString()} avg. lost margin).
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Operating Room Revenue Protected (75% Reduction)
                </p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  +${annualRevenueProtected.toLocaleString()} / year
                </p>
                <p className="text-[11px] text-slate-300">
                  {estimatedCancellationsSaved} cancelled surgeries saved per year protected into completed procedure revenue.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total GetPreOp Program Cost (Annual)
                </p>
                <p className="text-2xl font-bold text-slate-200 mt-1">
                  ${annualGetPreOpCost.toLocaleString()} / year
                </p>
                <p className="text-[11px] text-slate-400">
                  ${annualPhysicianCost.toLocaleString()} anesthesiologist professional fees + ${annualPlatformCost.toLocaleString()} GetPreOp platform fees.
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Net Financial Impact (Cancellation Savings vs. Program Cost)
                </p>
                <p className={`text-3xl font-black mt-1 ${netAnnualImpact >= 0 ? "text-teal-300" : "text-slate-300"}`}>
                  {netAnnualImpact >= 0 ? "+" : "-"}${Math.abs(netAnnualImpact).toLocaleString()} / year
                </p>
                <p className="text-[11px] text-slate-300">
                  {netAnnualImpact >= 0
                    ? "Direct cancellation-prevention revenue alone covers the full program cost at this volume and cancellation rate."
                    : "At this volume, direct cancellation savings don't fully offset program cost — the remainder is offset by safety, compliance, and reduced administrative burden on your in-house team."}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <Link
                href={`/signup?role=SURGERY_CENTER&plan=${monthlyCases <= 150 ? "asc-growth" : "enterprise"}&billing=${annualBilling ? "annual" : "monthly"}`}
                className="block w-full rounded-lg bg-teal-600 py-3 text-center text-xs font-semibold text-white hover:bg-teal-500 transition shadow-xs"
              >
                Protect Your Facility Revenue ({annualBilling ? "Annual Terms" : "Monthly Terms"})
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Comprehensive Plan Comparison</h2>
        <p className="mt-1 text-xs text-slate-500">Detailed breakdown of platform capabilities across tier levels.</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-800">
                <th className="p-3 font-bold">Platform Feature</th>
                <th className="p-3 font-bold">Pay-As-You-Go</th>
                <th className="p-3 font-bold">Standard ASC</th>
                <th className="p-3 font-bold">Enterprise System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {featureMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 font-semibold text-slate-800">{row.feature}</td>
                  <td className="p-3 text-slate-600">{row.perCase}</td>
                  <td className="p-3 font-semibold text-teal-800">{row.standard}</td>
                  <td className="p-3 font-semibold text-slate-900">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Institutional FAQ Accordion */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
        <p className="mt-1 text-xs text-slate-500">Common questions from facility administrators and surgical directors.</p>

        <div className="mt-6 space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
              <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white md:p-10 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ready to Optimize Your Pre-Op Operations?</h2>
          <p className="mt-2 text-xs text-slate-300 max-w-xl">
            Register your surgical center or health network today. Start preventing same-day cancellations in as little as 48 hours.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
          <Link
            href="/signup?role=SURGERY_CENTER"
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition"
          >
            Create Institution Account
          </Link>
        </div>
      </section>
    </main>
  );
}
