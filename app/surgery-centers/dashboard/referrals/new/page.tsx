"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewReferralPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitReferral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/referrals/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surgeryCenterId: "meridian-surgical-center",
        surgeryCenterName: "Meridian Surgical Center",
        patientFullName: form.get("patientFullName"),
        patientEmail: form.get("patientEmail"),
        procedureName: form.get("procedureName"),
        scheduledDate: form.get("scheduledDate"),
        priority: form.get("priority"),
      }),
    });

    if (response.ok) {
      router.push("/surgery-centers/dashboard/referrals");
      return;
    }
    setError("We could not create this referral. Review the required details and try again.");
    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/surgery-centers/dashboard/referrals" className="text-xs font-semibold text-teal-800 hover:text-teal-950">Back to referrals</Link>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">New referral</h1>
        <p className="mt-1 text-sm text-slate-500">Send a case to GetPreOp for preoperative assessment and readiness planning.</p>
      </div>
      <form onSubmit={submitReferral} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-800">Patient full name<input required name="patientFullName" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
          <label className="text-sm font-medium text-slate-800">Patient email<input required type="email" name="patientEmail" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
        </div>
        <label className="block text-sm font-medium text-slate-800">Procedure<input required name="procedureName" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-800">Scheduled surgery date<input required type="datetime-local" name="scheduledDate" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
          <label className="text-sm font-medium text-slate-800">Priority<select name="priority" defaultValue="routine" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-700"><option value="routine">Routine - 48 hour target</option><option value="urgent">Urgent - 24 hour target</option></select></label>
        </div>
        {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        <button disabled={submitting} type="submit" className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:bg-slate-300">{submitting ? "Creating referral..." : "Create referral"}</button>
      </form>
    </div>
  );
}