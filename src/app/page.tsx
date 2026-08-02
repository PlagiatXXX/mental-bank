"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import GrowthChart from "@/components/GrowthChart";
import FlaskViewer from "@/components/FlaskViewer";
import { getRandomQuote } from "@/lib/quotes";

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
  deposits: number;
  pendingBalance: number;
  pendingCount: number;
  pendingItems: { source: string; amount: number; createdAt: string }[];
  history?: { date: string; cumulative: number }[];
}

const SOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  victory: { label: "Победа", icon: "🏆" },
  esp: { label: "ESP-запись", icon: "📝" },
  affirmation: { label: "Аффирмация", icon: "💬" },
  visualization: { label: "Визуализация", icon: "🎬" },
  aar: { label: "AAR", icon: "📋" },
  ritual: { label: "Ритуал", icon: "🔥" },
  deposit: { label: "Депозит", icon: "🪙" },
};

export default function Dashboard() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [confirming, setConfirming] = useState(false);

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
    let cancelled = false;
    fetch("/api/balance?history=true")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setBalance(data);
      })
      .catch(() => {
        // silently fail
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Animated counter
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

  const handleConfirmDay = async () => {
    setConfirming(true);
    try {
      const res = await fetch("/api/confirm-day", { method: "POST" });
      if (res.ok) {
        // Показываем цитату после подтверждения
        setQuote(getRandomQuote());
        // Обновляем баланс
        await fetchBalance();
      }
    } catch {
      // ignore
    } finally {
      setConfirming(false);
    }
  };

  if (!balance) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка…</div>
      </div>
    );
  }

  const items = balance.pendingItems ?? [];

  // Сортируем по времени (от новых к старым) — уже отсортировано ASC из API, разворачиваем
  const sortedItems = [...items].reverse();

  return (
    <div className="space-y-6">
      {/* Колба с подтверждением дня — вне карточки, парит на фоне */}
      <FlaskViewer
        pendingBalance={balance.pendingBalance}
        pendingCount={balance.pendingCount}
        totalBalance={balance.total}
        onConfirm={handleConfirmDay}
        disabled={confirming}
      />

      {/* Общий баланс */}
      <div
        id="main-balance"
        className="glass-card rounded-2xl px-4 py-6 text-center sm:px-6 sm:py-8"
      >
        <div className="text-xs uppercase tracking-widest text-slate-500">
          Общий ментальный баланс
        </div>
        <div className="text-4xl font-bold tracking-tight text-emerald-400 tabular-nums sm:text-5xl">
          {animatedTotal.toLocaleString()}
        </div>
        <p className="mt-1 text-[10px] italic text-slate-600">
          ↑ Только депозиты. Списаний нет.
        </p>
      </div>

      {/* Сводка действий за день */}
      {sortedItems.length > 0 && (
        <div className="glass-card rounded-2xl px-4 py-5 sm:px-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">
            📋 Сегодня сделано
          </h3>
          <ul className="space-y-2">
            <AnimatePresence>
              {sortedItems.map((item, i) => {
                const info = SOURCE_LABELS[item.source] ?? {
                  label: item.source,
                  icon: "•",
                };
                const timeAgo = getTimeAgo(item.createdAt);
                return (
                  <motion.li
                    key={item.createdAt + item.source + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl bg-slate-800/30 px-3 py-2"
                  >
                    <span className="text-lg">{info.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-200">
                        {info.label}
                      </div>
                      <div className="text-[10px] text-slate-600">{timeAgo}</div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 tabular-nums">
                      +{item.amount}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {/* Нет действий сегодня */}
      {sortedItems.length === 0 && (
        <div className="glass-card rounded-2xl px-4 py-5 text-center sm:px-6">
          <div className="text-lg">🌅</div>
          <p className="mt-2 text-sm text-slate-500">
            Сегодня ещё не было действий.
          </p>
          <Link
            href="/tools"
            className="mt-3 inline-block rounded-xl bg-amber-500/10 px-5 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            🚀 Сделать первый шаг
          </Link>
        </div>
      )}

      {/* Цитата после подтверждения */}
      {quote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="animate-modal-in glass-card rounded-2xl border-l-4 border-amber-500/50 p-5"
        >
          <p className="text-sm leading-relaxed italic text-slate-300">
            &laquo;{quote.text}&raquo;
          </p>
          <p className="mt-2 text-xs text-slate-500">— {quote.author}</p>
        </motion.div>
      )}

      {/* Growth chart */}
      {balance.history && <div id="growth-chart"><GrowthChart data={balance.history} /></div>}

      {/* 3 account cards */}
      <div id="account-cards" className="grid gap-4 sm:grid-cols-3">
        {([
          {
            key: "account1" as const,
            label: "Счёт №1 — Прошлое",
            value: balance.account1,
            sub: `${balance.victories} побед • ${balance.espEntries} ESP • ${balance.deposits} депозитов`,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            icon: "📖",
            href: "/esp-journal",
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
          },
        ] as const).map((acc) => (
          <Link
            key={acc.key}
            id={acc.key}
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
          </Link>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин. назад`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;

  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}
