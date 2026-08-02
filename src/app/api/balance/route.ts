import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId } from "@/lib/auth";

// GET /api/balance
export async function GET(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({
        total: 0,
        account1: 0,
        account2: 0,
        account3: 0,
        victories: 0,
        espEntries: 0,
        affirmations: 0,
        visualizations: 0,
        aars: 0,
        rituals: 0,
      });
    }

    const { searchParams } = new URL(request.url);
    const withHistory = searchParams.get("history") === "true";

    const where = { userId };

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    const [victories, espEntries, affirmations, visualizations, aars, rituals, deposits, pendingEarnings] =
      await Promise.all([
        prisma.victory.count({ where }),
        prisma.eSPEntry.count({ where }),
        prisma.affirmation.count({ where }),
        prisma.visualization.count({ where }),
        prisma.aAR.count({ where }),
        prisma.ritual.count({ where }),
        prisma.deposit.count({ where }),
        prisma.pendingEarning.findMany({
          where: {
            userId,
            confirmed: false,
            createdAt: { gte: todayStart, lte: todayEnd },
          },
          select: { amount: true, source: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    const account1 = victories + espEntries;
    const account2 = affirmations;
    const account3 = visualizations;
    const total = account1 + account2 + account3 + aars + rituals + deposits;

    const pendingBalance = pendingEarnings.reduce((sum, e) => sum + e.amount, 0);
    const pendingCount = pendingEarnings.length;

    let history: { date: string; cumulative: number }[] | undefined;

    if (withHistory) {
      const [allVictories, allEsp, allAffirmations, allVisualizations, allAars, allRituals, allDeposits] =
        await Promise.all([
          prisma.victory.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
          prisma.eSPEntry.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
          prisma.affirmation.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
          prisma.visualization.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
          prisma.aAR.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
          prisma.ritual.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
          prisma.deposit.findMany({ where, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
        ]);

      const events = [
        ...allVictories,
        ...allEsp,
        ...allAffirmations,
        ...allVisualizations,
        ...allAars,
        ...allRituals,
        ...allDeposits,
      ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const dailyCounts: Record<string, number> = {};
      for (const event of events) {
        const key = event.createdAt.toISOString().split("T")[0];
        dailyCounts[key] = (dailyCounts[key] || 0) + 1;
      }

      let cumulative = 0;
      history = Object.keys(dailyCounts)
        .sort()
        .map((date) => {
          cumulative += dailyCounts[date];
          return { date, cumulative };
        });
    }

    return NextResponse.json({
      total,
      account1,
      account2,
      account3,
      victories,
      espEntries,
      affirmations,
      visualizations,
      aars,
      rituals,
      deposits,
      pendingBalance,
      pendingCount,
      pendingItems: pendingEarnings.map((e) => ({
        source: e.source,
        amount: e.amount,
        createdAt: e.createdAt.toISOString(),
      })),
      history: history && history.length > 1 ? history : undefined,
    });
  } catch (error) {
    console.error("GET /api/balance error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить баланс" },
      { status: 500 },
    );
  }
}
