/*
  Warnings:

  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Referral` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "stripeCheckoutSessionId" TEXT;

-- CreateTable
CREATE TABLE "ReferralPaymentDraft" (
    "id" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "facilityEmail" TEXT NOT NULL,
    "surgeryCenterId" TEXT NOT NULL,
    "surgeryCenterName" TEXT NOT NULL,
    "patientFullName" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "referralId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralPaymentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPaymentDraft_stripeCheckoutSessionId_key" ON "ReferralPaymentDraft"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPaymentDraft_referralId_key" ON "ReferralPaymentDraft"("referralId");

-- CreateIndex
CREATE INDEX "ReferralPaymentDraft_status_createdAt_idx" ON "ReferralPaymentDraft"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_stripeCheckoutSessionId_key" ON "Referral"("stripeCheckoutSessionId");
