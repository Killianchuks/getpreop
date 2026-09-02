import Link from "next/link";

const patientBenefits = [
  {
    title: "10-Minute Digital Health Survey",
    description: "Complete your medical history, allergy, and medication questionnaire on your phone or computer from home.",
    badge: "Fast & Convenient",
  },
  {
    title: "Virtual Telehealth Visit",
    description: "Connect face-to-face with a board-certified anesthesiologist via secure video—no extra driving or waiting rooms.",
    badge: "Care From Home",
  },
  {
    title: "Personalized Medication & Fasting Plan",
    description: "Clear, step-by-step instructions on what medications to take, when to stop drinking or eating, and how to prepare.",
    badge: "Clear Guidance",
  },
  {
    title: "Direct Secure Messaging",
    description: "Have a question before surgery? Message your care team directly for prompt, reassuring answers.",
    badge: "Direct Support",
  },
  {
    title: "Prevent Same-Day Cancellations",
    description: "Early medical risk screening ensures your surgery goes as scheduled without unexpected last-minute holds.",
    badge: "Peace of Mind",
  },
  {
    title: "Encrypted Document Uploads",
    description: "Easily upload lab results, EKG reports, or specialist letters directly into your encrypted health record.",
    badge: "Private & Secure",
  },
];

const patientJourney = [
  {
    step: "1",
    title: "Digital Intake",
    desc: "Fill out your medical survey online in under 10 minutes.",
  },
  {
    step: "2",
    title: "Virtual Consultation",
    desc: "Speak with a licensed anesthesiologist from home.",
  },
  {
    step: "3",
    title: "Tailored Pre-Op Plan",
    desc: "Get simple instructions for fasting, medications, and surgery day.",
  },
  {
    step: "4",
    title: "Confident Surgery Day",
    desc: "Arrive at the facility fully prepared and medically cleared.",
  },
];

export default function PatientsLandingPage() {
  return (
    <main className="space-y-10">
      {/* Clean Mature Patient Hero Container */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Patient Care &amp; Readiness
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight">
              Peace of Mind &amp; Personal Care Before Surgery Day.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Complete your pre-operative assessment online, consult directly with a licensed anesthesiologist from home,
              and receive personalized guidance so your procedure goes smoothly.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/intake"
                className="rounded-lg bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
              >
                Start Digital Intake
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Patient Sign In
              </Link>
              <Link
                href="/patients/portal"
                className="rounded-lg border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                My Patient Portal
              </Link>
            </div>
          </div>

          {/* Clean Patient Callout Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400">Our Patient Promise</p>
            <div className="mt-4 space-y-5">
              <div>
                <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">&lt; 10 Mins</p>
                <p className="mt-1 text-xs text-slate-300">Fast, easy digital health survey on your phone or tablet</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xl font-bold text-amber-300">Care From Home</p>
                <p className="mt-1 text-xs text-slate-300">Consult face-to-face with a board-certified anesthesiologist</p>
              </div>
              <div className="border-t border-slate-800 pt-4">
                <p className="text-xl font-bold text-emerald-300">Clear Instructions</p>
                <p className="mt-1 text-xs text-slate-300">Personalized fasting &amp; medication guidance before arrival</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Benefits Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">How GetPreOp Helps You Prepare</h2>
          <p className="mt-1 text-xs text-slate-500">
            Everything you need for a safe, stress-free surgical experience.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patientBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
            >
              <span className="inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                {benefit.badge}
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Patient Journey Steps */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Your 4-Step Journey to Surgery Day</h2>
        <p className="mt-1 text-xs text-slate-500">
          Simple, guided steps designed to make preoperative preparation effortless.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {patientJourney.map((j) => (
            <div key={j.step} className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-800 text-xs font-bold text-white">
                {j.step}
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{j.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{j.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white md:p-10 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Have an Upcoming Surgery Scheduled?</h2>
          <p className="mt-2 text-xs text-slate-300 max-w-xl">
            Start your digital health intake now or log in to access your pre-op instructions and consult portal.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-0">
          <Link
            href="/intake"
            className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 transition shadow-sm"
          >
            Start Digital Intake
          </Link>
          <Link
            href="/patients/portal"
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
          >
            Go to Patient Portal
          </Link>
        </div>
      </section>
    </main>
  );
}
