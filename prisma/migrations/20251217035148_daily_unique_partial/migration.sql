-- DropIndex
DROP INDEX "Cuites_Id_User_ChalyDay_IsDaily_key";

-- CreateIndex
CREATE INDEX "Cuites_Id_User_ChalyDay_idx" ON "Cuites"("Id_User", "ChalyDay");
