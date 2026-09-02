import nodemailer from "nodemailer";

interface PatientUploadEmailInput {
  patientName: string;
  patientEmail: string;
  title: string;
  description: string | null;
  uploadType: "REPORT" | "IMAGE" | "DICOM" | "NOTE";
  modality: string | null;
  fileName: string | null;
  reference: string;
}

function hasSmtpConfiguration() {
  return Boolean(
    process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USER
      && process.env.SMTP_PASS
      && process.env.SMTP_FROM,
  );
}

function buildEmailContent(input: PatientUploadEmailInput) {
  const modalityLine = input.modality ? `Imaging modality: ${input.modality}` : "Imaging modality: not provided";
  const fileLine = input.fileName ? `File: ${input.fileName}` : "File: not required for this upload";
  const descriptionLine = input.description ? `Description: ${input.description}` : "Description: none";

  const text = [
    `Hello ${input.patientName},`,
    "",
    "A new pre-op document has been uploaded to your ReadyForOR case.",
    `Reference: ${input.reference}`,
    `Upload type: ${input.uploadType}`,
    modalityLine,
    `Title: ${input.title}`,
    fileLine,
    descriptionLine,
    "",
    "Please log in to review details and follow any updated instructions.",
  ].join("\n");

  const html = `
    <p>Hello ${input.patientName},</p>
    <p>A new pre-op document has been uploaded to your ReadyForOR case.</p>
    <ul>
      <li><strong>Reference:</strong> ${input.reference}</li>
      <li><strong>Upload type:</strong> ${input.uploadType}</li>
      <li><strong>Imaging modality:</strong> ${input.modality ?? "not provided"}</li>
      <li><strong>Title:</strong> ${input.title}</li>
      <li><strong>File:</strong> ${input.fileName ?? "not required for this upload"}</li>
      <li><strong>Description:</strong> ${input.description ?? "none"}</li>
    </ul>
    <p>Please log in to review details and follow any updated instructions.</p>
  `;

  return { text, html };
}

export async function sendPatientUploadEmail(input: PatientUploadEmailInput) {
  if (!hasSmtpConfiguration()) {
    return {
      sent: false,
      provider: "none" as const,
      mode: "queued_only" as const,
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { text, html } = buildEmailContent(input);

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.patientEmail,
    subject: `New pre-op upload: ${input.title}`,
    text,
    html,
  });

  return {
    sent: true,
    provider: "smtp" as const,
    mode: "sent" as const,
    messageId: info.messageId,
  };
}
