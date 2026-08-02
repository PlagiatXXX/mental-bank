import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setUserIdCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { nickname, avatar } = await request.json();

    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: "Никнейм обязателен" },
        { status: 400 },
      );
    }

    const trimmed = nickname.trim().slice(0, 30);

    const data: { nickname: string; avatar?: string } = { nickname: trimmed };
    if (typeof avatar === "string" && avatar.trim().length > 0) {
      data.avatar = avatar.trim().slice(0, 8);
    }

    const user = await prisma.user.create({ data });

    await setUserIdCookie(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Не удалось создать профиль" },
      { status: 500 },
    );
  }
}
