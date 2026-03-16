/*
  Warnings:

  - You are about to drop the column `IsPublished` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the column `isAnalyzed` on the `Cuites` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cuites" DROP COLUMN "IsPublished",
DROP COLUMN "isAnalyzed";
