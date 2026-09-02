import { CURRENT_DOCTOR, getDoctorOverview, getPayoutForCase, STATE_COMPENSATION_RATES } from "@/lib/case-assignment-data";

export default function ClinicianAccountPage() {
  const overview = getDoctorOverview(CURRENT_DOCTOR);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Account &amp; Billing</h1>
        <p className="mt-1 text-sm text-slate-500">Payout summary for completed assessments, calculated by service state.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">CA Standard Rate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">${STATE_COMPENSATION_RATES.CA.standard}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">NY Standard Rate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">${STATE_COMPENSATION_RATES.NY.standard}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed This Period</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overview.completed}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Earnings</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${overview.totalEarnings.toLocaleString()}</p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">Recent completed reports</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {overview.recentCompleted.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">No completed reports yet.</p>
          ) : (
            overview.recentCompleted.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.patientName}</p>
                  <p className="text-xs text-slate-500">{c.procedure} · {c.institutionName} · {c.serviceState}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">${getPayoutForCase(c)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">State compensation schedule</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(STATE_COMPENSATION_RATES).filter(([state]) => state !== "DEFAULT").map(([state, rate]) => (
            <div key={state} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><span className="font-bold text-slate-900">{state}</span><span className="ml-2">${rate.standard} standard · ${rate.standard + rate.complexUplift} complex</span></div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">Payout method</h2>
        <p className="mt-1 text-xs text-slate-500">Direct deposit on file, paid bi-weekly.</p>
        <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
          <p><span className="font-semibold">Bank:</span> •••• 4821</p>
          <p><span className="font-semibold">Next payout:</span> Sep 15, 2026</p>
        </div>
      </div>
    </div>
  );
}
