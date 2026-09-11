"use client";

import { useMemo, useState } from "react";

const GETPREOP_FEE = 350;
const AVOIDABLE_REDUCTION = 100;

const facilityPresets = {
  asc: { label: "Ambulatory Surgery Center (ASC)", cases: 140, cancellationRate: 30, surgeryPrice: 3500 },
  hospital: { label: "Hospital / Health System", cases: 250, cancellationRate: 30, surgeryPrice: 6500 },
  gi: { label: "Endoscopy / GI Center", cases: 220, cancellationRate: 30, surgeryPrice: 1800 },
  ortho: { label: "Orthopedic Specialty Center", cases: 90, cancellationRate: 30, surgeryPrice: 8500 },
  ophthalmology: { label: "Ophthalmology Center", cases: 180, cancellationRate: 30, surgeryPrice: 2800 },
  custom: { label: "Custom facility profile", cases: 150, cancellationRate: 30, surgeryPrice: 3500 },
} as const;

type FacilityKey = keyof typeof facilityPresets;

export function PricingCalculator() {
  const [facility, setFacility] = useState<FacilityKey>("asc");
  const [monthlyCases, setMonthlyCases] = useState<number>(facilityPresets.asc.cases);
  const [cancellationRate, setCancellationRate] = useState<number>(facilityPresets.asc.cancellationRate);
  const [surgeryPrice, setSurgeryPrice] = useState<number>(facilityPresets.asc.surgeryPrice);

  function chooseFacility(value: FacilityKey) {
    const preset = facilityPresets[value];
    setFacility(value);
    setMonthlyCases(preset.cases);
    setCancellationRate(preset.cancellationRate);
    setSurgeryPrice(preset.surgeryPrice);
  }

  const calculation = useMemo(() => {
    const baselineMonthlyCancellations = Math.round(monthlyCases * cancellationRate / 100);
    const preventedMonthlyCancellations = Math.round(baselineMonthlyCancellations * AVOIDABLE_REDUCTION / 100);
    const monthlyRevenueProtected = preventedMonthlyCancellations * surgeryPrice;
    const annualRevenueProtected = monthlyRevenueProtected * 12;
    return {
      patientTotalPrice: surgeryPrice + GETPREOP_FEE,
      baselineMonthlyCancellations,
      preventedMonthlyCancellations,
      monthlyRevenueProtected,
      annualRevenueProtected,
    };
  }, [monthlyCases, cancellationRate, surgeryPrice]);

  return (
    <section className="border-y border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Interactive savings model</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Choose your facility. Model your opportunity.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          The $350 GetPreOp fee is embedded in the patient&apos;s total surgery price. The clinic&apos;s savings come from procedures that are no longer cancelled on the day of surgery.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6 rounded-lg bg-slate-50 p-6">
            <label className="block text-sm font-semibold text-slate-800">
              1. Select your facility category
              <select value={facility} onChange={(event) => chooseFacility(event.target.value as FacilityKey)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none focus:border-teal-700">
                {Object.entries(facilityPresets).map(([key, preset]) => <option key={key} value={key}>{preset.label} - avg. surgery ${preset.surgeryPrice.toLocaleString()}</option>)}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-800">
              Average surgery price or custom price
              <span className="float-right text-teal-800">${surgeryPrice.toLocaleString()}</span>
              <input type="range" min="500" max="25000" step="100" value={surgeryPrice} onChange={(event) => setSurgeryPrice(Number(event.target.value))} className="mt-3 w-full accent-teal-700" />
            </label>

            <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Patient price breakdown</p>
              <div className="mt-3 flex justify-between text-sm text-slate-700"><span>Surgery price</span><span>${surgeryPrice.toLocaleString()}</span></div>
              <div className="mt-2 flex justify-between text-sm text-slate-700"><span>GetPreOp pre-op fee</span><span>+ ${GETPREOP_FEE}</span></div>
              <div className="mt-3 flex justify-between border-t border-teal-200 pt-3 text-base font-bold text-slate-950"><span>Total patient surgery price</span><span>${calculation.patientTotalPrice.toLocaleString()}</span></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">2. Fine-tune facility parameters</p>
            <label className="block text-sm font-semibold text-slate-800">Monthly procedural volume <span className="float-right text-teal-800">{monthlyCases} cases</span><input type="range" min="10" max="1000" step="10" value={monthlyCases} onChange={(event) => setMonthlyCases(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label>
            <label className="block text-sm font-semibold text-slate-800">Estimated monthly day-of-surgery cancellation rate <span className="float-right text-teal-800">{cancellationRate}%</span><input type="range" min="1" max="60" step="1" value={cancellationRate} onChange={(event) => setCancellationRate(Number(event.target.value))} className="mt-3 w-full accent-teal-700" /></label>
          </div>

          <div className="rounded-lg bg-slate-950 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-300">Estimated clinic impact</p>
            <p className="mt-2 text-xs text-slate-400">Illustrative model: baseline day-of-surgery cancellations avoided.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div><p className="text-xs text-slate-400">Baseline cancellations / month</p><p className="mt-1 text-2xl font-bold">{calculation.baselineMonthlyCancellations}</p></div>
              <div><p className="text-xs text-slate-400">Cancellations prevented / month</p><p className="mt-1 text-2xl font-bold text-teal-300">{calculation.preventedMonthlyCancellations}</p></div>
              <div><p className="text-xs text-slate-400">Revenue protected / month</p><p className="mt-1 text-2xl font-bold text-teal-300">${calculation.monthlyRevenueProtected.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-400">Revenue protected / year</p><p className="mt-1 text-2xl font-bold text-white">${calculation.annualRevenueProtected.toLocaleString()}</p></div>
            </div>
            <div className="mt-7 border-t border-slate-700 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-teal-300">How the math works</p><p className="mt-2 text-sm leading-6 text-slate-300">{calculation.preventedMonthlyCancellations} prevented cancellations × ${surgeryPrice.toLocaleString()} surgery price = ${calculation.monthlyRevenueProtected.toLocaleString()} protected each month.</p><p className="mt-3 text-xs leading-5 text-slate-500">The $350 GetPreOp fee is included in the patient total and is not subtracted from the clinic&apos;s protected revenue estimate.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
