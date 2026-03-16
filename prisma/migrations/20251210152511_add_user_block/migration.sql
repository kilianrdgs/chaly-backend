-- CreateTable
CREATE TABLE "UserBlock" (
    "Id" SERIAL NOT NULL,
    "Blocker_Id" INTEGER NOT NULL,
    "Blocked_Id" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "UserBlock_Blocker_Id_idx" ON "UserBlock"("Blocker_Id");

-- CreateIndex
CREATE INDEX "UserBlock_Blocked_Id_idx" ON "UserBlock"("Blocked_Id");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_Blocker_Id_Blocked_Id_key" ON "UserBlock"("Blocker_Id", "Blocked_Id");

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_Blocker_Id_fkey" FOREIGN KEY ("Blocker_Id") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_Blocked_Id_fkey" FOREIGN KEY ("Blocked_Id") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
