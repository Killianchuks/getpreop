import Link from "next/link";

type Feature = { title: string; description: string };
type Proof = { value: string; label: string };
type Step = { number: string; title: string; description: string };

export function MarketingPage({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  proof,
  sectionTitle,
  features,
  steps,
  closingTitle,
  closingDescription,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  proof: Proof[];
  sectionTitle: string;
  features: Feature[];
  steps: Step[];
  closingTitle: string;
  closingDescription: string;
}) {
  return (
    <main className="w-full max-w-none p-0">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">{eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryHref} className="rounded-lg bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900">{primaryLabel}</Link>
              <Link href={secondaryHref} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">{secondaryLabel}</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg bg-slate-100 shadow-sm"><img src={image} alt={imageAlt} className="h-full min-h-[320px] w-full object-cover" /></div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {proof.map((item) => <div key={item.label} className="border-l border-teal-400 pl-4"><p className="text-2xl font-bold text-white">{item.value}</p><p className="mt-1 text-sm text-slate-300">{item.label}</p></div>)}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Built for dependable delivery</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{sectionTitle}</h2></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{features.map((feature) => <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-6"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-sm font-bold text-teal-800">+</span><h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p></article>)}</div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">The GetPreOp approach</p><div className="mt-7 grid gap-5 md:grid-cols-3">{steps.map((step) => <div key={step.number} className="border-t-2 border-teal-700 pt-4"><p className="text-sm font-bold text-teal-800">{step.number}</p><h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p></div>)}</div></div></section>

      <section className="bg-teal-800 py-16 text-white"><div className="mx-auto max-w-7xl px-5 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:px-8 lg:px-10"><div className="max-w-2xl"><h2 className="text-3xl font-bold tracking-tight">{closingTitle}</h2><p className="mt-3 text-sm leading-6 text-teal-50">{closingDescription}</p></div><Link href={primaryHref} className="mt-6 inline-block shrink-0 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 sm:mt-0">{primaryLabel}</Link></div></section>
    </main>
  );
}
