-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '🪙',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "victories" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "victories" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "esp_entries" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "esp_entries" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "affirmations" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "affirmations" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "visualizations" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "visualizations" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "confidence_attacks" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "confidence_attacks" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "rituals" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "rituals" ALTER COLUMN "userId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "aars" ADD COLUMN "userId" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "aars" ALTER COLUMN "userId" DROP DEFAULT;

-- DropIndex
DROP INDEX "esp_entries_date_key";

-- CreateIndex
CREATE INDEX "victories_userId_idx" ON "victories"("userId");
CREATE INDEX "esp_entries_userId_idx" ON "esp_entries"("userId");
CREATE UNIQUE INDEX "esp_entries_userId_date_key" ON "esp_entries"("userId", "date");
CREATE INDEX "affirmations_userId_idx" ON "affirmations"("userId");
CREATE INDEX "visualizations_userId_idx" ON "visualizations"("userId");
CREATE INDEX "confidence_attacks_userId_idx" ON "confidence_attacks"("userId");
CREATE INDEX "rituals_userId_idx" ON "rituals"("userId");
CREATE INDEX "aars_userId_idx" ON "aars"("userId");

-- AddForeignKey
ALTER TABLE "victories" ADD CONSTRAINT "victories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "esp_entries" ADD CONSTRAINT "esp_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "affirmations" ADD CONSTRAINT "affirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "visualizations" ADD CONSTRAINT "visualizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "confidence_attacks" ADD CONSTRAINT "confidence_attacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rituals" ADD CONSTRAINT "rituals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "aars" ADD CONSTRAINT "aars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
