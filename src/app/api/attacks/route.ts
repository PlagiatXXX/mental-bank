import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/attacks
export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json([]);

    const attacks = await prisma.confidenceAttack.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(attacks);
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить атаки" },
      { status: 500 },
    );
  }
}

// POST /api/attacks
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { source, type, context } = await request.json();
    if (!source?.trim() || !type || !context?.trim()) {
      return NextResponse.json(
        { error: "source, type и context обязательны" },
        { status: 400 },
      );
    }

    const attack = await prisma.confidenceAttack.create({
      data: {
        source: source.trim(),
        type,
        context: context.trim(),
        userId,
      },
    });
    return NextResponse.json(attack, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать запись об атаке" },
      { status: 500 },
    );
  }
}

// PATCH /api/attacks
export async function PATCH(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, defence, resolved } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "ID атаки обязателен" },
        { status: 400 },
      );
    }

    const attack = await prisma.confidenceAttack.update({
      where: { id, userId },
      data: {
        ...(defence !== undefined && { defence: defence.trim() }),
        ...(resolved !== undefined && { resolved }),
      },
    });
    return NextResponse.json(attack);
  } catch {
    return NextResponse.json(
      { error: "Не удалось обновить запись об атаке" },
      { status: 500 },
    );
  }
}

// DELETE /api/attacks?id=...
export async function DELETE(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID атаки обязателен" },
        { status: 400 },
      );
    }

    await prisma.confidenceAttack.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить запись об атаке" },
      { status: 500 },
    );
  }
}
