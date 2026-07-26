import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/visualizations
export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json([]);

    const visualizations = await prisma.visualization.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(visualizations);
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить визуализации" },
      { status: 500 },
    );
  }
}

// POST /api/visualizations
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content, eventDate } = await request.json();
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Название и содержание обязательны" },
        { status: 400 },
      );
    }

    const visualization = await prisma.visualization.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        eventDate: eventDate ? new Date(eventDate) : null,
        userId,
      },
    });
    return NextResponse.json(visualization, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать визуализацию" },
      { status: 500 },
    );
  }
}

// DELETE /api/visualizations?id=...
export async function DELETE(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID визуализации обязателен" },
        { status: 400 },
      );
    }

    await prisma.visualization.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить визуализацию" },
      { status: 500 },
    );
  }
}
