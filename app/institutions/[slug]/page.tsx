import Link from "next/link";
import { notFound } from "next/navigation";

const institutionData = [
  {
    slug: "hospitals",
    name: "Hospitals",
    story: "Large surgical volumes and patients spread across different locations.",
    value: "Virtual pre-op assessment helps centralize readiness review, reduce hospital-day delays, and support scheduling efficiency across complex care pathways.",
    rating: "★★★★★",
  },
  {
    slug: "ambulatory-surgical-centers",
    name: "Ambulatory Surgical Centers (ASCs)",
    story: "High-volume, standardized procedures; cancellations directly affect revenue.",
    value: "ASCs benefit from fast, repeatable screening that keeps same-day throughput high and minimizes revenue loss from preventable postponements.",
    rating: "★★★★★",
  },
  {
    slug: "endoscopy-gastroenterology",
    name: "Endoscopy / GI centers",
    story: "Huge volume of colonoscopies and EGDs requiring sedation.",
    value: "Standardized pre-assessment helps match sedation risk to procedural complexity and reduces last-minute safety holds or rescheduling.",
    rating: "★★★★★",
  },
  {
    slug: "dental-surgery-centers",
    name: "Dental surgery centers",
    story: "Sedation and general anesthesia, especially pediatric and complex dental procedures.",
    value: "A structured review helps identify airway, comorbidity, and sedation readiness concerns before the patient arrives.",
    rating: "★★★★☆",
  },
  {
    slug: "ophthalmology-centers",
    name: "Ophthalmology centers",
    story: "Cataract and other procedures frequently require pre-op assessment.",
    value: "A lightweight virtual screen can standardize consent, risk review, and anesthesia communication without adding clinic friction.",
    rating: "★★★★☆",
  },
  {
    slug: "orthopedic-specialty-clinics",
    name: "Orthopedic specialty clinics",
    story: "Joint replacement, arthroscopy, and other procedures require optimization.",
    value: "Optimization pathways help identify medication, mobility, and medical clearance issues before the surgical date.",
    rating: "★★★★☆",
  },
  {
    slug: "plastic-reconstructive-surgery-clinics",
    name: "Plastic / reconstructive surgery clinics",
    story: "Elective procedures require structured anesthesia risk assessment.",
    value: "Virtual review improves patient optimization and helps clinics align anesthesia planning with their elective scheduling goals.",
    rating: "★★★★☆",
  },
  {
    slug: "interventional-radiology-departments",
    name: "Interventional radiology departments",
    story: "Many minimally invasive procedures use moderate or deep sedation.",
    value: "Most cases benefit from a protocolized screen that reduces procedural delays and enhances anesthesia readiness.",
    rating: "★★★★★",
  },
  {
    slug: "cardiology-cath-labs",
    name: "Cardiology / cath labs",
    story: "Procedures such as TAVR, EP procedures, and certain interventions require assessment.",
    value: "Virtual assessment supports higher-risk procedural planning while protecting throughput for time-sensitive cardiovascular work.",
    rating: "★★★★☆",
  },
  {
    slug: "womens-health-obgyn-centers",
    name: "Women’s health / OB-GYN centers",
    story: "Procedures such as hysteroscopy, D&C, and other interventions may require anesthesia.",
    value: "Standardized review reduces variability and ensures cases are appropriately cleared before they reach the procedural suite.",
    rating: "★★★★☆",
  },
  {
    slug: "pain-management-centers",
    name: "Pain management centers",
    story: "Interventional procedures can involve sedation and medical risk screening.",
    value: "Targeted pre-assessment helps triage patients who need medical optimization versus those who can proceed quickly.",
    rating: "★★★☆☆",
  },
  {
    slug: "fertility-ivf-centers",
    name: "Fertility / IVF centers",
    story: "Egg retrieval and related procedures commonly involve sedation or anesthesia.",
    value: "A clear pre-op workflow helps minimize rescheduling and improves patient confidence around anesthesia-related instructions.",
    rating: "★★★★☆",
  },
  {
    slug: "university-teaching-hospitals",
    name: "University teaching hospitals",
    story: "High procedural volume, complex patients, and a need to standardize anesthesia readiness.",
    value: "Teaching environments benefit from consistent, scalable assessment models that reduce variation across departments and providers.",
    rating: "★★★★★",
  },
  {
    slug: "hospital-affiliated-specialty-clinics",
    name: "Hospital-affiliated specialty clinics",
    story: "Can shift pre-op work away from physicians and anesthesia teams.",
    value: "These clinics can streamline intake and keep anesthesia and physician time focused on patients who need clinical review.",
    rating: "★★★★☆",
  },
] as const;

export function generateStaticParams() {
  return institutionData.map(({ slug }) => ({ slug }));
}

export default function InstitutionDetailPage({ params }: { params: { slug: string } }) {
  const institution = institutionData.find((item) => item.slug === params.slug);

  if (!institution) {
    notFound();
  }

  return (
    <main>
      <section className="panel max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">Institution</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">{institution.name}</h1>
        <p className="mt-4 text-lg text-[color:var(--ink-muted)]">{institution.story}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div className="rounded-2xl border border-black/10 bg-white/80 p-5">
            <h2 className="text-xl font-semibold">Why virtual pre-op assessment is valuable</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-muted)]">{institution.value}</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-slate-950 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-teal-300">Potential value</p>
            <p className="mt-4 text-3xl font-bold">{institution.rating}</p>
            <p className="mt-2 text-sm text-slate-300">Operational fit and impact profile</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/institutions" className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold">
            Back to institutions
          </Link>
          <Link href="/workflow" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
            View workflow demo
          </Link>
        </div>
      </section>
    </main>
  );
}
