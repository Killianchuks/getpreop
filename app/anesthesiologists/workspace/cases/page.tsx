"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CaseRow {
  id: string;
  caseReference: string;
  clientReference: string;
  institutionName: string;
  serviceState: string;
  patientName: string;
  procedure: string;
  surgeryDate: string;
  complexity: string;
  status: string;
  assignedAt?: string;
  payout: number;
  deliveryHours?: number;
}

const statusLabels: Record<string, string> = {
  ASSIGNED: "Awaiting your response",
  ACCEPTED: "Accepted — chart access unlocked",
  INTAKE_COMPLETE: "Intake complete — report pending",
  REPORT_SUBMITTED: "Report submitted",
};

function formatDeliveryTime(hours: number | undefined): string {
  if (hours === undefined) return "—";
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d ${hours % 24}h`;
}

function formatElapsedSince(iso: string | undefined): string {
  if (!iso) return "—";
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h elapsed`;
  return `${Math.round(hours / 24)}d elapsed`;
}

export default function MyCasesPage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [doctor, setDoctor] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ASSIGNED" | "ACCEPTED" | "INTAKE_COMPLETE" | "REPORT_SUBMITTED">("ALL");

  async function loadData() {
    const res = await fetch("/api/cases?scope=mine");
    const data = await res.json();
    setCases(data.cases ?? []);
    setDoctor(data.doctor ?? "");
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function respond(caseId: string, accept: boolean) {
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: accept ? "accept" : "decline" }),
    });
    await loadData();
  }

  const completedCases = cases.filter((c) => c.status === "REPORT_SUBMITTED");
  const totalEarnings = completedCases.reduce((sum, c) => sum + c.payout, 0);
  const deliveryTimes = completedCases.map((c) => c.deliveryHours).filter((h): h is number => h !== undefined);
  const avgDeliveryHours = deliveryTimes.length > 0
    ? Math.round(deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length)
    : undefined;

  const statusOptions = [
    { key: "ALL", label: "All" },
    { key: "ASSIGNED", label: "Pending" },
    { key: "ACCEPTED", label: "In progress" },
    { key: "INTAKE_COMPLETE", label: "Intake" },
    { key: "REPORT_SUBMITTED", label: "Completed" },
  ] as const;

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" ? true : c.status === statusFilter;
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || [
      c.id,
      c.caseReference,
      c.clientReference,
      c.patientName,
      c.institutionName,
      c.serviceState,
      c.procedure,
      c.complexity,
    ].some((value) => value.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical Portal</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Case Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cases assigned to you{doctor ? ` as ${doctor}` : ""} — earnings, delivery time, and case status at a glance.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-[#f4efe8] p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total Cases</p>
          <p className="mt-3 text-[2.2rem] font-bold leading-none text-slate-900">{cases.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-[#f2f5f7] p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Total Earnings</p>
          <p className="mt-3 text-[2.2rem] font-bold leading-none text-emerald-700">${totalEarnings.toLocaleString()}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-[#edf5fb] p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Avg Delivery Time</p>
          <p className="mt-3 text-[2.2rem] font-bold leading-none text-slate-900">{formatDeliveryTime(avgDeliveryHours)}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-[#fbeae4] p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Awaiting Response</p>
          <p className="mt-3 text-[2.2rem] font-bold leading-none text-amber-700">{cases.filter((c) => c.status === "ASSIGNED").length}</p>
        </article>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading cases…</p>
      ) : cases.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No cases assigned to you yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
            {statusOptions.map((option) => {
              const count = option.key === "ALL"
                ? cases.length
                : cases.filter((c) => c.status === option.key).length;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setStatusFilter(option.key)}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    statusFilter === option.key
                      ? "bg-[#e75b2a] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                  <span className={`ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${statusFilter === option.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-b border-slate-200 p-4">
            <label className="relative block">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                <path d="M10.5 3a7.5 7.5 0 0 1 5.857 12.803l4.8 4.8 1.414-1.414-4.8-4.8A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 3.894 9.394A5.5 5.5 0 0 0 10.5 5Z" fill="currentColor"/>
              </svg>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by case reference, patient ID, or category..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[15px] text-slate-700 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-4 py-3">Case</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Procedure</th>
                  <th className="px-4 py-3">Service state</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Surgery Date</th>
                  <th className="px-4 py-3">Earnings</th>
                  <th className="px-4 py-3">Delivery Time</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{c.caseReference}</p>
                      <p className="mt-0.5 text-xs text-slate-400">Client {c.clientReference}</p>
                      {c.complexity === "COMPLEX" ? (
                        <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          COMPLEX
                        </span>
                      ) : (
                        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{c.patientName}</p>
                      <p className="text-xs text-slate-400">{c.institutionName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.procedure}</td>
                    <td className="px-4 py-3"><span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800">{c.serviceState}</span></td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        {statusLabels[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(c.surgeryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900">
                      ${c.payout}
                      {c.status !== "REPORT_SUBMITTED" ? (
                        <span className="ml-1 font-normal text-slate-400">(pending)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {c.status === "REPORT_SUBMITTED" ? formatDeliveryTime(c.deliveryHours) : formatElapsedSince(c.assignedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === "ASSIGNED" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => respond(c.id, true)}
                            className="rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-900 transition"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => respond(c.id, false)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/anesthesiologists/workspace/cases/${c.id}`}
                          className="inline-block rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-900 transition"
                        >
                          {c.status === "ACCEPTED" ? "Open chart" : c.status === "REPORT_SUBMITTED" ? "View report" : "Continue"}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
