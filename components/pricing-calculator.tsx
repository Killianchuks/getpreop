"use client";

import { useMemo, useState } from "react";

const facilityPresets = {
  asc: { label: "Ambulatory Surgery Center (ASC)", cases: 140, cancellationRate: 4.5, lostMargin: 3200 },
  hospital: { label: "Hospital / Health System", cases: 250, cancellationRate: 5.5, lostMargin: 4800 },
  gi: { label: "Endoscopy / GI Center", cases: 220, cancellationRate: 6, lostMargin: 1800 },
  ortho: { label: "Orthopedic Specialty Center", cases: 90, cancellationRate: 4, lostMargin: 4500 },
  ophthalmology: { label: "Ophthalmology Center", cases: 180, cancellationRate: 5, lostMargin: 2000 },
  custom: { label: "Custom facility profile", cases: 150, cancellationRate: 5, lostMargin: 3500 },
} as const;

const included = ["Digital patient intake", "Anesthesiology-led preoperative assessment", "State-matched clinician routing", "Standardized readiness report", "Secure patient and care-team messaging", "Appointment scheduling and reminders"];

type FacilityKey = keyof typeof facilityPresets;

export function PricingCalculator() {
  const [facility, setFacility] = useState<FacilityKey>("asc");
  const [monthlyCases, setMonthlyCases] = useState<number>(facilityPresets.asc.cases);
  const [cancellationRate, setCancellationRate] = useState<number>(facilityPresets.asc.cancellationRate);
  const [lostMargin, setLostMargin] = useState<number>(facilityPresets.asc.lostMargin);
  const [reductionRate, setReductionRate] = useState<number>(75);
  const [pricePerCase, setPricePerCase] = useState<number>(350);

  function chooseFacility(value: FacilityKey) {
    setFacility(value);
    const preset = facilityPresets[value];
    setMonthlyCases(preset.cases);
    setCancellationRate(preset.cancellationRate);
    setLostMargin(preset.lostMargin);
  }

  const calculation = useMemo(() => {
    const annualCases = monthlyCases * 12;
    const baselineCancellations = Math.round(annualCases * (cancellationRate / 100));
    const prevented = Math.round(baselineCancellations * (reductionRate / 100));
    const protectedRevenue = prevented * lostMargin;
    const programCost = annualCases * pricePerCase;
    return { annualCases, baselineCancellations, prevented, protectedRevenue, programCost, netSavings: protectedRevenue - programCost };
  }, [monthlyCases, cancellationRate, lostMargin, reductionRate, pricePerCase]);

  const controls: Array<[string, number, (value: number) => void, number, number, number, string]> = [["Your proposed GetPreOp price per case", pricePerCase, setPricePerCase, 100, 1000, 10, "$"], ["Monthly surgical cases", monthlyCases, setMonthlyCases, 10, 1000, 10, ""], ["Current cancellation rate", cancellationRate, setCancellationRate, 1, 15, .5, "%"], ["Average lost margin per cancellation", lostMargin, setLostMargin, 1000, 15000, 500, "$"], ["Estimated avoidable reduction", reductionRate, setReductionRate, 25, 90, 5, "%"]];
  return <><section className="border-y border-slate-200 bg-white py-16"><div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Interactive savings model</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Choose your facility. Model your opportunity.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Start with a facility profile based on the earlier planning model, then adjust every assumption - including your proposed GetPreOp case price - to see your own numbers.</p><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]"><div className="space-y-6 rounded-lg bg-slate-50 p-6"><label className="block text-sm font-semibold text-slate-800">Facility type<select value={facility} onChange={(event) => chooseFacility(event.target.value as FacilityKey)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-teal-700">{Object.entries(facilityPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>{controls.map(([label, value, setter, min, max, step, suffix]) => <label key={label} className="block text-sm font-semibold text-slate-800">{label}<span className="float-right text-teal-800">{suffix === "$" ? `$${Number(value).toLocaleString()}` : `${value}${suffix}`}</span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => setter(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label>)}</div><div className="rounded-lg bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-teal-300">Estimated annual impact</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Cases modeled</p><p className="mt-1 text-2xl font-bold">{calculation.annualCases.toLocaleString()}</p></div><div><p className="text-xs text-slate-400">Cancellations prevented</p><p className="mt-1 text-2xl font-bold">{calculation.prevented}</p></div><div><p className="text-xs text-slate-400">Revenue protected</p><p className="mt-1 text-2xl font-bold text-teal-300">${calculation.protectedRevenue.toLocaleString()}</p></div><div><p className="text-xs text-slate-400">Program cost</p><p className="mt-1 text-2xl font-bold">${calculation.programCost.toLocaleString()}</p></div></div><div className="mt-7 border-t border-slate-700 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-teal-300">Estimated net impact</p><p className={`mt-1 text-4xl font-black ${calculation.netSavings >= 0 ? "text-white" : "text-slate-300"}`}>{calculation.netSavings >= 0 ? "+" : "-"}${Math.abs(calculation.netSavings).toLocaleString()}</p><p className="mt-2 text-xs leading-5 text-slate-400">Protected revenue minus your proposed price per completed case.</p><p className="mt-4 text-xs text-slate-500">This is a planning estimate, not a guarantee.</p></div></div></div></div></section><section className="bg-[#e8f0dd] py-16"><div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Included with every case</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">The workflow, not just the assessment.</h2><ul className="mt-7 grid gap-3 sm:grid-cols-2">{included.map((item) => <li key={item} className="rounded-lg bg-white p-4 text-sm font-semibold text-slate-700"><span className="mr-2 text-teal-800">✓</span>{item}</li>)}</ul></div></section></>;
}
