/*
  Warnings:

  - You are about to drop the column `Dislike` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the column `Id_Confidentiality` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the column `Like` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the column `Reported` on the `Cuites` table. All the data in the column will be lost.
  - You are about to drop the `Confidentialities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Cuites" DROP CONSTRAINT "Cuites_Id_Confidentiality_fkey";

-- AlterTable
ALTER TABLE "Cuites" DROP COLUMN "Dislike",
DROP COLUMN "Id_Confidentiality",
DROP COLUMN "Like",
DROP COLUMN "Reported";

-- DropTable
DROP TABLE "public"."Confidentialities";
