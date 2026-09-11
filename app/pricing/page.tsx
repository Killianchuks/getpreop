import Link from "next/link";
import { PricingCalculator } from "@/components/pricing-calculator";

export const metadata = {
  title: "Pricing | GetPreOp",
  description: "Simple per-case pricing for surgical facilities with custom volume pricing for hospitals and high-volume systems.",
};

const standardIncluded = ["Digital patient intake", "Anesthesiology-led assessment", "State-matched clinician routing", "Standardized readiness report", "Scheduling, reminders, and secure messaging"];
const bulkIncluded = ["Custom volume and facility pricing", "Multi-site readiness management", "EHR integration planning", "Custom clinical workflows and service levels", "Dedicated implementation discussion"];

export default function PricingPage() {
  return <main className="w-full max-w-none p-0"><section className="bg-slate-950 py-20 text-white"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Institution pricing</p><h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">See what a more prepared schedule could be worth.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Start with transparent $350-per-case pricing, then use your own facility assumptions to estimate the revenue GetPreOp could help protect.</p></div></section><section className="bg-slate-50 py-16"><div className="mx-auto grid max-w-5xl gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10"><PricingCard eyebrow="Standard access" title="$350 per completed case" description="No monthly commitment. Each completed preoperative assessment includes the digital workflow, clinician review, readiness report, and care-team communication." items={standardIncluded} action={<Link href="/signup?role=SURGERY_CENTER&plan=per-case&billing=annual" className="mt-7 block rounded-lg bg-teal-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-teal-900">Register your facility</Link>} featured /><PricingCard eyebrow="High volume" title="Custom bulk pricing" description="Hospitals, health systems, and high-volume surgical networks can contact us to discuss volume, facility mix, integrations, and service levels." items={bulkIncluded} action={<a href="mailto:contact@getpreop.com?subject=Bulk pricing discussion" className="mt-7 block rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800">Discuss bulk pricing</a>} /></div></section><PricingCalculator /></main>;
}

function PricingCard({ eyebrow, title, description, items, action, featured = false }: { eyebrow: string; title: string; description: string; items: string[]; action: React.ReactNode; featured?: boolean }) {
  return <article className={`rounded-lg bg-white p-7 shadow-sm ${featured ? "border-2 border-teal-700" : "border border-slate-200"}`}><p className={`text-xs font-bold uppercase tracking-[0.16em] ${featured ? "text-teal-800" : "text-slate-500"}`}>{eyebrow}</p><h2 className="mt-4 text-2xl font-bold text-slate-950">{title}</h2><p className="mt-4 text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">What&apos;s included</p><ul className="mt-3 space-y-2 text-sm text-slate-700">{items.map((item) => <li key={item}>✓ {item}</li>)}</ul></div>{action}</article>;
}
