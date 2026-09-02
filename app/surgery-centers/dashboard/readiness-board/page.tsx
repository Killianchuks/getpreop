import {
  STAGE_ORDER,
  formatSurgeryDate,
  getReferrals,
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

export default function ReadinessBoardPage() {
  const referrals = getReferrals();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Readiness board</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every open case grouped by pipeline stage. Columns read left to right in the order work actually happens.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map(({ stage, label }) => {
          const cases = referrals.filter((r) => r.stage === stage);
          return (
            <div key={stage} className="w-64 shrink-0 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <h2 className="text-sm font-bold text-slate-900">{label}</h2>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                  {cases.length}
                </span>
              </div>

              <div className="space-y-2">
                {cases.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs text-slate-400">
                    No cases
                  </p>
                ) : (
                  cases.map((referral) => (
                    <div key={referral.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                      <p className="text-sm font-semibold text-slate-900">{referral.patient}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{referral.procedure}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {referral.complex ? (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">COMPLEX</span>
                        ) : null}
                        {referral.risk ? (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskBadgeStyles[referral.risk]}`}>
                            {riskLabels[referral.risk]}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400">{formatSurgeryDate(referral.surgeryDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
