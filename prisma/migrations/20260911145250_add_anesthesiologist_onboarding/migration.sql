-- AlterTable
ALTER TABLE "AnesthesiologistProfile" ADD COLUMN     "adminApprovedAt" TIMESTAMP(3),
ADD COLUMN     "attestedAt" TIMESTAMP(3),
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "licenseExpiration" TIMESTAMP(3),
ADD COLUMN     "licensedStates" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "payoutAccountHolderName" TEXT,
ADD COLUMN     "payoutAccountLast4" TEXT,
ADD COLUMN     "payoutAccountType" TEXT,
ADD COLUMN     "payoutRoutingLast4" TEXT,
ADD COLUMN     "specialtyFocus" TEXT,
ADD COLUMN     "taxIdLast4" TEXT;
