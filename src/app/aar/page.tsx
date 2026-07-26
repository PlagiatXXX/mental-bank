"use client";

import { useEffect, useState, useCallback } from "react";
import { assessAARBalance } from "@/lib/validation";
import ChapterInfo from "@/components/ChapterInfo";

interface AAR {
  id: string;
  eventTitle: string;
  whatHappened: string | null;
  soWhat: string | null;
  nowWhat: string | null;
  balanceType: "win" | "loss";
  lessons: string | null;
  createdAt: string;
}

const emptyForm = () => ({
  eventTitle: "",
  whatHappened: "",
  soWhat: "",
  nowWhat: "",
  balanceType: "loss" as "win" | "loss",
});

export default function AARPage() {
  const [aars, setAars] = useState<AAR[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAar, setSelectedAar] = useState<AAR | null>(null);

  const fetchAars = useCallback(async () => {
    try {
      const res = await fetch("/api/aar");
      if (res.ok) setAars(await res.json());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAars();
  }, [fetchAars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventTitle.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/aar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(emptyForm());
        setShowForm(false);
        await fetchAars();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/aar?id=${id}`, { method: "DELETE" });
      setAars((prev) => prev.filter((x) => x.id !== id));
      if (selectedAar?.id === id) setSelectedAar(null);
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChapterInfo
        chapterNumber={9}
        pageTitle="🔄 AAR — After Action Review"
        contextNote="AAR — самая важная практика для обеспечения следующей Первой Победы. Три вопроса: Что произошло? → И что это значит? → Что теперь делать? Правило 80/20 зависит от того, победа это или поражение."
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            <span aria-hidden="true">🔄</span> AAR — After Action Review
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Глава 9. Разбор выступления: Что? → И что? → Что теперь?
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/30"
        >
          + Новый AAR
        </button>
      </div>

      {/* Empty state */}
      {aars.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mb-3 text-4xl">🔄</div>
          <p className="mb-2 text-slate-300">
            Ни одного разбора пока нет
          </p>
          <p className="text-xs text-slate-500">
            AAR помогает извлечь уроки из каждого выступления и пополнить
            ментальный банковский счёт
          </p>
        </div>
      )}

      {/* AAR Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 space-y-5"
          >
            <h3 className="text-lg font-bold text-slate-100">
              ✍️ Новый разбор
            </h3>

            {/* Event title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Название события
              </label>
              <input
                type="text"
                value={form.eventTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventTitle: e.target.value }))
                }
                placeholder="Например: Презентация проекта, Собеседование, Тренировка"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
                autoFocus
              />
            </div>

            {/* Balance type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Это был:
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, balanceType: "loss" }))}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    form.balanceType === "loss"
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                      : "border-slate-600 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  ⚠️ Проигрыш / Неудача
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, balanceType: "win" }))}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    form.balanceType === "win"
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                      : "border-slate-600 text-slate-500 hover:border-slate-500"
                  }`}
                >
                  🏆 Победа / Успех
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {form.balanceType === "loss"
                  ? "Фокус 80% на успехах, 20% на ошибках (правило из Главы 9)"
                  : "Фокус 60% на ошибках, 40% на успехах (чтобы не расслабляться)"}
              </p>
            </div>

            {/* Step 1: What */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                  1
                </span>
                <label className="text-sm font-medium text-amber-400">
                  Что произошло?
                </label>
              </div>
              <p className="mb-2 text-xs text-slate-600">
                Объективная картина: результат, лучшие моменты (80%), ошибка
                (20%).
              </p>
              <textarea
                value={form.whatHappened}
                onChange={(e) =>
                  setForm((f) => ({ ...f, whatHappened: e.target.value }))
                }
                placeholder="Что получилось хорошо? Какой момент был лучшим? Что бы я вернул?"
                className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={4}
              />
            </div>

            {/* Step 2: So What */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  2
                </span>
                <label className="text-sm font-medium text-emerald-400">
                  И что это значит?
                </label>
              </div>
              <p className="mb-2 text-xs text-slate-600">
                Какие уроки? Что я узнал о себе? Какие сильные/слабые стороны
                выявило это выступление?
              </p>
              <textarea
                value={form.soWhat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, soWhat: e.target.value }))
                }
                placeholder="Я узнал, что могу... Мне нужно поработать над... Этот опыт научил меня..."
                className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={4}
              />
            </div>

            {/* Step 3: Now What */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">
                  3
                </span>
                <label className="text-sm font-medium text-sky-400">
                  Что теперь делать?
                </label>
              </div>
              <p className="mb-2 text-xs text-slate-600">
                Что продолжу делать? Что начну? Что прекращу? Какие
                аффирмации из этого следуют?
              </p>
              <textarea
                value={form.nowWhat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nowWhat: e.target.value }))
                }
                placeholder="Я продолжу... Я начну... Я перестану... Моя новая аффирмация: Я всегда..."
                className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                {isSaving ? "Сохраняю…" : "💾 Сохранить AAR"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AAR list */}
      {aars.length > 0 && (
        <div className="grid gap-4">
          {aars.map((aar) => (
            <div
              key={aar.id}
              onClick={() =>
                setSelectedAar(selectedAar?.id === aar.id ? null : aar)
              }
              className={`glass-card cursor-pointer rounded-2xl border p-5 transition-all ${
                selectedAar?.id === aar.id
                  ? "border-amber-500/30"
                  : "border-transparent hover:border-slate-600/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      aar.balanceType === "win"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {aar.balanceType === "win" ? "🏆" : "⚠️"}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {aar.eventTitle}
                  </h3>
                </div>
                <span className="text-xs text-slate-600">
                  {new Date(aar.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {/* Expanded details */}
              {selectedAar?.id === aar.id && (
                <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
                  {aar.whatHappened && (
                    <div>
                      <span className="text-xs font-semibold text-amber-400">
                        🔍 Что произошло:
                      </span>
                      <p className="mt-1 text-sm text-slate-300">
                        {aar.whatHappened}
                      </p>
                    </div>
                  )}
                  {aar.soWhat && (
                    <div>
                      <span className="text-xs font-semibold text-emerald-400">
                        💡 И что это значит:
                      </span>
                      <p className="mt-1 text-sm text-slate-300">
                        {aar.soWhat}
                      </p>
                    </div>
                  )}
                  {aar.nowWhat && (
                    <div>
                      <span className="text-xs font-semibold text-sky-400">
                        🎯 Что теперь:
                      </span>
                      <p className="mt-1 text-sm text-slate-300">
                        {aar.nowWhat}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(aar.id);
                    }}
                    className="mt-2 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 transition-colors hover:bg-rose-500/20"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
