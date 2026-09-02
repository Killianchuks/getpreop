"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";

interface CaseDetail {
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
  payout: number;
  deliveryHours?: number;
  intake?: {
    medicalHistory: string;
    medicationsAllergies: string;
    priorAnesthesiaComplications: string;
    labsImagingReviewed: string;
    asaClass: string;
    additionalTestingNeeded: boolean;
    additionalTestingNotes: string;
    appropriateForSetting: boolean;
  };
  report?: {
    anestheticPlan: string;
    recommendationsToSurgeon: string;
    riskLevel: string;
    clearanceNotes: string;
  };
}

interface AccessProfile {
  institutionName: string;
  accessMode: "EHR_ACCESS" | "PHONE_SCREENING";
  ehr?: { vendor: string; portalUrl: string; username: string; password: string };
  phoneContact?: { contactName: string; phoneNumber: string; bestTimeToCall: string };
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [record, setRecord] = useState<CaseDetail | null>(null);
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [intake, setIntake] = useState({
    medicalHistory: "",
    medicationsAllergies: "",
    priorAnesthesiaComplications: "",
    labsImagingReviewed: "",
    asaClass: "II",
    additionalTestingNeeded: false,
    additionalTestingNotes: "",
    appropriateForSetting: true,
  });

  const [report, setReport] = useState({
    anestheticPlan: "",
    recommendationsToSurgeon: "",
    riskLevel: "READY",
    clearanceNotes: "",
  });

  async function loadCase() {
    const res = await fetch(`/api/cases/${id}`);
    const data = await res.json();
    setRecord(data.case ?? null);
    if (data.case?.intake) setIntake(data.case.intake);
    if (data.case?.report) setReport(data.case.report);

    if (data.case?.institutionName) {
      const profileRes = await fetch(`/api/institutions/access-mode?institution=${encodeURIComponent(data.case.institutionName)}`);
      const profileData = await profileRes.json();
      setProfile(profileData.profile ?? null);
    }
  }

  useEffect(() => {
    loadCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleIntakeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "intake", intake }),
    });
    await loadCase();
    setSaving(false);
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report", report }),
    });
    await loadCase();
    setSaving(false);
  }

  if (!record) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Loading case…</p>
      </div>
    );
  }

  const chartUnlocked = record.status !== "ASSIGNED";
  const intakeSubmitted = record.status === "INTAKE_COMPLETE" || record.status === "REPORT_SUBMITTED";
  const reportSubmitted = record.status === "REPORT_SUBMITTED";
  const isEhr = profile?.accessMode === "EHR_ACCESS";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Case Assessment</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{record.patientName}</h1>
          <p className="mt-1 text-xs font-semibold text-teal-800">Case {record.caseReference} · Client {record.clientReference}</p>
          <p className="mt-1 text-sm text-slate-500">
            {record.procedure} · {record.institutionName}
            {record.complexity === "COMPLEX" ? (
              <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">COMPLEX</span>
            ) : null}
          </p>
        </div>
        <Link
          href="/anesthesiologists/workspace/cases"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← My Cases
        </Link>
      </div>

      {chartUnlocked ? (
        <Link href={`/anesthesiologists/workspace/cases/${record.id}/video`} className="inline-flex items-center rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">
          Start video assessment
        </Link>
      ) : null}

      {/* Earnings & delivery time strip */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Earnings</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            ${record.payout}{record.status !== "REPORT_SUBMITTED" ? " (pending)" : ""}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Delivery Time</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {record.status === "REPORT_SUBMITTED" && record.deliveryHours !== undefined
              ? record.deliveryHours < 24 ? `${record.deliveryHours}h` : `${Math.round(record.deliveryHours / 24)}d ${record.deliveryHours % 24}h`
              : "In progress"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Complexity</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">{record.complexity === "COMPLEX" ? "Complex" : "Standard"}</p>
        </div>
      </div>

        {/* Chart access panel */}
        {chartUnlocked ? (
          <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-5">
            {isEhr && profile?.ehr ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  {record.institutionName}&apos;s EHR access ({profile.ehr.vendor})
                </p>
                <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                  <p><span className="font-semibold">Portal:</span> <a href={profile.ehr.portalUrl} target="_blank" rel="noreferrer" className="text-teal-700 underline">{profile.ehr.portalUrl}</a></p>
                  <p><span className="font-semibold">Username:</span> {profile.ehr.username}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Password:</span> {passwordVisible ? profile.ehr.password : "••••••••••"}
                    <button type="button" onClick={() => setPasswordVisible((v) => !v)} className="text-[11px] font-semibold text-teal-700 hover:underline">
                      {passwordVisible ? "Hide" : "Reveal"}
                    </button>
                  </p>
                  <p><span className="font-semibold">Patient ID to search:</span> {record.patientId}</p>
                </div>
              </div>
            ) : profile?.phoneContact ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-900">
                  No EHR access — call the patient to screen
                </p>
                <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                  <p><span className="font-semibold">Patient phone:</span> {record.patientPhone ?? "Not provided"}</p>
                  <p><span className="font-semibold">Patient ref:</span> {record.patientId}</p>
                  <p><span className="font-semibold">Facility contact:</span> {profile.phoneContact.contactName} · {profile.phoneContact.phoneNumber}</p>
                  <p><span className="font-semibold">Best time to call:</span> {profile.phoneContact.bestTimeToCall}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No access profile configured for this institution.</p>
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
            Accept this case from &quot;My Assigned Cases&quot; to unlock chart access details.
          </p>
        )}

        {/* Intake form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">Chart review &amp; intake</h2>
          <p className="mt-1 text-xs text-slate-500">Complete after reviewing the chart or screening call.</p>

          <form onSubmit={handleIntakeSubmit} className="mt-4 grid gap-4">
            <label className="text-xs font-semibold text-slate-700">
              Medical history reviewed
              <textarea
                disabled={!chartUnlocked || intakeSubmitted}
                value={intake.medicalHistory}
                onChange={(e) => setIntake((prev) => ({ ...prev, medicalHistory: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Medications &amp; allergies
              <textarea
                disabled={!chartUnlocked || intakeSubmitted}
                value={intake.medicationsAllergies}
                onChange={(e) => setIntake((prev) => ({ ...prev, medicationsAllergies: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Prior anesthesia complications
              <textarea
                disabled={!chartUnlocked || intakeSubmitted}
                value={intake.priorAnesthesiaComplications}
                onChange={(e) => setIntake((prev) => ({ ...prev, priorAnesthesiaComplications: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Labs / imaging / cardiac testing reviewed
              <textarea
                disabled={!chartUnlocked || intakeSubmitted}
                value={intake.labsImagingReviewed}
                onChange={(e) => setIntake((prev) => ({ ...prev, labsImagingReviewed: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">
                ASA classification
                <select
                  disabled={!chartUnlocked || intakeSubmitted}
                  value={intake.asaClass}
                  onChange={(e) => setIntake((prev) => ({ ...prev, asaClass: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                >
                  {["I", "II", "III", "IV", "V"].map((c) => <option key={c} value={c}>ASA {c}</option>)}
                </select>
              </label>
              <label className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  disabled={!chartUnlocked || intakeSubmitted}
                  checked={intake.appropriateForSetting}
                  onChange={(e) => setIntake((prev) => ({ ...prev, appropriateForSetting: e.target.checked }))}
                />
                Appropriate for proposed setting
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                disabled={!chartUnlocked || intakeSubmitted}
                checked={intake.additionalTestingNeeded}
                onChange={(e) => setIntake((prev) => ({ ...prev, additionalTestingNeeded: e.target.checked }))}
              />
              Needs additional testing / specialist clearance
            </label>
            {intake.additionalTestingNeeded ? (
              <textarea
                disabled={!chartUnlocked || intakeSubmitted}
                value={intake.additionalTestingNotes}
                onChange={(e) => setIntake((prev) => ({ ...prev, additionalTestingNotes: e.target.value }))}
                placeholder="What additional testing or clearance is needed?"
                className="w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            ) : null}

            {!intakeSubmitted ? (
              <button
                type="submit"
                disabled={!chartUnlocked || saving}
                className="w-fit rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Submit intake"}
              </button>
            ) : (
              <p className="text-xs font-semibold text-emerald-700">✓ Intake submitted</p>
            )}
          </form>
        </div>

        {/* Report form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-900">Assessment report</h2>
          <p className="mt-1 text-xs text-slate-500">Final recommendation delivered back to the surgical team.</p>

          <form onSubmit={handleReportSubmit} className="mt-4 grid gap-4">
            <label className="text-xs font-semibold text-slate-700">
              Preliminary anesthetic plan
              <textarea
                disabled={!intakeSubmitted || reportSubmitted}
                value={report.anestheticPlan}
                onChange={(e) => setReport((prev) => ({ ...prev, anestheticPlan: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Recommendations to surgeon / facility
              <textarea
                disabled={!intakeSubmitted || reportSubmitted}
                value={report.recommendationsToSurgeon}
                onChange={(e) => setReport((prev) => ({ ...prev, recommendationsToSurgeon: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Risk stratification
              <select
                disabled={!intakeSubmitted || reportSubmitted}
                value={report.riskLevel}
                onChange={(e) => setReport((prev) => ({ ...prev, riskLevel: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
              >
                <option value="READY">Ready for surgery</option>
                <option value="OPTIMIZE">Needs optimization</option>
                <option value="SPECIALIST">Needs specialist evaluation</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Clearance notes for the one-page report
              <textarea
                disabled={!intakeSubmitted || reportSubmitted}
                value={report.clearanceNotes}
                onChange={(e) => setReport((prev) => ({ ...prev, clearanceNotes: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-normal disabled:bg-slate-50"
                rows={2}
              />
            </label>

            {!reportSubmitted ? (
              <button
                type="submit"
                disabled={!intakeSubmitted || saving}
                className="w-fit rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Submit report to facility"}
              </button>
            ) : (
              <p className="text-xs font-semibold text-emerald-700">✓ Report submitted — visible to {record.institutionName}</p>
            )}
          </form>
        </div>
    </div>
  );
}
