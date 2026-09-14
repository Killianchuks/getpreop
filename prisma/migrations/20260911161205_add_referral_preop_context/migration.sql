-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "patientPhone" TEXT,
ADD COLUMN     "supportingNoteContent" BYTEA,
ADD COLUMN     "supportingNoteName" TEXT,
ADD COLUMN     "supportingNoteType" TEXT;

-- AlterTable
ALTER TABLE "ReferralPaymentDraft" ADD COLUMN     "medicalHistory" TEXT,
ADD COLUMN     "patientPhone" TEXT,
ADD COLUMN     "supportingNoteContent" BYTEA,
ADD COLUMN     "supportingNoteName" TEXT,
ADD COLUMN     "supportingNoteType" TEXT;
