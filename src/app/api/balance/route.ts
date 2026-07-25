import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/balance
//   ?history=true — добавить дневную историю для графика
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withHistory = searchParams.get("history") === "true";

    const [victories, espEntries, allVictories, allEsp] = await Promise.all([
      prisma.victory.count(),
      prisma.eSPEntry.count(),
      withHistory
        ? prisma.victory.findMany({
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
          })
        : Promise.resolve([]),
      withHistory
        ? prisma.eSPEntry.findMany({
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
          })
        : Promise.resolve([]),
    ]);

    const total = victories + espEntries;

    let history: { date: string; cumulative: number }[] = [];

    if (withHistory) {
      // Объединяем события в хронологическом порядке
      const events: { date: Date }[] = [
        ...allVictories.map((v) => ({ date: v.createdAt })),
        ...allEsp.map((e) => ({ date: e.createdAt })),
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      // Группируем по дням и считаем cumulative
      const dailyCounts: Record<string, number> = {};
      for (const event of events) {
        const key = event.date.toISOString().split("T")[0];
        dailyCounts[key] = (dailyCounts[key] || 0) + 1;
      }

      let cumulative = 0;
      const sortedDays = Object.keys(dailyCounts).sort();
      history = sortedDays.map((date) => {
        cumulative += dailyCounts[date];
        return { date, cumulative };
      });
    }

    return NextResponse.json({
      total,
      victories,
      espEntries,
      history: history.length > 0 ? history : undefined,
    });
  } catch (error) {
    console.error("GET /api/balance error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить баланс" },
      { status: 500 }
    );
  }
}
