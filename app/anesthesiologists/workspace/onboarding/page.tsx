"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const availableStates = ["CA", "NY", "TX", "FL"];
type FormState = { licenseNumber: string; licenseRegion: string; licenseExpiration: string; specialtyFocus: string; bio: string; licensedStates: string[]; payoutAccountHolderName: string; payoutAccountType: string; payoutRoutingNumber: string; payoutAccountNumber: string; taxId: string; attested: boolean };
const initialForm: FormState = { licenseNumber: "", licenseRegion: "", licenseExpiration: "", specialtyFocus: "", bio: "", licensedStates: [], payoutAccountHolderName: "", payoutAccountType: "Checking", payoutRoutingNumber: "", payoutAccountNumber: "", taxId: "", attested: false };

export default function ClinicianOnboardingPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/anesthesiologists/onboarding").then((response) => response.json()).then((data) => {
      const profile = data.profile;
      if (profile) setForm({ ...initialForm, licenseNumber: profile.licenseNumber ?? "", licenseRegion: profile.licenseRegion ?? "", licenseExpiration: profile.licenseExpiration?.slice(0, 10) ?? "", specialtyFocus: profile.specialtyFocus ?? "", bio: profile.bio ?? "", licensedStates: profile.licensedStates ?? [], payoutAccountHolderName: profile.payoutAccountHolderName ?? "", payoutAccountType: profile.payoutAccountType ?? "Checking", attested: Boolean(profile.attestedAt) });
    }).finally(() => setLoading(false));
  }, []);

  const update = (field: keyof FormState, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));
  const toggleState = (state: string) => setForm((current) => ({ ...current, licensedStates: current.licensedStates.includes(state) ? current.licensedStates.filter((item) => item !== state) : [...current.licensedStates, state] }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const response = await fetch("/api/anesthesiologists/onboarding", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to submit onboarding.");
      setMessage("Onboarding completed and submitted for administrator verification.");
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "Unable to submit onboarding."); } finally { setSaving(false); }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading onboarding...</p>;

  return <div className="max-w-3xl space-y-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical portal</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Complete your clinician onboarding</h1><p className="mt-1 text-sm text-slate-500">Every required field must be completed before GetPreOp can verify your account or assign cases.</p></div><form onSubmit={submit} className="space-y-5">
    <section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-teal-800" size={22} /><div><h2 className="font-bold text-slate-900">Professional credentials</h2><p className="mt-1 text-sm text-slate-500">Provide current license and practice information.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-800">License number<input required value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium text-slate-800">License region<input required value={form.licenseRegion} onChange={(e) => update("licenseRegion", e.target.value)} placeholder="CA" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 uppercase" /></label><label className="text-sm font-medium text-slate-800">License expiration<input required type="date" value={form.licenseExpiration} onChange={(e) => update("licenseExpiration", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium text-slate-800">Specialty focus<input required value={form.specialtyFocus} onChange={(e) => update("specialtyFocus", e.target.value)} placeholder="General and orthopedic anesthesia" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label></div><label className="mt-4 block text-sm font-medium text-slate-800">Professional bio<textarea required minLength={20} value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Service states</h2><p className="mt-1 text-sm text-slate-500">Select every state where you hold an active, unrestricted license.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{availableStates.map((state) => <label key={state} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${form.licensedStates.includes(state) ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}><span className="font-semibold">{state}</span><input type="checkbox" checked={form.licensedStates.includes(state)} onChange={() => toggleState(state)} className="h-4 w-4 accent-teal-700" /></label>)}</div></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Payout and tax information</h2><p className="mt-1 text-sm text-slate-500">Sensitive account numbers are not retained; only their last four digits are stored.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Account holder name<input required value={form.payoutAccountHolderName} onChange={(e) => update("payoutAccountHolderName", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Account type<select value={form.payoutAccountType} onChange={(e) => update("payoutAccountType", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5"><option>Checking</option><option>Savings</option></select></label><label className="text-sm font-medium">Routing number<input required inputMode="numeric" value={form.payoutRoutingNumber} onChange={(e) => update("payoutRoutingNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Account number<input required inputMode="numeric" value={form.payoutAccountNumber} onChange={(e) => update("payoutAccountNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Tax ID last four digits<input required minLength={4} maxLength={4} value={form.taxId} onChange={(e) => update("taxId", e.target.value.replace(/\D/g, ""))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label></div></section>
    <label className="flex gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700"><input type="checkbox" checked={form.attested} onChange={(e) => update("attested", e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-700" /><span>I attest that my information and selected licenses are current, active, unrestricted, and accurate.</span></label>{error ? <p className="text-sm text-rose-700">{error}</p> : null}{message ? <p className="flex items-center gap-2 text-sm font-medium text-teal-800"><CheckCircle2 size={17} />{message}</p> : null}<button disabled={saving} type="submit" className="rounded-lg bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900 disabled:bg-slate-300">{saving ? "Submitting..." : "Complete onboarding"}</button>
+  </form></div>;
}
