import { ClinicianSidebar } from "@/components/clinician-sidebar";
import { CURRENT_DOCTOR, getDoctorProfile } from "@/lib/case-assignment-data";

export default function AnesthesiologistWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = getDoctorProfile(CURRENT_DOCTOR);

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      <ClinicianSidebar
        doctorName={CURRENT_DOCTOR}
        specialtyFocus={profile?.specialtyFocus ?? "Anesthesiology"}
      />
      <div className="flex-1 overflow-x-auto px-6 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
