import Link from "next/link";

interface AccessDeniedProps {
  searchParams: Promise<{
    required?: string;
    current?: string;
  }>;
}

export default async function AccessDeniedPage({ searchParams }: AccessDeniedProps) {
  const params = await searchParams;
  const required = params.required ?? "role not specified";
  const current = params.current ?? "none";

  return (
    <main>
      <section className="panel">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-3 text-sm text-[color:var(--ink-muted)]">This section is restricted to authorized platform administrators.</p>
        <p className="mt-4 text-sm">Required role(s): {required}</p>
        <p className="text-sm">Current role: {current}</p>
        <p className="mt-4 text-sm leading-6 text-[color:var(--ink-muted)]">
          Sign in with your authorized account, then return to the admin dashboard. Administrator access is intentionally not available through public signup.
        </p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900">
          Go to secure login
        </Link>
      </section>
    </main>
  );
}
