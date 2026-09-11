"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ClinicianAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/anesthesiologists/onboarding")
      .then((response) => response.json())
      .then((data) => {
        const profile = data.profile;
        const onboardingPath = pathname === "/anesthesiologists/workspace/onboarding";
        if (!onboardingPath && (!profile?.onboardingCompletedAt || !profile?.adminApprovedAt)) {
          router.replace("/anesthesiologists/workspace/onboarding");
          return;
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [pathname, router]);

  if (checking && pathname !== "/anesthesiologists/workspace/onboarding") {
    return <div className="p-8 text-sm text-slate-500">Checking account access...</div>;
  }

  return children;
}
