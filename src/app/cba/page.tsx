"use client";

import { useState, useRef, useCallback } from "react";
import ChapterInfo from "@/components/ChapterInfo";

type Phase = "center" | "breathe" | "act" | "idle";

const phaseData: Record<
  Phase,
  { label: string; description: string; duration: number; color: string }
> = {
  idle: { label: "", description: "", duration: 0, color: "" },
  center: {
    label: "Center — Центр",
    description:
      "Почувствуйте центр тела. Стопы на полу, спина прямая. Вес равномерно распределён. Вы здесь и сейчас.",
    duration: 5,
    color: "from-amber-500/30 to-amber-600/30 border-amber-500",
  },
  breathe: {
    label: "Breathe — Вдох",
    description:
      "Медленный глубокий вдох животом (4 сек). Задержка (2 сек). Выдох (6 сек). Чувствуете, как напряжение уходит?",
    duration: 12,
    color: "from-emerald-500/30 to-emerald-600/30 border-emerald-500",
  },
  act: {
    label: "Act — Действие",
    description:
      "Сразу после выдоха — действуйте. Не думайте. Не анализируйте. Просто сделайте следующий шаг. Вы готовы.",
    duration: 3,
    color: "from-sky-500/30 to-sky-600/30 border-sky-500",
  },
};

export default function CBAPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPhase = (nextPhase: Phase) => {
    stopTimer();
    if (nextPhase === "idle") {
      setPhase("idle");
      setTimer(0);
      setIsRunning(false);
      return;
    }

    setPhase(nextPhase);
    setTimer(phaseData[nextPhase].duration);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          stopTimer();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const runFullCBA = () => {
    startPhase("center");
    // После center → breathe → act автоматически
    setTimeout(() => startPhase("breathe"), phaseData.center.duration * 1000 + 200);
    setTimeout(
      () => startPhase("act"),
      (phaseData.center.duration + phaseData.breathe.duration) * 1000 + 400,
    );
    setTimeout(
      () => {
        setPhase("idle");
        setTimer(0);
        setIsRunning(false);
      },
      (phaseData.center.duration + phaseData.breathe.duration + phaseData.act.duration) *
        1000 +
        600,
    );
  };

  const progress =
    phase !== "idle"
      ? ((phaseData[phase].duration - timer) / phaseData[phase].duration) * 100
      : 0;

  return (
    <div className="space-y-6">
      <ChapterInfo
        chapterNumber={8}
        pageTitle="🌬️ C-B-A — Центр • Дыхание • Действие"
        contextNote="C-B-A — это 3-секундная микро-рутина для возврата в состояние уверенности прямо во время выступления. Используйте её когда чувствуете, что мысли разбегаются или дыхание становится поверхностным."
      />

      <h2 className="text-xl font-bold text-slate-100">
        <span aria-hidden="true">🌬️</span> C-B-A — Центр • Дыхание • Действие
      </h2>
      <p className="text-xs text-slate-500">
        Глава 8. Микро-рутина для возврата в состояние уверенности прямо во
        время выступления. Весь цикл — 3–5 секунд.
      </p>

      {/* CBA Card */}
      <div
        className={`glass-card rounded-2xl border-2 p-8 text-center transition-all ${
          phase !== "idle"
            ? phaseData[phase].color
            : "border-slate-700/50"
        }`}
      >
        {/* Phase indicator */}
        {phase !== "idle" && (
          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Фаза {["center", "breathe", "act"].indexOf(phase) + 1} из 3
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              {phaseData[phase].label}
            </h3>
          </div>
        )}

        {phase === "idle" ? (
          <>
            {/* Idle state */}
            <div className="mb-6 text-6xl">🌬️</div>
            <p className="mb-6 text-sm text-slate-400">
              Когда чувствуете, что уверенность ускользает — нажмите старт.
              Микро-рутина займёт 20 секунд.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={runFullCBA}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 font-bold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500"
              >
                ▶ Запустить C-B-A
              </button>
              <button
                onClick={() => startPhase("center")}
                className="rounded-xl border border-slate-600 px-6 py-4 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500"
              >
                ⏱ Пошагово
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Active phase */}
            <div className="mb-4 text-6xl">
              {phase === "center" && "🧘"}
              {phase === "breathe" && "🌬️"}
              {phase === "act" && "⚡"}
            </div>

            <p className="mb-6 text-sm text-slate-300">
              {phaseData[phase].description}
            </p>

            {/* Timer */}
            <div className="mb-4">
              <div className="text-5xl font-bold tabular-nums text-slate-100">
                {timer}
              </div>
              <div className="text-xs text-slate-500">секунд</div>
            </div>

            {/* Progress bar */}
            <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={() => startPhase("idle")}
              className="mt-6 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-slate-500"
            >
              ✋ Завершить
            </button>
          </>
        )}
      </div>

      {/* Diaphragmatic breathing guide */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-semibold text-emerald-400">
          🌬️ Диафрагмальное дыхание (Глава 8)
        </h3>
        <p className="mb-3 text-sm text-slate-400">
          Главный физиологический инструмент управления стрессом. Активирует
          парасимпатическую нервную систему.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-800/50 p-3">
            <div className="mb-1 text-center text-lg">⬆️</div>
            <p className="text-xs font-medium text-slate-300">Вдох (4 сек)</p>
            <p className="text-xs text-slate-500">
              Медленно через нос. Живот надувается, плечи неподвижны.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3">
            <div className="mb-1 text-center text-lg">⏸️</div>
            <p className="text-xs font-medium text-slate-300">Задержка (2 сек)</p>
            <p className="text-xs text-slate-500">
              Мягкая пауза. Не зажимайтесь.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3">
            <div className="mb-1 text-center text-lg">⬇️</div>
            <p className="text-xs font-medium text-slate-300">Выдох (6 сек)</p>
            <p className="text-xs text-slate-500">
              Медленно через рот. Живот опускается. Всё напряжение уходит.
            </p>
          </div>
          <div className="rounded-xl bg-slate-800/50 p-3">
            <div className="mb-1 text-center text-lg">🔄</div>
            <p className="text-xs font-medium text-slate-300">Повтор (10 циклов)</p>
            <p className="text-xs text-slate-500">
              Практикуйте ежедневно по 5 минут, чтобы закрепить навык.
            </p>
          </div>
        </div>
      </div>

      {/* Quick reference */}
      <div className="glass-card rounded-2xl border border-slate-700/50 p-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">
          📋 Когда применять C-B-A
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Почувствовали, что мысли разбегаются</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Дыхание стало поверхностным и частым</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Тело напряглось, плечи поднялись</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Поймали себя на самокритике во время выступления</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Нужно переключиться между задачами</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
