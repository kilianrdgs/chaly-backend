/*
  Warnings:

  - You are about to drop the column `ReplacedAt` on the `Cuites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Id_User,ChalyDay,IsDaily]` on the table `Cuites` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Cuites_Id_User_ChalyDay_key";

-- AlterTable
ALTER TABLE "Cuites" DROP COLUMN "ReplacedAt",
ADD COLUMN     "IsDaily" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Cuites_Id_User_ChalyDay_IsDaily_key" ON "Cuites"("Id_User", "ChalyDay", "IsDaily");
