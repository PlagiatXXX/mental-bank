"use client";

import { useEffect, useState } from "react";

const STREAK_KEY = "mental-bank:deposit-streak";

interface StreakData {
  count: number;
  lastDate: string;
}

function readStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { count: 0, lastDate: "" };
}

function writeStreak(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

/** Вызвать после успешного депозита */
export function bumpStreak() {
  const today = new Date().toISOString().split("T")[0];
  const prev = readStreak();

  if (prev.lastDate === today) return; // уже сегодня пополняли

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  const count = prev.lastDate === yStr ? prev.count + 1 : 1;
  writeStreak({ count, lastDate: today });
}

export default function DepositStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(readStreak().count);
  }, []);

  if (streak < 2) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
      <span>🔥</span>
      {streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"}
    </span>
  );
}
