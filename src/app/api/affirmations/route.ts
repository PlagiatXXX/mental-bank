import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/affirmations
export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json([]);

    const affirmations = await prisma.affirmation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(affirmations);
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить аффирмации" },
      { status: 500 },
    );
  }
}

// POST /api/affirmations
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text, context } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Текст аффирмации обязателен" },
        { status: 400 },
      );
    }

    const [affirmation] = await prisma.$transaction([
      prisma.affirmation.create({
        data: { text: text.trim(), context: context?.trim() || null, userId },
      }),
      prisma.pendingEarning.create({
        data: { source: "affirmation", sourceId: null, userId },
      }),
    ]);
    return NextResponse.json(affirmation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать аффирмацию" },
      { status: 500 },
    );
  }
}

// PATCH /api/affirmations
export async function PATCH(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, text, context, hitCount } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "ID аффирмации обязателен" },
        { status: 400 },
      );
    }

    const affirmation = await prisma.affirmation.update({
      where: { id, userId },
      data: {
        ...(text !== undefined && { text: text.trim() }),
        ...(context !== undefined && { context: context?.trim() || null }),
        ...(hitCount !== undefined && { hitCount }),
      },
    });
    return NextResponse.json(affirmation);
  } catch {
    return NextResponse.json(
      { error: "Не удалось обновить аффирмацию" },
      { status: 500 },
    );
  }
}

// DELETE /api/affirmations?id=...
export async function DELETE(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID аффирмации обязателен" },
        { status: 400 },
      );
    }

    await prisma.affirmation.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить аффирмацию" },
      { status: 500 },
    );
  }
}
