import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/deposits?today=true — получить сегодняшний депозит
// GET /api/deposits — получить все депозиты
export async function GET(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({ deposits: [], today: null });
    }

    const { searchParams } = new URL(request.url);
    const today = searchParams.get("today");

    if (today === "true") {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date();
      end.setUTCHours(23, 59, 59, 999);

      const deposit = await prisma.deposit.findFirst({
        where: {
          userId,
          createdAt: { gte: start, lte: end },
        },
      });

      return NextResponse.json({ today: deposit });
    }

    const deposits = await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error("GET /api/deposits error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить депозиты" },
      { status: 500 },
    );
  }
}

// POST /api/deposits — создать быстрый депозит
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Текст депозита обязателен" },
        { status: 400 },
      );
    }

    // Проверяем, не было ли депозита сегодня
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const existing = await prisma.deposit.findFirst({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Сегодня вы уже сделали депозит. Один депозит в день — это ритуал." },
        { status: 409 },
      );
    }

    const deposit = await prisma.deposit.create({
      data: {
        text: text.trim().slice(0, 500),
        userId,
      },
    });

    return NextResponse.json(deposit, { status: 201 });
  } catch (error) {
    console.error("POST /api/deposits error:", error);
    return NextResponse.json(
      { error: "Не удалось создать депозит" },
      { status: 500 },
    );
  }
}
