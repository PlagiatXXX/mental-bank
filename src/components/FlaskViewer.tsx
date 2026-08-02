"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  depositFeedback,
  confirmDayFeedback,
  vibrate,
} from "@/lib/audio-haptics";

interface FlaskViewerProps {
  pendingBalance: number;
  pendingCount: number;
  totalBalance: number;
  onConfirm: () => Promise<void>;
  disabled: boolean;
}

/** Вместимость колбы в ОУ — полная колба = 10000 очков уверенности */
const MAX_CAPACITY = 10000;

/**
 * Форма колбы Эрленмейера (viewBox 220×280).
 * Горлышко 90–130 по x, от y=40; тело расширяется к 26–194 и
 * скруглённым дном к y≈262. Жидкость может подняться до низа
 * горлышка (y=66) — это уровень 100%.
 */
const FLASK_PATH =
  "M 90 66 L 26 190 Q 26 258 70 260 Q 110 262 150 260 Q 194 258 194 190 L 130 66 L 130 40 L 90 40 Z";

interface BubbleSpec {
  left: number; // % от ширины колбы
  bottom: number; // % от высоты — точка старта
  size: number; // px
  duration: number; // s
  delay: number; // s
  drift: number; // горизонтальное смещение, px
}

/** Детерминированный набор пузырьков — без рандома в рендере */
const BUBBLES: BubbleSpec[] = [
  { left: 30, bottom: 6, size: 9, duration: 2.4, delay: 0, drift: 6 },
  { left: 52, bottom: 12, size: 6, duration: 3.1, delay: 0.6, drift: -5 },
  { left: 68, bottom: 4, size: 7, duration: 2.7, delay: 1.1, drift: 4 },
  { left: 40, bottom: 18, size: 5, duration: 3.6, delay: 0.2, drift: -3 },
  { left: 62, bottom: 9, size: 8, duration: 2.9, delay: 1.6, drift: 5 },
  { left: 46, bottom: 24, size: 6, duration: 4.0, delay: 0.9, drift: -6 },
  { left: 56, bottom: 15, size: 5, duration: 3.3, delay: 2.1, drift: 3 },
  { left: 72, bottom: 20, size: 6, duration: 3.8, delay: 0.4, drift: -4 },
  // Пузыри в зоне струи — активнее в центре колбы
  { left: 47, bottom: 3, size: 4, duration: 1.8, delay: 0.2, drift: 2 },
  { left: 50, bottom: 8, size: 5, duration: 2.1, delay: 0.5, drift: -2 },
  { left: 44, bottom: 12, size: 4, duration: 2.4, delay: 0.8, drift: 3 },
  { left: 53, bottom: 5, size: 4, duration: 2.0, delay: 1.0, drift: -3 },
  { left: 49, bottom: 16, size: 3, duration: 2.6, delay: 0.35, drift: 2 },
  { left: 52, bottom: 20, size: 3, duration: 2.8, delay: 0.7, drift: -2 },
];

/** EaseOutBack — уровень слегка «перелетает» цель (инерция жидкости) */
function easeOutBack(p: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}

/**
 * Плавное подведение числа к цели с лёгким перелётом (easeOutBack) через rAF.
 * Возвращает промис, резолвящийся по завершении.
 */
function animateValue(
  from: number,
  to: number,
  duration: number,
  onValue: (v: number) => void,
  rafRef: React.MutableRefObject<number | null>
): Promise<void> {
  return new Promise((resolve) => {
    cancelAnimationFrame(rafRef.current ?? 0);
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = easeOutBack(p);
      onValue(Math.round(from + (to - from) * e));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        resolve();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  });
}

export default function FlaskViewer({
  pendingBalance,
  pendingCount,
  totalBalance,
  onConfirm,
  disabled,
}: FlaskViewerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `flask-clip-${uid}`;

  const [depositing, setDepositing] = useState(false);
  const [done, setDone] = useState(false);
  const [sentAmount, setSentAmount] = useState(0);
  const [liquidOU, setLiquidOU] = useState(0);

  const rafRef = useRef<number | null>(null);

  const cancelRunningAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const hasPending = pendingCount > 0 && !done;

  /** Уже влито в колбу: всё подтверждённое, без сегодняшнего pending */
  const restingOU = Math.max(
    0,
    Math.min(totalBalance - pendingBalance, MAX_CAPACITY)
  );

  const level = Math.min(liquidOU / MAX_CAPACITY, 1);
  const pct = Math.round(level * 100);
  const full = level >= 1;

  // В покое колба плавно приводит уровень к «влитому» значению
  useEffect(() => {
    if (depositing || done) return;
    animateValue(liquidOU, restingOU, 700, setLiquidOU, rafRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restingOU, depositing, done]);

  useEffect(() => {
    return cancelRunningAnimation;
  }, [cancelRunningAnimation]);

  const handleDeposit = async () => {
    if (depositing || disabled || !hasPending) return;
    setSentAmount(pendingBalance);
    setDepositing(true);
    depositFeedback();
    vibrate(30);

    // Налив: от текущего уровня до (clamped) total — строго на долю pending
    const target = Math.min(totalBalance, MAX_CAPACITY);
    await animateValue(liquidOU, target, 1500, setLiquidOU, rafRef);

    confirmDayFeedback();
    try {
      await onConfirm();
    } catch {
      // ошибка — всё равно done
    }
    setDepositing(false);
    setDone(true);
    // Поздравление висит пару секунд, затем панель возвращается в обычный вид
    setTimeout(() => setDone(false), 4000);
  };

  // Пузырьки видны только внутри жидкости: стартовая точка ниже поверхности
  const visibleBubbles = depositing || full ? BUBBLES : [];

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[320px]">
        {/* Колба */}
        <div className="relative aspect-[220/280] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-700/40 via-slate-800/50 to-slate-950/80 shadow-2xl shadow-black/50 backdrop-blur-md">
          {/* Стекло, шкала, пробка, блик */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 220 280"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={clipId}>
                <path d={FLASK_PATH} />
              </clipPath>
            </defs>

            {/* Стекло */}
            <path
              d={FLASK_PATH}
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />

            {/* Блик на стекле */}
            <path
              d="M 52 196 Q 56 130 96 62 L 102 62 Q 62 132 58 196 Z"
              fill="rgba(255,255,255,0.14)"
            />

            {/* Пробка */}
            <rect
              x={86}
              y={8}
              width={48}
              height={30}
              rx={7}
              fill="url(#flask-cork)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
            <defs>
              <linearGradient id="flask-cork" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5e3c" />
                <stop offset="100%" stopColor="#5b3a21" />
              </linearGradient>
            </defs>
          </svg>

          {/* Жидкость, обрезанная по контуру колбы */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ clipPath: `url(#${clipId})` }}
          >
            {/* Тело жидкости — высота строго = доля ОУ от вместимости */}
            <div
              className="absolute left-0 right-0 bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-700"
              style={{ bottom: 0, height: `${pct}%` }}
            />

            {/* Поверхность — едет вверх вместе с уровнем; при наливе по ней бегут волны */}
            <div
              className="absolute left-0 right-0"
              style={{ bottom: `${Math.max(pct - 2, 0)}%` }}
            >
              {/* Гребень */}
              <div
                className="border-t-2 border-emerald-300/70"
                style={{ boxShadow: "0 -2px 12px rgba(52,211,153,0.55)" }}
              />
              {/* Бегущие волны при наливе */}
              {depositing && (
                <>
                  <motion.span
                    className="absolute -top-[3px] rounded-full bg-emerald-200/70"
                    style={{ width: 30, height: 3.5 }}
                    initial={{ left: "-8%" }}
                    animate={{
                      left: ["-8%", "108%"],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.15,
                      repeat: 1,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.span
                    className="absolute -top-[2px] rounded-full bg-emerald-200/50"
                    style={{ width: 22, height: 3 }}
                    initial={{ left: "-8%" }}
                    animate={{
                      left: ["-8%", "108%"],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.55,
                      repeat: 1,
                      ease: "easeInOut",
                    }}
                  />
                </>
              )}
            </div>

            {/* Пузырьки — во время налива или кипения у полной колбы */}
            {visibleBubbles.map((b, i) => {
              const surface = pct - b.bottom - 4;
              if (surface <= 0) return null;
              return (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-emerald-200/70 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                  style={{
                    left: `${b.left}%`,
                    bottom: `${b.bottom}%`,
                    width: b.size,
                    height: b.size,
                  }}
                  initial={{ y: 0, x: 0, opacity: 0 }}
                  animate={{
                    y: [0, -surface * 1.1],
                    x: [0, b.drift, 0],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: b.duration,
                    delay: b.delay,
                    repeat: Infinity,
                    ease: "easeIn",
                  }}
                />
              );
            })}
          </div>

          {/* Свечение при наливе — вспышка, затухающая к концу */}
          {depositing && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.4, 0] }}
              transition={{
                duration: 1.6,
                times: [0, 0.3, 0.7, 1],
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, rgba(52,211,153,0.35) 0%, transparent 70%)",
              }}
            />
          )}

          {/* Done — свечение */}
          <AnimatePresence>
            {done && (
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(52,211,153,0.28) 0%, transparent 70%)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Переполнение/полнота — кипение у пробки */}
          <AnimatePresence>
            {full && !done && (
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-0 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  height: "12%",
                  background:
                    "radial-gradient(ellipse at 50% 30%, rgba(52,211,153,0.35) 0%, transparent 70%)",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Панель */}
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="pending"
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-[10px] text-slate-500">
              уровень {pct}%
            </div>

            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-amber-400 tabular-nums">
                +{pendingBalance}
              </span>
              <span className="text-xs text-slate-500">ОУ</span>
              <span className="text-xs text-slate-600">
                • {pendingCount}{" "}
                {pendingCount === 1 ? "действие" : "действий"}
              </span>
            </div>

            <button
              onClick={handleDeposit}
              disabled={depositing || disabled || !hasPending}
              className={`mt-3 w-full max-w-[220px] rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all ${
                hasPending
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-900 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.97]"
                  : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              }`}
            >
              {depositing
                ? "Наливаем…"
                : hasPending
                  ? "⚗️ Влить " + pendingBalance + " ОУ"
                  : "Нет накоплений за день"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            className="mt-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-sm font-bold text-emerald-400">
              ✅ День подтверждён!
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {sentAmount} ОУ влито в колбу
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
