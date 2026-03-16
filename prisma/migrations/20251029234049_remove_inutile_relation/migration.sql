/*
  Warnings:

  - You are about to drop the column `Email` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `Id_Clan` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `Block_Reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Clans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User_Rewards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Tokens" DROP CONSTRAINT "Tokens_Id_User_fkey";

-- DropForeignKey
ALTER TABLE "public"."User_Rewards" DROP CONSTRAINT "User_Rewards_Id_Reward_fkey";

-- DropForeignKey
ALTER TABLE "public"."User_Rewards" DROP CONSTRAINT "User_Rewards_Id_User_fkey";

-- DropForeignKey
ALTER TABLE "public"."Users" DROP CONSTRAINT "Users_Id_Clan_fkey";

-- DropIndex
DROP INDEX "public"."Users_Email_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "Email",
DROP COLUMN "Id_Clan";

-- DropTable
DROP TABLE "public"."Block_Reports";

-- DropTable
DROP TABLE "public"."Clans";

-- DropTable
DROP TABLE "public"."Friends";

-- DropTable
DROP TABLE "public"."Location";

-- DropTable
DROP TABLE "public"."Rewards";

-- DropTable
DROP TABLE "public"."Tokens";

-- DropTable
DROP TABLE "public"."User_Rewards";
