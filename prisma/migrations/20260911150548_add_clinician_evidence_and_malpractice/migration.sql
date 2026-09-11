-- AlterTable
ALTER TABLE "AnesthesiologistProfile" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "malpracticeInsuranceStatus" TEXT,
ADD COLUMN     "malpracticePolicyNumber" TEXT,
ADD COLUMN     "malpracticeProvider" TEXT;

-- CreateTable
CREATE TABLE "ClinicianDocument" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicianDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClinicianDocument_profileId_documentType_key" ON "ClinicianDocument"("profileId", "documentType");

-- AddForeignKey
ALTER TABLE "ClinicianDocument" ADD CONSTRAINT "ClinicianDocument_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AnesthesiologistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
