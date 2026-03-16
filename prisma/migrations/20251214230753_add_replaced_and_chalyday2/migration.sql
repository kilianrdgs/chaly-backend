/*
  Warnings:

  - A unique constraint covering the columns `[Id_User,ChalyDay]` on the table `Cuites` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ChalyDay` on table `Cuites` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cuites" ALTER COLUMN "ChalyDay" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cuites_Id_User_ChalyDay_key" ON "Cuites"("Id_User", "ChalyDay");
