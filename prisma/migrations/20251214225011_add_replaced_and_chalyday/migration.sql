/*
  Warnings:

  - You are about to drop the column `Date` on the `Cuites` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cuites" DROP COLUMN "Date",
ADD COLUMN     "ChalyDay" TEXT,
ADD COLUMN     "ReplacedAt" TIMESTAMP(3);
