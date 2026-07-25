import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/esp?date=2025-07-25 — получить запись за конкретную дату
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    // Если дата не указана, возвращаем все записи
    if (!dateStr) {
      const entries = await prisma.eSPEntry.findMany({
        orderBy: { date: "desc" },
      });
      return NextResponse.json(entries);
    }

    const date = new Date(dateStr + "T00:00:00.000Z");

    const entry = await prisma.eSPEntry.findUnique({
      where: { date },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("GET /api/esp error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить запись" },
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

    // Устанавливаем дату на начало дня (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Проверяем, нет ли уже записи на сегодня
    const existing = await prisma.eSPEntry.findUnique({
      where: { date: today },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Запись на сегодня уже существует. Используйте PATCH для обновления." },
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
