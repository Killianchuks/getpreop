"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";

const availableStates = ["CA", "NY", "TX", "FL"];

export default function ClinicianOnboardingPage() {
  const [states, setStates] = useState(["CA", "NY"]);
  const [attested, setAttested] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleState(state: string) {
    setStates((current) => current.includes(state) ? current.filter((item) => item !== state) : [...current, state]);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Credentialing and coverage</h1>
        <p className="mt-1 text-sm text-slate-500">Complete state-specific credentialing before accepting cases in each service state.</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800"><ShieldCheck size={21} /></span><div><h2 className="font-bold text-slate-900">GetPreOp malpractice coverage</h2><p className="mt-1 text-sm leading-6 text-slate-600">GetPreOp provides professional liability coverage for approved services performed through the platform. Coverage activation is reviewed for every state where you deliver care.</p></div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Coverage status</p><p className="mt-1 font-bold text-teal-800">Active in CA, NY</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Policy reference</p><p className="mt-1 font-bold text-slate-900">GPO-MAL-2026-1842</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">Service eligibility</p><p className="mt-1 font-bold text-slate-900">Verified licenses only</p></div></div>
      </section>

      <form onSubmit={(event) => { event.preventDefault(); if (attested && states.length) setSubmitted(true); }} className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">State service enrollment</h2>
        <p className="mt-1 text-sm text-slate-500">Select the jurisdictions where you hold an unrestricted license. Case pay is calculated from the state-specific rate at the time of assignment.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {availableStates.map((state) => <label key={state} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${states.includes(state) ? "border-teal-300 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}><span><span className="block font-semibold text-slate-900">{state}</span><span className="mt-1 block text-xs text-slate-500">License and coverage review required</span></span><input type="checkbox" checked={states.includes(state)} onChange={() => toggleState(state)} className="h-4 w-4 accent-teal-700" /></label>)}
        </div>
        <label className="mt-5 flex gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700"><input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-700" /><span>I attest that each selected license is active, unrestricted, and accurate. I understand that GetPreOp will confirm credentialing and malpractice coverage before assigning cases in a newly added state.</span></label>
        <button disabled={!attested || states.length === 0} type="submit" className="mt-5 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-300">Submit for coverage review</button>
        {submitted ? <p className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-800"><CheckCircle2 size={17} />Credentialing request submitted for review.</p> : null}
      </form>
    </div>
  );
}