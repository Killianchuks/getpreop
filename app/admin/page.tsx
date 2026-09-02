"use client";

import Link from "next/link";
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
  ReceiptText,
  Settings,
  Stethoscope,
  Upload,
  Users,
  WalletCards,
} from "lucide-react";

const recentCases = [
  { patient: "Vogel, Stanley", procedure: "Transurethral resection of prostate", facility: "Meridian Surgical Center", status: "Unassigned", due: "Needs assignment" },
  { patient: "Raghunathan, Priya", procedure: "Diagnostic laparoscopy", facility: "Meridian Surgical Center", status: "Unassigned", due: "Needs assignment" },
  { patient: "Nkemdirim, Harold", procedure: "Total knee arthroplasty", facility: "Meridian Surgical Center", status: "Assigned", due: "Due in 18h" },
  { patient: "Faruk, Ibrahim", procedure: "EGD with biopsy", facility: "Lakeside Endoscopy Center", status: "In review", due: "Due in 2d" },
];

const activity = [
  "Dr. Amara Chen accepted a complex case",
  "Meridian Surgical Center sent 2 new referrals",
  "Pre-op report delivered for Whitfield, Anna",
  "Lakeside Endoscopy Center updated phone screening access",
];

const navigation = [
  {
    label: "Operations",
    items: [
      { id: "overview", href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { id: "staff", href: "/admin/staff", label: "Staff", icon: Stethoscope, count: "3" },
      { id: "users", href: "/admin/users", label: "Users", icon: Users, count: "18" },
      { id: "support", href: "/admin/support", label: "Support tickets", icon: CircleHelp, count: "1" },
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
      { id: "payments", href: "/admin/payments", label: "Payments", icon: CreditCard },
      { id: "pricing", href: "/admin/pricing", label: "Pricing", icon: ReceiptText },
      { id: "payouts", href: "/admin/payouts", label: "Clinician payouts", icon: WalletCards },
    ],
  },
  {
    label: "Platform",
    items: [
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

export default function AdminPage() {
  return (
    <main className="w-full max-w-none p-0">
      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-[1440px] bg-slate-50">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span>
            <span><span className="block text-lg font-bold tracking-tight text-slate-900">GetPreOp</span><span className="block text-[11px] font-medium text-slate-500">Platform operations</span></span>
          </Link>
          <nav className="mt-9 flex-1 space-y-6 overflow-y-auto text-sm">
            {navigation.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const selected = item.id === "overview";
                    return (
                      <Link key={item.id} href={item.href} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium transition ${selected ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
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

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wider text-teal-800">Admin ops</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Operations overview</h1><p className="mt-2 text-sm text-slate-500">Monitor referrals, clinical delivery, and network performance.</p></div>
            <Link href="/admin/case-assignment" className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900">Review assignment queue</Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[ ["Unassigned cases", "3", "Require clinician routing"], ["Cases in review", "2", "Active pre-op assessments"], ["Reports delivered", "12", "This month"], ["On-time delivery", "96%", "Within 48-hour target"] ].map(([label, value, note]) => (
              <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-2 text-xs text-slate-500">{note}</p></article>
            ))}
          </div>

          <div id="case-load" className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div><h2 className="text-base font-bold text-slate-900">Case load</h2><p className="mt-1 text-xs text-slate-500">Incoming and active clinical assessments across the network.</p></div><Link href="/admin/case-assignment" className="text-xs font-semibold text-teal-800 hover:text-teal-950">Open queue</Link></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Patient</th><th className="px-5 py-3">Procedure</th><th className="px-5 py-3">Facility</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Delivery</th></tr></thead><tbody className="divide-y divide-slate-100">{recentCases.map((item) => <tr key={item.patient} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-semibold text-slate-900">{item.patient}</td><td className="px-5 py-4 text-slate-600">{item.procedure}</td><td className="px-5 py-4 text-slate-600">{item.facility}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === "Unassigned" ? "bg-amber-50 text-amber-800" : item.status === "Assigned" ? "bg-blue-50 text-blue-800" : "bg-teal-50 text-teal-800"}`}>{item.status}</span></td><td className="px-5 py-4 text-slate-600">{item.due}</td></tr>)}</tbody></table></div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section id="facilities" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-base font-bold text-slate-900">Network coverage</h2><p className="mt-1 text-xs text-slate-500">Facility access and clinician capacity.</p></div><span className="text-xs font-semibold text-teal-800">2 active facilities</span></div><div id="clinicians" className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-slate-100 bg-slate-50 p-4"><p className="font-semibold text-slate-900">Meridian Surgical Center</p><p className="mt-1 text-xs text-slate-500">EHR access enabled · 4 active cases</p></div><div className="rounded-lg border border-slate-100 bg-slate-50 p-4"><p className="font-semibold text-slate-900">Lakeside Endoscopy Center</p><p className="mt-1 text-xs text-slate-500">Phone screening · 2 active cases</p></div></div><p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600"><span className="font-bold text-slate-900">3 verified anesthesiologists</span> available for assignment.</p></section>
            <section id="activity" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-slate-900">Recent activity</h2><ul className="mt-4 space-y-4">{activity.map((entry) => <li key={entry} className="border-l-2 border-teal-700 pl-3 text-sm leading-5 text-slate-600">{entry}</li>)}</ul><div id="reports" className="sr-only">Reports</div><div id="settings" className="sr-only">Settings</div></section>
          </div>
        </section>
      </div>
    </main>
  );
}
