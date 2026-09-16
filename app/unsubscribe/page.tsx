import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">You have been unsubscribed</h1>
        <p className="mt-2 text-sm text-slate-600">
          {email ? (
            <>
              <strong>{email}</strong> will no longer receive non-essential outreach communications from GetPreOp.
            </>
          ) : (
            "Your email address will no longer receive outreach communications from GetPreOp."
          )}
        </p>

        <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4 text-left text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-teal-700" />
            <span>Essential Account Security Notices</span>
          </div>
          <p className="mt-1">
            Transactional emails strictly required for account verification, password resets, or direct medical care on active cases will still be delivered when requested.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
