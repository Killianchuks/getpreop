"use client";

import { Bell, CalendarDays, CreditCard, FileCheck2, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/patients/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients/portal/assessment", label: "Appointments", icon: CalendarDays },
  { href: "/patients/portal/documents", label: "Documents", icon: FileText },
  { href: "/patients/portal/messages", label: "Messages", icon: MessageSquare },
  { href: "/patients/portal/completed-care", label: "Completed care", icon: FileCheck2 },
  { href: "/patients/portal/billing", label: "Billing", icon: CreditCard },
  { href: "/patients/portal/profile", label: "Profile", icon: UserRound },
  { href: "/patients/portal/settings", label: "Settings", icon: Settings },
];

export function PatientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  function signOut() { document.cookie = "getpreop_role=; path=/; max-age=0"; document.cookie = "getpreop_user=; path=/; max-age=0"; router.push("/"); }
  function closeMobile() { setMobileOpen(false); }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Link href="/patients/portal" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span>
          <span className="text-lg font-bold tracking-tight text-slate-900">GetPreOp</span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700">
          <Menu size={19} />
        </button>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMobile} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 md:static md:flex md:translate-x-0 ${mobileOpen ? "translate-x-0" : ""}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/patients/portal" className="flex items-center gap-2" onClick={closeMobile}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span>
            <span className="text-lg font-bold tracking-tight text-slate-900">GetPreOp</span>
          </Link>
          <button type="button" onClick={closeMobile} aria-label="Close navigation" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 border-t border-slate-100 px-2 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Patient</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Taylor Morgan</p>
          <p className="text-xs text-slate-500">Pre-op care plan</p>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/patients/portal" ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={closeMobile} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <Icon size={17} />
                <span>{item.label}</span>
                {item.label === "Messages" ? <span className="ml-auto rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">1</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 pt-3">
          <button type="button" onClick={() => { router.push("/patients/portal/settings"); closeMobile(); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Bell size={17} /> Notifications
          </button>
          <button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50">
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
