-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('ACTIVITY');

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Action" "ActionType" NOT NULL DEFAULT 'ACTIVITY',
    "Metadata" JSONB,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "UserAnalytics" ADD CONSTRAINT "UserAnalytics_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
