import Link from "next/link";

const ascHighlights = [
  {
    title: "Protect OR Revenue",
    description: "Prevent costly same-day surgical cancellations with early digital screening and anesthesia optimization.",
  },
  {
    title: "Standardized 1-Page Reports",
    description: "Receive turn-key, actionable pre-op clearance reports within 24–48 hours for every scheduled case.",
  },
  {
    title: "Streamlined Referral Intake",
    description: "Easily submit patient referrals, track medical clearance status, and view schedule readiness in real time.",
  },
  {
    title: "Turnkey Anesthesia Partnership",
    description: "Connect directly with state-licensed anesthesiologists without increasing internal administrative burden.",
  },
];

export default function SurgeryCentersPublicPage() {
  return (
    <main>
      <section className="panel mb-6 overflow-hidden">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-900">
              For Surgery Centers &amp; ASCs
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-[0.98] md:text-5xl">
              Maximize OR utilization and eliminate same-day cancellations.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--ink-muted)]">
              GetPreOp provides ambulatory surgery centers with virtual preoperative assessment and risk stratification
              to keep surgical schedules running smoothly.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/institutions"
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
              >
                View Institution Models
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Facility Sign In
              </Link>
              <Link
                href="/surgery-centers/dashboard"
                className="rounded-lg border border-black/15 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Access Facility Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-slate-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Impact Metrics</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-3xl font-bold text-white">24–48h</p>
                <p className="text-xs text-slate-300">Turnaround target for completed anesthesia pre-op reports</p>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <p className="text-3xl font-bold text-amber-300">Ready / Optimize</p>
                <p className="text-xs text-slate-300">Instant triaging into actionable risk levels</p>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <p className="text-3xl font-bold text-teal-300">Seamless EHR</p>
                <p className="text-xs text-slate-300">Clean 1-page reports ready for your chart</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        {ascHighlights.map((item) => (
          <article key={item.title} className="kpi">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-black/10 bg-slate-900 p-8 text-white text-center md:text-left md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ready to streamline facility readiness?</h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            Explore our institution portfolio or sign in to manage referrals and patient clearance queues.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-wrap gap-3 justify-center">
          <Link
            href="/institutions"
            className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-400"
          >
            Explore All Institutions
          </Link>
          <Link
            href="/surgery-centers/dashboard"
            className="rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Facility Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
