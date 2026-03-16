-- AlterTable
ALTER TABLE "public"."Users" ADD COLUMN     "LastPostAt" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "idx_user_last_post_at" ON "public"."Users"("LastPostAt");
