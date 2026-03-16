/*
  Warnings:

  - You are about to drop the `Picture` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Picture" DROP CONSTRAINT "Picture_Id_Cuite_fkey";

-- DropTable
DROP TABLE "public"."Picture";
