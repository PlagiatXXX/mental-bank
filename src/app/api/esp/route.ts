import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/esp
export async function GET(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      // без пользователя возвращаем пустые данные
      const { searchParams } = new URL(request.url);
      if (searchParams.get("calendar")) return NextResponse.json([]);
      if (searchParams.get("search")) return NextResponse.json({ entries: [], total: 0 });
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const offset = parseInt(searchParams.get("offset") || "0");
    const calendar = searchParams.get("calendar");

    if (calendar) {
      const [year, month] = calendar.split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const entries = await prisma.eSPEntry.findMany({
        where: {
          userId,
          date: { gte: start, lte: end },
        },
        select: { date: true },
        orderBy: { date: "asc" },
      });

      const dates = entries.map((e) =>
        e.date.toISOString().split("T")[0]
      );
      return NextResponse.json(dates);
    }

    if (search) {
      const validFilters = ["effort", "success", "progress"];
      const fields = filter && validFilters.includes(filter)
        ? [filter]
        : validFilters;

      const where = {
        userId,
        OR: fields.map((field) => ({
          [field]: { contains: search, mode: "insensitive" as const },
        })),
      };

      const [entries, total] = await Promise.all([
        prisma.eSPEntry.findMany({
          where,
          orderBy: { date: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.eSPEntry.count({ where }),
      ]);

      return NextResponse.json({ entries, total });
    }

    if (dateStr) {
      const date = new Date(dateStr + "T00:00:00.000Z");
      const entry = await prisma.eSPEntry.findFirst({
        where: { userId, date },
      });
      return NextResponse.json(entry);
    }

    const entries = await prisma.eSPEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/esp error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить записи" },
      { status: 500 }
    );
  }
}

// POST /api/esp
export async function POST(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { effort, success, progress } = body;

    if (!effort || !success || !progress) {
      return NextResponse.json(
        { error: "Все поля (effort, success, progress) обязательны" },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.eSPEntry.findFirst({
      where: { userId, date: today },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Запись на сегодня уже существует. Используйте PATCH для обновления.",
        },
        { status: 409 }
      );
    }

    const [entry] = await prisma.$transaction([
      prisma.eSPEntry.create({
        data: {
          date: today,
          effort: effort.trim(),
          success: success.trim(),
          progress: progress.trim(),
          userId,
        },
      }),
      prisma.pendingEarning.create({
        data: { source: "esp", sourceId: null, userId },
      }),
    ]);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/esp error:", error);
    return NextResponse.json(
      { error: "Не удалось создать запись" },
      { status: 500 }
    );
  }
}

// PATCH /api/esp
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, effort, success, progress } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID записи обязателен" },
        { status: 400 }
      );
    }

    const data: Record<string, string> = {};
    if (effort) data.effort = effort.trim();
    if (success) data.success = success.trim();
    if (progress) data.progress = progress.trim();

    const entry = await prisma.eSPEntry.update({
      where: { id, userId },
      data,
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("PATCH /api/esp error:", error);
    return NextResponse.json(
      { error: "Не удалось обновить запись" },
      { status: 500 }
    );
  }
}
