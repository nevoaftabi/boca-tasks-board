-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPENED', 'CLAIMED', 'DONE');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pay" DECIMAL(10,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'OPENED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "city" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "claimerName" TEXT NOT NULL,
    "claimerEmail" TEXT NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_taskId_key" ON "Claim"("taskId");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
