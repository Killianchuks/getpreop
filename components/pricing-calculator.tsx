"use client";

import { useMemo, useState } from "react";

const GETPREOP_FEE = 350;
const AVOIDABLE_REDUCTION = 75;
const facilityPresets = {
  asc: { label: "Ambulatory Surgery Center (ASC)", cases: 140, cancellationRate: 4.5, procedurePrice: 3500, lostMargin: 3200 },
  hospital: { label: "Hospital / Health System", cases: 250, cancellationRate: 5.5, procedurePrice: 6500, lostMargin: 4800 },
  gi: { label: "Endoscopy / GI Center", cases: 220, cancellationRate: 6, procedurePrice: 1800, lostMargin: 1800 },
  ortho: { label: "Orthopedic Specialty Center", cases: 90, cancellationRate: 4, procedurePrice: 8500, lostMargin: 4500 },
  ophthalmology: { label: "Ophthalmology Center", cases: 180, cancellationRate: 5, procedurePrice: 2800, lostMargin: 2000 },
  custom: { label: "Custom facility profile", cases: 150, cancellationRate: 5, procedurePrice: 3500, lostMargin: 3500 },
} as const;

type FacilityKey = keyof typeof facilityPresets;

export function PricingCalculator() {
  const [facility, setFacility] = useState<FacilityKey>("asc");
  const [monthlyCases, setMonthlyCases] = useState<number>(facilityPresets.asc.cases);
  const [cancellationRate, setCancellationRate] = useState<number>(facilityPresets.asc.cancellationRate);
  const [procedurePrice, setProcedurePrice] = useState<number>(facilityPresets.asc.procedurePrice);
  const [lostMargin, setLostMargin] = useState<number>(facilityPresets.asc.lostMargin);

  function chooseFacility(value: FacilityKey) {
    const preset = facilityPresets[value];
    setFacility(value);
    setMonthlyCases(preset.cases);
    setCancellationRate(preset.cancellationRate);
    setProcedurePrice(preset.procedurePrice);
    setLostMargin(preset.lostMargin);
  }

  const calculation = useMemo(() => {
    const annualCases = monthlyCases * 12;
    const baselineCancellations = Math.round(annualCases * cancellationRate / 100);
    const preventedCancellations = Math.round(baselineCancellations * AVOIDABLE_REDUCTION / 100);
    const patientTotalPrice = procedurePrice + GETPREOP_FEE;
    const protectedRevenue = preventedCancellations * lostMargin;
    const annualProgramCost = annualCases * GETPREOP_FEE;
    return { annualCases, baselineCancellations, preventedCancellations, patientTotalPrice, protectedRevenue, annualProgramCost, netImpact: protectedRevenue - annualProgramCost };
  }, [monthlyCases, cancellationRate, procedurePrice, lostMargin]);

  return <section className="border-y border-slate-200 bg-white py-16"><div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Interactive savings model</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Choose your facility. Model your opportunity.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Start with an estimated procedure price for your facility category, or enter your own. The model adds the $350 GetPreOp case fee to show the patient-facing total.</p><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]"><div className="space-y-6 rounded-lg bg-slate-50 p-6"><label className="block text-sm font-semibold text-slate-800">1. Select your facility category<select value={facility} onChange={(event) => chooseFacility(event.target.value as FacilityKey)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-teal-700">{Object.entries(facilityPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label} - avg. surgery ${preset.procedurePrice.toLocaleString()}</option>)}</select></label><label className="block text-sm font-semibold text-slate-800">Your custom average surgery price<span className="float-right text-teal-800">${procedurePrice.toLocaleString()}</span><input type="range" min="500" max="25000" step="100" value={procedurePrice} onChange={(event) => setProcedurePrice(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label><div className="rounded-lg border border-teal-100 bg-teal-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-teal-800">Patient price breakdown</p><div className="mt-3 flex justify-between text-sm text-slate-700"><span>Average surgery price</span><span>${procedurePrice.toLocaleString()}</span></div><div className="mt-2 flex justify-between text-sm text-slate-700"><span>GetPreOp pre-op fee</span><span>+ ${GETPREOP_FEE}</span></div><div className="mt-3 flex justify-between border-t border-teal-200 pt-3 text-base font-bold text-slate-950"><span>Estimated total surgery price</span><span>${calculation.patientTotalPrice.toLocaleString()}</span></div></div><p className="text-xs text-slate-500">2. Fine-tune your facility parameters below.</p><label className="block text-sm font-semibold text-slate-800">Monthly procedural volume<span className="float-right text-teal-800">{monthlyCases} cases</span><input type="range" min="10" max="1000" step="10" value={monthlyCases} onChange={(event) => setMonthlyCases(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label><label className="block text-sm font-semibold text-slate-800">Estimated monthly day-of-surgery cancellation rate<span className="float-right text-teal-800">{cancellationRate}%</span><input type="range" min="1" max="15" step="0.5" value={cancellationRate} onChange={(event) => setCancellationRate(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label><label className="block text-sm font-semibold text-slate-800">Average lost margin per cancellation<span className="float-right text-teal-800">${lostMargin.toLocaleString()}</span><input type="range" min="1000" max="15000" step="500" value={lostMargin} onChange={(event) => setLostMargin(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label></div><div className="rounded-lg bg-slate-950 p-6 text-white"><p className="text-xs font-bold uppercase tracking-wider text-teal-300">Estimated annual impact</p><p className="mt-2 text-xs text-slate-400">Fixed model: {AVOIDABLE_REDUCTION}% avoidable cancellation reduction.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><p className="text-xs text-slate-400">Annual cases modeled</p><p className="mt-1 text-2xl font-bold">{calculation.annualCases.toLocaleString()}</p></div><div><p className="text-xs text-slate-400">Baseline cancellations</p><p className="mt-1 text-2xl font-bold">{calculation.baselineCancellations}</p></div><div><p className="text-xs text-slate-400">Cancellations prevented</p><p className="mt-1 text-2xl font-bold text-teal-300">{calculation.preventedCancellations}</p></div><div><p className="text-xs text-slate-400">Revenue protected</p><p className="mt-1 text-2xl font-bold text-teal-300">${calculation.protectedRevenue.toLocaleString()}</p></div></div><div className="mt-7 border-t border-slate-700 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-teal-300">Annual GetPreOp fee</p><p className="mt-1 text-2xl font-bold">${calculation.annualProgramCost.toLocaleString()}</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-teal-300">Estimated net impact</p><p className={`mt-1 text-4xl font-black ${calculation.netImpact >= 0 ? "text-white" : "text-slate-300"}`}>{calculation.netImpact >= 0 ? "+" : "-"}${Math.abs(calculation.netImpact).toLocaleString()}</p><p className="mt-2 text-xs leading-5 text-slate-400">Protected revenue minus the $350 fee per completed case. Planning estimate only.</p></div></div></div></div></section>;
}
