import { NextResponse } from "next/server";
import { z } from "zod";

const teleconsultSchema = z.object({
  patientProfileId: z.string().min(1),
  consultantId: z.string().min(1).optional(),
  scheduledStart: z.iso.datetime(),
  scheduledEnd: z.iso.datetime(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = teleconsultSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid teleconsultation payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      teleconsultationId: `tel_${crypto.randomUUID()}`,
      meetingUrl: `https://virtual-preop.example/room/${crypto.randomUUID()}`,
      status: "SCHEDULED",
      reminders: [
        { type: "appointment_reminder", offsetMinutes: 1440, delivery: ["email", "in-app"] },
        { type: "appointment_reminder", offsetMinutes: 30, delivery: ["email", "in-app"] },
      ],
    },
    { status: 201 },
  );
}
