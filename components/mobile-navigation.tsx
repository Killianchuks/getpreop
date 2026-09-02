"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const primaryLinks = [
  ["Home", "/"],
  ["Why GetPreOp", "/why-getpreop"],
  ["Who We Serve", "/who-we-serve"],
  ["How We Partner", "/how-we-partner"],
  ["For Institutions", "/how-we-partner/institutions"],
  ["For Clinicians", "/how-we-partner/clinicians"],
  ["What We Offer", "/what-we-offer"],
  ["About Us", "/about"],
] as const;

const roles = [
  ["Patient", "PATIENT"],
  ["Institution", "SURGERY_CENTER"],
  ["Anesthesiologist", "ANESTHESIOLOGIST"],
  ["Administrator", "ADMIN"],
] as const;

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <div className="mobile-navigation"><button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700">{open ? <X size={21} /> : <Menu size={21} />}</button>{open ? <div className="mobile-navigation-panel"><nav className="space-y-1">{primaryLinks.map(([label, href]) => <Link key={href} href={href} onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-900">{label}</Link>)}</nav><div className="mt-5 border-t border-slate-200 pt-5"><p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">Account access</p><div className="mt-3 grid grid-cols-2 gap-2">{roles.map(([label, role]) => <Link key={role} href={`/login?role=${role}`} onClick={close} className="rounded-lg border border-slate-200 px-3 py-3 text-center text-xs font-semibold text-slate-700 hover:border-teal-500 hover:bg-teal-50">{label} login</Link>)}</div><Link href="/signup" onClick={close} className="mt-3 block rounded-lg bg-teal-800 px-4 py-3 text-center text-sm font-semibold text-white">Create an account</Link></div></div> : null}</div>;
}
