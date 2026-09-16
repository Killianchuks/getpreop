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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Message history</h2>
            <Link href="/admin/emails" className="text-xs font-semibold text-teal-800 hover:text-teal-950">
              View all logs &rarr;
            </Link>
          </div>
          {contact.messages.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No outreach has been sent yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {contact.messages.map((message) => {
                const statusColor =
                  message.status === "DELIVERED" || message.status === "OPENED"
                    ? "bg-emerald-50 text-emerald-700"
                    : message.status === "SENT"
                    ? "bg-blue-50 text-blue-700"
                    : message.status === "BOUNCED" || message.status === "FAILED"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-slate-100 text-slate-600";

                return (
                  <li key={message.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{message.subject}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
                        {message.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>Sent: {new Date(message.createdAt).toLocaleString()}</span>
                      {message.deliveredAt && (
                        <span className="font-semibold text-emerald-700">
                          &bull; Delivered: {new Date(message.deliveredAt).toLocaleTimeString()}
                        </span>
                      )}
                      {message.openedAt && (
                        <span className="font-semibold text-teal-800">
                          &bull; Opened: {new Date(message.openedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    {message.errorMessage && (
                      <p className="mt-1.5 text-[11px] font-medium text-rose-600">Error: {message.errorMessage}</p>
                    )}
                    <p className="mt-2 text-xs leading-5 text-slate-700">{message.body}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
