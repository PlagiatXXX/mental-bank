"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import GrowthChart from "@/components/GrowthChart";
import CoinFly from "@/components/CoinFly";
import DepositStreak, { bumpStreak } from "@/components/DepositStreak";
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
  history?: { date: string; cumulative: number }[];
}

export default function Dashboard() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [bumping, setBumping] = useState(false);

  // Deposit form
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [todayDeposit, setTodayDeposit] = useState<{ id: string; text: string; createdAt: string } | null>(null);
  const [depositDone, setDepositDone] = useState(false);

  // Coin animation
  const [coin, setCoin] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
  } | null>(null);

  // Quote
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  // Refs for positions
  const buttonRef = useRef<HTMLButtonElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const bumpCountRef = useRef(0);

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
    // Проверяем, был ли сегодня депозит
    fetch("/api/deposits?today=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.today) {
          setTodayDeposit(data.today);
          setDepositDone(true);
        }
      })
      .catch(() => {});
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  const handleDeposit = async () => {
    const trimmed = text.trim();
    if (!trimmed || depositDone) return;

    setSaving(true);

    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (res.status === 409) {
        // Уже депозит сегодня — обновляем UI
        setDepositDone(true);
        setSaving(false);
        return;
      }

      if (!res.ok) return;

      const deposit = await res.json();
      setTodayDeposit(deposit);
      setDepositDone(true);

      // Запускаем анимацию монеты
      const btnRect = buttonRef.current?.getBoundingClientRect();
      const balRect = balanceRef.current?.getBoundingClientRect();
      if (btnRect && balRect) {
        const from = {
          x: btnRect.left + btnRect.width / 2 - 20,
          y: btnRect.top - 10,
        };
        const to = {
          x: balRect.left + balRect.width / 2 - 20,
          y: balRect.top + balRect.height / 2 - 20,
        };
        setCoin({ from, to });
      }

      // Обновляем streak
      bumpStreak();

      // Выбираем цитату
      setQuote(getRandomQuote());

      setText("");
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const onCoinFinish = () => {
    setCoin(null);
    // Вспышка баланса
    setBumping(true);
    bumpCountRef.current += 1;
    const count = bumpCountRef.current;
    setTimeout(() => {
      // только если не было нового бампа
      if (bumpCountRef.current === count) setBumping(false);
    }, 500);
    // Перезапрашиваем баланс
    fetchBalance();
  };

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
      sub: `${balance.victories} побед • ${balance.espEntries} ESP • ${balance.deposits} депозитов`,
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
      {/* Coin animation */}
      {coin && <CoinFly from={coin.from} to={coin.to} onFinish={onCoinFinish} />}

      {/* Main balance */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div
          ref={balanceRef}
          className={`mb-2 flex items-center justify-center gap-3 ${bumping ? "animate-balance-bump" : ""}`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full coin-glow bg-gradient-to-br from-amber-400 to-amber-600">
            <img
              src="/logo/logo-96x96.webp"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div
            className={`text-5xl font-bold tracking-tight text-amber-400 tabular-nums ${bumping ? "animate-balance-bump" : ""}`}
          >
            {animatedTotal.toLocaleString()}
          </div>
          <DepositStreak />
        </div>
        <p className="mb-1 mt-1 text-sm font-medium uppercase tracking-widest text-slate-400">
          Общий ментальный баланс
        </p>
        <p className="text-xs italic text-emerald-500">
          ↑ Только депозиты. Списаний нет.
        </p>
      </div>

      {/* Deposit form */}
      <div className="glass-card rounded-2xl p-5">
        {depositDone && todayDeposit ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-lg">
              ✅
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-emerald-400">
                Депозит на сегодня внесён
              </div>
              <p className="truncate text-xs text-slate-500">
                &laquo;{todayDeposit.text}&raquo;
              </p>
            </div>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-sm font-semibold text-slate-200">
              🪙 Что вы сделали сегодня?
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              Одно действие в день — осознанный ритуал. Опишите его, чтобы закрепить в подсознании.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Например: провёл встречу по проекту Бустрата, на которую не решался неделю…"
              className="mb-3 w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows={3}
              maxLength={500}
            />

            <button
              ref={buttonRef}
              onClick={handleDeposit}
              disabled={saving || !text.trim()}
              className="gold-glow w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-sm font-bold tracking-wider text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
            >
              {saving ? "Чеканим монету…" : "🪙  ВНЕСТИ ДЕПОЗИТ"}
            </button>
          </>
        )}
      </div>

      {/* Quote after deposit */}
      {quote && (
        <div className="animate-modal-in glass-card rounded-2xl border-l-4 border-amber-500/50 p-5">
          <p className="text-sm leading-relaxed italic text-slate-300">
            &laquo;{quote.text}&raquo;
          </p>
          <p className="mt-2 text-xs text-slate-500">— {quote.author}</p>
        </div>
      )}

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
          <div className="text-xs font-medium text-slate-300">ESP-дневник</div>
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

      {/* Deposit history link */}
      <Link
        href="/deposits"
        className="glass-card flex items-center gap-3 rounded-2xl p-4 transition-all hover:border-amber-500/30"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-lg">
          📜
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-200">
            История депозитов
          </div>
          <p className="text-xs text-slate-500">
            Все ваши депозиты — от первого до сегодняшнего
          </p>
        </div>
        <div className="text-lg text-slate-600">→</div>
      </Link>
    </div>
  );
}
