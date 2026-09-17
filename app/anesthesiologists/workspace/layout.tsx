import { ClinicianSidebar } from "@/components/clinician-sidebar";
import { CURRENT_DOCTOR, getDoctorProfile } from "@/lib/case-assignment-data";
import { getCurrentUser } from "@/lib/current-user";
import { ClinicianAccessGate } from "@/components/clinician-access-gate";

export default async function AnesthesiologistWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const doctorName = user?.fullName ?? CURRENT_DOCTOR;
  const profile = getDoctorProfile(doctorName) ?? getDoctorProfile(CURRENT_DOCTOR);

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <ClinicianSidebar
        doctorName={doctorName}
        specialtyFocus={profile?.specialtyFocus ?? (user?.anesthesiologistProfile?.licenseRegion ? `Licensed in ${user.anesthesiologistProfile.licenseRegion}` : "Anesthesiology")}
      />
      <div className="min-w-0 flex-1 overflow-x-auto px-6 py-6 md:px-8 md:py-8"><ClinicianAccessGate>{children}</ClinicianAccessGate></div>
    </div>
  );
}
