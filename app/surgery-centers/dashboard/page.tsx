import { InstitutionDashboardContent } from "@/components/institution-dashboard-content";
import { getCurrentUser } from "@/lib/current-user";
import { getInstitutionDashboardData } from "@/lib/institution-dashboard";

export default async function InstitutionDashboardPage() {
  const user = await getCurrentUser();
  const data = await getInstitutionDashboardData(user?.surgeryCenterId);
  return <InstitutionDashboardContent facilityName={user?.surgeryCenter?.name ?? "Surgery center"} cases={data.cases} />;
}
