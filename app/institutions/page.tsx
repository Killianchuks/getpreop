import Link from "next/link";

const institutionalBenefits = [
  {
    title: "Protect High-Margin OR Revenue",
    description: "Same-day surgical cancellations directly erode procedural margin and waste expensive block time. Early virtual screening identifies medical blockers weeks before surgery.",
    badge: "Revenue Protection",
  },
  {
    title: "Standardized Anesthesia Clearance",
    description: "Receive turn-key, EHR-ready 1-page preoperative assessment reports returned within 24–48 hours for every scheduled procedural case.",
    badge: "24–48h SLA",
  },
  {
    title: "Scalable Across Health Networks & ASCs",
    description: "Whether managing a single high-volume ambulatory surgery center or an enterprise hospital network with specialized departments, GetPreOp unifies pre-op workflows.",
    badge: "Enterprise Scale",
  },
  {
    title: "Reduce Administrative Burden",
    description: "Shift pre-op intake synthesis and routine risk scoring off physician and internal anesthesia teams so they can focus on complex clinical care.",
    badge: "Workflow Efficiency",
  },
  {
    title: "Protocolized Workup Guidance",
    description: "Ensure additional lab work or specialist consultations are requested only when clinically necessary according to evidence-based guidelines.",
    badge: "Evidence-Based",
  },
  {
    title: "Seamless Patient Onboarding",
    description: "Patients complete 10-minute digital health questionnaires on their mobile devices with virtual video consultation access from home.",
    badge: "Patient Experience",
  },
];

const networkCapabilities = [
  "Multi-facility enterprise management under a unified health system dashboard",
  "Custom risk thresholds tailored to high-volume outpatient vs. complex inpatient procedures",
  "Automated patient intake reminders with EHR integration capabilities",
  "Dedicated quality review and monthly cancellation analytics reporting",
];

export default function InstitutionsPage() {
  return (
    <main className="space-y-10">
      {/* Clean Mature Executive Hero Container */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Enterprise &amp; Facility Readiness
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight">
              Virtual Pre-Op Assessment Built for High-Volume Health Systems.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Maximize operating room throughput, eliminate late-stage cancellations, and deliver standardized anesthesia risk evaluations across your entire surgical network.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup?role=SURGERY_CENTER"
                className="rounded-lg bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
              >
                Register Your Institution
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Facility Sign In
              </Link>
              <Link
                href="/surgery-centers/dashboard"
                className="rounded-lg border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Access Facility Dashboard
              </Link>
            </div>
          </div>

          {/* Clean Metric Callout */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Institutional Impact</p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">24–48h</p>
                <p className="mt-1 text-xs text-slate-300">Turnaround target for completed pre-op clearance reports</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xl font-bold text-amber-300">Zero Block Waste</p>
                <p className="mt-1 text-xs text-slate-300">Prevent avoidable same-day surgical holds and delays</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xl font-bold text-emerald-300">Enterprise Ready</p>
                <p className="mt-1 text-xs text-slate-300">Multi-facility networks, ASCs, and specialized hospital clinics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Value Pillars Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Why Healthcare Leaders Partner With GetPreOp
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            A technology-enabled preoperative evaluation network engineered for procedural profitability and patient safety.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {institutionalBenefits.map((b) => (
            <article
              key={b.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
            >
              <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                {b.badge}
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{b.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{b.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Network & Enterprise Capabilities */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Enterprise &amp; Health System Capabilities</h2>
        <p className="mt-1 text-xs text-slate-500">
          Built to accommodate complex hospital networks with diverse sub-specialized facilities under one operational umbrella.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {networkCapabilities.map((cap, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-800 text-[10px] font-bold text-white">
                ✓
              </span>
              <p className="text-xs leading-relaxed font-medium text-slate-800">{cap}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white md:p-10 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ready to Register Your Facility or Health Network?</h2>
          <p className="mt-2 text-xs text-slate-300 max-w-xl">
            Create an institution account today. Select single or multiple facility types, or configure a hospital network with sub-specialized surgical departments.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
          <Link
            href="/signup?role=SURGERY_CENTER"
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition shadow-sm"
          >
            Create Institution Account
          </Link>
        </div>
      </section>
    </main>
  );
}

