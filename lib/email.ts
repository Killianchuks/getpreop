import { buildPatientUploadEmailContent } from "@/lib/email-templates";
import { sendDeliverableEmail } from "@/lib/email-service";

export interface PatientUploadEmailInput {
  patientName: string;
  patientEmail: string;
  title: string;
  description: string | null;
  uploadType: "REPORT" | "IMAGE" | "DICOM" | "NOTE";
  modality: string | null;
  fileName: string | null;
  reference: string;
}

export async function sendPatientUploadEmail(input: PatientUploadEmailInput) {
  const { html, text } = buildPatientUploadEmailContent(input);

  const result = await sendDeliverableEmail({
    to: input.patientEmail,
    toName: input.patientName,
    subject: `New pre-op upload: ${input.title}`,
    html,
    text,
    category: "PATIENT_UPLOAD",
    metadata: {
      reference: input.reference,
      uploadType: input.uploadType,
      modality: input.modality,
      fileName: input.fileName,
    },
  });

  return {
    sent: result.success,
    provider: result.provider,
    mode: result.success ? ("sent" as const) : ("queued_only" as const),
    messageId: result.providerMessageId,
    logId: result.logId,
  };
}
