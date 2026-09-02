"use client";

import { useState } from "react";

interface WorkflowResult {
  referralId?: string;
  patientProfileId?: string;
  surgeryCaseId?: string;
  readiness?: string;
  reportId?: string;
  error?: string;
}

export default function WorkflowPage() {
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [running, setRunning] = useState(false);

  async function runWorkflow() {
    setRunning(true);
    setResult(null);

    try {
      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "SURGERY_CENTER" }),
      });

      const referralResponse = await fetch("/api/referrals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surgeryCenterId: "asc-west-001",
          surgeryCenterName: "Westside Ambulatory Surgery Center",
          patientFullName: "Taylor Morgan",
          patientEmail: "taylor.morgan@example.com",
          procedureName: "Knee arthroscopy",
          scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          priority: "standard",
        }),
      });

      const referral = await referralResponse.json();
      if (!referralResponse.ok) throw new Error(referral.error ?? "Referral creation failed");

      const onboardResponse = await fetch("/api/patients/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralId: referral.referralId,
          fullName: "Taylor Morgan",
          email: "taylor.morgan@example.com",
          dateOfBirth: "1982-05-12T00:00:00.000Z",
          sexAtBirth: "FEMALE",
          procedureName: "Knee arthroscopy",
          plannedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          facilityName: "Westside Ambulatory Surgery Center",
        }),
      });

      const onboard = await onboardResponse.json();
      if (!onboardResponse.ok) throw new Error(onboard.error ?? "Onboarding failed");

      const riskResponse = await fetch("/api/risk/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: onboard.patientProfileId,
          surgeryCaseId: onboard.surgeryCaseId,
          age: 44,
          bmi: 31,
          hasCardiopulmonaryDisease: false,
          hasDiabetes: true,
          currentSmoker: false,
          priorAnesthesiaComplication: false,
          functionalCapacityMets: 5,
        }),
      });

      const risk = await riskResponse.json();
      if (!riskResponse.ok) throw new Error(risk.error ?? "Risk scoring failed");

      await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ANESTHESIOLOGIST" }),
      });

      const reportResponse = await fetch("/api/reports/one-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralId: referral.referralId,
          patientProfileId: onboard.patientProfileId,
          surgeryCaseId: onboard.surgeryCaseId,
          patientFullName: "Taylor Morgan",
          procedureName: "Knee arthroscopy",
          surgeryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
          age: 44,
          bmi: 31,
          hasCardiopulmonaryDisease: false,
          hasDiabetes: true,
          currentSmoker: false,
          priorAnesthesiaComplication: false,
          functionalCapacityMets: 5,
          anesthesiaQuestions: ["Can I take my diabetes medications the morning of surgery?"],
        }),
      });

      const report = await reportResponse.json();
      if (!reportResponse.ok) throw new Error(report.error ?? "Report generation failed");

      setResult({
        referralId: referral.referralId,
        patientProfileId: onboard.patientProfileId,
        surgeryCaseId: onboard.surgeryCaseId,
        readiness: risk.readinessLevel,
        reportId: report.reportId,
      });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown workflow error" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main>
      <section className="panel">
        <h1 className="text-3xl font-bold">Referral to Report Workflow</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Demo path: surgery center referral -&gt; digital intake -&gt; risk scoring -&gt; one-page anesthesia report.
        </p>

        <button
          onClick={runWorkflow}
          disabled={running}
          className="mt-5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {running ? "Running workflow..." : "Run End-to-End Workflow"}
        </button>

        {result ? (
          <div className="mt-6 rounded-xl border border-black/10 bg-white/75 p-4 text-sm">
            {result.error ? (
              <p className="text-red-700">{result.error}</p>
            ) : (
              <ul className="list-disc pl-5">
                <li>Referral ID: {result.referralId}</li>
                <li>Patient Profile ID: {result.patientProfileId}</li>
                <li>Surgery Case ID: {result.surgeryCaseId}</li>
                <li>Readiness: {result.readiness}</li>
                <li>Report ID: {result.reportId}</li>
              </ul>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
