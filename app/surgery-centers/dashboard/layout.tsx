import { InstitutionSidebar } from "@/components/institution-sidebar";
import { getInstitutionOverview } from "@/lib/institution-data";
import { getCurrentUser } from "@/lib/current-user";

export default async function InstitutionDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const overview = getInstitutionOverview();
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <InstitutionSidebar facilityName={user?.surgeryCenter?.name ?? overview.facilityName} clinicianName={user?.fullName ?? overview.clinicianName} />
      <div className="min-w-0 flex-1 overflow-x-auto px-6 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
