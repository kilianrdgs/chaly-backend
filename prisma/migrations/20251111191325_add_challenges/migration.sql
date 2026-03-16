/*
  Warnings:

  - You are about to drop the column `LastAnalyseAt` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `PersonalityMode` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `DailyChallenges` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACTIVE', 'FINISHED');

-- DropIndex
DROP INDEX "idx_user_last_analyse_at";

-- AlterTable
ALTER TABLE "Challenges" ADD COLUMN     "Description" TEXT,
ADD COLUMN     "GameMasterId" INTEGER,
ADD COLUMN     "Status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "LastAnalyseAt",
DROP COLUMN "PersonalityMode";

-- DropTable
DROP TABLE "DailyChallenges";
