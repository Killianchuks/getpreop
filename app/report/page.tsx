const reportSections = [
  "Patient summary and surgery details",
  "Risk stratification: Ready / Needs Optimization / Needs Specialist Evaluation",
  "Medication instructions",
  "Additional workup recommendations only when clinically appropriate",
  "Virtual anesthesia consult findings",
  "Clear disposition and next steps",
];

export default function ReportPage() {
  return (
    <main>
      <section className="panel">
        <h1 className="text-3xl font-bold">One-Page Preoperative Report</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Standardized report returned within 24-48 hours of referral and digital intake completion.
        </p>

        <div className="mt-6 rounded-xl border border-black/10 bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">SLA target</p>
          <p className="mt-1 text-xl font-semibold">24h urgent referrals | 48h standard referrals</p>
          <ul className="mt-4 list-disc pl-5 text-sm">
            {reportSections.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
