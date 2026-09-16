"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BDMessageList({
  messages,
}: {
  messages: Array<{
    id: string;
    subject: string;
    body: string;
    status: string;
    deliveredAt: string | Date | null;
    openedAt: string | Date | null;
    errorMessage: string | null;
    createdAt: string | Date;
  }>;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteMessage(id: string) {
    if (!window.confirm("Are you sure you want to delete this message record?")) return;

    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/bd-center/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete message");
      }
    } catch {
      alert("Error deleting message");
    } finally {
      setDeletingId(null);
    }
  }

  if (messages.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">No outreach has been sent yet.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {messages.map((message) => {
        const statusColor =
          message.status === "DELIVERED" || message.status === "OPENED" || message.status === "CLICKED"
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
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
                  {message.status}
                </span>
                <button
                  type="button"
                  disabled={deletingId === message.id}
                  onClick={() => handleDeleteMessage(message.id)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600 transition"
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
  );
}
