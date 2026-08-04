"use client";

import { useEffect, useState, useCallback } from "react";
import { validateAffirmation } from "@/lib/validation";
import ChapterInfo from "@/components/ChapterInfo";

interface Affirmation {
  id: string;
  text: string;
  context: string | null;
  isValid: boolean;
  hitCount: number;
  createdAt: string;
}

export default function AffirmationsPage() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchAffirmations = useCallback(async () => {
    try {
      const res = await fetch("/api/affirmations");
      if (res.ok) setAffirmations(await res.json());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/affirmations")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setAffirmations(data);
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validation = text.trim() ? validateAffirmation(text) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !validation?.passed) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          context: context.trim() || null,
        }),
      });
      if (res.ok) {
        setText("");
        setContext("");
        await fetchAffirmations();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleHit = async (a: Affirmation) => {
    try {
      await fetch("/api/affirmations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, hitCount: a.hitCount + 1 }),
      });
      setAffirmations((prev) =>
        prev.map((x) =>
          x.id === a.id ? { ...x, hitCount: x.hitCount + 1 } : x,
        ),
      );
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/affirmations?id=${id}`, { method: "DELETE" });
      setAffirmations((prev) => prev.filter((x) => x.id !== id));
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка аффирмаций…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChapterInfo
        chapterNumber={3}
        pageTitle="💬 Счёт 2 — Аффирмации"
        contextNote="Аффирмации работают только если соблюдены 5 правил: первое лицо, настоящее время, позитив, точность, сила. Форма ниже проверяет каждое правило в реальном времени."
      />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">
          <span aria-hidden="true">💬</span> Счёт 2 — Аффирмации
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Глава 3. Конструктивные утверждения по 5 правилам. Повторение —
          ключ к пополнению Счёта №2.
        </p>
      </div>

      {/* Creation form */}
      <form onSubmit={handleSubmit} className="glass-card space-y-4 rounded-2xl p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">
            Текст аффирмации
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Я уверенно и чётко отвечаю на вопросы совета директоров"
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            rows={2}
            maxLength={300}
            required
          />

          {/* Live validation result */}
          {validation && (
            <div className="mt-3 space-y-1.5">
              {validation.checks.map((check) => (
                <div
                  key={check.rule}
                  className={`flex items-start gap-2 text-xs ${
                    check.passed ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  <span className="mt-0.5">
                    {check.passed ? "✅" : "❌"}
                  </span>
                  <div>
                    <span className="font-medium">{check.rule}</span>
                    {!check.passed && (
                      <p className="text-slate-500">{check.hint}</p>
                    )}
                  </div>
                </div>
              ))}
              {validation.passed && (
                <p className="mt-2 text-xs font-medium text-emerald-400">
                  ✅ Все 5 правил соблюдены. Аффирмация готова к использованию!
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">
            Контекст (необязательно)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Например: перед презентацией, перед тренировкой"
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || !validation?.passed}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
        >
          {isSaving ? "Сохраняю…" : "💾 Добавить аффирмацию"}
        </button>
      </form>

      {/* List */}
      {affirmations.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mb-3 text-4xl">💬</div>
          <p className="mb-2 text-slate-300">
            У вас пока нет аффирмаций
          </p>
          <p className="text-xs text-slate-500">
            Создайте первую аффирмацию по 5 правилам из Главы 3
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {affirmations.length} аффирмаций • всего{" "}
              {affirmations.reduce((s, a) => s + a.hitCount, 0)} повторений
            </p>
          </div>
          {affirmations.map((a) => (
            <div
              key={a.id}
              className="glass-card group flex items-start gap-3 rounded-2xl p-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100">
                  {a.text}
                </p>
                {a.context && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    📌 {a.context}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                  <span>🔄 {a.hitCount} раз</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleHit(a)}
                  className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25"
                  title="Повторить аффирмацию"
                >
                  🔄 +1
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 transition-colors hover:bg-rose-500/20"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
