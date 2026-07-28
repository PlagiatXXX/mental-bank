"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ChapterInfo from "@/components/ChapterInfo";
import BackToTools from "@/components/BackToTools";

// ─── Helpers ─────────────────────────────────────────────────────────

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

// ─── Types ───────────────────────────────────────────────────────────

type RitualPhase =
  | "idle"
  | "awareness"
  | "silence"
  | "breathe"
  | "restore"
  | "done";

interface Attack {
  id: string;
  source: string;
  type: "internal" | "external";
  context: string;
  defence: string | null;
  resolved: boolean;
  createdAt: string;
}

interface RecoveryItem {
  type: "esp" | "affirmation" | "victory" | "quote";
  content: string;
  label: string;
}

// ─── Recovery helpers ────────────────────────────────────────────────

const QUOTE_FALLBACKS: RecoveryItem[] = [
  {
    type: "quote",
    content:
      "Уверенность без защиты — всё равно что банк с открытыми дверями. Рано или поздно его ограбят.",
    label: "📖 Нейт Зинссер",
  },
  {
    type: "quote",
    content:
      "Вы не можете запретить птицам пролетать над вашей головой, но вы можете запретить им вить гнёзда в ваших волосах.",
    label: "📖 Нейт Зинссер",
  },
  {
    type: "quote",
    content:
      "Недостаточно просто построить уверенность — её нужно защищать. Каждый день происходят атаки.",
    label: "📖 Нейт Зинссер",
  },
];

async function fetchRecoveryItems(): Promise<RecoveryItem[]> {
  const items: RecoveryItem[] = [];

  try {
    const [espRes, affRes, vicRes] = await Promise.all([
      fetch("/api/esp?limit=20"),
      fetch("/api/affirmations"),
      fetch("/api/victories"),
    ]);

    if (espRes.ok) {
      const entries = await espRes.json();
      for (const e of entries) {
        const text = e.event || e.content || e.text;
        if (text?.trim()) {
          items.push({ type: "esp", content: text.trim(), label: "📝 ESP" });
        }
      }
    }

    if (affRes.ok) {
      const affs = await affRes.json();
      for (const a of affs) {
        const text = a.text || a.content;
        if (text?.trim()) {
          items.push({
            type: "affirmation",
            content: text.trim(),
            label: "💬 Аффирмация",
          });
        }
      }
    }

    if (vicRes.ok) {
      const victs = await vicRes.json();
      for (const v of victs) {
        const text = v.text || v.content || v.title;
        if (text?.trim()) {
          items.push({
            type: "victory",
            content: text.trim(),
            label: "🏆 Топ-10",
          });
        }
      }
    }
  } catch {
    // fall back to quotes
  }

  // Add quotes as extra options
  items.push(...QUOTE_FALLBACKS);

  // Shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

// ─── Breathing timer hook ────────────────────────────────────────────

function useBreathing(phase: RitualPhase, onDone: () => void) {
  const [breathCycle, setBreathCycle] = useState(0);
  const [isInhaling, setIsInhaling] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Reset when leaving breathe phase
  useEffect(() => {
    if (phase !== "breathe") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(false);
    }
  }, [phase]);

  // Run breathing timer when active
  useEffect(() => {
    if (phase !== "breathe" || !isActive) return;

    const CYCLE_MS = 3000;
    let cancelled = false;
    let tickCount = 0;

    const tick = () => {
      if (cancelled) return;
      tickCount++;

      if (tickCount % 2 === 1) {
        setIsInhaling(true);
      } else {
        setIsInhaling(false);
        setBreathCycle((c) => {
          if (cancelled) return c;
          const next = c + 1;
          if (next >= 3) {
            setTimeout(() => onDoneRef.current(), 0);
            return 3;
          }
          return next;
        });
      }

      if (!cancelled) {
        timerRef.current = setTimeout(tick, CYCLE_MS);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, isActive]);

  const startBreathing = () => {
    setBreathCycle(0);
    setIsInhaling(false);
    setIsActive(true);
  };

  return { breathCycle, isInhaling, isActive, startBreathing };
}

// ─── Main component ──────────────────────────────────────────────────

export default function ProtectionPage() {
  // Attacks
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ritual
  const [phase, setPhase] = useState<RitualPhase>("idle");
  const [attackType, setAttackType] = useState<"internal" | "external">("external");
  const [source, setSource] = useState("");
  const [currentAttackId, setCurrentAttackId] = useState<string | null>(null);
  const [recoveryItems, setRecoveryItems] = useState<RecoveryItem[]>([]);
  const [recoveryIndex, setRecoveryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // ── Data fetching ──
  const fetchAttacks = useCallback(async () => {
    try {
      const res = await fetch("/api/attacks");
      if (res.ok) setAttacks(await res.json());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAttacks();
  }, [fetchAttacks]);

  // ── Ritual flow ──

  const resetRitual = useCallback(() => {
    setPhase("idle");
    setAttackType("external");
    setSource("");
    setCurrentAttackId(null);
    setRecoveryItems([]);
    setRecoveryIndex(0);
    setIsSaving(false);
  }, []);

  const handleAwarenessDone = async () => {
    if (!attackType || !source.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/attacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source.trim(),
          type: attackType,
          context: `Атака зафиксирована через 4 шага защиты. Источник: ${source.trim()}`,
        }),
      });
      if (res.ok) {
        const attack = await res.json();
        setCurrentAttackId(attack.id);
        setPhase("silence");
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleSilenceDone = () => {
    setPhase("breathe");
  };

  const handleBreathDone = useCallback(() => {
    // Start fetching recovery content
    fetchRecoveryItems().then((items) => {
      setRecoveryItems(items);
      setRecoveryIndex(0);
      setPhase("restore");
    });
  }, []);

  const { breathCycle, isInhaling, isActive, startBreathing } = useBreathing(phase, handleBreathDone);

  const handleRestoreDone = async () => {
    if (!currentAttackId) return;
    try {
      await fetch("/api/attacks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentAttackId,
          resolved: true,
          defence: "4 шага защиты",
        }),
      });
      fetchAttacks();
    } catch {
      // silently fail
    }
    setPhase("done");
    setTimeout(resetRitual, 2500);
  };

  const nextRecoveryItem = () => {
    setRecoveryIndex((i) => (i + 1) % Math.max(recoveryItems.length, 1));
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackToTools />
        <ChapterInfo
          chapterNumber={5}
          pageTitle="🛡️ Защита уверенности"
          contextNote="Уверенность — ценный ресурс, который нужно защищать. 4 шага защиты — это алгоритм немедленного реагирования на любую атаку: внешнюю или внутреннюю."
        />
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-pulse text-slate-600">Загрузка…</div>
        </div>
      </div>
    );
  }

  // ── Ritual screens ──
  if (phase !== "idle") {
    return (
      <div className="space-y-6">
        <BackToTools />
        <ChapterInfo
          chapterNumber={5}
          pageTitle="🛡️ Защита уверенности"
          contextNote="Уверенность — ценный ресурс, который нужно защищать. 4 шага защиты — это алгоритм немедленного реагирования на любую атаку: внешнюю или внутреннюю."
        />

        {phase === "awareness" && (
          <div className="relative glass-card rounded-2xl border border-rose-500/30 p-6 sm:p-8">
            <button
              onClick={resetRitual}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-3xl">
              🛡️
            </div>

            <h2 className="mb-1 text-center text-lg font-bold text-slate-100">
              Шаг 1 из 4: Осознать
            </h2>
            <p className="mb-6 text-center text-sm text-slate-500">
              Заметьте, что произошла атака. Скажите себе: <br />
              <span className="font-medium text-slate-300">
                «Мою уверенность атакуют»
              </span>
            </p>

            {/* Type selector */}
            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setAttackType("external")}
                className={`cursor-pointer rounded-xl border-2 p-4 text-center text-sm font-medium transition-all ${
                  attackType === "external"
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-400"
                    : "border-slate-600 text-slate-500 hover:border-slate-500"
                }`}
              >
                <div className="mb-1 text-2xl">🔴</div>
                <div>Внешняя</div>
                <div className="text-[11px] opacity-60">люди, критика</div>
              </button>
              <button
                onClick={() => setAttackType("internal")}
                className={`cursor-pointer rounded-xl border-2 p-4 text-center text-sm font-medium transition-all ${
                  attackType === "internal"
                    ? "border-rose-500/60 bg-rose-500/15 text-rose-400"
                    : "border-slate-600 text-slate-500 hover:border-slate-500"
                }`}
              >
                <div className="mb-1 text-2xl">🟡</div>
                <div>Внутренняя</div>
                <div className="text-[11px] opacity-60">мысли, сомнения</div>
              </button>
            </div>

            {/* Source */}
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Кто или что атаковало?"
              className="mb-6 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              autoFocus
            />

            <button
              onClick={handleAwarenessDone}
              disabled={!attackType || !source.trim() || isSaving}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 py-3 font-semibold text-white transition-all hover:from-rose-400 hover:to-rose-500 disabled:opacity-40"
            >
              {isSaving ? "Сохраняю…" : "→ Я заметил(а) атаку"}
            </button>
          </div>
        )}

        {phase === "silence" && (
          <div className="relative glass-card rounded-2xl border border-violet-500/30 p-6 text-center sm:p-8">
            <button
              onClick={resetRitual}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-3xl">
              🤫
            </div>

            <h2 className="mb-1 text-lg font-bold text-slate-100">
              Шаг 2 из 4: Заглушить
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Остановите источник атаки прямо сейчас.
            </p>

            <div className="mb-8 space-y-3 text-left">
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-3">
                <span className="mt-0.5 text-lg">🚪</span>
                <div>
                  <div className="text-sm font-medium text-slate-200">Выйдите</div>
                  <div className="text-xs text-slate-500">
                    Из разговора, из комнаты, из переписки
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-3">
                <span className="mt-0.5 text-lg">🔇</span>
                <div>
                  <div className="text-sm font-medium text-slate-200">Скажите «Стоп»</div>
                  <div className="text-xs text-slate-500">
                    Вслух или про себя. Твёрдо и без объяснений
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-3">
                <span className="mt-0.5 text-lg">⏸️</span>
                <div>
                  <div className="text-sm font-medium text-slate-200">Замрите на 5 секунд</div>
                  <div className="text-xs text-slate-500">
                    Не анализируйте, не спорьте. Просто тишина
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSilenceDone}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 py-3 font-semibold text-white transition-all hover:from-violet-400 hover:to-violet-500"
            >
              → Заглушил(а)
            </button>
          </div>
        )}

        {phase === "breathe" && (
          <div className="relative glass-card rounded-2xl border border-sky-500/30 p-6 text-center sm:p-8">
            <button
              onClick={resetRitual}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <h2 className="mb-1 text-lg font-bold text-slate-100">
              Шаг 3 из 4: Переключить
            </h2>

            {!isActive ? (
              <>
                <p className="mb-6 text-sm text-slate-500">
                  3 глубоких вдоха. Нажмите «Начать», когда будете готовы.
                </p>

                <div className="mx-auto mb-8 flex items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-cyan-500/20 text-4xl opacity-40">
                    🌬️
                  </div>
                </div>

                <button
                  onClick={startBreathing}
                  className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 py-3 font-semibold text-white transition-all hover:from-sky-400 hover:to-cyan-400"
                >
                  → Начать
                </button>
              </>
            ) : (
              <>
                <p className="mb-6 text-sm text-slate-500">
                  Следите за кругом.
                </p>

                <div className="mx-auto mb-3 flex h-48 w-48 items-center justify-center">
                  <div
                    className="flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400/30 to-cyan-500/30 text-2xl font-bold text-sky-300 transition-all duration-[3s] ease-in-out"
                    style={{
                      width: isInhaling ? "10rem" : "7rem",
                      height: isInhaling ? "10rem" : "7rem",
                    }}
                  >
                    {isInhaling ? "🌬️" : "😮‍💨"}
                  </div>
                </div>

                <div className="mb-2 text-sm font-medium text-sky-400">
                  {isInhaling ? "Вдох..." : "Выдох..."}
                </div>
                <div className="mb-6 text-xs text-slate-600">
                  Цикл {breathCycle + 1} из 3
                </div>

                <div className="mb-6 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-all ${
                        i <= breathCycle ? "bg-sky-400" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleBreathDone}
                  className="w-full cursor-pointer rounded-xl border border-sky-500/50 bg-sky-500/10 py-3 font-medium text-sky-400 transition-colors hover:bg-sky-500/20"
                >
                  → Готово
                </button>
              </>
            )}
          </div>
        )}

        {phase === "restore" && (
          <div className="relative glass-card rounded-2xl border border-emerald-500/30 p-6 text-center sm:p-8">
            <button
              onClick={resetRitual}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-sm text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
              💪
            </div>

            <h2 className="mb-1 text-lg font-bold text-slate-100">
              Шаг 4 из 4: Восстановить
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Напомните себе, что у вас уже есть.
            </p>

            {recoveryItems.length > 0 ? (
              <div className="mb-6 rounded-xl border border-slate-700/60 bg-slate-800/50 p-5 text-left">
                <div className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {recoveryItems[recoveryIndex].label}
                </div>
                <p className="text-base leading-relaxed text-slate-200">
                  «{recoveryItems[recoveryIndex].content}»
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-xl bg-slate-800/50 p-5">
                <div className="animate-pulse text-sm text-slate-500">
                  Загружаем ваши записи…
                </div>
              </div>
            )}

            {recoveryItems.length > 1 && (
              <button
                onClick={nextRecoveryItem}
                className="mb-4 w-full cursor-pointer rounded-xl border border-slate-600 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
              >
                ← Не помогло — покажи другое
              </button>
            )}

            <button
              onClick={handleRestoreDone}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 font-semibold text-white transition-all hover:from-emerald-400 hover:to-emerald-500"
            >
              ✅ Я в порядке! Атака отражена
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="glass-card rounded-2xl border border-emerald-500/40 p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-5xl">
              ✅
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-100">
              Атака отражена
            </h2>
            <p className="text-sm text-slate-500">
              Вы защитили свою уверенность. Доказательство сохранено.
            </p>
            <div className="mt-6 text-xs text-slate-600">
              Автоматический возврат через 2 секунды…
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Idle: main page ──
  const resolvedCount = attacks.filter((a) => a.resolved).length;

  return (
    <div className="space-y-6">
      <BackToTools />

      <ChapterInfo
        chapterNumber={5}
        pageTitle="🛡️ Защита уверенности"
        contextNote="Уверенность — ценный ресурс, который нужно защищать. 4 шага защиты — это алгоритм немедленного реагирования на любую атаку: внешнюю или внутреннюю."
      />

      {/* Big attack button */}
      <button
        onClick={() => {
          resetRitual();
          setPhase("awareness");
        }}
        className="group w-full cursor-pointer rounded-2xl border-2 border-dashed border-rose-500/40 bg-rose-500/5 p-8 text-center transition-all hover:border-rose-500/60 hover:bg-rose-500/10"
      >
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-3xl transition-transform group-hover:scale-110">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-rose-400">Атака!</h2>
        <p className="mt-1 text-sm text-slate-500">
          Нажмите, когда уверенность под угрозой
        </p>
        {resolvedCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <span>✅</span>
            <span>{resolvedCount} {pluralize(resolvedCount, "атака", "атаки", "атак")} отражено</span>
          </div>
        )}
        {resolvedCount === 0 && (
          <div className="mt-4 inline-block rounded-full bg-slate-800 px-4 py-1.5 text-sm text-slate-500">
            Пока не было атак
          </div>
        )}
      </button>

      {/* Quick 4 steps reference */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-center">
          <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-400">1</div>
          <div className="text-[11px] font-medium text-slate-400">Осознать</div>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-2.5 text-center">
          <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">2</div>
          <div className="text-[11px] font-medium text-slate-400">Заглушить</div>
        </div>
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-2.5 text-center">
          <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">3</div>
          <div className="text-[11px] font-medium text-slate-400">Переключить</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
          <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">4</div>
          <div className="text-[11px] font-medium text-slate-400">Восстановить</div>
        </div>
      </div>

      {/* Attack log */}
      {attacks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400">
            📋 Журнал атак ({attacks.length})
          </h3>
          {attacks.map((attack) => (
            <div
              key={attack.id}
              className={`glass-card rounded-2xl border p-4 ${
                attack.resolved
                  ? "border-emerald-500/20"
                  : "border-rose-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="mt-0.5 shrink-0">
                    {attack.type === "external" ? "🔴" : "🟡"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {attack.source}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(attack.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>
                {attack.resolved && (
                  <span className="shrink-0 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                    ✅ Защищено
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {attacks.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">
            Здесь появятся атаки, которые вы отразили.
          </p>
        </div>
      )}
    </div>
  );
}
