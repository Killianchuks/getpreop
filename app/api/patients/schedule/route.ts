import { NextResponse } from "next/server";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db";
import { consultationScheduleSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = consultationScheduleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid scheduling payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const preferred = new Date(parsed.data.preferredDate);
  const end = addHours(preferred, 1);

  const consultation = await prisma.teleconsultation.create({
    data: {
      patientProfileId: parsed.data.patientProfileId,
      scheduledStart: preferred,
      scheduledEnd: end,
      status: "SCHEDULED",
      notes: parsed.data.questionForAnesthesia,
    },
  });

  return NextResponse.json(
    {
      appointmentId: consultation.id,
      status: "scheduled",
      videoStart: preferred.toISOString(),
      videoEnd: end.toISOString(),
      timezone: parsed.data.timezone,
      reminders: [
        { type: "appointment_reminder", scheduledFor: addHours(preferred, -24).toISOString() },
        { type: "appointment_reminder", scheduledFor: addHours(preferred, -0.5).toISOString() },
      ],
    },
    { status: 201 },
  );
}
