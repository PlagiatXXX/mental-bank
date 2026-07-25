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
    const { title, description, imageUrl } = body;

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
        imageUrl: imageUrl?.trim() || null,
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

// PATCH /api/victories — обновить победу (или переупорядочить)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, imageUrl, position } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID победы обязателен" },
        { status: 400 }
      );
    }

    // Режим переупорядочивания: передан position
    if (position !== undefined) {
      const victory = await prisma.victory.findUnique({ where: { id } });
      if (!victory) {
        return NextResponse.json(
          { error: "Победа не найдена" },
          { status: 404 }
        );
      }

      const oldPos = victory.position;
      const newPos = Math.max(1, Math.min(10, position));

      if (oldPos === newPos) {
        return NextResponse.json(victory);
      }

      // Сдвигаем остальные победы
      await prisma.$transaction(async (tx) => {
        if (newPos > oldPos) {
          // Двигаем вниз: сдвигаем те, что между old и new, вверх
          await tx.victory.updateMany({
            where: {
              position: { gt: oldPos, lte: newPos },
              id: { not: id },
            },
            data: { position: { decrement: 1 } },
          });
        } else {
          // Двигаем вверх: сдвигаем те, что между new и old, вниз
          await tx.victory.updateMany({
            where: {
              position: { gte: newPos, lt: oldPos },
              id: { not: id },
            },
            data: { position: { increment: 1 } },
          });
        }

        await tx.victory.update({
          where: { id },
          data: { position: newPos },
        });
      });

      const updated = await prisma.victory.findMany({
        orderBy: { position: "asc" },
      });
      return NextResponse.json(updated);
    }

    // Обычное обновление полей
    const data: Record<string, string | null> = {};
    if (title && typeof title === "string") data.title = title.trim();
    if (description !== undefined)
      data.description = description?.trim() || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() || null;

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
