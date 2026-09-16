"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles,
  Inbox,
  X,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

interface EmailLogItem {
  id: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  category: string;
  provider: string;
  providerMessageId: string | null;
  status: "QUEUED" | "SENDING" | "SENT" | "DELIVERED" | "OPENED" | "CLICKED" | "BOUNCED" | "SPAM_COMPLAINT" | "FAILED";
  bodyText: string | null;
  bodyHtml: string | null;
  metadata: Record<string, unknown> | null;
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  createdAt: string;
}

interface EmailStats {
  totalSent: number;
  delivered: number;
  deliveryRate: number;
  opened: number;
  openRate: number;
  clicked: number;
  bounced: number;
  bounceRate: number;
  spamComplaints: number;
  failed: number;
}

interface DnsConfig {
  fromEmail: string;
  fromName: string;
  hasMailerSend: boolean;
  hasSmtp: boolean;
  recommendedRecords: Array<{
    type: string;
    host: string;
    value: string;
    purpose: string;
    status: string;
  }>;
}

export default function EmailTrackingPage() {
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [dnsConfig, setDnsConfig] = useState<DnsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);
  const [previewTab, setPreviewTab] = useState<"preview" | "text" | "details">("preview");

  // Test Email state
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Copied DNS record state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchEmailData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || null);
        setDnsConfig(data.dnsConfig || null);
      }
    } catch (err) {
      console.error("Failed to load email tracking data:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchEmailData();
  }, [fetchEmailData]);

  async function handleSendTest(e: React.FormEvent) {
    e.preventDefault();
    if (!testEmail.trim()) return;

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_test", email: testEmail.trim() }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? "Test email dispatched successfully." : "Failed to dispatch test email."),
      });
      if (data.success) {
        fetchEmailData();
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Error sending test email",
      });
    } finally {
      setSendingTest(false);
    }
  }

  async function handleResend(logId: string) {
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", logId }),
      });
      const data = await res.json();
      alert(data.message || (data.success ? "Message resent!" : "Failed to resend."));
      fetchEmailData();
    } catch {
      alert("Error resending message.");
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStatusBadge = (status: EmailLogItem["status"]) => {
    switch (status) {
      case "DELIVERED":
      case "OPENED":
      case "CLICKED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <Send className="h-3 w-3" />
            SENT
          </span>
        );
      case "SENDING":
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            <Clock className="h-3 w-3 animate-spin" />
            {status}
          </span>
        );
      case "BOUNCED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-3 w-3" />
            BOUNCED
          </span>
        );
      case "SPAM_COMPLAINT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            <AlertTriangle className="h-3 w-3" />
            SPAM COMPLAINT
          </span>
        );
      case "FAILED":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            <AlertCircle className="h-3 w-3" />
            FAILED
          </span>
        );
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-semibold text-teal-800 hover:text-teal-950">
              Operations
            </Link>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-semibold text-slate-500">Email Deliverability & Tracking</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Email Delivery & Inbox Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor real-time delivery status, opens, bounces, and ensure emails land directly in the recipient&apos;s primary inbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEmailData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Tracked</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalSent}</p>
            <p className="mt-1 text-[11px] text-slate-500">All outbound messages</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Delivery Rate</p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.deliveryRate}%</p>
            <p className="mt-1 text-[11px] text-slate-500">{stats.delivered} delivered</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Open Rate</p>
            <p className="mt-2 text-2xl font-bold text-teal-800">{stats.openRate}%</p>
            <p className="mt-1 text-[11px] text-slate-500">{stats.opened} read receipts</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Clicks</p>
            <p className="mt-2 text-2xl font-bold text-blue-700">{stats.clicked}</p>
            <p className="mt-1 text-[11px] text-slate-500">Link interactions</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Bounces</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{stats.bounced}</p>
            <p className="mt-1 text-[11px] text-slate-500">{stats.bounceRate}% bounce rate</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Spam Complaints</p>
            <p className="mt-2 text-2xl font-bold text-rose-700">{stats.spamComplaints}</p>
            <p className="mt-1 text-[11px] text-slate-500">0.0% target</p>
          </div>
        </div>
      )}

      {/* Two Columns: Test Sender & DNS Checklist */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Deliverability Test Tool */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-700" />
            <h2 className="text-base font-bold text-slate-900">Live Inbox Placement & Spam Test</h2>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Send an authenticated test email containing full MIME multipart formatting, RFC 8058 one-click unsubscribe headers, and CAN-SPAM footers to inspect spam score and inbox placement.
          </p>

          <form onSubmit={handleSendTest} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g. test@gmail.com or mail-tester address"
              required
              className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
            <button
              type="submit"
              disabled={sendingTest}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-900 disabled:opacity-60"
            >
              {sendingTest ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Test Email
            </button>
          </form>

          {testResult && (
            <div
              className={`mt-3 rounded-lg border p-3 text-xs font-medium ${
                testResult.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {testResult.message}
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            <p><strong>Configured Sender:</strong> {dnsConfig?.fromName} &lt;{dnsConfig?.fromEmail}&gt;</p>
            <p className="mt-0.5"><strong>Active Providers:</strong> {dnsConfig?.hasMailerSend ? "MailerSend API (Primary)" : "None"} {dnsConfig?.hasSmtp ? "+ SMTP Fallback" : ""}</p>
          </div>
        </div>

        {/* DNS & Inbox Deliverability Guide */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-700" />
              <h2 className="text-base font-bold text-slate-900">DNS Records for 100% Inbox Placement</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Zero Spam Setup
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Major providers (Google, Yahoo, Microsoft) automatically flag emails as spam unless these DNS records exist on your domain:
          </p>

          <div className="mt-3 space-y-2.5">
            {dnsConfig?.recommendedRecords.map((rec, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span className="font-mono text-[11px] text-teal-900">{rec.type} &bull; Host: {rec.host}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rec.value, i)}
                    className="inline-flex items-center gap-1 text-[10px] text-teal-700 hover:text-teal-900"
                  >
                    {copiedIndex === i ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedIndex === i ? "Copied" : "Copy Value"}
                  </button>
                </div>
                <p className="mt-1 font-mono text-[11px] break-all text-slate-600 bg-white p-1 rounded border border-slate-200">
                  {rec.value}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">{rec.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by recipient, subject, or message ID..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-700 focus:outline-none"
            >
              <option value="all">All Delivery & Read Statuses</option>
              <option value="READ">Read (Opened / Clicked)</option>
              <option value="UNREAD">Unread</option>
              <option value="DELIVERED">Delivered</option>
              <option value="OPENED">Opened</option>
              <option value="CLICKED">Link Clicked</option>
              <option value="SENT">Sent</option>
              <option value="BOUNCED">Bounced</option>
              <option value="SPAM_COMPLAINT">Spam Complaint</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="VERIFICATION_CODE">Verification Codes</option>
              <option value="BD_OUTREACH">BD Outreach</option>
              <option value="PATIENT_UPLOAD">Patient Uploads</option>
              <option value="NOTIFICATION">Notifications</option>
              <option value="TEST">Deliverability Tests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sent Messages Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Provider ID</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <Inbox className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm">No email logs found matching the criteria.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{log.recipientEmail}</div>
                      {log.recipientName && <div className="text-[10px] text-slate-500">{log.recipientName}</div>}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 font-semibold text-slate-800" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {log.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                      {log.providerMessageId ? (
                        <span title={log.providerMessageId}>
                          {log.providerMessageId.slice(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-slate-400">n/a</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3 w-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-800" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Tracked Message Details</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedLog.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Info Strip */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-white px-6 py-3 text-xs sm:grid-cols-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Recipient</p>
                <p className="font-semibold text-slate-900 break-all">{selectedLog.recipientEmail}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Delivery Status</p>
                <div className="mt-0.5">{getStatusBadge(selectedLog.status)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Provider & ID</p>
                <p className="font-mono text-[11px] text-slate-700 truncate" title={selectedLog.providerMessageId ?? ""}>
                  {selectedLog.provider}: {selectedLog.providerMessageId ?? "none"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Sent At</p>
                <p className="text-slate-700">{selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString() : "Not sent"}</p>
              </div>
            </div>

            {/* Tabs for HTML preview / Text / Meta */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6">
              <button
                type="button"
                onClick={() => setPreviewTab("preview")}
                className={`border-b-2 px-4 py-2 text-xs font-semibold ${
                  previewTab === "preview" ? "border-teal-800 text-teal-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                HTML Preview
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("text")}
                className={`border-b-2 px-4 py-2 text-xs font-semibold ${
                  previewTab === "text" ? "border-teal-800 text-teal-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Plain Text Fallback
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("details")}
                className={`border-b-2 px-4 py-2 text-xs font-semibold ${
                  previewTab === "details" ? "border-teal-800 text-teal-900 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Tracking & Timeline
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewTab === "preview" && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  {selectedLog.bodyHtml ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedLog.bodyHtml }}
                    />
                  ) : (
                    <p className="text-xs text-slate-500">No HTML body recorded.</p>
                  )}
                </div>
              )}

              {previewTab === "text" && (
                <pre className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                  {selectedLog.bodyText || "No plain text body recorded."}
                </pre>
              )}

              {previewTab === "details" && (
                <div className="space-y-4 text-xs">
                  {selectedLog.errorMessage && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                      <p className="font-bold">Delivery Error / Bounce Reason:</p>
                      <p className="mt-1 font-mono text-[11px]">{selectedLog.errorMessage}</p>
                    </div>
                  )}

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-900">Delivery Event Timeline</h4>
                    <ul className="mt-3 space-y-2 text-slate-700">
                      <li className="flex items-center justify-between">
                        <span>Created in Queue:</span>
                        <span className="font-mono">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                      </li>
                      {selectedLog.sentAt && (
                        <li className="flex items-center justify-between text-blue-700 font-semibold">
                          <span>Dispatched to Provider:</span>
                          <span className="font-mono">{new Date(selectedLog.sentAt).toLocaleString()}</span>
                        </li>
                      )}
                      {selectedLog.deliveredAt && (
                        <li className="flex items-center justify-between text-emerald-700 font-semibold">
                          <span>Confirmed Delivered (Inbox):</span>
                          <span className="font-mono">{new Date(selectedLog.deliveredAt).toLocaleString()}</span>
                        </li>
                      )}
                      {selectedLog.openedAt && (
                        <li className="flex items-center justify-between text-teal-800 font-semibold">
                          <span>Recipient Opened:</span>
                          <span className="font-mono">{new Date(selectedLog.openedAt).toLocaleString()}</span>
                        </li>
                      )}
                      {selectedLog.clickedAt && (
                        <li className="flex items-center justify-between text-purple-700 font-semibold">
                          <span>Recipient Clicked Link:</span>
                          <span className="font-mono">{new Date(selectedLog.clickedAt).toLocaleString()}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {selectedLog.metadata && (
                    <div>
                      <h4 className="font-bold text-slate-900">Custom Metadata</h4>
                      <pre className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-700">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => handleResend(selectedLog.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Resend Message
              </button>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-teal-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
