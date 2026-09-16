-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "elapsedMs" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuePlanCache" (
    "id" TEXT NOT NULL,
    "projectionHash" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuePlanCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "subject" TEXT NOT NULL,
    "listening" BOOLEAN NOT NULL DEFAULT false,
    "photos" BOOLEAN NOT NULL DEFAULT false,
    "clinician" BOOLEAN NOT NULL DEFAULT false,
    "research" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("subject")
);

-- CreateIndex
CREATE INDEX "AuditEvent_subject_occurredAt_idx" ON "AuditEvent"("subject", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "CuePlanCache_projectionHash_targetId_key" ON "CuePlanCache"("projectionHash", "targetId");

