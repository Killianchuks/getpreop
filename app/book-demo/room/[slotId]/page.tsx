import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { VideoAssessmentRoom } from "@/components/video-assessment-room";

export default async function DemoVideoRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slotId: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { slotId } = await params;
  const { role } = await searchParams;

  const slot = await prisma.demoAvailabilitySlot.findUnique({ where: { id: slotId } });
  if (!slot || !slot.isBooked) {
    notFound();
  }

  const isHost = role === "host";

  return (
    <VideoAssessmentRoom
      role={isHost ? "clinician" : "patient"}
      patientName={slot.bookedByName || "Guest"}
      physicianName="Dr. Jessica Onwudiwe, MD"
      backHref="/book-demo"
      attendeeLabel="Guest"
      visitType="Product demo"
    />
  );
}
