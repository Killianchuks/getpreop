"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const dashboardByRole: Record<string, string> = {
  PATIENT: "/patients/portal",
  SURGERY_CENTER: "/surgery-centers/dashboard",
  ANESTHESIOLOGIST: "/anesthesiologists/workspace",
  ADMIN: "/admin",
};

function readRole() {
  return document.cookie
    .split("; ")
    .find((value) => value.startsWith("getpreop_role="))
    ?.split("=")[1];
}

export function DashboardHomeLink({ brand = false }: { brand?: boolean }) {
  const [role, setRole] = useState<string>();

  useEffect(() => {
    setRole(readRole());
  }, []);

  const dashboardHref = role ? dashboardByRole[role] : undefined;
  const href = dashboardHref ?? "/";

  if (brand) {
    return <Link href={href} className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 transition hover:text-teal-700"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white">G</span><span>GetPreOp</span></Link>;
  }

  return <Link href={href} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-800"><LayoutDashboard size={15} />{dashboardHref ? "Dashboard" : "Home"}</Link>;
}
