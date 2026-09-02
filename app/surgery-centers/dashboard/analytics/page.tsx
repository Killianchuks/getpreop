import { getAnalytics } from "@/lib/institution-data";

export default function AnalyticsPage() {
  const analytics = getAnalytics();
  const maxTurnaround = Math.max(...analytics.turnaroundBuckets.map((b) => b.count), 1);
  const maxRisk = Math.max(...analytics.riskMix.map((r) => r.count), 1);
  const maxCancellations = Math.max(...analytics.cancellationsOverTime.map((c) => c.total), 1);
  const maxVolume = Math.max(...analytics.volumeBySurgeon.map((v) => v.cleared + v.pending), 1);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          How fast clearances come back, what the risk mix looks like, and where cancellations are still leaking.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Clearance turnaround */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Clearance turnaround</h2>
          <p className="mt-1 text-xs text-slate-500">Hours from referral received to signed clearance.</p>
          <div className="mt-6 flex h-40 items-end gap-4">
            {analytics.turnaroundBuckets.map((bucket) => (
              <div key={bucket.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-teal-700"
                  style={{ height: `${Math.max((bucket.count / maxTurnaround) * 100, 4)}%` }}
                  title={`${bucket.count} cases`}
                />
                <span className="text-[11px] font-medium text-slate-500">{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk mix */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Risk mix</h2>
          <p className="mt-1 text-xs text-slate-500">Stratification outcome across all assessed cases.</p>
          <div className="mt-6 space-y-4">
            {analytics.riskMix.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs font-medium text-slate-600">{row.label}</span>
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

        {/* Cancellations over time */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Cancellations over time</h2>
          <p className="mt-1 text-xs text-slate-500">Total cancellations and the preventable subset, by month.</p>
          <div className="mt-6 flex h-40 items-end gap-6">
            {analytics.cancellationsOverTime.map((point) => (
              <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end gap-1" style={{ height: "100%" }}>
                  <div
                    className="flex-1 rounded-t-md bg-slate-300"
                    style={{ height: `${Math.max((point.total / maxCancellations) * 100, 4)}%` }}
                    title={`${point.total} total`}
                  />
                  <div
                    className="flex-1 rounded-t-md bg-red-500"
                    style={{ height: `${Math.max((point.preventable / maxCancellations) * 100, 4)}%` }}
                    title={`${point.preventable} preventable`}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-500">{point.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Total</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Preventable</span>
          </div>
        </div>

        {/* Volume by surgeon */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">Volume by surgeon</h2>
          <p className="mt-1 text-xs text-slate-500">Referrals sent, split by how many reached clearance.</p>
          <div className="mt-6 space-y-4">
            {analytics.volumeBySurgeon.map((row) => {
              const total = row.cleared + row.pending;
              return (
                <div key={row.surgeon} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-xs font-medium text-slate-600">{row.surgeon}</span>
                  <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-3 bg-teal-700"
                      style={{ width: `${(row.cleared / maxVolume) * 100}%` }}
                    />
                    <div
                      className="h-3 bg-amber-400"
                      style={{ width: `${(row.pending / maxVolume) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-slate-900">{total}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-700" /> Cleared</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
