import { VideoAssessmentRoom } from "@/components/video-assessment-room";

export default function PatientVideoAssessmentPage() {
  return <VideoAssessmentRoom role="patient" patientName="Your pre-op assessment" physicianName="Dr. Amara Chen" backHref="/patients/portal/assessment" />;
}
