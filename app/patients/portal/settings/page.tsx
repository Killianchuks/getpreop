"use client";

import { useState } from "react";

export default function PatientSettingsPage() {
  const [email, setEmail] = useState(true); const [sms, setSms] = useState(true);
  return <main className="w-full max-w-none p-0"><section className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-wider text-teal-800">Patient space</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Settings</h1><p className="mt-2 text-sm text-slate-500">Choose how GetPreOp keeps you informed about your care.</p><section className="mt-7 rounded-lg border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Appointment notifications</h2><div className="mt-5 space-y-4">{[["Email reminders", email, setEmail], ["Text message reminders", sms, setSms]].map(([label, enabled, setEnabled]) => <div key={label as string} className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-900">{label as string}</p><p className="mt-1 text-xs text-slate-500">Reminders are sent 1 day and 30 minutes before visits.</p></div><button type="button" onClick={() => (setEnabled as React.Dispatch<React.SetStateAction<boolean>>)(!(enabled as boolean))} className={`relative h-6 w-11 rounded-full ${(enabled as boolean) ? "bg-teal-700" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${(enabled as boolean) ? "left-[22px]" : "left-0.5"}`} /></button></div>)}</div></section></section></main>;
}
