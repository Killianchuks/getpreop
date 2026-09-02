import Link from "next/link";

const keyBenefits = [
  {
    title: "Flexible Remote Practice",
    description: "Conduct thorough, high-quality preoperative consults from anywhere with complete schedule autonomy.",
    badge: "Work-Life Balance",
  },
  {
    title: "Intelligent Licensure Matching",
    description: "Automated routing matches patient locations with your active state and provincial medical licenses.",
    badge: "Smart Compliance",
  },
  {
    title: "EHR-Ready 1-Page Output",
    description: "Streamlined documentation templates yield clear risk stratification (Ready / Optimization / Evaluation) in minutes.",
    badge: "Structured EHR",
  },
  {
    title: "Fair Per-Evaluation Compensation",
    description: "Transparent compensation structures for completed consults with hassle-free billing and payout tracking.",
    badge: "Competitive Pay",
  },
  {
    title: "Peer Quality Calibration",
    description: "Supported by an 8% peer-review sampling framework that maintains clinical quality without micromanagement.",
    badge: "Quality Assurance",
  },
  {
    title: "Reduced Administrative Overhead",
    description: "Intake synthesis and risk scoring run automatically, so you can focus entirely on clinical assessment.",
    badge: "Clinical Efficiency",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Set Availability & State Licenses",
    desc: "Specify your active state medical licenses and set the hours you want to consult.",
  },
  {
    step: "02",
    title: "Review Synthesized Intake",
    desc: "Access pre-scored health history, current medications, and flagged comorbidities before video visit.",
  },
  {
    step: "03",
    title: "Conduct Telehealth Evaluation",
    desc: "Assess patient readiness, clarify airway or cardiac risk, and deliver personalized medication guidance.",
  },
  {
    step: "04",
    title: "Generate Standardized Report",
    desc: "Publish a clean 1-page pre-op clearance report returned to the surgical team within 24–48 hours.",
  },
];

export default function AnesthesiologistsLandingPage() {
  return (
    <main className="space-y-10">
      {/* Clean Mature Physician Hero Container */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Anesthesia Practice Network
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight">
              Elevate Preoperative Care on Your Own Schedule.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Join an elite network of board-certified anesthesiologists providing virtual evaluations,
              optimizing surgical readiness, and reducing day-of-surgery cancellations from anywhere.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup?role=ANESTHESIOLOGIST"
                className="rounded-lg bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
              >
                Join Anesthesiologist Network
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Clinician Sign In
              </Link>
              <Link
                href="/anesthesiologists/workspace"
                className="rounded-lg border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Access Clinical Workspace
              </Link>
            </div>
          </div>

          {/* Clean Network Callout Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Network Highlights</p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">100% Virtual</p>
                <p className="mt-1 text-xs text-slate-300">Flexible teleconsults with smart schedule autonomy</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xl font-bold text-amber-300">24–48h SLA Target</p>
                <p className="mt-1 text-xs text-slate-300">Completed standardized 1-page pre-op clearance reports</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xl font-bold text-emerald-300">Peer Calibrated</p>
                <p className="mt-1 text-xs text-slate-300">8% random audit sampling for ongoing clinical excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Why Anesthesiologists Choose GetPreOp
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Designed by clinicians to eliminate administrative friction and keep the focus on patient safety.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {keyBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
            >
              <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                {benefit.badge}
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Clinical Workflow Step-By-Step */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Clinical Workflow Overview</h2>
        <p className="mt-1 text-xs text-slate-500">
          Four streamlined steps from referral assignment to finalized clearance report.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((s) => (
            <div key={s.step} className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-5">
              <span className="text-xl font-bold text-teal-800">{s.step}</span>
              <h3 className="mt-2 text-sm font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white md:p-10 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Ready to Modernize Your Anesthesia Practice?</h2>
          <p className="mt-2 text-xs text-slate-300 max-w-xl">
            Apply to join our credentialed physician network or access your clinical workspace today.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
          <Link
            href="/signup?role=ANESTHESIOLOGIST"
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition shadow-sm"
          >
            Apply to Join
          </Link>
          <Link
            href="/anesthesiologists/workspace"
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
          >
            Go to Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
