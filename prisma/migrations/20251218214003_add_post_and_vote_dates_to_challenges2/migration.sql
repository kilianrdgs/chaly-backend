/*
  Warnings:

  - You are about to drop the column `End_At` on the `Challenges` table. All the data in the column will be lost.
  - You are about to drop the column `Start_At` on the `Challenges` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenges" DROP COLUMN "End_At",
DROP COLUMN "Start_At",
ADD COLUMN     "Post_EndAt" TIMESTAMP(3),
ADD COLUMN     "Post_StartAt" TIMESTAMP(3),
ADD COLUMN     "Title" TEXT,
ADD COLUMN     "Vote_EndAt" TIMESTAMP(3);
