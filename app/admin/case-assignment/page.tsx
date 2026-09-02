"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DOCTOR_ROSTER } from "@/lib/case-assignment-data";

interface CaseRow {
  id: string;
  caseReference: string;
  clientReference: string;
  institutionName: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  procedure: string;
  surgeryDate: string;
  complexity: string;
  status: string;
  assignedTo?: string;
}

interface AccessProfile {
  institutionName: string;
  accessMode: "EHR_ACCESS" | "PHONE_SCREENING";
  ehr?: { vendor: string; portalUrl: string; username: string; password: string };
  phoneContact?: { contactName: string; phoneNumber: string; bestTimeToCall: string };
}

export default function CaseAssignmentPage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [profiles, setProfiles] = useState<AccessProfile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Record<string, string>>({});
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [casesRes, profilesRes] = await Promise.all([
      fetch("/api/cases?scope=unassigned"),
      fetch("/api/institutions/access-mode"),
    ]);
    const casesData = await casesRes.json();
    const profilesData = await profilesRes.json();
    setCases(casesData.cases ?? []);
    setProfiles(profilesData.profiles ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function profileFor(institutionName: string) {
    return profiles.find((p) => p.institutionName === institutionName);
  }

  async function handleAssign(caseId: string) {
    const doctorName = selectedDoctor[caseId] ?? DOCTOR_ROSTER[0];
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", doctorName }),
    });
    await loadData();
  }

  return (
    <main>
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Admin Ops</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Case Assignment Queue</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review each incoming case, gather chart detail, then route it to the right anesthesiologist.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Admin Metrics
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading cases…</p>
        ) : cases.length === 0 ? (
          <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No unassigned cases right now.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {cases.map((c) => {
              const profile = profileFor(c.institutionName);
              const isEhr = profile?.accessMode === "EHR_ACCESS";
              const passwordVisible = revealedPasswords[c.id];

              return (
                <article key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {c.patientName}
                        {c.complexity === "COMPLEX" ? (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">COMPLEX</span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-teal-800">Case {c.caseReference} · Client {c.clientReference}</p>
                      <p className="text-xs text-slate-500">
                        {c.procedure} · {c.institutionName}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Surgery: {new Date(c.surgeryDate).toLocaleDateString()}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        isEhr
                          ? "border-teal-100 bg-teal-50 text-teal-800"
                          : "border-amber-100 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {isEhr ? "EHR access facility" : "Phone screening facility"}
                    </span>
                  </div>

                  {/* Chart access panel */}
                  <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                    {isEhr && profile?.ehr ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Open {c.institutionName}&apos;s EHR ({profile.ehr.vendor}) to gather chart detail
                        </p>
                        <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                          <p><span className="font-semibold">Portal:</span> <a href={profile.ehr.portalUrl} target="_blank" rel="noreferrer" className="text-teal-700 underline">{profile.ehr.portalUrl}</a></p>
                          <p><span className="font-semibold">Username:</span> {profile.ehr.username}</p>
                          <p className="flex items-center gap-2">
                            <span className="font-semibold">Password:</span>{" "}
                            {passwordVisible ? profile.ehr.password : "••••••••••"}
                            <button
                              type="button"
                              onClick={() => setRevealedPasswords((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                              className="text-[11px] font-semibold text-teal-700 hover:underline"
                            >
                              {passwordVisible ? "Hide" : "Reveal"}
                            </button>
                          </p>
                          <p><span className="font-semibold">Patient ID:</span> {c.patientId}</p>
                        </div>
                      </div>
                    ) : profile?.phoneContact ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          {c.institutionName} does not share EHR access — call the patient to screen
                        </p>
                        <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                          <p><span className="font-semibold">Patient phone:</span> {c.patientPhone ?? "Not provided"}</p>
                          <p><span className="font-semibold">Patient ref:</span> {c.patientId}</p>
                          <p><span className="font-semibold">Facility contact:</span> {profile.phoneContact.contactName} · {profile.phoneContact.phoneNumber}</p>
                          <p><span className="font-semibold">Best time to call:</span> {profile.phoneContact.bestTimeToCall}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No access profile configured for this institution yet.</p>
                    )}
                  </div>

                  {/* Assignment control */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <select
                      value={selectedDoctor[c.id] ?? DOCTOR_ROSTER[0]}
                      onChange={(e) => setSelectedDoctor((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:border-teal-700 focus:outline-none"
                    >
                      {DOCTOR_ROSTER.map((doc) => (
                        <option key={doc} value={doc}>{doc}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAssign(c.id)}
                      className="rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition"
                    >
                      Assign case
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
