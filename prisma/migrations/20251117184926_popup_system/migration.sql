-- CreateTable
CREATE TABLE "Popup" (
    "Id" SERIAL NOT NULL,
    "Version" TEXT,
    "Title" TEXT NOT NULL,
    "Content" JSONB NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Popup_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserSeenPopup" (
    "Id" SERIAL NOT NULL,
    "Id_User" INTEGER NOT NULL,
    "Id_Popup" INTEGER NOT NULL,
    "Seen_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSeenPopup_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE INDEX "UserSeenPopup_Id_User_idx" ON "UserSeenPopup"("Id_User");

-- CreateIndex
CREATE INDEX "UserSeenPopup_Id_Popup_idx" ON "UserSeenPopup"("Id_Popup");

-- CreateIndex
CREATE UNIQUE INDEX "UserSeenPopup_Id_User_Id_Popup_key" ON "UserSeenPopup"("Id_User", "Id_Popup");

-- AddForeignKey
ALTER TABLE "UserSeenPopup" ADD CONSTRAINT "UserSeenPopup_Id_User_fkey" FOREIGN KEY ("Id_User") REFERENCES "Users"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSeenPopup" ADD CONSTRAINT "UserSeenPopup_Id_Popup_fkey" FOREIGN KEY ("Id_Popup") REFERENCES "Popup"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
