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
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      <InstitutionSidebar facilityName={user?.surgeryCenter?.name ?? overview.facilityName} clinicianName={user?.fullName ?? overview.clinicianName} />
      <div className="flex-1 overflow-x-auto px-6 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
