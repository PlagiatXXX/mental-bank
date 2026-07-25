import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/victories — получить все победы, отсортированные по позиции
export async function GET() {
  try {
    const victories = await prisma.victory.findMany({
      orderBy: { position: "asc" },
    });
    return NextResponse.json(victories);
  } catch (error) {
    console.error("GET /api/victories error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить победы" },
      { status: 500 }
    );
  }
}

// POST /api/victories — создать новую победу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Название победы обязательно" },
        { status: 400 }
      );
    }

    // Определяем следующую позицию (1–10)
    const count = await prisma.victory.count();
    if (count >= 10) {
      return NextResponse.json(
        { error: "Максимум 10 побед" },
        { status: 400 }
      );
    }

    const victory = await prisma.victory.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        position: count + 1,
      },
    });

    return NextResponse.json(victory, { status: 201 });
  } catch (error) {
    console.error("POST /api/victories error:", error);
    return NextResponse.json(
      { error: "Не удалось создать победу" },
      { status: 500 }
    );
  }
}

// PATCH /api/victories — обновить победу
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID победы обязателен" },
        { status: 400 }
      );
    }

    const data: Record<string, string> = {};
    if (title && typeof title === "string") data.title = title.trim();
    if (description !== undefined)
      data.description = description?.trim() || "";

    const victory = await prisma.victory.update({
      where: { id },
      data,
    });

    return NextResponse.json(victory);
  } catch (error) {
    console.error("PATCH /api/victories error:", error);
    return NextResponse.json(
      { error: "Не удалось обновить победу" },
      { status: 500 }
    );
  }
}

// DELETE /api/victories?id=xxx — удалить победу
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID победы обязателен" },
        { status: 400 }
      );
    }

    await prisma.victory.delete({ where: { id } });

    // Перенумеровываем позиции
    const remaining = await prisma.victory.findMany({
      orderBy: { position: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i + 1) {
        await prisma.victory.update({
          where: { id: remaining[i].id },
          data: { position: i + 1 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/victories error:", error);
    return NextResponse.json(
      { error: "Не удалось удалить победу" },
      { status: 500 }
    );
  }
}
