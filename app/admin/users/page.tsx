"use client";

import { Edit3, Eye, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

type UserRole = "All" | "Admin" | "Patient" | "Anesthesiologist" | "Surgery center";
type ManagedUser = { id: string; name: string; email: string; role: Exclude<UserRole, "All">; region: string; joined: string; verified: boolean; active: boolean };

const fallbackUsers: ManagedUser[] = [
  { id: "demo-amara", name: "Dr. Amara Chen", email: "amara.chen@getpreop.test", role: "Anesthesiologist", region: "California", joined: "Aug 11, 2026", verified: true, active: true },
  { id: "demo-jordan", name: "Jordan Williams", email: "jordan.williams@meridiansurgical.org", role: "Surgery center", region: "California", joined: "Aug 10, 2026", verified: true, active: true },
  { id: "demo-priya", name: "Priya Raghunathan", email: "priya.raghunathan@example.com", role: "Patient", region: "New York", joined: "Aug 3, 2026", verified: true, active: true },
  { id: "demo-owen", name: "Dr. Owen Bright", email: "owen.bright@getpreop.test", role: "Anesthesiologist", region: "Texas", joined: "Jul 28, 2026", verified: false, active: false },
  { id: "demo-meridian", name: "Meridian Surgical Center", email: "operations@meridiansurgical.org", role: "Surgery center", region: "California", joined: "Jul 14, 2026", verified: true, active: true },
  { id: "demo-admin", name: "Platform Administrator", email: "admin@getpreop.test", role: "Admin", region: "Ontario", joined: "Jun 30, 2026", verified: true, active: true },
];

const roles: UserRole[] = ["All", "Admin", "Patient", "Anesthesiologist", "Surgery center"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(fallbackUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<UserRole>("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All status");
  const [activeUsers, setActiveUsers] = useState(() => new Set(fallbackUsers.filter((user) => user.active).map((user) => user.email)));

  useEffect(() => {
    fetch("/api/admin/users")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load users")))
      .then((data) => {
        const nextUsers = data.users ?? [];
        setUsers(nextUsers);
        setActiveUsers(new Set(nextUsers.filter((user: { active: boolean }) => user.active).map((user: { email: string }) => user.email)));
      })
      .catch(() => setError("Unable to load registered users."))
      .finally(() => setLoading(false));
  }, []);

  const openUser = (user: ManagedUser, shouldEdit = false) => {
    setSelectedUser(user);
    setEditing(shouldEdit);
    setError("");
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedUser.id, fullName: selectedUser.name, email: selectedUser.email, role: selectedUser.role === "Admin" ? "ADMIN" : selectedUser.role === "Surgery center" ? "SURGERY_CENTER" : selectedUser.role.toUpperCase() }) });
      if (!response.ok) throw new Error();
      setUsers((current) => current.map((user) => user.id === selectedUser.id ? selectedUser : user));
      setEditing(false);
    } catch {
      setError("Unable to save this user.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userToDelete = selectedUser) => {
    if (!userToDelete || !window.confirm(`Delete ${userToDelete.name}? This cannot be undone.`)) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: userToDelete.id }) });
      if (!response.ok) throw new Error();
      setUsers((current) => current.filter((user) => user.id !== userToDelete.id));
      setActiveUsers((current) => { const next = new Set(current); next.delete(userToDelete.email); return next; });
      setSelectedUser((current) => current?.id === userToDelete.id ? null : current);
    } catch {
      setError("Unable to delete this user.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${user.name} ${user.email} ${user.region}`.toLowerCase().includes(query);
    const matchesRole = role === "All" || user.role === role;
    const isActive = activeUsers.has(user.email);
    const matchesStatus = status === "All status" || (status === "Active" ? isActive : !isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <main className="w-full max-w-none p-0">
      <section className="mx-auto min-h-[calc(100vh-65px)] max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">Admin ops</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Users management</h1>
            <p className="mt-2 text-sm text-slate-500">Manage patient, facility, clinician, and platform administrator access.</p>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"><Plus size={17} /> Add user</button>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex overflow-x-auto border-b border-slate-200 px-2">
            {roles.map((item) => {
              const count = item === "All" ? users.length : users.filter((user) => user.role === item).length;
              return <button key={item} type="button" onClick={() => setRole(item)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition ${role === item ? "border-teal-800 text-teal-900" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{item}<span className={`rounded-full px-2 py-0.5 text-[10px] ${role === item ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-500"}`}>{count}</span></button>;
            })}
          </div>

          <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
            <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or region" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700" /></label>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-700"><option>All regions</option><option>California</option><option>New York</option><option>Texas</option><option>Ontario</option></select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-700"><option>All status</option><option>Active</option><option>Inactive</option></select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Region</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Access</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">Loading registered users...</td></tr> : filteredUsers.map((user) => {
                  const isActive = activeUsers.has(user.email);
                  return <tr key={user.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{user.name}</p><p className={`mt-1 text-xs font-medium ${user.verified ? "text-teal-700" : "text-amber-700"}`}>{user.verified ? "Verified" : "Verification pending"}</p></td><td className="px-5 py-4 text-slate-600">{user.email}</td><td className="px-5 py-4"><span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{user.role}</span></td><td className="px-5 py-4 text-slate-600">{user.region}</td><td className="px-5 py-4 text-slate-600">{new Date(user.joined).toLocaleDateString()}</td><td className="px-5 py-4"><button type="button" aria-label={`Toggle ${user.name} access`} onClick={() => setActiveUsers((current) => { const next = new Set(current); isActive ? next.delete(user.email) : next.add(user.email); return next; })} className={`relative h-6 w-11 rounded-full transition ${isActive ? "bg-teal-700" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${isActive ? "left-[22px]" : "left-0.5"}`} /></button><p className="mt-1 text-[11px] font-medium text-slate-500">{isActive ? "Active" : "Inactive"}</p></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" aria-label={`View ${user.name}`} onClick={() => openUser(user)} className="rounded-lg p-2 text-teal-800 hover:bg-teal-50"><Eye size={17} /></button><button type="button" aria-label={`Edit ${user.name}`} onClick={() => openUser(user, true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Edit3 size={17} /></button><button type="button" aria-label={`Delete ${user.name}`} onClick={() => deleteUser(user)} className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"><Trash2 size={17} /></button></div></td></tr>;
                })}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No users match these filters.</p> : null}
        </div>
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        {selectedUser ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit user" : "User details"}><div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-800">User account</p><h2 className="mt-1 text-xl font-bold text-slate-900">{editing ? "Edit user" : selectedUser.name}</h2></div><button type="button" aria-label="Close user dialog" onClick={() => setSelectedUser(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>{editing ? <div className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-700">Full name<input value={selectedUser.name} onChange={(event) => setSelectedUser({ ...selectedUser, name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-700" /></label><label className="block text-sm font-semibold text-slate-700">Email<input type="email" value={selectedUser.email} onChange={(event) => setSelectedUser({ ...selectedUser, email: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-700" /></label><label className="block text-sm font-semibold text-slate-700">Role<select value={selectedUser.role} onChange={(event) => setSelectedUser({ ...selectedUser, role: event.target.value as ManagedUser["role"] })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-700">{roles.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><div className="flex justify-end gap-3"><button type="button" onClick={() => setSelectedUser(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button type="button" disabled={saving} onClick={saveUser} className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div></div> : <div className="mt-5 space-y-3 text-sm"><p><span className="font-semibold text-slate-500">Email:</span> {selectedUser.email}</p><p><span className="font-semibold text-slate-500">Role:</span> {selectedUser.role}</p><p><span className="font-semibold text-slate-500">Region:</span> {selectedUser.region}</p><p><span className="font-semibold text-slate-500">Joined:</span> {new Date(selectedUser.joined).toLocaleDateString()}</p><p><span className="font-semibold text-slate-500">Status:</span> {selectedUser.verified ? "Verified" : "Verification pending"}</p><div className="flex justify-end gap-3 pt-3"><button type="button" onClick={() => setEditing(true)} className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white">Edit user</button><button type="button" disabled={saving} onClick={() => deleteUser()} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">{saving ? "Deleting..." : "Delete user"}</button></div></div>}</div></div> : null}
      </section>
    </main>
  );
}