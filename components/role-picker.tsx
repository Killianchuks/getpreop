"use client";

import { useState } from "react";

const roles = [
  { id: "PATIENT", label: "Patient" },
  { id: "SURGERY_CENTER", label: "Institution / ASC" },
  { id: "ANESTHESIOLOGIST", label: "Anesthesiologist" },
  { id: "ADMIN", label: "Admin" },
] as const;

export function RolePicker() {
  const [selected, setSelected] = useState<string | null>(null);

  async function chooseRole(role: string) {
    const response = await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (response.ok) {
      setSelected(role);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Demo Role Access Switcher
        </p>
        {selected ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
            Role: {selected}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400">No role active</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {roles.map((r) => {
          const isActive = selected === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => chooseRole(r.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Set {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
