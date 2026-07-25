"use client";

import { useEffect, useState, useCallback } from "react";

interface BalanceData {
  total: number;
  victories: number;
  espEntries: number;
}

export default function BalanceCounter() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/balance");
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch {
      // silently fail — data will load on next render
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (balance === null) return;

    const target = balance.total;
    if (animatedTotal >= target) {
      setAnimatedTotal(target);
      return;
    }

    const step = Math.max(1, Math.floor(target / 50));
    const interval = setInterval(() => {
      setAnimatedTotal((prev) => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(interval);
          return target;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [balance, animatedTotal]);

  if (!balance) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка баланса…</div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 text-center count-up">
      {/* Gold coin icon */}
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full coin-glow bg-gradient-to-br from-amber-400 to-amber-600">
        <span className="text-4xl">🪙</span>
      </div>

      {/* Balance number */}
      <div className="mb-1 text-5xl font-bold tracking-tight text-amber-400">
        {animatedTotal.toLocaleString()}
      </div>
      <p className="mb-6 text-sm font-medium uppercase tracking-widest text-slate-400">
        Ментальный баланс
      </p>

      {/* Stats breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-800/50 p-3">
          <div className="text-2xl font-bold text-emerald-400">
            {balance.victories}
          </div>
          <div className="text-xs text-slate-400">Побед</div>
        </div>
        <div className="rounded-xl bg-slate-800/50 p-3">
          <div className="text-2xl font-bold text-amber-400">
            {balance.espEntries}
          </div>
          <div className="text-xs text-slate-400">Дней E-S-P</div>
        </div>
      </div>

      {/* Always-growing message */}
      <div className="mt-4 text-xs italic text-emerald-500">
        ↑ Только депозиты. Списаний нет.
      </div>
    </div>
  );
}
