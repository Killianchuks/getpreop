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
        <p className="mt-3 text-sm text-[color:var(--ink-muted)]">
          This section is role restricted for MVP access control testing.
        </p>
        <p className="mt-4 text-sm">Required role(s): {required}</p>
        <p className="text-sm">Current role: {current}</p>
        <p className="mt-4 text-sm text-[color:var(--ink-muted)]">
          Select a role on the home page and try again.
        </p>
      </section>
    </main>
  );
}
