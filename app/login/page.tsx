"use client";

import Link from "next/link";
import { Suspense, useState } from "react";

const destinationByRole: Record<string, string> = {
  PATIENT: "/patients/portal",
  SURGERY_CENTER: "/surgery-centers/dashboard",
  ANESTHESIOLOGIST: "/anesthesiologists/workspace",
  ADMIN: "/admin",
};

function LoginContent() {
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

      window.location.assign(data.redirectTo ?? destinationByRole[data.user.role] ?? "/");
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
          Access the platform as an institution, anesthesiologist, or patient.
        </p>

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
