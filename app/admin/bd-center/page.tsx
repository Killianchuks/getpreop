"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface ContactRecord {
  id: string;
  source?: string | null;
  organizationName?: string | null;
  contactName?: string | null;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  corporatePhone?: string | null;
  companyPhone?: string | null;
  practiceAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  specialty?: string | null;
  organizationType?: string | null;
  salutation?: string | null;
  tags: string[];
  status: string;
  notes?: string | null;
  createdAt: string;
}

const defaultMessage = {
  subject: "Introduction to GetPreOp partnership",
  body: "Hello {{contactName}},\n\nWe are reaching out to connect on improving surgical readiness and pre-op coordination for {{organizationName}}.\n\nGetPreOp helps practices and facilities reduce day-of-surgery delays and improve patient readiness workflows.\n\nWould you be open to a brief conversation about how we can support your team?\n\nBest,\nGetPreOp Team",
};

// Matches physician indicators in a job title (e.g. "Dr.", "MD", "DO", "Physician") as whole words.
const DOCTOR_TITLE_PATTERN = /\b(dr\.?|md|do|physician|surgeon|anesthesiologist|doctor)\b/i;

const isDoctorContact = (contact: Pick<ContactRecord, "jobTitle" | "contactName" | "salutation">) =>
  contact.salutation === "DOCTOR"
  || (contact.salutation !== "NAME" && (DOCTOR_TITLE_PATTERN.test(contact.jobTitle ?? "") || DOCTOR_TITLE_PATTERN.test(contact.contactName ?? "")));

export default function BDCenterPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");
  const [phoneFilter, setPhoneFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [uploadName, setUploadName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [messageSubject, setMessageSubject] = useState(defaultMessage.subject);
  const [messageBody, setMessageBody] = useState(defaultMessage.body);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualContact, setManualContact] = useState({ contactName: "", organizationName: "", organizationType: "", email: "", corporatePhone: "", companyPhone: "", practiceAddress: "", notes: "" });
  const [savingManualContact, setSavingManualContact] = useState(false);

  const stateOptions = useMemo(() => {
    const states = new Set<string>();
    contacts.forEach((item) => {
      if (item.state) states.add(item.state);
    });
    return Array.from(states).sort();
  }, [contacts]);

  const sourceOptions = useMemo(() => Array.from(new Set(contacts.map((contact) => contact.source).filter((source): source is string => Boolean(source)))).sort(), [contacts]);
  const organizationOptions = useMemo(() => Array.from(new Set(contacts.map((contact) => contact.organizationName).filter((organization): organization is string => Boolean(organization)))).sort(), [contacts]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const term = search.trim().toLowerCase();
      const matchesSearch = !term || [
        contact.organizationName,
        contact.contactName,
        contact.email,
        contact.corporatePhone ?? contact.phone,
        contact.practiceAddress,
        contact.city,
        contact.state,
        contact.specialty,
      ].some((value) => (value ?? "").toLowerCase().includes(term));

      const matchesState = stateFilter === "all" || contact.state === stateFilter;
      const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
      const matchesOrganization = organizationFilter === "all" || contact.organizationName === organizationFilter;
      const hasEmail = Boolean(contact.email?.trim());
      const hasPhone = Boolean((contact.corporatePhone ?? contact.companyPhone ?? contact.phone)?.trim());
      const matchesEmail = emailFilter === "all" || (emailFilter === "present" ? hasEmail : !hasEmail);
      const matchesPhone = phoneFilter === "all" || (phoneFilter === "present" ? hasPhone : !hasPhone);
      const matchesRole = roleFilter === "all" || (roleFilter === "doctor" ? isDoctorContact(contact) : !isDoctorContact(contact));
      return matchesSearch && matchesState && matchesStatus && matchesOrganization && matchesEmail && matchesPhone && matchesRole;
    });
  }, [contacts, search, stateFilter, statusFilter, organizationFilter, emailFilter, phoneFilter, roleFilter]);

  const pipelineCounts = useMemo(() => {
    return contacts.reduce<Record<string, number>>((counts, contact) => {
      counts[contact.status] = (counts[contact.status] ?? 0) + 1;
      return counts;
    }, {});
  }, [contacts]);

  async function loadContacts() {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (stateFilter !== "all") query.set("state", stateFilter);
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (sourceFilter !== "all") query.set("source", sourceFilter);
      if (organizationFilter !== "all") query.set("organization", organizationFilter);
      if (emailFilter !== "all") query.set("email", emailFilter);
      if (phoneFilter !== "all") query.set("phone", phoneFilter);

      const response = await fetch(`/api/admin/bd-center?${query.toString()}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load contacts.");
      setContacts(payload.contacts ?? []);
      setSelectedIds((prev) => prev.filter((id) => (payload.contacts ?? []).some((contact: ContactRecord) => contact.id === id)));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load contacts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadContacts();
  }, [search, stateFilter, statusFilter, sourceFilter, organizationFilter, emailFilter, phoneFilter]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("replaceExisting", String(replaceExisting));
    formData.append("uploadName", uploadName);

    setUploading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Upload failed.");
      setFeedback(payload.message ?? `${payload.imported ?? 0} contacts imported.`);
      event.target.value = "";
      await loadContacts();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleManualContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingManualContact(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualContact),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to add contact.");
      setManualContact({ contactName: "", organizationName: "", organizationType: "", email: "", corporatePhone: "", companyPhone: "", practiceAddress: "", notes: "" });
      setFeedback(payload.message ?? "Contact added.");
      await loadContacts();
    } catch (manualError) {
      setError(manualError instanceof Error ? manualError.message : "Unable to add contact.");
    } finally {
      setSavingManualContact(false);
    }
  }

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    const targets = selectedIds.length ? selectedIds : filteredContacts.map((contact) => contact.id);

    if (!targets.length) {
      setError("Select at least one contact before sending a message.");
      return;
    }

    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactIds: targets,
          subject: messageSubject,
          body: messageBody,
          channel: "EMAIL",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to send messages.");
      setFeedback(`${payload.sent ?? 0} messages queued or sent.`);
      await loadContacts();
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Unable to send messages.");
    }
  }

  async function updateContactStatus(contactId: string, status: string) {
    setError(null);
    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to update contact.");
      await loadContacts();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to update contact status.");
    }
  }

  async function updateContactSalutation(contactId: string, salutation: string) {
    setError(null);
    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, salutation: salutation === "auto" ? null : salutation }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to update contact.");
      await loadContacts();
    } catch (salutationError) {
      setError(salutationError instanceof Error ? salutationError.message : "Unable to update contact greeting.");
    }
  }

  async function bulkApplySalutation(salutation: string) {
    if (!selectedIds.length) {
      setError("Select at least one contact to update.");
      return;
    }
    setError(null);
    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: selectedIds, salutation: salutation === "auto" ? null : salutation }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to update contacts.");
      setFeedback(`Updated greeting for ${payload.updated ?? selectedIds.length} contacts.`);
      await loadContacts();
    } catch (salutationError) {
      setError(salutationError instanceof Error ? salutationError.message : "Unable to update contact greetings.");
    }
  }

  async function deleteSelectedContacts() {
    if (!selectedIds.length) {
      setError("Select at least one contact to delete.");
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected contact${selectedIds.length === 1 ? "" : "s"}? This also removes their message history and cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: selectedIds }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to delete contacts.");
      setSelectedIds([]);
      setFeedback(`${payload.deleted ?? 0} contacts deleted.`);
      await loadContacts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete contacts.");
    } finally {
      setDeleting(false);
    }
  }

  function exportCsv() {
    const rows = [
      ["organizationName", "contactName", "organizationType", "jobTitle", "email", "corporatePhone", "companyPhone", "practiceAddress", "city", "state", "zipCode", "country", "specialty", "status", "notes"],
      ...filteredContacts.map((contact) => [
        contact.organizationName ?? "",
        contact.contactName ?? "",
        contact.organizationType ?? "",
        contact.jobTitle ?? "",
        contact.email ?? "",
        contact.corporatePhone ?? contact.phone ?? "",
        contact.companyPhone ?? "",
        contact.practiceAddress ?? "",
        contact.city ?? "",
        contact.state ?? "",
        contact.zipCode ?? "",
        contact.country ?? "",
        contact.specialty ?? "",
        contact.status ?? "",
        contact.notes ?? "",
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bd-center-contacts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Business development</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">BD center</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Upload contacts</h2>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center text-sm text-slate-600 hover:border-teal-400 hover:bg-teal-50">
            <span className="font-semibold text-slate-800">Choose CSV or Excel file</span>
            <span className="mt-1 text-xs text-slate-500">.csv, .xlsx, .xls</span>
            <input type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleUpload} />
          </label>
          <p className="mt-3 text-xs text-slate-500">{uploading ? "Importing contacts…" : "Accepts organization, contact, address, phone, and email fields."}</p>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="upload-name">Upload name</label>
            <input id="upload-name" value={uploadName} onChange={(event) => setUploadName(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="e.g. NY and IL surgical centers" />
            <p className="mt-1 text-xs text-slate-500">Used to filter this contact batch later. Defaults to the file name.</p>
          </div>
          <label className="mt-4 flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} className="mt-0.5" />
            <span><span className="font-semibold text-slate-800">Replace current list</span><br />Delete existing contacts before importing this file.</span>
          </label>

          <form onSubmit={handleManualContact} className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold text-slate-900">Add contact manually</h3>
            <div className="mt-3 space-y-3">
              <input required value={manualContact.contactName} onChange={(event) => setManualContact((current) => ({ ...current, contactName: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Contact name" />
              <input value={manualContact.organizationName} onChange={(event) => setManualContact((current) => ({ ...current, organizationName: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Organization" />
              <input value={manualContact.organizationType} onChange={(event) => setManualContact((current) => ({ ...current, organizationType: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Organization type" />
              <input type="email" value={manualContact.email} onChange={(event) => setManualContact((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Email" />
              <input value={manualContact.corporatePhone} onChange={(event) => setManualContact((current) => ({ ...current, corporatePhone: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Corporate phone" />
              <input value={manualContact.companyPhone} onChange={(event) => setManualContact((current) => ({ ...current, companyPhone: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Company phone" />
              <input value={manualContact.practiceAddress} onChange={(event) => setManualContact((current) => ({ ...current, practiceAddress: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Practice address" />
              <textarea value={manualContact.notes} onChange={(event) => setManualContact((current) => ({ ...current, notes: event.target.value }))} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Notes" />
              <button type="submit" disabled={savingManualContact} className="w-full rounded-lg bg-teal-800 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60">{savingManualContact ? "Adding..." : "Add contact"}</button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Hospital, city, contact, email..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Upload list</label>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All upload lists</option>
                {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</label>
              <select value={organizationFilter} onChange={(event) => setOrganizationFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All organizations</option>
                {organizationOptions.map((organization) => <option key={organization} value={organization}>{organization}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <select value={emailFilter} onChange={(event) => setEmailFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All contacts</option>
                <option value="present">With email</option>
                <option value="missing">Without email</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
              <select value={phoneFilter} onChange={(event) => setPhoneFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All contacts</option>
                <option value="present">With phone</option>
                <option value="missing">Without phone</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All roles</option>
                <option value="doctor">Doctors only</option>
                <option value="non-doctor">Non-doctors only</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">State</label>
              <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All states</option>
                {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CLIENT">Client</option>
              </select>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-4">
            {["NEW", "CONTACTED", "QUALIFIED", "CLIENT"].map((stage) => (
              <button key={stage} type="button" onClick={() => setStatusFilter(stage)} className={`rounded-xl border p-4 text-left shadow-sm transition ${statusFilter === stage ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"}`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{stage}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{pipelineCounts[stage] ?? 0}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">Bulk outreach</h2>
              <button type="submit" className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900">
                Send to {selectedIds.length ? selectedIds.length : filteredContacts.length} contacts
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email subject</label>
                <input value={messageSubject} onChange={(event) => setMessageSubject(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Message body</label>
              <textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} rows={8} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            </div>

            {feedback ? <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{feedback}</p> : null}
            {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          </form>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">CRM contacts</h2>
                <p className="text-xs text-slate-500">{filteredContacts.length} records</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button type="button" onClick={() => void bulkApplySalutation("DOCTOR")} disabled={!selectedIds.length} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Address as Dr.
                </button>
                <button type="button" onClick={() => void bulkApplySalutation("NAME")} disabled={!selectedIds.length} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                  Address by name
                </button>
                <button type="button" onClick={deleteSelectedContacts} disabled={!selectedIds.length || deleting} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                  {deleting ? "Deleting..." : `Delete selected${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
                </button>
                <button type="button" onClick={exportCsv} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3"><input type="checkbox" checked={filteredContacts.length > 0 && filteredContacts.every((contact) => selectedIds.includes(contact.id))} onChange={() => {
                      if (filteredContacts.every((contact) => selectedIds.includes(contact.id))) {
                        setSelectedIds((current) => current.filter((id) => !filteredContacts.some((contact) => contact.id === id)));
                        return;
                      }
                      setSelectedIds((current) => Array.from(new Set([...current, ...filteredContacts.map((contact) => contact.id)])));
                    }} /></th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Greeting</th>
                    <th className="px-4 py-3">Organization type</th>
                    <th className="px-4 py-3">Corporate phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading contacts…</td></tr> : filteredContacts.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No contacts match the current filters.</td></tr> : filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(contact.id)} onChange={() => toggleSelected(contact.id)} /></td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{contact.organizationName ?? "Unspecified"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{contact.contactName ?? "Unknown contact"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={contact.salutation ?? "auto"} onChange={(event) => void updateContactSalutation(contact.id, event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                          <option value="auto">Auto ({isDoctorContact(contact) ? "Dr." : "Name"})</option>
                          <option value="DOCTOR">Dr.</option>
                          <option value="NAME">By name</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{contact.organizationType ?? "Not classified"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{contact.corporatePhone ?? contact.phone ?? "No phone"}</td>
                      <td className="px-4 py-3">
                        <select value={contact.status} onChange={(event) => void updateContactStatus(contact.id, event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="CLIENT">Client</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{contact.email ?? "No email"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/bd-center/${contact.id}`} className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
