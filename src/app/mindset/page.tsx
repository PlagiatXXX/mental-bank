"use client";

import { useState, useEffect } from "react";
import ChapterInfo from "@/components/ChapterInfo";
import BackToTools from "@/components/BackToTools";

// ─── 3 ограничивающих убеждения ──────────────────────────────────────

interface Belief {
  id: string;
  label: string;
  icon: string;
  color: string;
  desc: string; // оттенок для текста описания
  bg: string;
  border: string;
  description: string;
  bookRef: string;
  antidote: string;
  affirmation: string;
  practice: string;
}

const beliefs: Belief[] = [
  {
    id: "perfectionism",
    label: "Перфекционизм",
    icon: "🎯",
    color: "text-rose-400",
    desc: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    description:
      "Стремление к совершенству — это не желание сделать хорошо, а страх сделать плохо. Перфекционист откладывает действие, потому что боится, что результат будет неидеальным.",
    bookRef:
      "Глава 6: «Перфекционизм — это не стремление к совершенству, а страх быть несовершенным. Разница критична.»",
    antidote:
      "Разрешите себе делать «достаточно хорошо». Идеал недостижим — он существует только в голове. Законченное «хорошо» намного ценнее незаконченного «идеально».",
    affirmation:
      "Я делаю свою лучшую работу прямо сейчас, и этого достаточно.",
    practice:
      "Поставьте таймер на 10 минут и начните делать то, что откладывали из-за страха несовершенства. Когда таймер сработает — оцените результат. Скорее всего, он намного лучше, чем вы думали.",
  },
  {
    id: "self-criticism",
    label: "Хроническая самокритика",
    icon: "🗣️",
    color: "text-amber-400",
    desc: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    description:
      "Вы верите, что быть жёстким к себе — значит быть честным. На самом деле самокритика истощает уверенность и ухудшает результат. Поддержка себя ведёт к лучшим результатам, чем самобичевание.",
    bookRef:
      "Глава 6: «Хроническая самокритика — не честность, а привычка. Она истощает уверенность, а не улучшает результат.»",
    antidote:
      "Говорите с собой как с лучшим другом. Если друг ошибся, вы бы его поддержали, а не уничтожили. Заслужите такого же отношения от себя.",
    affirmation:
      "Я учусь на своих ошибках и становлюсь сильнее. Я поддерживаю себя, даже когда неидеален.",
    practice:
      "Каждый раз, когда ловите себя на самокритике, переформулируйте: вместо «Какой я дурак» скажите «Я сделал ошибку, и это нормально. Что я узнал?»",
  },
  {
    id: "hyper-rationality",
    label: "Гиперлогичность",
    icon: "🧠",
    color: "text-sky-400",
    desc: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    description:
      "Попытка полностью понять и просчитать ситуацию перед действием. Но жизнь нелинейна, и полный контроль невозможен. Гиперлогичность — это замаскированный страх действовать в условиях неопределённости.",
    bookRef:
      "Глава 6: «Гиперлогичный человек откладывает действие, пока не соберёт всю информацию. Но полной информации не бывает.»",
    antidote:
      "Примите, что 100% информации никогда не будет. Действие в условиях 70% готовности — это смелость, а не безрассудство. Вы узнаете остальное по пути.",
    affirmation:
      "У меня достаточно информации, чтобы сделать первый шаг. Я разберусь с остальным по ходу.",
    practice:
      "Выберите задачу, которую вы откладывали из-за нехватки информации. Примите решение на основе 70% данных и сделайте первый шаг прямо сейчас.",
  },
];

// ─── Вопросы для диагностики ─────────────────────────────────────────

interface Question {
  text: string;
  scores: Record<string, number>; // beliefId → points
}

const questions: Question[] = [
  {
    text: "Я часто откладываю важные дела, потому что боюсь сделать их недостаточно хорошо.",
    scores: { perfectionism: 3, "self-criticism": 1, "hyper-rationality": 1 },
  },
  {
    text: "После ошибки я могу прокручивать её в голове часами, ругая себя.",
    scores: { perfectionism: 1, "self-criticism": 3, "hyper-rationality": 0 },
  },
  {
    text: "Мне нужно собрать максимум информации и всё тщательно обдумать, прежде чем начать.",
    scores: { perfectionism: 1, "self-criticism": 0, "hyper-rationality": 3 },
  },
  {
    text: "«Достаточно хорошо» — это не про меня. Если не идеально, то зачем вообще?",
    scores: { perfectionism: 3, "self-criticism": 2, "hyper-rationality": 0 },
  },
  {
    text: "Я часто говорю себе: «Ну вот, опять ты всё испортил».",
    scores: { perfectionism: 0, "self-criticism": 3, "hyper-rationality": 0 },
  },
  {
    text: "Я могу бесконечно изучать тему, но так и не начать действовать.",
    scores: { perfectionism: 0, "self-criticism": 0, "hyper-rationality": 3 },
  },
  {
    text: "Критика в мой адрес выбивает меня из колеи на весь день.",
    scores: { perfectionism: 2, "self-criticism": 3, "hyper-rationality": 0 },
  },
  {
    text: "Я предпочитаю не браться за задачу, если не уверен, что сделаю её отлично.",
    scores: { perfectionism: 3, "self-criticism": 1, "hyper-rationality": 1 },
  },
  {
    text: "Мне трудно принимать решения без полного анализа всех «за» и «против».",
    scores: { perfectionism: 0, "self-criticism": 0, "hyper-rationality": 3 },
  },
  {
    text: "Я считаю, что если не быть строгим к себе, то не будет и результата.",
    scores: { perfectionism: 1, "self-criticism": 3, "hyper-rationality": 1 },
  },
];

// ─── Режимы мышления ─────────────────────────────────────────────────

type Mode = "improvement" | "demonstration";

export default function MindsetPage() {
  const [step, setStep] = useState<"intro" | "quiz" | "result" | "practice">(
    "intro",
  );
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [dominantBelief, setDominantBelief] = useState<Belief | null>(null);
  const [mode, setMode] = useState<Mode>("improvement");
  const [modeTimer, setModeTimer] = useState(0);
  const [modeIsRunning, setModeIsRunning] = useState(false);

  // ── Quiz logic ──

  const startQuiz = () => {
    setStep("quiz");
    setAnswers([]);
    setCurrentQuestion(0);
    setScores(null);
    setDominantBelief(null);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((p) => p + 1);
    } else {
      // Calculate scores
      const total: Record<string, number> = {};
      for (let i = 0; i < questions.length; i++) {
        const weight = newAnswers[i] / 3; // 0..3 scale → weight
        for (const [beliefId, points] of Object.entries(questions[i].scores)) {
          total[beliefId] = (total[beliefId] || 0) + points * weight;
        }
      }
      setScores(total);

      // Find dominant
      const maxBelief = Object.entries(total).sort((a, b) => b[1] - a[1])[0][0];
      const found = beliefs.find((b) => b.id === maxBelief) ?? beliefs[0];
      setDominantBelief(found);

      setStep("result");
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((p) => p - 1);
      setAnswers((p) => p.slice(0, -1));
    }
  };

  // ── Mode switch logic ──

  const startModeTimer = () => {
    setModeTimer(30 * 60); // 30 minutes
    setModeIsRunning(true);
  };

  useEffect(() => {
    if (!modeIsRunning || modeTimer <= 0) return;
    const interval = setInterval(() => {
      setModeTimer((prev) => {
        if (prev <= 1) {
          setModeIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [modeIsRunning, modeTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // ── Render ──

  return (
    <div className="space-y-6">
      <BackToTools />

      <ChapterInfo
        chapterNumber={6}
        pageTitle="🧠 Решение быть другим"
        contextNote="Три ограничивающих убеждения — перфекционизм, самокритика и гиперлогичность — блокируют уверенность. Пройдите диагностику, чтобы узнать своё доминирующее убеждение, и научитесь переключаться из режима «улучшение» в режим «демонстрация»."
      />

      <h2 className="text-xl font-bold text-slate-100">
        <span aria-hidden="true">🧠</span> Решение быть другим
      </h2>
      <p className="text-xs text-slate-500">
        Глава 6. Выявите ограничивающие убеждения и переключитесь из режима
        «улучшение» в режим «демонстрация».
      </p>

      {/* INTRO */}
      {step === "intro" && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              Три ограничивающих убеждения
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {beliefs.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border ${b.border} ${b.bg} p-4`}
                >
                  <div className="mb-2 text-2xl text-center">{b.icon}</div>
                  <h4 className={`text-center text-sm font-semibold ${b.color}`}>
                    {b.label}
                  </h4>
                  <p className="mt-2 text-xs text-slate-500">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Пройдите короткую диагностику — узнайте, какое убеждение
            доминирует у вас, и получите план действий из книги.
          </p>

          <div className="flex justify-center">
            <button
              onClick={startQuiz}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 font-bold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 gold-glow"
            >
              🧠 Пройти диагностику
            </button>
          </div>
        </div>
      )}

      {/* QUIZ */}
      {step === "quiz" && (
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="text-xs text-slate-600">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          <p className="mb-6 text-base font-medium text-slate-100">
            {questions[currentQuestion].text}
          </p>

          <div className="space-y-2">
            {[
              { value: 0, label: "Совсем не про меня" },
              { value: 1, label: "Скорее не про меня" },
              { value: 2, label: "Отчасти про меня" },
              { value: 3, label: "Точно про меня" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                  answers[currentQuestion] === opt.value
                    ? "border-amber-500 bg-amber-500/15 text-amber-400"
                    : "border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-800/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <button
              onClick={goBack}
              className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-xs text-slate-400 transition-colors hover:border-slate-500"
            >
              ← Назад
            </button>
          )}
        </div>
      )}

      {/* RESULT */}
      {step === "result" && dominantBelief && scores && (
        <div className="space-y-6">
          {/* Dominant belief */}
          <div
            className={`glass-card rounded-2xl border text-center ${dominantBelief.border} p-6`}
          >
            <div className="mb-3 text-5xl">{dominantBelief.icon}</div>
            <h3 className={`mb-2 text-xl font-bold ${dominantBelief.color}`}>
              {dominantBelief.label}
            </h3>
            <p className={`text-sm ${dominantBelief.desc}`}>
              Ваше доминирующее ограничивающее убеждение
            </p>
          </div>

          {/* All scores */}
          <div className="glass-card rounded-2xl p-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-300">
              📊 Распределение
            </h4>
            <div className="space-y-2">
              {Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .map(([id, score]) => {
                  const bel = beliefs.find((b) => b.id === id)!;
                  const maxScore = Object.values(scores).reduce(
                    (s, v) => s + v,
                    0,
                  );
                  const pct =
                    maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <span className="w-6 text-center">{bel.icon}</span>
                      <span className="w-28 text-xs text-slate-400">
                        {bel.label}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className={`h-full rounded-full ${
                              id === dominantBelief.id
                                ? "bg-amber-500"
                                : "bg-slate-500"
                            } transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right text-xs text-slate-500">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Explanation from the book */}
          <div className={`glass-card rounded-2xl border ${dominantBelief.border} p-5`}>
            <h4 className={`mb-2 text-sm font-semibold ${dominantBelief.color}`}>
              📖 Из книги
            </h4>
            <p className="mb-4 text-sm italic leading-relaxed text-slate-400">
              {dominantBelief.bookRef}
            </p>
            <h4 className="mb-2 text-sm font-semibold text-emerald-400">
              💊 Противоядие
            </h4>
            <p className="mb-4 text-sm text-slate-300">
              {dominantBelief.antidote}
            </p>
            <h4 className="mb-2 text-sm font-semibold text-amber-400">
              💬 Аффирмация
            </h4>
            <p className="mb-4 text-sm text-slate-300">
              {dominantBelief.affirmation}
            </p>
            <h4 className="mb-2 text-sm font-semibold text-sky-400">
              🏋️ Практика
            </h4>
            <p className="text-sm text-slate-300">
              {dominantBelief.practice}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={startQuiz}
              className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500"
            >
              🔄 Пройти заново
            </button>
            <button
              onClick={() => setStep("practice")}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500"
            >
              ⚡ Режим демонстрации →
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE: Mode Switch */}
      {step === "practice" && (
        <div className="space-y-6">
          {/* Mode switcher */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-200">
              ⚡ Режим мышления
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              Ключевой сдвиг из Главы 6: во время подготовки вы улучшаете, во
              время выступления — демонстрируете. Не перепутайте.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setMode("improvement")}
                className={`flex-1 rounded-xl border px-6 py-4 text-center text-sm font-medium transition-all ${
                  mode === "improvement"
                    ? "border-amber-500 bg-amber-500/15 text-amber-400"
                    : "border-slate-600 text-slate-500 hover:border-slate-500"
                }`}
              >
                <div className="mb-1 text-xl">📚</div>
                <div>Улучшение</div>
                <div className="mt-0.5 text-[10px] opacity-70">
                  Тренировка / Подготовка
                </div>
              </button>
              <button
                onClick={() => setMode("demonstration")}
                className={`flex-1 rounded-xl border px-6 py-4 text-center text-sm font-medium transition-all ${
                  mode === "demonstration"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                    : "border-slate-600 text-slate-500 hover:border-slate-500"
                }`}
              >
                <div className="mb-1 text-xl">🎭</div>
                <div>Демонстрация</div>
                <div className="mt-0.5 text-[10px] opacity-70">
                  Выступление / Показ
                </div>
              </button>
            </div>

            {mode === "demonstration" && (
              <div className="mt-4">
                <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
                  <p className="text-sm text-emerald-300">
                    Сейчас не время улучшать себя. Сейчас время показать,
                    на что вы способны.
                  </p>
                </div>
              </div>
            )}
            {mode === "improvement" && (
              <div className="mt-4">
                <div className="rounded-xl bg-amber-500/10 p-4 text-center">
                  <p className="text-sm text-amber-300">
                    Сейчас время учиться, пробовать, ошибаться и расти.
                    Результат не важен — важен прогресс.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Demonstration timer */}
          <div className="glass-card rounded-2xl p-6 text-center">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              ⏱ Таймер демонстрации
            </h3>
            <p className="mb-4 text-xs text-slate-500">
              Включите таймер на время выступления, чтобы напоминать себе:
              сейчас я показываю, а не улучшаю.
            </p>

            {!modeIsRunning && modeTimer === 0 && (
              <button
                onClick={startModeTimer}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 font-bold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500"
              >
                ▶ Начать (30 мин)
              </button>
            )}

            {modeIsRunning && (
              <div>
                <div className="mb-3 text-4xl font-bold tabular-nums text-amber-400">
                  {formatTime(modeTimer)}
                </div>
                <p className="text-xs text-slate-500">
                  Осталось времени демонстрации
                </p>
              </div>
            )}

            {!modeIsRunning && modeTimer > 0 && (
              <div>
                <div className="mb-3 text-4xl font-bold tabular-nums text-slate-400">
                  {formatTime(modeTimer)}
                </div>
                <p className="text-xs text-slate-500">Таймер завершён</p>
                <button
                  onClick={startModeTimer}
                  className="mt-4 rounded-xl border border-slate-600 px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500"
                >
                  🔄 Повторить
                </button>
              </div>
            )}

            {modeIsRunning && (
              <button
                onClick={() => {
                  setModeIsRunning(false);
                  setModeTimer(0);
                }}
                className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-xs text-slate-400"
              >
                ✋ Завершить
              </button>
            )}
          </div>

          {/* Quick reference */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-300">
              📋 Когда какой режим
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-amber-500/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-amber-400">
                  📚 Режим улучшения
                </h4>
                <ul className="space-y-1 text-xs text-slate-500">
                  <li>• Тренировки и репетиции</li>
                  <li>• Изучение нового материала</li>
                  <li>• AAR-разбор после выступления</li>
                  <li>• ESP-журнал и рефлексия</li>
                  <li>• Создание аффирмаций</li>
                </ul>
              </div>
              <div className="rounded-xl bg-emerald-500/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-emerald-400">
                  🎭 Режим демонстрации
                </h4>
                <ul className="space-y-1 text-xs text-slate-500">
                  <li>• Само выступление</li>
                  <li>• Соревнование / экзамен</li>
                  <li>• Важная встреча</li>
                  <li>• Презентация</li>
                  <li>• Сложный разговор</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back to start */}
          <div className="flex justify-center">
            <button
              onClick={() => setStep("intro")}
              className="rounded-lg border border-slate-600 px-4 py-2 text-xs text-slate-400 transition-colors hover:border-slate-500"
            >
              ← К диагностике
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
