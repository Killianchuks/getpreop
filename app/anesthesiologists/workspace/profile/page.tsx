import { CURRENT_DOCTOR, getDoctorProfile } from "@/lib/case-assignment-data";

export default function ClinicianProfilePage() {
  const profile = getDoctorProfile(CURRENT_DOCTOR);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">Clinical Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your credentials and licensure on file with GetPreOp.</p>
      </div>

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-800 text-lg font-bold text-white">
            {(profile?.name ?? CURRENT_DOCTOR).split(" ").map((p) => p[0]).slice(-2).join("")}
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">{profile?.name ?? CURRENT_DOCTOR}</p>
            <p className="text-xs text-slate-500">{profile?.specialtyFocus ?? "Anesthesiology"}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</dt>
            <dd className="mt-1 font-medium text-slate-800">{profile?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">License number</dt>
            <dd className="mt-1 font-medium text-slate-800">{profile?.licenseNumber ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Licensed region</dt>
            <dd className="mt-1 font-medium text-slate-800">{profile?.licenseRegion ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active service states</dt>
            <dd className="mt-1 font-medium text-slate-800">{profile?.licensedStates?.join(", ") || "Not enrolled"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verification status</dt>
            <dd className="mt-1">
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                Verified
              </span>
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">GetPreOp malpractice coverage</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{profile?.malpracticeCoverage === "ACTIVE" ? "Active" : "Enrollment pending"}</p>
          {profile?.malpracticePolicyId ? <p className="mt-1 text-xs text-slate-600">Policy reference: {profile.malpracticePolicyId}</p> : null}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bio</dt>
          <dd className="mt-1 text-sm text-slate-700">{profile?.bio ?? "—"}</dd>
        </div>
      </div>
    </div>
  );
}
