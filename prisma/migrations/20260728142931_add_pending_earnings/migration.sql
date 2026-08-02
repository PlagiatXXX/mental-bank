-- CreateTable
CREATE TABLE "pending_earnings" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pending_earnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_earnings_userId_confirmed_createdAt_idx" ON "pending_earnings"("userId", "confirmed", "createdAt");

-- AddForeignKey
ALTER TABLE "pending_earnings" ADD CONSTRAINT "pending_earnings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
