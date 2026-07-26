"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import GrowthChart from "@/components/GrowthChart";

interface BalanceData {
  total: number;
  account1: number;
  account2: number;
  account3: number;
  victories: number;
  espEntries: number;
  affirmations: number;
  visualizations: number;
  aars: number;
  rituals: number;
  history?: { date: string; cumulative: number }[];
}

export default function Dashboard() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/balance?history=true");
      if (res.ok) {
        const data = await res.json();
        setBalance(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Animate counter
  useEffect(() => {
    if (!balance) return;
    const target = balance.total;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setAnimatedTotal(target);
        clearInterval(interval);
      } else {
        setAnimatedTotal(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [balance]);

  if (!balance) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка баланса…</div>
      </div>
    );
  }

  const accounts = [
    {
      key: "account1" as const,
      label: "Счёт №1 — Прошлое",
      value: balance.account1,
      sub: `${balance.victories} побед • ${balance.espEntries} ESP-записей`,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      icon: "📖",
      href: "/esp-journal",
      chapter: "Гл. 2",
    },
    {
      key: "account2" as const,
      label: "Счёт №2 — Настоящее",
      value: balance.affirmations,
      sub: `${balance.affirmations} аффирмаций`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      icon: "💬",
      href: "/account-2",
      chapter: "Гл. 3",
    },
    {
      key: "account3" as const,
      label: "Счёт №3 — Будущее",
      value: balance.visualizations,
      sub: `${balance.visualizations} сценариев`,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      icon: "🎬",
      href: "/account-3",
      chapter: "Гл. 4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main balance */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full coin-glow bg-gradient-to-br from-amber-400 to-amber-600">
            <span className="text-3xl">🪙</span>
          </div>
        </div>
        <div className="text-5xl font-bold tracking-tight text-amber-400 tabular-nums">
          {animatedTotal.toLocaleString()}
        </div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-slate-400">
          Общий ментальный баланс
        </p>
        <p className="text-xs italic text-emerald-500">
          ↑ Только депозиты. Списаний нет.
        </p>
      </div>

      {/* Growth chart */}
      {balance.history && <GrowthChart data={balance.history} />}

      {/* 3 account cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {accounts.map((acc) => (
          <Link
            key={acc.key}
            href={acc.href}
            className={`glass-card rounded-2xl border p-4 text-center transition-all hover:scale-[1.02] ${acc.bg}`}
          >
            <div className="mb-2 text-2xl">{acc.icon}</div>
            <div className={`text-3xl font-bold ${acc.color} tabular-nums`}>
              {acc.value}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-300">
              {acc.label}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">{acc.sub}</div>
            <div className="mt-1 text-[10px] text-slate-600">{acc.chapter}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/esp-journal"
          className="glass-card rounded-2xl p-4 text-center transition-all hover:border-amber-500/30"
        >
          <div className="text-lg">📝</div>
          <div className="text-xs font-medium text-slate-300">
            ESP-дневник
          </div>
        </Link>
        <Link
          href="/top-10"
          className="glass-card rounded-2xl p-4 text-center transition-all hover:border-amber-500/30"
        >
          <div className="text-lg">🏆</div>
          <div className="text-xs font-medium text-slate-300">Топ-10</div>
        </Link>
        <Link
          href="/protection"
          className="glass-card rounded-2xl p-4 text-center transition-all hover:border-rose-500/30"
        >
          <div className="text-lg">🛡️</div>
          <div className="text-xs font-medium text-slate-300">Защита</div>
        </Link>
        <Link
          href="/rituals"
          className="glass-card rounded-2xl p-4 text-center transition-all hover:border-purple-500/30"
        >
          <div className="text-lg">⚡</div>
          <div className="text-xs font-medium text-slate-300">Ритуалы</div>
        </Link>
        <Link
          href="/cba"
          className="glass-card rounded-2xl p-4 text-center transition-all hover:border-sky-500/30"
        >
          <div className="text-lg">🌬️</div>
          <div className="text-xs font-medium text-slate-300">C-B-A</div>
        </Link>
        <Link
          href="/aar"
          className="glass-card rounded-2xl p-4 text-center transition-all hover:border-emerald-500/30"
        >
          <div className="text-lg">🔄</div>
          <div className="text-xs font-medium text-slate-300">AAR</div>
        </Link>
      </div>

      {/* Quote */}
      <div className="glass-card rounded-2xl p-6 text-center italic">
        <p className="text-sm leading-relaxed text-slate-300">
          &laquo;Победоносные воины сначала побеждают, а потом идут на войну;
          побеждённые сначала идут на войну, а потом пытаются победить.&raquo;
        </p>
        <p className="mt-3 text-xs text-slate-500">
          — Сунь Цзы, «Искусство войны» (Эпилог)
        </p>
      </div>
    </div>
  );
}
