import { getCurrentUser } from "@/lib/current-user";

export default async function CancellationsPage() {
  await getCurrentUser();
  return <div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Cancellations</h1><p className="mt-1 text-sm text-slate-500">Facility cancellation history will appear here when cancellation records are captured.</p></div><div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><p className="text-base font-semibold text-slate-900">No cancellation records yet</p><p className="mt-2 text-sm text-slate-500">There are no real cancellation records associated with this facility.</p></div></div>;
}
