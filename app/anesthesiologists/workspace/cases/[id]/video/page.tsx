import { VideoAssessmentRoom } from "@/components/video-assessment-room";
import { getCaseById } from "@/lib/case-assignment-data";
import { notFound } from "next/navigation";

export default async function ClinicianVideoAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getCaseById(id);
  if (!record) notFound();
  return <VideoAssessmentRoom role="clinician" patientName={record.patientName} backHref={`/anesthesiologists/workspace/cases/${id}`} />;
}
