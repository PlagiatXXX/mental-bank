import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/aar
export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json([]);

    const aars = await prisma.aAR.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(aars);
  } catch {
    return NextResponse.json(
      { error: "Не удалось загрузить AAR" },
      { status: 500 },
    );
  }
}

// POST /api/aar
export async function POST(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { eventTitle, whatHappened, soWhat, nowWhat, balanceType, lessons } =
      await request.json();

    if (!eventTitle?.trim()) {
      return NextResponse.json(
        { error: "Название события обязательно" },
        { status: 400 },
      );
    }

    const aar = await prisma.aAR.create({
      data: {
        eventTitle: eventTitle.trim(),
        whatHappened: whatHappened?.trim() || null,
        soWhat: soWhat?.trim() || null,
        nowWhat: nowWhat?.trim() || null,
        balanceType: balanceType || "loss",
        lessons: lessons ? JSON.stringify(lessons) : null,
        userId,
      },
    });
    return NextResponse.json(aar, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать AAR" },
      { status: 500 },
    );
  }
}

// DELETE /api/aar?id=...
export async function DELETE(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID AAR обязателен" },
        { status: 400 },
      );
    }

    await prisma.aAR.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось удалить AAR" },
      { status: 500 },
    );
  }
}
