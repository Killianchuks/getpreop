import { format } from "date-fns";
import { getCancellations } from "@/lib/institution-data";

export default function CancellationsPage() {
  const cancellations = getCancellations();
  const preventableCount = cancellations.filter((c) => c.preventable).length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Cancellations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Same-day and late cancellations from the last 60 days, with the preventable subset flagged.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cancellations</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{cancellations.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preventable with Pre-Op Screening</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{preventableCount}</p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-semibold">Patient</th>
                <th className="px-3 py-2 font-semibold">Procedure</th>
                <th className="px-3 py-2 font-semibold">Surgery date</th>
                <th className="px-3 py-2 font-semibold">Reason</th>
                <th className="px-3 py-2 font-semibold">Preventable</th>
              </tr>
            </thead>
            <tbody>
              {cancellations.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                  <td className="px-3 py-3 font-semibold text-slate-900">{c.patient}</td>
                  <td className="px-3 py-3 text-slate-700">{c.procedure}</td>
                  <td className="px-3 py-3 text-slate-700">{format(c.surgeryDate, "MMM d, yyyy")}</td>
                  <td className="px-3 py-3 text-slate-700">{c.reason}</td>
                  <td className="px-3 py-3">
                    {c.preventable ? (
                      <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                        Yes
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
