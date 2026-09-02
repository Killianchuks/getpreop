import { CURRENT_DOCTOR, getCasesForDoctor } from "@/lib/case-assignment-data";

export default function ClinicianAnalyticsPage() {
  const myCases = getCasesForDoctor(CURRENT_DOCTOR);

  const byStatus = [
    { label: "Awaiting response", count: myCases.filter((c) => c.status === "ASSIGNED").length },
    { label: "Accepted", count: myCases.filter((c) => c.status === "ACCEPTED").length },
    { label: "Intake complete", count: myCases.filter((c) => c.status === "INTAKE_COMPLETE").length },
    { label: "Report submitted", count: myCases.filter((c) => c.status === "REPORT_SUBMITTED").length },
  ];
  const maxStatus = Math.max(...byStatus.map((s) => s.count), 1);

  const riskMix = [
    { label: "Ready", count: myCases.filter((c) => c.report?.riskLevel === "READY").length },
    { label: "Needs optimization", count: myCases.filter((c) => c.report?.riskLevel === "OPTIMIZE").length },
    { label: "Needs specialist", count: myCases.filter((c) => c.report?.riskLevel === "SPECIALIST").length },
  ];
  const maxRisk = Math.max(...riskMix.map((r) => r.count), 1);

  const completed = myCases.filter((c) => c.status === "REPORT_SUBMITTED").length;
  const complexCases = myCases.filter((c) => c.complexity === "COMPLEX").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Your caseload mix and completion activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Assigned</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{myCases.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reports Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{completed}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Complex Cases</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{complexCases}</p>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Cases by pipeline stage</h2>
          <div className="mt-6 space-y-4">
            {byStatus.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs font-medium text-slate-600">{row.label}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-teal-700"
                    style={{ width: `${Math.max((row.count / maxStatus) * 100, 4)}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-bold text-slate-900">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Risk stratification of completed reports</h2>
          <div className="mt-6 space-y-4">
            {riskMix.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs font-medium text-slate-600">{row.label}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-teal-700"
                    style={{ width: `${Math.max((row.count / maxRisk) * 100, 4)}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-bold text-slate-900">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
