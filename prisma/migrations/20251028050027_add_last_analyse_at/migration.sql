-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "LastAnalyseAt" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "idx_user_last_analyse_at" ON "Users"("LastAnalyseAt");
