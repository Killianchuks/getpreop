"use client";

import { useEffect, useState } from "react";
import { getInstitutionOverview } from "@/lib/institution-data";

const facilityName = getInstitutionOverview().facilityName;

export default function InstitutionSettingsPage() {
  const [accessMode, setAccessMode] = useState<"EHR_ACCESS" | "PHONE_SCREENING">("EHR_ACCESS");
  const [vendor, setVendor] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bestTimeToCall, setBestTimeToCall] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/institutions/access-mode?institution=${encodeURIComponent(facilityName)}`);
      const data = await res.json();
      if (data.profile) {
        setAccessMode(data.profile.accessMode);
        if (data.profile.ehr) {
          setVendor(data.profile.ehr.vendor);
          setPortalUrl(data.profile.ehr.portalUrl);
          setUsername(data.profile.ehr.username);
          setPassword(data.profile.ehr.password);
        }
        if (data.profile.phoneContact) {
          setContactName(data.profile.phoneContact.contactName);
          setPhoneNumber(data.profile.phoneContact.phoneNumber);
          setBestTimeToCall(data.profile.phoneContact.bestTimeToCall);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await fetch("/api/institutions/access-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institutionName: facilityName,
        accessMode,
        ehr: accessMode === "EHR_ACCESS" ? { vendor, portalUrl, username, password } : undefined,
        phoneContact: accessMode === "PHONE_SCREENING" ? { contactName, phoneNumber, bestTimeToCall } : undefined,
      }),
    });
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Chart access settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Choose how GetPreOp&apos;s reviewing anesthesiologists gather chart detail for your patients before assessment.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="max-w-2xl space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                accessMode === "EHR_ACCESS" ? "border-teal-700 bg-teal-50/60" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="accessMode"
                className="sr-only"
                checked={accessMode === "EHR_ACCESS"}
                onChange={() => setAccessMode("EHR_ACCESS")}
              />
              <p className="text-sm font-bold text-slate-900">Grant EHR access</p>
              <p className="mt-1 text-xs text-slate-500">
                Share a reviewer login so anesthesiologists can pull medical history, meds, and labs directly from your chart.
              </p>
            </label>

            <label
              className={`cursor-pointer rounded-xl border p-4 transition ${
                accessMode === "PHONE_SCREENING" ? "border-teal-700 bg-teal-50/60" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="accessMode"
                className="sr-only"
                checked={accessMode === "PHONE_SCREENING"}
                onChange={() => setAccessMode("PHONE_SCREENING")}
              />
              <p className="text-sm font-bold text-slate-900">Phone screening only</p>
              <p className="mt-1 text-xs text-slate-500">
                Send us patient contact details instead — we&apos;ll call the patient directly to determine surgical suitability.
              </p>
            </label>
          </div>

          {accessMode === "EHR_ACCESS" ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">EHR reviewer credentials</h2>
              <label className="block text-xs font-semibold text-slate-700">
                EHR vendor
                <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Epic, Cerner, MEDITECH…" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Portal URL
                <input value={portalUrl} onChange={(e) => setPortalUrl(e.target.value)} placeholder="https://ehr.yourfacility.com" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Reviewer username
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Reviewer password
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">Credentials are shared only with the anesthesiologist assigned to each case, after they accept it.</p>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Facility callback contact</h2>
              <label className="block text-xs font-semibold text-slate-700">
                Contact name
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Front desk, scheduling coordinator…" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone number
                  <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  Best time to call
                  <input value={bestTimeToCall} onChange={(e) => setBestTimeToCall(e.target.value)} placeholder="9am–4pm ET" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none" required />
                </label>
              </div>
              <p className="text-[11px] text-slate-400">Add each patient&apos;s direct phone number when you submit their referral.</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-900 transition">
              Save access settings
            </button>
            {saved ? <span className="text-xs font-semibold text-emerald-700">✓ Saved</span> : null}
          </div>
        </form>
      )}
    </div>
  );
}
