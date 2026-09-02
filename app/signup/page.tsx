"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const roles = [
  { id: "PATIENT", label: "Patient" },
  { id: "SURGERY_CENTER", label: "Institution / Health System" },
  { id: "ANESTHESIOLOGIST", label: "Anesthesiologist" },
  { id: "ADMIN", label: "Admin" },
] as const;

const availableInstitutionOptions = [
  "Hospitals",
  "Ambulatory Surgical Centers (ASCs)",
  "Endoscopy / GI Centers",
  "Dental Surgery Centers",
  "Ophthalmology Centers",
  "Orthopedic Specialty Clinics",
  "Plastic & Reconstructive Surgery Clinics",
  "Interventional Radiology Departments",
  "Cardiology / Cath Labs",
  "Women’s Health / OB-GYN Centers",
  "Pain Management Centers",
  "Fertility / IVF Centers",
  "University Teaching Hospitals",
  "Hospital-Affiliated Specialty Clinics",
];

const destinationByRole: Record<string, string> = {
  PATIENT: "/patients/portal",
  SURGERY_CENTER: "/surgery-centers/dashboard",
  ANESTHESIOLOGIST: "/anesthesiologists/workspace",
  ADMIN: "/admin",
};

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role");
  const initialPlanParam = searchParams.get("plan") || "asc-growth";
  const initialBillingParam = searchParams.get("billing") || "annual";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(
    initialRoleParam && ["PATIENT", "SURGERY_CENTER", "ANESTHESIOLOGIST", "ADMIN"].includes(initialRoleParam)
      ? initialRoleParam
      : "SURGERY_CENTER"
  );
  
  // Plan selection state
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlanParam);
  const [billingCycle, setBillingCycle] = useState<string>(initialBillingParam);

  // Institution-specific options
  const [isHospitalNetwork, setIsHospitalNetwork] = useState(false);
  const [selectedInstitutionTypes, setSelectedInstitutionTypes] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleInstitutionType(type: string) {
    setSelectedInstitutionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function toggleSelectAllInstitutions() {
    if (selectedInstitutionTypes.length === availableInstitutionOptions.length) {
      setSelectedInstitutionTypes([]);
    } else {
      setSelectedInstitutionTypes([...availableInstitutionOptions]);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (role === "SURGERY_CENTER" && selectedInstitutionTypes.length === 0 && !isHospitalNetwork) {
      setError("Please select at least one institution type or classify as a Hospital Network.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          plan: selectedPlan,
          billingCycle,
          institutionTypes: role === "SURGERY_CENTER" ? selectedInstitutionTypes : [],
          isHospitalNetwork: role === "SURGERY_CENTER" ? isHospitalNetwork : false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Sign up failed");
        return;
      }

      // If user is registering an institution or patient, redirect to Payment Gateway Checkout
      if (role === "SURGERY_CENTER" || role === "PATIENT") {
        router.push(`/checkout?plan=${encodeURIComponent(selectedPlan)}&billing=${encodeURIComponent(billingCycle)}&email=${encodeURIComponent(email)}`);
      } else {
        router.push(destinationByRole[data.user.role] ?? "/");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
      <label className="text-sm font-medium text-slate-800">
        Account Role
        <select
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white p-2.5 text-sm shadow-sm font-medium focus:border-teal-700 focus:outline-none"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      {/* Institution Specific Classification & Subscription Plan Selection */}
      {role === "SURGERY_CENTER" ? (
        <>
          {/* Plan Selection Block */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400">
                Select Platform Subscription Plan
              </h2>
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    billingCycle === "monthly" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-300"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    billingCycle === "annual" ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-300"
                  }`}
                >
                  Annual (Lower Platform Fee)
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label
                className={`rounded-xl border p-3.5 cursor-pointer transition flex flex-col justify-between ${
                  selectedPlan === "per-case"
                    ? "border-teal-400 bg-teal-950/70 shadow-sm"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === "per-case"}
                      onChange={() => setSelectedPlan("per-case")}
                      className="text-teal-500 focus:ring-teal-400"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">On-Demand</span>
                  </div>
                  <p className="font-bold text-sm text-white mt-2">Pay-As-You-Go</p>
                  <p className="text-[11px] text-slate-300 mt-1 font-semibold">
                    {billingCycle === "annual" ? "$310 / case" : "$339 / case"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">$250 MD fee + platform fee • $0 monthly commitment</p>
                </div>
              </label>

              <label
                className={`rounded-xl border p-3.5 cursor-pointer transition flex flex-col justify-between ${
                  selectedPlan === "asc-growth"
                    ? "border-teal-400 bg-teal-950/70 shadow-sm"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === "asc-growth"}
                      onChange={() => setSelectedPlan("asc-growth")}
                      className="text-teal-500 focus:ring-teal-400"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Most Popular</span>
                  </div>
                  <p className="font-bold text-sm text-white mt-2">Standard ASC</p>
                  <p className="text-[11px] text-teal-300 mt-1 font-bold">
                    {billingCycle === "annual" ? "$39,750 / mo" : "$42,750 / mo"}
                  </p>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Includes 150 cases/mo ({billingCycle === "annual" ? "$265" : "$285"}/case, incl. $250 MD fee)
                  </p>
                </div>
              </label>

              <label
                className={`rounded-xl border p-3.5 cursor-pointer transition flex flex-col justify-between ${
                  selectedPlan === "enterprise"
                    ? "border-teal-400 bg-teal-950/70 shadow-sm"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlan === "enterprise"}
                      onChange={() => setSelectedPlan("enterprise")}
                      className="text-teal-500 focus:ring-teal-400"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Multi-Site</span>
                  </div>
                  <p className="font-bold text-sm text-white mt-2">Enterprise</p>
                  <p className="text-[11px] text-slate-300 mt-1 font-semibold">Custom Volume Contract</p>
                  <p className="text-[10px] text-slate-400 mt-1">$250 MD fee + platform fee from ~$10/case at scale</p>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-teal-800/20 bg-teal-50/50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-teal-950 uppercase tracking-wider">
                Institution Classification
              </h2>
              <button
                type="button"
                onClick={toggleSelectAllInstitutions}
                className="text-xs font-semibold text-teal-800 hover:underline"
              >
                {selectedInstitutionTypes.length === availableInstitutionOptions.length
                  ? "Deselect All"
                  : "Select All Sub-Specialties"}
              </button>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-teal-700/20 bg-white p-3 shadow-sm cursor-pointer hover:bg-teal-50/30 transition">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
                checked={isHospitalNetwork}
                onChange={(e) => setIsHospitalNetwork(e.target.checked)}
              />
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  Hospital Network / Health System
                </span>
                <span className="text-xs text-[color:var(--ink-muted)] leading-tight block mt-0.5">
                  Check this if managing a multi-facility network with diverse sub-specialized clinical departments.
                </span>
              </div>
            </label>

            <p className="text-xs font-semibold text-slate-700 pt-1">
              Select Sub-Specialized Facilities or Departments (Choose Multiple):
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {availableInstitutionOptions.map((option) => {
                const isChecked = selectedInstitutionTypes.includes(option);
                return (
                  <label
                    key={option}
                    className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium cursor-pointer transition ${
                      isChecked
                        ? "border-teal-700 bg-teal-100/70 text-teal-950 font-semibold"
                        : "border-black/10 bg-white text-slate-700 hover:border-teal-600/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-teal-700 focus:ring-teal-500"
                      checked={isChecked}
                      onChange={() => toggleInstitutionType(option)}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <label className="text-sm font-medium text-slate-800">
        Full Name or Facility Contact Name
        <input
          type="text"
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white p-2.5 text-sm shadow-sm focus:border-teal-700 focus:outline-none"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder={role === "SURGERY_CENTER" ? "e.g., St. Jude Surgical Network" : "e.g., Dr. Jane Doe"}
          required
        />
      </label>

      <label className="text-sm font-medium text-slate-800">
        Work Email Address
        <input
          type="email"
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white p-2.5 text-sm shadow-sm focus:border-teal-700 focus:outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@facility.org"
          required
        />
      </label>

      <label className="text-sm font-medium text-slate-800">
        Password
        <input
          type="password"
          minLength={8}
          className="mt-1.5 w-full rounded-xl border border-black/15 bg-white p-2.5 text-sm shadow-sm focus:border-teal-700 focus:outline-none"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 characters"
          required
        />
      </label>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-teal-800 py-3 text-sm font-semibold text-white shadow-md hover:bg-teal-900 transition disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <main>
      <section className="panel mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Join GetPreOp to streamline preoperative optimization for patients, anesthesiologists, and health institutions.
        </p>

        <Suspense fallback={<div className="mt-6 text-sm text-[color:var(--ink-muted)]">Loading signup options...</div>}>
          <SignUpForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-[color:var(--ink-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-teal-800 hover:underline">
            Sign In
          </Link>
        </p>
      </section>
    </main>
  );
}
