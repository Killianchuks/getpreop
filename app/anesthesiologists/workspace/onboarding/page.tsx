"use client";

import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const states = ["CA", "NY", "TX", "FL", "IL", "GA", "NJ", "PA"];
const specialties = ["General anesthesiology", "Cardiac anesthesiology", "Pediatric anesthesiology", "Obstetric anesthesiology", "Neuroanesthesiology", "Regional anesthesiology", "Critical care anesthesiology", "Pain medicine"];

type FormState = {
  licenseNumber: string; licenseRegion: string; licenseExpiration: string; specialtyFocus: string; bio: string; licensedStates: string[];
  licenseEvidence: File | null; credentialEvidence: File | null; malpracticeEvidence: File | null;
  malpracticeInsuranceStatus: "HAVE" | "NONE" | ""; malpracticeProvider: string; malpracticePolicyNumber: string;
  payoutAccountHolderName: string; payoutAccountType: string; bankName: string; payoutRoutingNumber: string; payoutAccountNumber: string; taxId: string; attested: boolean;
};

const initialForm: FormState = {
  licenseNumber: "", licenseRegion: "", licenseExpiration: "", specialtyFocus: "", bio: "", licensedStates: [],
  licenseEvidence: null, credentialEvidence: null, malpracticeEvidence: null, malpracticeInsuranceStatus: "", malpracticeProvider: "", malpracticePolicyNumber: "",
  payoutAccountHolderName: "", payoutAccountType: "Checking", bankName: "", payoutRoutingNumber: "", payoutAccountNumber: "", taxId: "", attested: false,
};

export default function ClinicianOnboardingPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/anesthesiologists/onboarding").then((response) => response.json()).then((data) => {
      const profile = data.profile;
      if (profile) setForm((current) => ({ ...current, licenseNumber: profile.licenseNumber ?? "", licenseRegion: profile.licenseRegion ?? "", licenseExpiration: profile.licenseExpiration?.slice(0, 10) ?? "", specialtyFocus: profile.specialtyFocus ?? "", bio: profile.bio ?? "", licensedStates: profile.licensedStates ?? [], malpracticeInsuranceStatus: profile.malpracticeInsuranceStatus ?? "", malpracticeProvider: profile.malpracticeProvider ?? "", malpracticePolicyNumber: profile.malpracticePolicyNumber ?? "", payoutAccountHolderName: profile.payoutAccountHolderName ?? "", payoutAccountType: profile.payoutAccountType ?? "Checking", bankName: profile.bankName ?? "", attested: Boolean(profile.attestedAt) }));
    }).finally(() => setLoading(false));
  }, []);

  const update = (field: keyof FormState, value: string | boolean | File | null) => setForm((current) => ({ ...current, [field]: value }));
  const toggleState = (state: string) => setForm((current) => ({ ...current, licensedStates: current.licensedStates.includes(state) ? current.licensedStates.filter((item) => item !== state) : [...current.licensedStates, state] }));
  const chooseFile = (field: "licenseEvidence" | "credentialEvidence" | "malpracticeEvidence", event: React.ChangeEvent<HTMLInputElement>) => update(field, event.target.files?.[0] ?? null);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => { if (key === "licensedStates") (value as string[]).forEach((state) => data.append(key, state)); else if (value instanceof File) data.append(key, value); else if (value !== null) data.append(key, String(value)); });
    try {
      const response = await fetch("/api/anesthesiologists/onboarding", { method: "PATCH", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to submit onboarding.");
      setMessage("Onboarding completed and submitted for administrator verification.");
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "Unable to submit onboarding."); } finally { setSaving(false); }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading onboarding...</p>;
  const fileLabel = (file: File | null) => file ? `${file.name} (${Math.ceil(file.size / 1024)} KB)` : "Choose PDF, JPG, or PNG";
  const fileInput = (label: string, field: "licenseEvidence" | "credentialEvidence" | "malpracticeEvidence", file: File | null, required = true) => <label className="block text-sm font-medium text-slate-800">{label}{required ? " *" : ""}<span className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm font-normal text-slate-500 hover:border-teal-600"><FileText size={17} />{fileLabel(file)}<input required={required} type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => chooseFile(field, event)} className="sr-only" /></span></label>;

  return <div className="max-w-3xl space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical portal</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Complete your clinician onboarding</h1><p className="mt-1 text-sm text-slate-500">Complete every requirement before GetPreOp can verify your account or assign cases.</p></div>
    <form onSubmit={submit} className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-teal-800" size={22} /><div><h2 className="font-bold text-slate-900">Professional credentials</h2><p className="mt-1 text-sm text-slate-500">Use standardized credentialing records.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">License number<input required value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Primary license region<select required value={form.licenseRegion} onChange={(e) => update("licenseRegion", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5"><option value="">Select a state</option>{states.map((state) => <option key={state}>{state}</option>)}</select></label><label className="text-sm font-medium">License expiration<input required type="date" value={form.licenseExpiration} onChange={(e) => update("licenseExpiration", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Specialty focus<select required value={form.specialtyFocus} onChange={(e) => update("specialtyFocus", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5"><option value="">Select specialty</option>{specialties.map((specialty) => <option key={specialty}>{specialty}</option>)}</select></label></div><label className="mt-4 block text-sm font-medium">Professional bio<textarea required minLength={20} value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2">{fileInput("License certificate", "licenseEvidence", form.licenseEvidence)}{fileInput("Credentialing evidence", "credentialEvidence", form.credentialEvidence)}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Service states</h2><p className="mt-1 text-sm text-slate-500">Select multiple states where you hold an active, unrestricted license.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{states.map((state) => <label key={state} className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${form.licensedStates.includes(state) ? "border-teal-300 bg-teal-50" : "border-slate-200"}`}><span className="font-semibold">{state}</span><input type="checkbox" checked={form.licensedStates.includes(state)} onChange={() => toggleState(state)} className="h-4 w-4 accent-teal-700" /></label>)}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Malpractice insurance</h2><p className="mt-1 text-sm text-slate-500">Tell us whether you carry coverage and provide evidence if you do.</p><div className="mt-4 flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm"><input required type="radio" name="malpractice" checked={form.malpracticeInsuranceStatus === "HAVE"} onChange={() => update("malpracticeInsuranceStatus", "HAVE")} /> I have malpractice insurance</label><label className="flex items-center gap-2 text-sm"><input required type="radio" name="malpractice" checked={form.malpracticeInsuranceStatus === "NONE"} onChange={() => update("malpracticeInsuranceStatus", "NONE")} /> I do not have it</label></div>{form.malpracticeInsuranceStatus === "HAVE" ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Insurance provider<input required value={form.malpracticeProvider} onChange={(e) => update("malpracticeProvider", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Policy number<input required value={form.malpracticePolicyNumber} onChange={(e) => update("malpracticePolicyNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><div className="sm:col-span-2">{fileInput("Malpractice certificate", "malpracticeEvidence", form.malpracticeEvidence)}</div></div> : null}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Payout and tax information</h2><p className="mt-1 text-sm text-slate-500">Account numbers are not retained; only their last four digits are stored.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Account holder name<input required value={form.payoutAccountHolderName} onChange={(e) => update("payoutAccountHolderName", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Bank name<input required value={form.bankName} onChange={(e) => update("bankName", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Account type<select value={form.payoutAccountType} onChange={(e) => update("payoutAccountType", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5"><option>Checking</option><option>Savings</option></select></label><label className="text-sm font-medium">Routing number<input required inputMode="numeric" value={form.payoutRoutingNumber} onChange={(e) => update("payoutRoutingNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Account number<input required inputMode="numeric" value={form.payoutAccountNumber} onChange={(e) => update("payoutAccountNumber", e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><label className="text-sm font-medium">Tax ID last four digits<input required minLength={4} maxLength={4} value={form.taxId} onChange={(e) => update("taxId", e.target.value.replace(/\D/g, ""))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label></div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Other documentation required before practice</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600"><li>Government-issued photo ID for identity verification</li><li>Current CV or professional résumé</li><li>License certificate and credentialing evidence</li><li>Malpractice certificate, if coverage is available</li><li>Additional state-specific documents requested during admin review</li></ul></section>
      <label className="flex gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700"><input type="checkbox" required checked={form.attested} onChange={(e) => update("attested", e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal-700" /><span>I attest that my information and selected licenses are current, active, unrestricted, and accurate.</span></label>{error ? <p className="text-sm text-rose-700">{error}</p> : null}{message ? <p className="flex items-center gap-2 text-sm font-medium text-teal-800"><CheckCircle2 size={17} />{message}</p> : null}<button disabled={saving} type="submit" className="rounded-lg bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900 disabled:bg-slate-300">{saving ? "Submitting..." : "Complete onboarding"}</button>
    </form>
  </div>;
}
