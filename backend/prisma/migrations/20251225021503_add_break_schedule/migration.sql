-- CreateTable
CREATE TABLE "BreakSchedule" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "firstBreak" TEXT NOT NULL,
    "secondBreak" TEXT,
    "lunchTime" TEXT NOT NULL,
    "endOfShift" TEXT NOT NULL,
    "alarmEnabled" BOOLEAN NOT NULL DEFAULT true,
    "alarmVolume" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BreakSchedule_agentId_idx" ON "BreakSchedule"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "BreakSchedule_agentId_key" ON "BreakSchedule"("agentId");

-- AddForeignKey
ALTER TABLE "BreakSchedule" ADD CONSTRAINT "BreakSchedule_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
