"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const uploadTypes = ["REPORT", "IMAGE", "DICOM", "NOTE"] as const;
const imagingModalities = ["CT", "MRI", "XRAY", "ULTRASOUND", "PET", "OTHER"] as const;

type UploadType = (typeof uploadTypes)[number];

interface UploadPatient {
  patientProfileId: string;
  fullName: string;
  email: string;
  reference: string;
}

export function ClinicianUploadForm() {
  const [patients, setPatients] = useState<UploadPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [uploadType, setUploadType] = useState<UploadType>("DICOM");
  const [modality, setModality] = useState("CT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPatients() {
      setLoadingPatients(true);

      try {
        const response = await fetch("/api/clinician/patients");
        const data = await response.json();

        if (!response.ok || !Array.isArray(data.patients) || data.patients.length === 0) {
          throw new Error("Unable to load patients.");
        }

        if (!mounted) {
          return;
        }

        setPatients(data.patients);
        setSelectedPatientId((current) => current || data.patients[0].patientProfileId);
      } catch {
        if (!mounted) {
          return;
        }

        setError("Unable to load patients right now. Please refresh.");
      } finally {
        if (mounted) {
          setLoadingPatients(false);
        }
      }
    }

    void loadPatients();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.patientProfileId === selectedPatientId) ?? patients[0] ?? null,
    [patients, selectedPatientId],
  );

  const modalityRequired = uploadType === "DICOM" || uploadType === "IMAGE";
  const fileRequired = uploadType !== "NOTE";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedPatient) {
      setError("Please choose a patient before submitting.");
      return;
    }

    if (modalityRequired && !modality) {
      setError("Please choose an imaging modality for image and DICOM uploads.");
      return;
    }

    if (fileRequired && !file) {
      setError("Please choose a file before submitting.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for this upload.");
      return;
    }

    setSubmitting(true);

    try {
      const uploadRequest = await fetch("/api/patients/upload-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: selectedPatient.patientProfileId,
          fileName: file?.name ?? `${title.trim().replace(/\s+/g, "_")}.txt`,
          mimeType: file?.type || "application/octet-stream",
        }),
      });

      const uploadData = await uploadRequest.json();
      if (!uploadRequest.ok) {
        setError(uploadData.error ?? "Could not authorize upload.");
        return;
      }

      const notificationResponse = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientProfileId: selectedPatient.patientProfileId,
          patientName: selectedPatient.fullName,
          patientEmail: selectedPatient.email,
          uploadType,
          modality: modalityRequired ? modality : null,
          title: title.trim(),
          description: description.trim() || null,
          fileName: file?.name ?? null,
          reference: selectedPatient.reference,
          uploadId: uploadData.uploadId,
        }),
      });

      const notificationData = await notificationResponse.json();
      if (!notificationResponse.ok) {
        setError(notificationData.error ?? "Upload succeeded, but patient notification failed.");
        return;
      }

      setSuccess(
        notificationData.sent
          ? `Upload submitted and email sent (${notificationData.notificationId}).`
          : `Upload submitted and email notification queued (${notificationData.notificationId}).`,
      );
      setDescription("");
      setTitle("");
      setFile(null);
    } catch {
      setError("Unable to submit this upload right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-black/10 bg-white/75 p-4">
      <h2 className="text-2xl font-semibold">Upload Report or Image</h2>
      <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
        Choose a patient and add a report, image, or note. The patient will receive an email notification.
      </p>

      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-xl font-semibold text-amber-900">{selectedPatient?.fullName ?? "No patient selected"}</p>
        <p className="mt-1 text-sm text-amber-800">Reference: {selectedPatient?.reference ?? "Not available"}</p>
      </div>

      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-slate-700">
          Patient
          <select
            className="mt-1 w-full rounded-lg border border-black/15 bg-white p-2 font-normal"
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
            disabled={loadingPatients || patients.length === 0}
          >
            {patients.length === 0 ? (
              <option value="">No patients available</option>
            ) : null}
            {patients.map((patient) => (
              <option key={patient.patientProfileId} value={patient.patientProfileId}>
                {patient.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Upload Type
          <select
            className="mt-1 w-full rounded-lg border border-black/15 bg-white p-2 font-normal"
            value={uploadType}
            onChange={(event) => setUploadType(event.target.value as UploadType)}
          >
            {uploadTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Imaging Modality {modalityRequired ? "*" : ""}
          <select
            className="mt-1 w-full rounded-lg border border-black/15 bg-white p-2 font-normal"
            value={modality}
            onChange={(event) => setModality(event.target.value)}
            disabled={!modalityRequired}
          >
            {imagingModalities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-[color:var(--ink-muted)]">
            Required for image and DICOM uploads so patient requests can auto-select modality.
          </span>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Title
          <input
            className="mt-1 w-full rounded-lg border border-black/15 p-2 font-normal"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Description
          <textarea
            className="mt-1 min-h-28 w-full rounded-lg border border-black/15 p-2 font-normal"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          File {fileRequired ? "*" : ""}
          <input
            type="file"
            className="mt-1 block w-full text-sm font-normal"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required={fileRequired}
          />
        </label>

        {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
        {success ? <p className="text-sm font-semibold text-teal-800">{success}</p> : null}

        <button
          type="submit"
          disabled={submitting || loadingPatients || !selectedPatient}
          className="rounded-lg bg-orange-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Upload and Notify Patient"}
        </button>
      </form>
    </section>
  );
}
