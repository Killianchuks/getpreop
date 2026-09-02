"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/anesthesiologists/workspace", label: "Dashboard" },
  { href: "/anesthesiologists/workspace/cases", label: "My Cases" },
  { href: "/anesthesiologists/workspace/analytics", label: "Analytics" },
  { href: "/anesthesiologists/workspace/profile", label: "Profile" },
  { href: "/anesthesiologists/workspace/onboarding", label: "Credentialing" },
  { href: "/anesthesiologists/workspace/availability", label: "Availability" },
  { href: "/anesthesiologists/workspace/payment-information", label: "Licenses & payments" },
  { href: "/anesthesiologists/workspace/account", label: "Account" },
  { href: "/anesthesiologists/workspace/settings", label: "Settings" },
];

export function ClinicianSidebar({
  doctorName,
  specialtyFocus,
}: {
  doctorName: string;
  specialtyFocus: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    document.cookie = "getpreop_role=; path=/; max-age=0";
    document.cookie = "getpreop_user=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <Link href="/anesthesiologists/workspace" className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">
          G
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-900">GetPreOp</span>
      </Link>

      <div className="mt-6 border-t border-slate-100 px-2 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Anesthesiologist</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{doctorName}</p>
        <p className="text-xs text-slate-500">{specialtyFocus}</p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.href === "/anesthesiologists/workspace"
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
  );
}
