import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BDContactEditor from "@/components/bd-contact-editor";

export default async function BDContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prisma.businessDevelopmentContact.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "desc" } } },
  });

  if (!contact) notFound();

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">BD center</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{contact.organizationName ?? "Contact record"}</h1>
        </div>
        <Link href="/admin/bd-center" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Back to CRM
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Contact details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact name</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.contactName ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Job title</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.jobTitle ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email greeting</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.salutation === "DOCTOR" ? "Dr." : contact.salutation === "NAME" ? "By name" : "Auto"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.email ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.phone ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Corporate phone</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.corporatePhone ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company phone</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.companyPhone ?? "Not provided"}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice address</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.practiceAddress ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">City</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.city ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">State</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.state ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ZIP</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.zipCode ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Country</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.country ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specialty</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.specialty ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization type</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.organizationType ?? "Not provided"}</p></div>
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p><p className="mt-1 text-sm font-semibold text-slate-900">{contact.status}</p></div>
          </div>

          <BDContactEditor contactId={contact.id} initialNotes={contact.notes ?? ""} initialTags={contact.tags} />
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Message history</h2>
          {contact.messages.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No outreach has been sent yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {contact.messages.map((message) => (
                <li key={message.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{message.subject}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">{message.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-700">{message.body}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
