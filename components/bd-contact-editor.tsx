"use client";

import { useState } from "react";

interface BDContactEditorProps {
  contactId: string;
  initialNotes: string;
  initialTags: string[];
}

export default function BDContactEditor({ contactId, initialNotes, initialTags }: BDContactEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [tags, setTags] = useState(initialTags.join(", "));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/bd-center", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          notes,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to save contact details.");
      setFeedback("Saved");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save contact details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 rounded-lg bg-slate-50 p-4">
      <div>
        <label htmlFor="bd-notes" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
        <textarea id="bd-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700" placeholder="Add context, decision makers, and next steps..." />
      </div>
      <div>
        <label htmlFor="bd-tags" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</label>
        <input id="bd-tags" value={tags} onChange={(event) => setTags(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" placeholder="hospital, priority, southeast" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-xs ${feedback === "Saved" ? "text-emerald-700" : "text-red-700"}`}>{feedback}</p>
        <button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60">
          {saving ? "Saving..." : "Save details"}
        </button>
      </div>
    </div>
  );
}