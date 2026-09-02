"use client";

import { useMemo, useState } from "react";
import { scorePreopRisk } from "@/lib/risk";
import Link from "next/link";

const initialForm = {
  fullName: "",
  email: "",
  procedureName: "",
  plannedDate: "",
  facilityName: "",
  age: 0,
  bmi: 0,
  hasCardiopulmonaryDisease: false,
  hasDiabetes: false,
  currentSmoker: false,
  priorAnesthesiaComplication: false,
  functionalCapacityMets: 0,
};

export default function IntakePage() {
  const [form, setForm] = useState(initialForm);

  const preview = useMemo(() => {
    if (!form.age || !form.bmi || !form.functionalCapacityMets) {
      return null;
    }

    return scorePreopRisk({
      age: form.age,
      bmi: form.bmi,
      hasCardiopulmonaryDisease: form.hasCardiopulmonaryDisease,
      hasDiabetes: form.hasDiabetes,
      currentSmoker: form.currentSmoker,
      priorAnesthesiaComplication: form.priorAnesthesiaComplication,
      functionalCapacityMets: form.functionalCapacityMets,
    });
  }, [form]);

  return (
    <main>
      <section className="panel">
        <h1 className="text-3xl font-bold">Patient Intake</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Complete this digital assessment before your anesthesiology teleconsultation.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="rounded-lg border border-black/15 p-2" placeholder="Full name" onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} />
          <input className="rounded-lg border border-black/15 p-2" placeholder="Email" type="email" onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
          <input className="rounded-lg border border-black/15 p-2" placeholder="Procedure" onChange={(e) => setForm((s) => ({ ...s, procedureName: e.target.value }))} />
          <input className="rounded-lg border border-black/15 p-2" placeholder="Facility" onChange={(e) => setForm((s) => ({ ...s, facilityName: e.target.value }))} />
          <input className="rounded-lg border border-black/15 p-2" placeholder="Age" type="number" onChange={(e) => setForm((s) => ({ ...s, age: Number(e.target.value) }))} />
          <input className="rounded-lg border border-black/15 p-2" placeholder="BMI" type="number" step="0.1" onChange={(e) => setForm((s) => ({ ...s, bmi: Number(e.target.value) }))} />
          <input className="rounded-lg border border-black/15 p-2" placeholder="Functional Capacity (METs)" type="number" step="0.5" onChange={(e) => setForm((s) => ({ ...s, functionalCapacityMets: Number(e.target.value) }))} />
          <input className="rounded-lg border border-black/15 p-2" type="date" onChange={(e) => setForm((s) => ({ ...s, plannedDate: e.target.value }))} />

          <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={(e) => setForm((s) => ({ ...s, hasCardiopulmonaryDisease: e.target.checked }))} /> Cardio/pulmonary disease</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={(e) => setForm((s) => ({ ...s, hasDiabetes: e.target.checked }))} /> Diabetes</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={(e) => setForm((s) => ({ ...s, currentSmoker: e.target.checked }))} /> Current smoker</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" onChange={(e) => setForm((s) => ({ ...s, priorAnesthesiaComplication: e.target.checked }))} /> Prior anesthesia complication</label>
        </form>

        {preview && (
          <aside className="mt-6 rounded-xl border border-black/10 bg-white/70 p-4">
            <h2 className="font-semibold">Instant triage preview</h2>
            <p className="mt-2 text-sm">ASA Class: {preview.asaClass}</p>
            <p className="text-sm">Readiness: {preview.readinessLevel.replaceAll("_", " ")}</p>
            <p className="text-sm">Modeled cancellation risk: {preview.cancellationRisk}%</p>
            <p className="text-sm">Safety risk: {preview.safetyRisk}%</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">Risk factors</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {preview.factors.map((factor) => (
                <li key={factor}>{factor.replaceAll("_", " ")}</li>
              ))}
            </ul>
            {preview.additionalWorkup.length > 0 ? (
              <>
                <p className="mt-3 text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">Additional workup only when appropriate</p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {preview.additionalWorkup.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>
        )}

        <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Ready for your anesthesia assessment?</h2>
          <p className="mt-1 text-sm text-slate-600">After completing your intake with your care team or an NP, select a visit time with your assigned physician.</p>
          <Link href="/patients/portal/assessment" className="mt-4 inline-block rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900">Continue to scheduling</Link>
        </div>
      </section>
    </main>
  );
}
