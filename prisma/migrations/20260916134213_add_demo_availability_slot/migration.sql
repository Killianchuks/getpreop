-- CreateTable
CREATE TABLE "DemoAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 15,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookedByName" TEXT,
    "bookedByEmail" TEXT,
    "bookedByOrg" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemoAvailabilitySlot_date_isBooked_idx" ON "DemoAvailabilitySlot"("date", "isBooked");

-- CreateIndex
CREATE UNIQUE INDEX "DemoAvailabilitySlot_date_time_key" ON "DemoAvailabilitySlot"("date", "time");
