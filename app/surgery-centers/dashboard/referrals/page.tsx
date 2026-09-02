"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  STAGE_ORDER,
  computeClearance,
  formatSurgeryDate,
  getReferrals,
  type RiskLevel,
} from "@/lib/institution-data";

const riskBadgeStyles: Record<string, string> = {
  SPECIALIST: "bg-red-50 text-red-700 border-red-100",
  OPTIMIZE: "bg-amber-50 text-amber-800 border-amber-100",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const riskLabels: Record<string, string> = {
  SPECIALIST: "Specialist",
  OPTIMIZE: "Optimize",
  READY: "Ready",
};

const clearanceBadgeStyles: Record<string, string> = {
  overdue: "bg-red-50 text-red-700 border-red-100",
  "on-track": "bg-slate-100 text-slate-700 border-slate-200",
  met: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const stageLabelByStage = Object.fromEntries(STAGE_ORDER.map((s) => [s.stage, s.label]));

export default function ReferralsPage() {
  const referrals = useMemo(() => getReferrals(), []);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  const filtered = referrals.filter((r) => {
    const matchesQuery =
      query.trim().length === 0 ||
      r.patient.toLowerCase().includes(query.toLowerCase()) ||
      r.mrn.toLowerCase().includes(query.toLowerCase()) ||
      r.procedure.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stageFilter === "ALL" || r.stage === stageFilter;
    const matchesRisk = riskFilter === "ALL" || r.risk === (riskFilter as RiskLevel);
    return matchesQuery && matchesStage && matchesRisk;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Surgery Center</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Referrals</h1>
          <p className="mt-1 text-sm text-slate-500">Every case sent to GetPreOp, with its current pipeline stage and clearance deadline.</p>
        </div>
        <Link
          href="/surgery-centers/dashboard/referrals/new"
          className="rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition"
        >
          New referral
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="text"
          placeholder="Search patient, MRN, or procedure"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
        >
          <option value="ALL">All statuses</option>
          {STAGE_ORDER.map((s) => (
            <option key={s.stage} value={s.stage}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none"
        >
          <option value="ALL">All risk levels</option>
          <option value="READY">Ready</option>
          <option value="OPTIMIZE">Needs optimization</option>
          <option value="SPECIALIST">Needs specialist</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <p className="px-3 py-2 text-xs font-semibold text-slate-500">{filtered.length} referrals</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-semibold">Patient</th>
                <th className="px-3 py-2 font-semibold">Procedure</th>
                <th className="px-3 py-2 font-semibold">Surgery &amp; clearance</th>
                <th className="px-3 py-2 font-semibold">Risk</th>
                <th className="px-3 py-2 font-semibold">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((referral) => {
                const clearance = computeClearance(referral);
                return (
                  <tr key={referral.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">
                        {referral.patient}
                        {referral.complex ? (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">COMPLEX</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-slate-500">
                        {referral.mrn} · {referral.age}y {referral.asaClass ? `· ASA ${referral.asaClass}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{referral.procedure}</td>
                    <td className="px-3 py-3">
                      <p className="text-slate-700">{formatSurgeryDate(referral.surgeryDate)}</p>
                      <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${clearanceBadgeStyles[clearance.status]}`}>
                        {clearance.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {referral.risk ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${riskBadgeStyles[referral.risk]}`}>
                          {riskLabels[referral.risk]}
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                          Awaiting intake
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        {stageLabelByStage[referral.stage]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                    No referrals match your filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
