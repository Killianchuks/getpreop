"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const roles = [
  { label: "Patient", loginHint: "Access your pre-op plan", role: "PATIENT" },
  { label: "Institution", loginHint: "Manage facility readiness", role: "SURGERY_CENTER" },
  { label: "Anesthesiologist", loginHint: "Access your clinical workspace", role: "ANESTHESIOLOGIST" },
  { label: "Administrator", loginHint: "Manage platform operations", role: "ADMIN" },
];

function RoleMenu({ type }: { type: "login" | "signup" }) {
  const [open, setOpen] = useState(false);
  const label = type === "login" ? "Login" : "Sign Up";

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" className={`flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-semibold transition ${type === "login" ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-teal-800 text-white hover:bg-teal-900"}`}>
        {label} <ChevronDown size={14} className={open ? "rotate-180" : ""} />
      </button>
      {open ? <div role="menu" className="absolute right-0 top-full z-50 w-64 pt-2"><div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg">{roles.map((role) => <Link key={role.role} href={type === "login" ? `/login?role=${role.role}` : `/signup?role=${role.role}`} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-left transition hover:bg-teal-50"><span className="block text-sm font-semibold text-slate-900">{type === "login" ? `${role.label} login` : `Join as ${role.label}`}</span><span className="mt-1 block text-xs text-slate-500">{role.loginHint}</span></Link>)}</div></div> : null}
    </div>
  );
}

export function AuthNavigation() {
  return <div className="flex items-center gap-2.5"><RoleMenu type="login" /><RoleMenu type="signup" /></div>;
}
