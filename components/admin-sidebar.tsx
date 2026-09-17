"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Mail,
  Menu,
  ReceiptText,
  Settings,
  Stethoscope,
  Upload,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Operations",
    items: [
      { id: "overview", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { id: "staff", href: "/admin/staff", label: "Staff", icon: Stethoscope, count: "3" },
      { id: "users", href: "/admin/users", label: "Users", icon: Users, count: "18" },
      { id: "support", href: "/admin/support", label: "Support tickets", icon: CircleHelp, count: "1" },
      { id: "cases-dashboard", href: "/admin/case-assignment", label: "Cases", icon: ClipboardList, count: "3" },
    ],
  },
  {
    label: "Case management",
    items: [
      { id: "cases", href: "/admin/case-assignment", label: "Medical cases", icon: ClipboardList, count: "3" },
      { id: "referrals", href: "/admin/referrals", label: "Referred cases", icon: FileText, count: "6" },
      { id: "uploads", href: "/admin/uploads", label: "Uploads", icon: Upload },
    ],
  },
  {
    label: "Network & billing",
    items: [
      { id: "facilities", href: "/admin/facilities", label: "Institutional partners", icon: Building2, count: "2" },
      { id: "bd-center", href: "/admin/bd-center", label: "BD center", icon: Users, count: "CRM" },
      { id: "payments", href: "/admin/payments", label: "Payments", icon: CreditCard },
      { id: "pricing", href: "/admin/pricing", label: "Pricing", icon: ReceiptText },
      { id: "payouts", href: "/admin/payouts", label: "Clinician payouts", icon: WalletCards },
    ],
  },
  {
    label: "Platform",
    items: [
      { id: "emails", href: "/admin/emails", label: "Email tracking", icon: Mail, count: "Inbox" },
      { id: "verification", href: "/admin/verification", label: "Verification", icon: BadgeCheck },
      { id: "availability", href: "/admin/availability", label: "Clinician availability", icon: CalendarDays },
      { id: "reports", href: "/admin/reports", label: "Reports", icon: FileBarChart },
      { id: "activity", href: "/admin/activity", label: "Activity log", icon: Activity },
      { id: "settings", href: "/admin/settings", label: "General settings", icon: Settings },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "notifications", href: "/admin/notifications", label: "Notifications", icon: Bell },
      { id: "install", href: "/admin/install", label: "Add to home screen", icon: FolderOpen },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
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
          <Link href="/admin" className="flex items-center gap-3" onClick={closeMobile}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span>
            <span><span className="block text-lg font-bold tracking-tight text-slate-900">GetPreOp</span><span className="block text-[11px] font-medium text-slate-500">Platform operations</span></span>
          </Link>
          <button type="button" onClick={closeMobile} aria-label="Close navigation" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden">
            <X size={18} />
          </button>
        </div>
        <nav className="mt-9 flex-1 space-y-6 overflow-y-auto text-sm">
          {navigation.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const selected = item.href === "/admin" ? pathname === item.href : pathname?.startsWith(item.href);
                  return (
                    <Link key={item.id} href={item.href} onClick={closeMobile} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium transition ${selected ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                      <Icon size={17} strokeWidth={selected ? 2.25 : 1.9} />
                      <span className="flex-1">{item.label}</span>
                      {item.count ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${selected ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}>{item.count}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold text-slate-900">Platform administrator</p><p className="mt-0.5 text-xs text-slate-500">System oversight</p></div>
      </aside>
    </>
  );
}
