import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/rituals
export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json([]);

    const rituals = await prisma.ritual.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rituals);
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить ритуалы" },
      { status: 500 },
    );
  }
}

// POST /api/rituals
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, steps } = await request.json();
    if (!name?.trim() || !steps) {
      return NextResponse.json(
        { error: "name и steps обязательны" },
        { status: 400 },
      );
    }

    const ritual = await prisma.ritual.create({
      data: { name: name.trim(), steps: JSON.stringify(steps), userId },
    });
    return NextResponse.json(ritual, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать ритуал" },
      { status: 500 },
    );
  }
}

// DELETE /api/rituals?id=...
export async function DELETE(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID ритуала обязателен" },
        { status: 400 },
      );
    }

    await prisma.ritual.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить ритуал" },
      { status: 500 },
    );
  }
}
