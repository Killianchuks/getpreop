import Link from "next/link";
import { notFound } from "next/navigation";

const sections: Record<string, { title: string; description: string; status: string; action: string }> = {
  staff: { title: "Staff", description: "Manage GetPreOp operations staff and service responsibilities.", status: "3 active operations staff", action: "Invite staff member" },
  users: { title: "Users", description: "Review platform accounts and role access across patients, facilities, and clinicians.", status: "18 active platform accounts", action: "Manage access" },
  support: { title: "Support tickets", description: "Review open support requests and operational escalations.", status: "1 ticket needs attention", action: "Review ticket" },
  referrals: { title: "Referred cases", description: "Track referred cases from facility intake through clinical delivery.", status: "6 active referrals", action: "Review referrals" },
  uploads: { title: "Uploads", description: "Review clinical record uploads and identify incomplete documentation.", status: "All current uploads processed", action: "Review uploads" },
  facilities: { title: "Institutional partners", description: "Manage facility access, EHR connections, and referral operations.", status: "2 active facilities", action: "Manage facilities" },
  payments: { title: "Payments", description: "Review facility subscription payments and invoices.", status: "No payments require attention", action: "View payments" },
  pricing: { title: "Pricing", description: "Review platform plans and per-case service rates.", status: "Current pricing is published", action: "Manage pricing" },
  payouts: { title: "Clinician payouts", description: "Review anesthesiologist professional fees for completed assessments.", status: "12 completed cases this month", action: "Review payouts" },
  verification: { title: "Verification", description: "Monitor clinician license and identity verification status.", status: "3 verified anesthesiologists", action: "Review verifications" },
  availability: { title: "Clinician availability", description: "Review clinician capacity before assigning new cases.", status: "3 clinicians available", action: "View availability" },
  reports: { title: "Reports", description: "Monitor readiness reports, turnaround time, and delivery completion.", status: "96% delivered within target", action: "View reports" },
  activity: { title: "Activity log", description: "Review recent administrative and clinical workflow events.", status: "Current system activity", action: "View activity" },
  settings: { title: "General settings", description: "Configure GetPreOp operational defaults and alerts.", status: "Platform configuration", action: "Open settings" },
  notifications: { title: "Notifications", description: "Configure alerts for referrals, delayed reports, and verification changes.", status: "Notifications are enabled", action: "Manage notifications" },
  install: { title: "Add to home screen", description: "Install GetPreOp for faster access from this device.", status: "Available on supported browsers", action: "Install app" },
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const item = sections[section];

  if (!item) notFound();

  return (
    <main>
      <section className="panel mx-auto max-w-3xl">
        <Link href="/admin" className="text-xs font-semibold text-teal-800 hover:text-teal-950">
          Back to operations overview
        </Link>
        <p className="mt-7 text-xs font-bold uppercase tracking-wider text-teal-800">Admin ops</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{item.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{item.description}</p>

        <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current status</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{item.status}</p>
        </div>

        <button type="button" className="mt-6 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900">
          {item.action}
        </button>
      </section>
    </main>
  );
}
