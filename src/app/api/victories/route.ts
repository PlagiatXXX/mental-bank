import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/victories
export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json([]);

    const victories = await prisma.victory.findMany({
      where: { userId },
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

// POST /api/victories
export async function POST(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, description, imageUrl } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Название победы обязательно" },
        { status: 400 }
      );
    }

    const count = await prisma.victory.count({ where: { userId } });
    if (count >= 10) {
      return NextResponse.json(
        { error: "Максимум 10 побед" },
        { status: 400 }
      );
    }

    const [victory] = await prisma.$transaction([
      prisma.victory.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          position: count + 1,
          userId,
        },
      }),
      prisma.pendingEarning.create({
        data: { source: "victory", sourceId: null, userId },
      }),
    ]);

    return NextResponse.json(victory, { status: 201 });
  } catch (error) {
    console.error("POST /api/victories error:", error);
    return NextResponse.json(
      { error: "Не удалось создать победу" },
      { status: 500 }
    );
  }
}

// PATCH /api/victories
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, title, description, imageUrl, position } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID победы обязателен" },
        { status: 400 }
      );
    }

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

      await prisma.$transaction(async (tx) => {
        if (newPos > oldPos) {
          await tx.victory.updateMany({
            where: {
              userId,
              position: { gt: oldPos, lte: newPos },
              id: { not: id },
            },
            data: { position: { decrement: 1 } },
          });
        } else {
          await tx.victory.updateMany({
            where: {
              userId,
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
        where: { userId },
        orderBy: { position: "asc" },
      });
      return NextResponse.json(updated);
    }

    const data: Record<string, string | null> = {};
    if (title && typeof title === "string") data.title = title.trim();
    if (description !== undefined)
      data.description = description?.trim() || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() || null;

    const victory = await prisma.victory.update({
      where: { id, userId },
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

// DELETE /api/victories?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID победы обязателен" },
        { status: 400 }
      );
    }

    await prisma.victory.delete({ where: { id, userId } });

    const remaining = await prisma.victory.findMany({
      where: { userId },
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
