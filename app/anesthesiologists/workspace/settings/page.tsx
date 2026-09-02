"use client";

import { useEffect, useState } from "react";

export default function ClinicianSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoAcceptStandardCases, setAutoAcceptStandardCases] = useState(false);
  const [weeklyAvailabilityHours, setWeeklyAvailabilityHours] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/doctor/settings");
      const data = await res.json();
      if (data.settings) {
        setEmailNotifications(data.settings.emailNotifications);
        setSmsNotifications(data.settings.smsNotifications);
        setAutoAcceptStandardCases(data.settings.autoAcceptStandardCases);
        setWeeklyAvailabilityHours(data.settings.weeklyAvailabilityHours);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await fetch("/api/doctor/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailNotifications, smsNotifications, autoAcceptStandardCases, weeklyAvailabilityHours }),
    });
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Notification preferences and case-assignment behavior.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Email me when a case is assigned
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Text me when a case is assigned
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
            Auto-accept standard-complexity cases
            <input
              type="checkbox"
              checked={autoAcceptStandardCases}
              onChange={(e) => setAutoAcceptStandardCases(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Weekly availability (hours)
            <input
              type="number"
              min={0}
              max={80}
              value={weeklyAvailabilityHours}
              onChange={(e) => setWeeklyAvailabilityHours(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal focus:border-teal-700 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-lg bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-900 transition">
              Save settings
            </button>
            {saved ? <span className="text-xs font-semibold text-emerald-700">✓ Saved</span> : null}
          </div>
        </form>
      )}
    </div>
  );
}
