"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PartnerNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em] hover:text-teal-800 transition">
        How We Partner <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div role="menu" className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2 normal-case tracking-normal">
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <Link href="/how-we-partner/institutions" onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-semibold text-slate-800 transition hover:bg-teal-50 hover:text-teal-900"><span className="block">For institutions</span><span className="mt-1 block text-xs font-normal text-slate-500">Build a dependable readiness workflow</span></Link>
          <Link href="/how-we-partner/clinicians" onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-semibold text-slate-800 transition hover:bg-teal-50 hover:text-teal-900"><span className="block">For clinicians</span><span className="mt-1 block text-xs font-normal text-slate-500">Practice virtually with confidence</span></Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
