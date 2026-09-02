import { differenceInCalendarDays, format } from "date-fns";
import { computeClearance, getReferrals, type ReferralRecord } from "@/lib/institution-data";

function dayLabel(date: Date): string {
  const diff = differenceInCalendarDays(date, new Date());
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return format(date, "EEEE, MMM d");
}

export default function SchedulePage() {
  const referrals = getReferrals()
    .filter((r) => r.surgeryDate.getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => a.surgeryDate.getTime() - b.surgeryDate.getTime());

  const groups = new Map<string, ReferralRecord[]>();
  for (const referral of referrals) {
    const key = format(referral.surgeryDate, "yyyy-MM-dd");
    const bucket = groups.get(key) ?? [];
    bucket.push(referral);
    groups.set(key, bucket);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Schedule</h1>
        <p className="mt-1 text-sm text-slate-500">
          Procedures booked in the next 30 days, grouped by surgical day. Cases without clearance are flagged before they reach the OR.
        </p>
      </div>

      <div className="space-y-4">
        {Array.from(groups.entries()).map(([key, cases]) => {
          const awaitingClearance = cases.filter((c) => computeClearance(c).status !== "met").length;
          return (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">{dayLabel(cases[0].surgeryDate)}</h2>
                <span className="text-xs font-medium text-slate-500">
                  {cases.length} case{cases.length > 1 ? "s" : ""} · {awaitingClearance} awaiting clearance
                </span>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {cases.map((referral) => {
                  const clearance = computeClearance(referral);
                  return (
                    <div key={referral.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {referral.patient}
                            {referral.complex ? (
                              <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">COMPLEX</span>
                            ) : null}
                            {referral.asaClass ? (
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                ASA {referral.asaClass}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-slate-500">
                            {referral.procedure} · {referral.surgeon}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-600">
                          {referral.stage.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            clearance.status === "overdue"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : clearance.status === "met"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {clearance.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {groups.size === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No procedures scheduled in the next 30 days.
          </p>
        ) : null}
      </div>
    </div>
  );
}
