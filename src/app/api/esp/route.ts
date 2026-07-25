import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/esp
//   ?date=2025-07-25    — запись за конкретную дату
//   ?search=keyword     — поиск по всем полям
//   &filter=effort|success|progress — поле для поиска
//   &limit=20&offset=0  — пагинация
//   &calendar=2026-07    — месячный календарь (return: массив дат)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const offset = parseInt(searchParams.get("offset") || "0");
    const calendar = searchParams.get("calendar");

    // Режим календаря: возвращает список дат и количество записей за месяц
    if (calendar) {
      const [year, month] = calendar.split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const entries = await prisma.eSPEntry.findMany({
        where: {
          date: { gte: start, lte: end },
        },
        select: { date: true },
        orderBy: { date: "asc" },
      });

      // Возвращаем массив дат (YYYY-MM-DD), в которых есть записи
      const dates = entries.map((e) =>
        e.date.toISOString().split("T")[0]
      );
      return NextResponse.json(dates);
    }

    // Поиск/фильтрация
    if (search) {
      const validFilters = ["effort", "success", "progress"];
      const fields = filter && validFilters.includes(filter)
        ? [filter]
        : validFilters;

      const where = {
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

    // Одна запись по дате
    if (dateStr) {
      const date = new Date(dateStr + "T00:00:00.000Z");
      const entry = await prisma.eSPEntry.findUnique({
        where: { date },
      });
      return NextResponse.json(entry);
    }

    // Все записи (по умолчанию)
    const entries = await prisma.eSPEntry.findMany({
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

// POST /api/esp — создать новую ESP-запись на сегодня
export async function POST(request: NextRequest) {
  try {
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

    const existing = await prisma.eSPEntry.findUnique({
      where: { date: today },
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

    const entry = await prisma.eSPEntry.create({
      data: {
        date: today,
        effort: effort.trim(),
        success: success.trim(),
        progress: progress.trim(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/esp error:", error);
    return NextResponse.json(
      { error: "Не удалось создать запись" },
      { status: 500 }
    );
  }
}

// PATCH /api/esp — обновить существующую ESP-запись
export async function PATCH(request: NextRequest) {
  try {
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
      where: { id },
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
