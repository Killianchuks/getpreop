"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/surgery-centers/dashboard", label: "Dashboard" },
  { href: "/surgery-centers/dashboard/referrals", label: "Referrals" },
  { href: "/surgery-centers/dashboard/schedule", label: "Schedule" },
  { href: "/surgery-centers/dashboard/readiness-board", label: "Readiness board" },
  { href: "/surgery-centers/dashboard/analytics", label: "Analytics" },
  { href: "/surgery-centers/dashboard/cancellations", label: "Cancellations" },
  { href: "/surgery-centers/dashboard/settings", label: "Settings" },
];

export function InstitutionSidebar({
  facilityName,
  clinicianName,
}: {
  facilityName: string;
  clinicianName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSignOut() {
    document.cookie = "getpreop_role=; path=/; max-age=0";
    document.cookie = "getpreop_user=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Link href="/surgery-centers/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span>
          <span className="text-lg font-bold tracking-tight text-slate-900">GetPreOp</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        >
          <Menu size={19} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 md:static md:flex md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/surgery-centers/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">
              G
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">GetPreOp</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 border-t border-slate-100 px-2 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Surgery Center</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{clinicianName}</p>
          <p className="text-xs text-slate-500">{facilityName}</p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/surgery-centers/dashboard"
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-50 text-teal-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          ↩ Sign out
        </button>
      </aside>
    </>
  );
}
