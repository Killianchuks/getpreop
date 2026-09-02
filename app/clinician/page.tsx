import { ClinicianUploadForm } from "@/components/clinician-upload-form";

const clinicians = [
  { label: "Patients in optimization", value: 48 },
  { label: "High-risk alerts", value: 11 },
  { label: "Teleconsults this week", value: 32 },
  { label: "Ready for surgery", value: 67 },
];

const queue = [
  {
    patient: "M. Santos",
    procedure: "Laparoscopic cholecystectomy",
    readiness: "OPTIMIZING",
    blocker: "Cardiology workup pending",
  },
  {
    patient: "J. Patel",
    procedure: "Total hip arthroplasty",
    readiness: "NOT_READY",
    blocker: "HbA1c above target",
  },
  {
    patient: "K. Thomas",
    procedure: "Ventral hernia repair",
    readiness: "READY",
    blocker: "No blockers",
  },
];

export default function ClinicianPage() {
  return (
    <main>
      <section className="panel">
        <h1 className="text-3xl font-bold">Clinician Dashboard</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Anesthesiology-led command center for risk review, optimization tracking, and teleconsult scheduling.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {clinicians.map((metric) => (
            <article key={metric.label} className="kpi">
              <p className="text-xs uppercase tracking-wide text-[color:var(--ink-muted)]">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white/70">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-black/10 bg-black/5">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Procedure</th>
                <th className="px-4 py-3">Readiness</th>
                <th className="px-4 py-3">Primary blocker</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((row) => (
                <tr key={row.patient} className="border-b border-black/10 last:border-0">
                  <td className="px-4 py-3">{row.patient}</td>
                  <td className="px-4 py-3">{row.procedure}</td>
                  <td className="px-4 py-3">{row.readiness}</td>
                  <td className="px-4 py-3">{row.blocker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <ClinicianUploadForm />
      </section>
    </main>
  );
}
