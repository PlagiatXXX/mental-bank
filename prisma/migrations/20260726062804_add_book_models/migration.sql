-- CreateTable
CREATE TABLE "affirmations" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "context" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visualizations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visualizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confidence_attacks" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "defence" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confidence_attacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rituals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aars" (
    "id" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "whatHappened" TEXT,
    "soWhat" TEXT,
    "nowWhat" TEXT,
    "balanceType" TEXT NOT NULL DEFAULT 'loss',
    "lessons" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aars_pkey" PRIMARY KEY ("id")
);
