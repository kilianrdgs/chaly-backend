-- CreateTable
CREATE TABLE "Votes" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Id_Cuite" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ChallengeId" INTEGER NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "Votes_ChallengeId_idx" ON "Votes"("ChallengeId");

-- CreateIndex
CREATE INDEX "Votes_Id_Cuite_idx" ON "Votes"("Id_Cuite");

-- CreateIndex
CREATE UNIQUE INDEX "Votes_Id_User_ChallengeId_key" ON "Votes"("Id_User", "ChallengeId");

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_Id_Cuite_fkey" FOREIGN KEY ("Id_Cuite") REFERENCES "Cuites"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_ChallengeId_fkey" FOREIGN KEY ("ChallengeId") REFERENCES "Challenges"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
