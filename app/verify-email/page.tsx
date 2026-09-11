"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "Unable to verify your email."); setLoading(false); return; }
    if (role === "SURGERY_CENTER") router.push("/surgery-centers/dashboard");
    else if (role === "PATIENT") router.push("/patients/portal");
    else if (role === "ANESTHESIOLOGIST") router.push("/anesthesiologists/workspace");
    else router.push("/login");
  }

  return <main><section className="panel mx-auto max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Verify your email</p><h1 className="mt-3 text-3xl font-bold text-slate-950">Check your inbox</h1><p className="mt-3 text-sm leading-6 text-slate-600">We sent a six-digit verification code to <strong>{email || "your email address"}</strong>. The code expires in 15 minutes.</p><form onSubmit={verify} className="mt-7 space-y-4"><label className="block text-sm font-semibold text-slate-800">Verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.35em] outline-none focus:border-teal-700" /></label>{error ? <p className="text-sm text-rose-700">{error}</p> : null}<button disabled={loading} type="submit" className="w-full rounded-lg bg-teal-800 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-900 disabled:bg-slate-300">{loading ? "Verifying..." : "Verify email"}</button></form><p className="mt-5 text-sm text-slate-500">Wrong email? <Link href="/signup" className="font-semibold text-teal-800">Start again</Link></p></section></main>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main><section className="panel mx-auto max-w-xl"><p className="text-sm text-slate-500">Loading verification...</p></section></main>}><VerifyEmailForm /></Suspense>;
}
