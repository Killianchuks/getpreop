import { NextResponse } from "next/server";
import { z } from "zod";

const uploadRequestSchema = z.object({
  patientProfileId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(3),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = uploadRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  return NextResponse.json({
    uploadId: `upl_${crypto.randomUUID()}`,
    status: "authorized",
    uploadUrl: `https://secure-upload.getpreop.test/upload/${crypto.randomUUID()}`,
    expiresInSeconds: 900,
  });
}
