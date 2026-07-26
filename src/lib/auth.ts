import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "mb_user_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

export async function getUserIdCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setUserIdCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getCurrentUser() {
  const userId = await getUserIdCookie();
  if (!userId) return null;
  try {
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Возвращает userId из куки или null.
 * Используется в API-роутах — при отсутствии userId роут
 * возвращает пустые данные вместо 401, так как AuthGate
 * на клиенте сам редиректит на /welcome.
 */
export async function removeUserIdCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getOptionalUserId(): Promise<string | null> {
  try {
    return await getUserIdCookie();
  } catch {
    return null;
  }
}
