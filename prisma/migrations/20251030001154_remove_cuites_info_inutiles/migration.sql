/*
  Warnings:

  - You are about to drop the column `Adresse` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the column `Latitude` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the column `Longitude` on the `Cuites` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cuites" DROP COLUMN "Adresse",
DROP COLUMN "Latitude",
DROP COLUMN "Longitude",
ALTER COLUMN "Description" DROP NOT NULL,
ALTER COLUMN "Titre" DROP NOT NULL,
ALTER COLUMN "Titre" DROP DEFAULT;
