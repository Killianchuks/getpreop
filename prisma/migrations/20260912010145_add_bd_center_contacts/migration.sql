-- CreateTable
CREATE TABLE "BusinessDevelopmentContact" (
    "id" TEXT NOT NULL,
    "source" TEXT,
    "organizationName" TEXT,
    "contactName" TEXT,
    "jobTitle" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "practiceAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "specialty" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessDevelopmentContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessDevelopmentMessage" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessDevelopmentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessDevelopmentContact_status_city_state_idx" ON "BusinessDevelopmentContact"("status", "city", "state");

-- CreateIndex
CREATE INDEX "BusinessDevelopmentContact_organizationName_idx" ON "BusinessDevelopmentContact"("organizationName");

-- CreateIndex
CREATE INDEX "BusinessDevelopmentContact_email_idx" ON "BusinessDevelopmentContact"("email");

-- CreateIndex
CREATE INDEX "BusinessDevelopmentContact_practiceAddress_idx" ON "BusinessDevelopmentContact"("practiceAddress");

-- CreateIndex
CREATE INDEX "BusinessDevelopmentMessage_contactId_createdAt_idx" ON "BusinessDevelopmentMessage"("contactId", "createdAt");

-- AddForeignKey
ALTER TABLE "BusinessDevelopmentMessage" ADD CONSTRAINT "BusinessDevelopmentMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "BusinessDevelopmentContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
