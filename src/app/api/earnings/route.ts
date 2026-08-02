import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

const ALLOWED_SOURCES = [
  "victory",
  "esp",
  "affirmation",
  "visualization",
  "aar",
  "ritual",
  "deposit",
] as const;

// POST /api/earnings — создать запись о неподтверждённом заработке
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { source, sourceId, amount } = body;

    if (!source || !ALLOWED_SOURCES.includes(source)) {
      return NextResponse.json(
        { error: "Поле source обязательно: victory | esp | affirmation | visualization | aar | ritual | deposit" },
        { status: 400 },
      );
    }

    const pending = await prisma.pendingEarning.create({
      data: {
        amount: typeof amount === "number" && amount >= 0 ? amount : 1,
        source,
        sourceId: sourceId ?? null,
        userId,
      },
    });

    return NextResponse.json(pending, { status: 201 });
  } catch (error) {
    console.error("POST /api/earnings error:", error);
    return NextResponse.json(
      { error: "Не удалось создать запись о заработке" },
      { status: 500 },
    );
  }
}
