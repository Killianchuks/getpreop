import Link from "next/link";
import { CURRENT_DOCTOR, getDoctorOverview } from "@/lib/case-assignment-data";

export default function AnesthesiologistDashboardPage() {
  const overview = getDoctorOverview(CURRENT_DOCTOR);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical Portal</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Welcome back, {overview.doctorName}</h1>
          <p className="mt-1 text-sm text-slate-500">Your assigned cases, pending actions, and recent activity.</p>
        </div>
        <Link
          href="/anesthesiologists/workspace/cases"
          className="rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition"
        >
          My Assigned Cases →
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Assigned</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overview.totalAssigned}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Awaiting Your Response</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{overview.awaitingResponse}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{overview.inProgress}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{overview.completed}</p>
        </article>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Upcoming visit</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Faruk, Ibrahim - preoperative assessment</h2>
            <p className="mt-1 text-sm text-slate-600">Thursday, September 4 at 11:00 AM PT · 30 minutes · Case GPO-NY-260901-005</p>
          </div>
          <Link href="/anesthesiologists/workspace/cases/case-5/video" className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">Join visit</Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
          <span className="rounded-full bg-teal-50 px-3 py-1.5 font-semibold text-teal-800">1-day reminder scheduled</span>
          <span className="rounded-full bg-teal-50 px-3 py-1.5 font-semibold text-teal-800">30-minute reminder scheduled</span>
          <Link href="/anesthesiologists/workspace/availability" className="px-3 py-1.5 font-semibold text-teal-800 hover:text-teal-950">Manage availability</Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Needs attention */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">Needs your attention</h2>
          <p className="mt-1 text-xs text-slate-500">Cases pending your response or still in progress.</p>

          <div className="mt-4 divide-y divide-slate-100">
            {overview.needsAttention.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Nothing pending right now.</p>
            ) : (
              overview.needsAttention.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.patientName}</p>
                    <p className="text-xs text-slate-500">{c.procedure} · {c.institutionName}</p>
                  </div>
                  <Link
                    href={c.status === "ASSIGNED" ? "/anesthesiologists/workspace/cases" : `/anesthesiologists/workspace/cases/${c.id}`}
                    className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800"
                  >
                    {c.status === "ASSIGNED" ? "Respond →" : "Continue →"}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Core workflow / peer review */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-900">Core workflow modules</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>License verification with state/province matching</li>
              <li>Chart access via EHR credentials or patient screening calls</li>
              <li>Standardized intake &amp; assessment report templates</li>
              <li>Secure telehealth workflow and billing support</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-bold text-slate-900">Peer quality review</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              8% random-case sampling with checklist scoring for documentation quality and guideline adherence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

