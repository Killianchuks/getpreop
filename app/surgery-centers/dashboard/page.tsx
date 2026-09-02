import Link from "next/link";
import {
  computeClearance,
  formatSurgeryDate,
  getInstitutionOverview,
} from "@/lib/institution-data";

const riskBadgeStyles: Record<string, string> = {
  SPECIALIST: "bg-red-50 text-red-700 border-red-100",
  OPTIMIZE: "bg-amber-50 text-amber-800 border-amber-100",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const riskLabels: Record<string, string> = {
  SPECIALIST: "Specialist",
  OPTIMIZE: "Optimize",
  READY: "Ready",
};

export default function InstitutionDashboardPage() {
  const overview = getInstitutionOverview();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">{overview.facilityName}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Pre-op readiness at a glance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every case with a scheduled date, its clearance deadline, and what is still blocking it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/surgery-centers/dashboard/readiness-board"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Readiness board
          </Link>
          <Link
            href="/surgery-centers/dashboard/referrals"
            className="rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition"
          >
            New referral
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Referrals</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overview.metrics.activeReferrals}</p>
          <p className="mt-1 text-xs text-slate-500">1 still awaiting patient intake</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Clearance at Risk</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{overview.metrics.clearanceAtRisk}</p>
          <p className="mt-1 text-xs text-slate-500">Due within 24 hours or already overdue</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ready for Surgery</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{overview.metrics.readyPct}%</p>
          <p className="mt-1 text-xs text-slate-500">Of assessed cases with no outstanding barriers</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Turnaround</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overview.metrics.avgTurnaroundHours} hrs</p>
          <p className="mt-1 text-xs text-slate-500">Referral received to signed clearance</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Needs attention today */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">Needs attention today</h2>
          <p className="mt-1 text-xs text-slate-500">Cases whose 48-hour clearance window is closing or has passed.</p>

          <div className="mt-4 divide-y divide-slate-100">
            {overview.needsAttention.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Nothing overdue right now.</p>
            ) : (
              overview.needsAttention.map((referral) => {
                const clearance = computeClearance(referral);
                return (
                  <div key={referral.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{referral.patient}</p>
                      <p className="text-xs text-slate-500">
                        {referral.procedure} · {formatSurgeryDate(referral.surgeryDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {referral.risk ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${riskBadgeStyles[referral.risk]}`}>
                          ⚠ {riskLabels[referral.risk]}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                        ⏱ {clearance.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Risk mix */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">Risk mix</h2>
          <p className="mt-1 text-xs text-slate-500">Across all assessed cases.</p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
              <span className="text-xs font-semibold text-red-700">⚠ Specialist</span>
              <span className="text-sm font-bold text-slate-900">{overview.riskMix.specialist}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span className="text-xs font-semibold text-amber-800">🔧 Optimize</span>
              <span className="text-sm font-bold text-slate-900">{overview.riskMix.optimize}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
              <span className="text-xs font-semibold text-emerald-700">✓ Ready</span>
              <span className="text-sm font-bold text-slate-900">{overview.riskMix.ready}</span>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Risk is assigned by the reviewing anesthesiologist. Cases without a risk status have not completed intake.
          </p>
        </div>
      </div>

      {/* Next 14 days */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900">Next 14 days</h2>
        <p className="mt-1 text-xs text-slate-500">
          {overview.upcoming.filter((r) => {
            const days = (r.surgeryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
            return days <= 14;
          }).length}{" "}
          scheduled case(s) with a surgery date.
        </p>

        <div className="mt-4 divide-y divide-slate-100">
          {overview.upcoming.slice(0, 5).map((referral) => (
            <div key={referral.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{referral.patient}</p>
                <p className="text-xs text-slate-500">
                  {referral.procedure} · {referral.surgeon}
                </p>
              </div>
              <span className="text-xs font-medium text-slate-600">{formatSurgeryDate(referral.surgeryDate)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

