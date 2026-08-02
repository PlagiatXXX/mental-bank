import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// POST /api/confirm-day — подтвердить все сегодняшние pending-заработки
export async function POST() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    // Находим все unconfirmed pending за сегодня
    const unconfirmed = await prisma.pendingEarning.findMany({
      where: {
        userId,
        confirmed: false,
        createdAt: { gte: start, lte: end },
      },
    });

    if (unconfirmed.length === 0) {
      return NextResponse.json({
        confirmed: 0,
        totalAmount: 0,
        message: "Нет неподтверждённых заработков за сегодня",
      });
    }

    // Подтверждаем все разом
    await prisma.pendingEarning.updateMany({
      where: {
        userId,
        confirmed: false,
        createdAt: { gte: start, lte: end },
      },
      data: {
        confirmed: true,
        confirmedAt: new Date(),
      },
    });

    const totalAmount = unconfirmed.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      confirmed: unconfirmed.length,
      totalAmount,
      message: `Подтверждено ${unconfirmed.length} действий на ${totalAmount} ОУ`,
    });
  } catch (error) {
    console.error("POST /api/confirm-day error:", error);
    return NextResponse.json(
      { error: "Не удалось подтвердить день" },
      { status: 500 },
    );
  }
}
