/*
  Warnings:

  - Added the required column `password` to the `Claim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "password" TEXT NOT NULL;
