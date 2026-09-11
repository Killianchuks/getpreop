"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewReferralPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "confirming" | "complete">("idle");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (searchParams.get("payment") !== "success" || !sessionId) return;

    setPaymentState("confirming");
    fetch("/api/referrals/complete-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Payment could not be verified.");
        setPaymentState("complete");
        router.replace("/surgery-centers/dashboard/referrals");
      })
      .catch((paymentError) => {
        setError(paymentError instanceof Error ? paymentError.message : "Payment could not be verified.");
        setPaymentState("idle");
      });
  }, [router, searchParams]);

  async function submitReferral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const scheduledDateInput = form.get("scheduledDate");
    const scheduledDateValue = typeof scheduledDateInput === "string" && scheduledDateInput.length > 0 ? scheduledDateInput : "";
    const parsedScheduledDate = scheduledDateValue ? new Date(scheduledDateValue) : null;

    if (!scheduledDateValue || Number.isNaN(parsedScheduledDate?.getTime() ?? NaN)) {
      setError("Please choose a valid scheduled surgery date.");
      setSubmitting(false);
      return;
    }

    const supportingNote = form.get("supportingNote");
    let supportingNoteData: { name: string; type: string; content: string } | undefined;

    if (supportingNote instanceof File && supportingNote.size > 0) {
      if (supportingNote.size > 5 * 1024 * 1024) {
        setError("Supporting notes must be 5 MB or smaller.");
        setSubmitting(false);
        return;
      }
      supportingNoteData = {
        name: supportingNote.name,
        type: supportingNote.type || "application/octet-stream",
        content: await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
          reader.onerror = () => reject(new Error("Unable to read supporting note."));
          reader.readAsDataURL(supportingNote);
        }),
      };
    }
    const response = await fetch("/api/referrals/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surgeryCenterId: "meridian-surgical-center",
        surgeryCenterName: "Meridian Surgical Center",
        patientFullName: form.get("patientFullName"),
        patientEmail: form.get("patientEmail"),
        patientPhone: form.get("patientPhone"),
        medicalHistory: form.get("medicalHistory"),
        facilityEmail: form.get("facilityEmail"),
        procedureName: form.get("procedureName"),
        scheduledDate: parsedScheduledDate?.toISOString(),
        priority: form.get("priority") || "standard",
        supportingNote: supportingNoteData,
      }),
    });

    const checkoutData = await response.json();
    if (!response.ok || !checkoutData.url) {
      setError(checkoutData.error ?? "We could not start secure payment. Review the required details and try again.");
      setSubmitting(false);
      return;
    }

    window.location.href = checkoutData.url;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/surgery-centers/dashboard/referrals" className="text-xs font-semibold text-teal-800 hover:text-teal-950">Back to referrals</Link>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">New referral</h1>
        <p className="mt-1 text-sm text-slate-500">Complete secure payment before sending a case to GetPreOp for preoperative assessment and readiness planning.</p>
      </div>
      {paymentState === "confirming" ? <p className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">Verifying payment and creating referral...</p> : null}
      {paymentState === "complete" ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Payment verified. Referral created.</p> : null}
      <form onSubmit={submitReferral} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-800">Patient full name<input required name="patientFullName" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
          <label className="text-sm font-medium text-slate-800">Patient email<input required type="email" name="patientEmail" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
          <label className="text-sm font-medium text-slate-800">Patient phone<input required type="tel" name="patientPhone" placeholder="(555) 555-5555" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
          <label className="text-sm font-medium text-slate-800 sm:col-span-2">Facility billing email<input required type="email" name="facilityEmail" placeholder="billing@facility.org" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
        </div>
        <label className="block text-sm font-medium text-slate-800">Procedure<input required name="procedureName" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
        <label className="block text-sm font-medium text-slate-800">Relevant medical history and pre-operative considerations<textarea required name="medicalHistory" rows={4} placeholder="Conditions, allergies, medications, prior anesthesia issues, or other information the care team should know." className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
        <label className="block text-sm font-medium text-slate-800">Supporting clinical note <span className="font-normal text-slate-500">(optional, PDF or image, max 5 MB)</span><input name="supportingNote" type="file" accept="application/pdf,image/*,.txt" className="mt-1.5 block w-full text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-100" /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-800">Scheduled surgery date<input required type="datetime-local" name="scheduledDate" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-700" /></label>
          <label className="text-sm font-medium text-slate-800">Priority<select name="priority" defaultValue="standard" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-teal-700"><option value="standard">Routine - 48 hour target</option><option value="urgent">Urgent - 24 hour target</option></select></label>
        </div>
        {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        <button disabled={submitting || paymentState === "confirming"} type="submit" className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:bg-slate-300">{submitting ? "Starting secure payment..." : "Continue to payment"}</button>
      </form>
    </div>
  );
}