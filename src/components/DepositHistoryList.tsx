"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Deposit {
  id: string;
  text: string;
  createdAt: string;
}

export default function DepositHistoryList() {
  const [deposits, setDeposits] = useState<Deposit[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deposits")
      .then((r) => r.json())
      .then((data) => {
        setDeposits(data.deposits ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-sm text-slate-500">Загрузка истории…</div>
      </div>
    );
  }

  if (!deposits || deposits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-600/50 px-6 py-12 text-center">
        <div className="mb-3 text-4xl">🪙</div>
        <p className="text-sm text-slate-400">
          У вас пока нет депозитов.
        </p>
        <Link
          href="/"
          className="mt-3 inline-block text-xs text-amber-400 underline underline-offset-2"
        >
          Вернуться на главную и внести первый депозит →
        </Link>
      </div>
    );
  }

  // Группируем по дням
  const groups: { date: string; display: string; items: Deposit[] }[] = [];
  for (const d of deposits) {
    const date = new Date(d.createdAt);
    const dateKey = date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const display = date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const last = groups[groups.length - 1];
    if (last && last.date === dateKey) {
      last.items.push(d);
    } else {
      groups.push({ date: dateKey, display, items: [d] });
    }
  }

  // Стили для разных дней
  const bgStyles = [
    "border-l-amber-500/30",
    "border-l-emerald-500/30",
    "border-l-sky-500/30",
    "border-l-purple-500/30",
    "border-l-rose-500/30",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Всего депозитов: <span className="font-medium text-slate-300">{deposits.length}</span>
        </p>
      </div>

      {groups.map((group, gi) => (
        <div key={group.date}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {group.display}
          </div>
          <div className="space-y-2">
            {group.items.map((deposit, i) => (
              <div
                key={deposit.id}
                className={`rounded-xl border border-slate-700/50 border-l-4 bg-slate-800/30 px-4 py-3 transition-colors hover:bg-slate-800/50 ${
                  bgStyles[(gi + i) % bgStyles.length]
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">🪙</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-slate-200">
                      {deposit.text}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {new Date(deposit.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
