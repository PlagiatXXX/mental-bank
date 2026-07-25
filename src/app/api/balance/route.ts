import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/balance — получить текущий ментальный баланс
export async function GET() {
  try {
    const [victories, espEntries] = await Promise.all([
      prisma.victory.count(),
      prisma.eSPEntry.count(),
    ]);

    return NextResponse.json({
      total: victories + espEntries,
      victories,
      espEntries,
    });
  } catch (error) {
    console.error("GET /api/balance error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить баланс" },
      { status: 500 }
    );
  }
}
