"use client";

import { PatientSidebar } from "@/components/patient-sidebar";
import { usePathname } from "next/navigation";

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.endsWith("/video")) return <>{children}</>;
  return <div className="flex min-h-[calc(100vh-64px)] w-full"><PatientSidebar /><div className="min-w-0 flex-1 bg-slate-50">{children}</div></div>;
}
