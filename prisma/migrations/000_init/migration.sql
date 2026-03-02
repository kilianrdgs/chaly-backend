-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Users" (
    "Id" SERIAL NOT NULL,
    "Email" TEXT,
    "PhotoUrl" TEXT,
    "XpTotal" INTEGER NOT NULL DEFAULT 0,
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Moderator" BOOLEAN NOT NULL DEFAULT false,
    "Id_Clan" INTEGER NOT NULL DEFAULT 0,
    "Pseudo" TEXT,
    "PhoneNumber" TEXT NOT NULL,
    "IsVerified" BOOLEAN NOT NULL DEFAULT false,
    "TokenNotification" TEXT,
    "IsCertified" BOOLEAN NOT NULL DEFAULT false,
    "Description" VARCHAR(280),
    "BackgroundName" TEXT,
    "LastActiveAt" TIMESTAMPTZ(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Cuites" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "Like" INTEGER NOT NULL DEFAULT 0,
    "Dislike" INTEGER NOT NULL DEFAULT 0,
    "Reported" INTEGER NOT NULL DEFAULT 0,
    "Latitude" TEXT NOT NULL,
    "Longitude" TEXT NOT NULL,
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Id_Confidentiality" INTEGER NOT NULL DEFAULT 1,
    "Adresse" TEXT DEFAULT '',
    "Titre" TEXT NOT NULL DEFAULT 'Titre par défaut',
    "Id_Challenge" INTEGER,

    CONSTRAINT "Cuites_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Friends" (
    "Id" SERIAL NOT NULL,
    "Id_Sender" INTEGER NOT NULL,
    "Id_Receiver" INTEGER NOT NULL,
    "Is_Accepted" BOOLEAN NOT NULL DEFAULT false,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Block_Reports" (
    "Id" SERIAL NOT NULL,
    "Id_Sender" INTEGER NOT NULL,
    "Id_Receiver" INTEGER NOT NULL,
    "Is_Blocked" BOOLEAN NOT NULL,
    "Message" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_Reports_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Confidentialities" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Confidentialities_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Adresse" TEXT DEFAULT '',
    "Latitude" TEXT NOT NULL DEFAULT '',
    "Longitude" TEXT NOT NULL DEFAULT '',
    "Type" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Picture" (
    "Id" SERIAL NOT NULL,
    "Id_Cuite" INTEGER NOT NULL,
    "Reported" INTEGER NOT NULL DEFAULT 0,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Url_Picture" TEXT NOT NULL,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."User_Rewards" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Id_Reward" INTEGER NOT NULL,
    "Progress" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Rewards_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Rewards" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Point" INTEGER NOT NULL,
    "Progress_Max" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rewards_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Invalid_Tokens" (
    "Id" SERIAL NOT NULL,
    "Token" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invalid_Tokens_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Tokens" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Token" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tokens_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Clans" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clans_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."PhoneVerifications" (
    "Id" SERIAL NOT NULL,
    "Phone" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Retries" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneVerifications_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Likes" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Id_Cuite" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Comments" (
    "Id" SERIAL NOT NULL,
    "Id_Cuite" INTEGER NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Content" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Parent_Id" INTEGER,
    "Reply_Count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."Challenges" (
    "Id" SERIAL NOT NULL,
    "Start_At" TIMESTAMP(3) NOT NULL,
    "End_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenges_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "public"."DailyChallenges" (
    "Id" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT,
    "Realized" BOOLEAN DEFAULT false,
    "Used_At" TIMESTAMPTZ(6),
    "Created_At" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenges_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "public"."Users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_PhoneNumber_key" ON "public"."Users"("PhoneNumber");

-- CreateIndex
CREATE INDEX "idx_user_last_active_at" ON "public"."Users"("LastActiveAt");

-- CreateIndex
CREATE INDEX "Cuites_Id_Challenge_idx" ON "public"."Cuites"("Id_Challenge");

-- CreateIndex
CREATE INDEX "Cuites_Id_Challenge_Id_User_idx" ON "public"."Cuites"("Id_Challenge", "Id_User");

-- CreateIndex
CREATE UNIQUE INDEX "Invalid_Tokens_Token_key" ON "public"."Invalid_Tokens"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_Id_User_key" ON "public"."Tokens"("Id_User");

-- CreateIndex
CREATE UNIQUE INDEX "Clans_Name_key" ON "public"."Clans"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneVerifications_Phone_key" ON "public"."PhoneVerifications"("Phone");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_Id_User_Id_Cuite_key" ON "public"."Likes"("Id_User", "Id_Cuite");

-- CreateIndex
CREATE INDEX "Comments_Id_Cuite_Parent_Id_Created_At_idx" ON "public"."Comments"("Id_Cuite", "Parent_Id", "Created_At" DESC);

-- CreateIndex
CREATE INDEX "Comments_Parent_Id_Created_At_idx" ON "public"."Comments"("Parent_Id", "Created_At" DESC);

-- AddForeignKey
ALTER TABLE "public"."Users" ADD CONSTRAINT "Users_Id_Clan_fkey" FOREIGN KEY ("Id_Clan") REFERENCES "public"."Clans"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cuites" ADD CONSTRAINT "Cuites_Id_Challenge_fkey" FOREIGN KEY ("Id_Challenge") REFERENCES "public"."Challenges"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cuites" ADD CONSTRAINT "Cuites_Id_Confidentiality_fkey" FOREIGN KEY ("Id_Confidentiality") REFERENCES "public"."Confidentialities"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cuites" ADD CONSTRAINT "Cuites_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "public"."Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Picture" ADD CONSTRAINT "Picture_Id_Cuite_fkey" FOREIGN KEY ("Id_Cuite") REFERENCES "public"."Cuites"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User_Rewards" ADD CONSTRAINT "User_Rewards_Id_Reward_fkey" FOREIGN KEY ("Id_Reward") REFERENCES "public"."Rewards"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User_Rewards" ADD CONSTRAINT "User_Rewards_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "public"."Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tokens" ADD CONSTRAINT "Tokens_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "public"."Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_Id_Cuite_fkey" FOREIGN KEY ("Id_Cuite") REFERENCES "public"."Cuites"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "public"."Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "public"."Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comments" ADD CONSTRAINT "Comments_Parent_Id_fkey" FOREIGN KEY ("Parent_Id") REFERENCES "public"."Comments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

