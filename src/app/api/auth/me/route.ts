import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUserId, removeUserIdCookie, setUserIdCookie } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to get user:", error);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getOptionalUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { nickname, avatar } = await request.json();
    const data: Record<string, string> = {};

    if (typeof nickname === "string" && nickname.trim().length > 0) {
      data.nickname = nickname.trim().slice(0, 30);
    }
    if (typeof avatar === "string" && avatar.trim().length > 0) {
      data.avatar = avatar.trim();
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Нет данных для обновления" },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    await setUserIdCookie(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Не удалось обновить профиль" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const userId = await getOptionalUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Удаляем все связанные данные пользователя
    await prisma.$transaction([
      prisma.victory.deleteMany({ where: { userId } }),
      prisma.eSPEntry.deleteMany({ where: { userId } }),
      prisma.affirmation.deleteMany({ where: { userId } }),
      prisma.visualization.deleteMany({ where: { userId } }),
      prisma.confidenceAttack.deleteMany({ where: { userId } }),
      prisma.ritual.deleteMany({ where: { userId } }),
      prisma.aAR.deleteMany({ where: { userId } }),
      prisma.deposit.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    await removeUserIdCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Не удалось удалить профиль" },
      { status: 500 },
    );
  }
}
