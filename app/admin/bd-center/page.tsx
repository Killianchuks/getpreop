"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { CAMPAIGN_TEMPLATES, type ContactSegment } from "@/lib/campaign-templates";

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
  lastContactedAt?: string | null;
  hasSentMessage?: boolean;
  hasDeliveredMessage?: boolean;
  hasOpened?: boolean;
  emailCount?: number;
  segment?: ContactSegment;
  messagesCount?: number;
  lastMessageStatus?: string | null;
  createdAt: string;
}

const SEGMENT_LABELS: Record<ContactSegment, string> = {
  NEW: "Never emailed",
  AWAITING_REPLY: "Sent, not opened",
  OPENED_NO_ACTION: "Opened, no action",
  ENGAGED: "Qualified / client",
};

const defaultMessage = {
  subject: "Introduction to GetPreOp partnership",
  body: "Hello {{contactName}},\n\nMy name is Dr. Jessica Onwudiwe, a licensed anesthesiologist trained at the University of Chicago and the founder of GetPreOp.\n\nI help surgical centers improve pre-operative readiness and coordination, reducing same-day surgery cancellations, avoidable delays, and incomplete workups. I came across {{organizationName}} and thought this might be relevant to your team.\n\nWould you be open to a brief 10-15-minute conversation to see if there is an opportunity to support your pre-op workflow?\n\nYou can view my availability and book a 15-minute demo directly here:\nhttps://www.getpreop.com/book-demo\n\nBest,\nDr Jessica Onwudiwe, MD\nFounder, GetPreOp",
};

// Matches physician indicators in a job title (e.g. "Dr.", "MD", "DO", "Physician") as whole words.
const DOCTOR_TITLE_PATTERN = /\b(dr\.?|md|do|physician|surgeon|anesthesiologist|doctor)\b/i;

const isDoctorContact = (contact: Pick<ContactRecord, "jobTitle" | "contactName" | "salutation">) =>
  contact.salutation === "DOCTOR"
  || (contact.salutation !== "NAME" && (DOCTOR_TITLE_PATTERN.test(contact.jobTitle ?? "") || DOCTOR_TITLE_PATTERN.test(contact.contactName ?? "")));

export default function BDCenterPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [excludeSearch, setExcludeSearch] = useState("");
  const [excludeStatus, setExcludeStatus] = useState("all");
  const [excludeSentDelivered, setExcludeSentDelivered] = useState(true);
  const [excludeUnsubscribed, setExcludeUnsubscribed] = useState(true);
  const [excludeAlreadyContacted, setExcludeAlreadyContacted] = useState(true);
  const [excludeWithoutEmail, setExcludeWithoutEmail] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [emailFilter, setEmailFilter] = useState("all");
  const [phoneFilter, setPhoneFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState<ContactSegment | "all">("all");
  const [campaignId, setCampaignId] = useState("");
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
  const [retrying, setRetrying] = useState(false);
  const [clearingFailed, setClearingFailed] = useState(false);

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
      const matchesSegment = segmentFilter === "all" || contact.segment === segmentFilter;
      return matchesSearch && matchesState && matchesStatus && matchesOrganization && matchesEmail && matchesPhone && matchesRole && matchesSegment;
    });
  }, [contacts, search, stateFilter, statusFilter, organizationFilter, emailFilter, phoneFilter, roleFilter, segmentFilter]);

  function applyCampaign(id: string) {
    setCampaignId(id);
    if (!id) return;
    const campaign = CAMPAIGN_TEMPLATES.find((item) => item.id === id);
    if (!campaign) return;
    setMessageSubject(campaign.subject);
    setMessageBody(campaign.body);
    setSegmentFilter(campaign.targetSegment === "ALL" ? "all" : campaign.targetSegment);
    setSelectedIds([]);
  }

  // Compute final recipients after applying exclusion filters and manual exclusions
  const activeRecipients = useMemo(() => {
    const baseList = selectedIds.length
      ? contacts.filter((c) => selectedIds.includes(c.id))
      : filteredContacts;

    const excludeTerm = excludeSearch.trim().toLowerCase();

    return baseList.filter((contact) => {
      // 1. Manually toggled excluded ID
      if (excludedIds.includes(contact.id)) return false;

      // 2. Exclude by search term
      if (excludeTerm) {
        const matchesExcludeTerm = [
          contact.organizationName,
          contact.contactName,
          contact.email,
          contact.specialty,
          contact.city,
          contact.state,
        ].some((val) => (val ?? "").toLowerCase().includes(excludeTerm));
        if (matchesExcludeTerm) return false;
      }

      // 3. Exclude by status
      if (excludeStatus !== "all" && contact.status === excludeStatus) {
        return false;
      }

      // 4. Auto-exclude sent or delivered messages
      if (excludeSentDelivered && (contact.hasSentMessage || contact.hasDeliveredMessage || contact.lastContactedAt)) {
        return false;
      }

      // 5. Auto-exclude unsubscribed
      if (excludeUnsubscribed && contact.status === "UNSUBSCRIBED") {
        return false;
      }

      // 6. Auto-exclude already contacted / qualified / clients
      if (excludeAlreadyContacted && (contact.status === "CONTACTED" || contact.status === "QUALIFIED" || contact.status === "CLIENT")) {
        return false;
      }

      // 7. Auto-exclude missing email
      if (excludeWithoutEmail && !contact.email?.trim()) {
        return false;
      }

      return true;
    });
  }, [selectedIds, filteredContacts, contacts, excludedIds, excludeSearch, excludeStatus, excludeSentDelivered, excludeUnsubscribed, excludeAlreadyContacted, excludeWithoutEmail]);

  const excludedCount = useMemo(() => {
    const totalPotential = selectedIds.length ? selectedIds.length : filteredContacts.length;
    return Math.max(0, totalPotential - activeRecipients.length);
  }, [selectedIds.length, filteredContacts.length, activeRecipients.length]);

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

  async function retryFailedMessages() {
    setRetrying(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_failed", limit: 50 }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to retry messages.");
      setFeedback(payload.message ?? "Retried failed messages.");
      await loadContacts();
    } catch (retryErr) {
      setError(retryErr instanceof Error ? retryErr.message : "Error retrying messages.");
    } finally {
      setRetrying(false);
    }
  }

  async function clearFailedMessages() {
    if (!window.confirm("Delete all failed message records? This cleans up the queue and error logs.")) return;

    setClearingFailed(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteFailedOnly: true }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to clear failed messages.");
      setFeedback(payload.message ?? "Cleared failed messages.");
      await loadContacts();
    } catch (clearErr) {
      setError(clearErr instanceof Error ? clearErr.message : "Error clearing failed messages.");
    } finally {
      setClearingFailed(false);
    }
  }

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    const targetIds = activeRecipients.map((contact) => contact.id);

    if (!targetIds.length) {
      setError("No valid recipient contacts to send to. Please review your selection and exclusion filters.");
      return;
    }

    const confirmed = window.confirm(`Ready to dispatch message to ${targetIds.length} contact(s)${excludedCount > 0 ? ` (${excludedCount} excluded)` : ""}?`);
    if (!confirmed) return;

    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/bd-center/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactIds: targetIds,
          subject: messageSubject,
          body: messageBody,
          channel: "EMAIL",
          excludeSentOrDelivered: excludeSentDelivered,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to send messages.");
      setFeedback(payload.message ?? `${payload.sent ?? 0} messages sent successfully.`);
      await loadContacts();
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Unable to send messages.");
    }
  }

  function toggleExcluded(id: string) {
    setExcludedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function clearAllExclusions() {
    setExcludedIds([]);
    setExcludeSearch("");
    setExcludeStatus("all");
    setExcludeSentDelivered(true);
    setExcludeUnsubscribed(true);
    setExcludeAlreadyContacted(true);
    setExcludeWithoutEmail(true);
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
    <main className="w-full max-w-none px-5 py-8">
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
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Outreach segment</label>
              <select value={segmentFilter} onChange={(event) => setSegmentFilter(event.target.value as ContactSegment | "all")} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="all">All segments</option>
                {(Object.keys(SEGMENT_LABELS) as ContactSegment[]).map((segment) => (
                  <option key={segment} value={segment}>{SEGMENT_LABELS[segment]}</option>
                ))}
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bulk outreach</h2>
                <p className="text-xs text-slate-500">Paced automated delivery with anti-spam & open tracking</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={retryFailedMessages}
                  disabled={retrying}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 transition"
                >
                  {retrying ? "Retrying failed..." : "Retry failed batch (50)"}
                </button>
                <button
                  type="button"
                  onClick={clearFailedMessages}
                  disabled={clearingFailed}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition"
                >
                  {clearingFailed ? "Clearing..." : "Clear failed messages"}
                </button>
                <button type="submit" className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 shadow-sm transition">
                  Send to {activeRecipients.length} contact{activeRecipients.length === 1 ? "" : "s"}
                </button>
              </div>
            </div>

            {/* Exclusion Controls Panel */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Recipient Exclusion Rules</span>
                  {excludedCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                      {excludedCount} excluded
                    </span>
                  )}
                </div>
                {(excludedIds.length > 0 || excludeSearch || excludeStatus !== "all" || !excludeSentDelivered || !excludeUnsubscribed) && (
                  <button
                    type="button"
                    onClick={clearAllExclusions}
                    className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 underline"
                  >
                    Reset exclusion filters
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">Exclude by keyword</label>
                  <input
                    type="text"
                    value={excludeSearch}
                    onChange={(e) => setExcludeSearch(e.target.value)}
                    placeholder="e.g. clinic, hospital, doctor..."
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">Exclude by status</label>
                  <select
                    value={excludeStatus}
                    onChange={(e) => setExcludeStatus(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                  >
                    <option value="all">Do not exclude any status</option>
                    <option value="CONTACTED">Exclude Contacted</option>
                    <option value="QUALIFIED">Exclude Qualified</option>
                    <option value="CLIENT">Exclude Client</option>
                    <option value="UNSUBSCRIBED">Exclude Unsubscribed</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center space-y-1.5 pt-1 sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer bg-white p-1.5 rounded border border-slate-200">
                    <input
                      type="checkbox"
                      checked={excludeSentDelivered}
                      onChange={(e) => setExcludeSentDelivered(e.target.checked)}
                      className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                    />
                    <span><strong>Exclude contacts with Sent or Delivered messages</strong> (no duplicates)</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeUnsubscribed}
                        onChange={(e) => setExcludeUnsubscribed(e.target.checked)}
                        className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                      />
                      <span>Auto-exclude Unsubscribed</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeAlreadyContacted}
                        onChange={(e) => setExcludeAlreadyContacted(e.target.checked)}
                        className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                      />
                      <span>Exclude pipeline leads (Contacted/Client)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2 text-[11px] text-slate-600">
                <span>
                  <strong>Send Summary:</strong> {activeRecipients.length} will receive email &bull; {excludedCount} excluded from this send batch.
                </span>
                {excludedIds.length > 0 && (
                  <span className="font-semibold text-rose-700">
                    ({excludedIds.length} manually excluded from table)
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Campaign template</label>
                <select value={campaignId} onChange={(event) => applyCampaign(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option value="">Custom message</option>
                  {CAMPAIGN_TEMPLATES.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>{campaign.label}</option>
                  ))}
                </select>
                {campaignId && (
                  <p className="mt-1 text-xs text-slate-500">
                    {CAMPAIGN_TEMPLATES.find((c) => c.id === campaignId)?.description}
                  </p>
                )}
              </div>
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
                    <th className="px-4 py-3">Outreach / Delivery</th>
                    <th className="px-4 py-3">Emails sent</th>
                    <th className="px-4 py-3">Corporate phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-right">Exclude / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">Loading contacts…</td></tr> : filteredContacts.length === 0 ? <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">No contacts match the current filters.</td></tr> : filteredContacts.map((contact) => {
                    const isManuallyExcluded = excludedIds.includes(contact.id);
                    const isAutoExcluded = !activeRecipients.some((r) => r.id === contact.id);

                    return (
                      <tr
                        key={contact.id}
                        className={`hover:bg-slate-50 transition ${isManuallyExcluded || isAutoExcluded ? "bg-slate-100/70 text-slate-400 opacity-75" : ""}`}
                      >
                        <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(contact.id)} onChange={() => toggleSelected(contact.id)} /></td>
                        <td className="px-4 py-3">
                          <div className={`font-semibold ${isAutoExcluded ? "text-slate-500 line-through" : "text-slate-900"}`}>{contact.organizationName ?? "Unspecified"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-medium ${isAutoExcluded ? "text-slate-500" : "text-slate-800"}`}>{contact.contactName ?? "Unknown contact"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select value={contact.salutation ?? "auto"} onChange={(event) => void updateContactSalutation(contact.id, event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                            <option value="auto">Auto ({isDoctorContact(contact) ? "Dr." : "Name"})</option>
                            <option value="DOCTOR">Dr.</option>
                            <option value="NAME">By name</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {contact.hasDeliveredMessage ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Delivered / Opened
                            </span>
                          ) : contact.hasSentMessage ? (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              Sent
                            </span>
                          ) : contact.lastMessageStatus === "FAILED" ? (
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              Failed (Can Retry)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              Unsent
                            </span>
                          )}
                          {contact.segment && (
                            <span className="mt-1 block text-[10px] font-semibold text-slate-500">{SEGMENT_LABELS[contact.segment]}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-700">{contact.emailCount ?? 0}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{contact.corporatePhone ?? contact.phone ?? "No phone"}</td>
                        <td className="px-4 py-3">
                          <select value={contact.status} onChange={(event) => void updateContactStatus(contact.id, event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="CLIENT">Client</option>
                            <option value="UNSUBSCRIBED">Unsubscribed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{contact.email ?? "No email"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExcluded(contact.id)}
                              className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                                isManuallyExcluded
                                  ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                              title={isManuallyExcluded ? "Click to include in send batch" : "Click to exclude from send batch"}
                            >
                              {isManuallyExcluded ? "Excluded" : "Exclude"}
                            </button>
                            <Link href={`/admin/bd-center/${contact.id}`} className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
