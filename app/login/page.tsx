"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const destinationByRole: Record<string, string> = {
  PATIENT: "/patients/portal",
  SURGERY_CENTER: "/surgery-centers/dashboard",
  ANESTHESIOLOGIST: "/anesthesiologists/workspace",
  ADMIN: "/admin",
};

const demoAccounts = [
  { role: "Anesthesiologist", roleId: "ANESTHESIOLOGIST", email: "dr.liu@getpreop.test", password: "Getpreop123!" },
  { role: "Institution", roleId: "SURGERY_CENTER", email: "operations@westsideasc.test", password: "Getpreop123!" },
  { role: "Patient", roleId: "PATIENT", email: "taylor.morgan@getpreop.test", password: "Getpreop123!" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push(destinationByRole[data.user.role] ?? "/");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="panel mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
          Access the platform as an institution, anesthesiologist, patient, or admin user.
        </p>

        <div className="mt-6 rounded-lg border border-teal-100 bg-teal-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Demo access</p>
          <p className="mt-1 text-xs text-teal-900">Select an account to populate the sign-in form.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => { setEmail(account.email); setPassword(account.password); setError(null); }}
                className={`rounded-lg border p-3 text-left transition hover:border-teal-500 hover:bg-teal-50 ${selectedRole === account.roleId ? "border-teal-500 bg-teal-50" : "border-teal-100 bg-white"}`}
              >
                <span className="block text-xs font-bold text-slate-900">{account.role}</span>
                <span className="mt-1 block break-all text-[11px] text-slate-600">{account.email}</span>
                <span className="mt-1 block text-[11px] font-medium text-teal-800">Password: {account.password}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="text-sm">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-black/15 p-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="text-sm">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-black/15 p-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-[color:var(--ink-muted)]">
          New user? <Link href="/signup" className="font-semibold text-teal-700">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main><section className="panel mx-auto max-w-xl"><p className="text-sm text-slate-500">Loading sign in...</p></section></main>}><LoginContent /></Suspense>;
}
