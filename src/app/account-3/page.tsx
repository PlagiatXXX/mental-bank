"use client";

import { useEffect, useState, useCallback } from "react";
import ChapterInfo from "@/components/ChapterInfo";

interface Visualization {
  id: string;
  title: string;
  content: string;
  eventDate: string | null;
  createdAt: string;
}

const emptyForm = () => ({
  title: "",
  content: "",
  eventDate: "",
});

export default function VisualizationsPage() {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [activeViz, setActiveViz] = useState<Visualization | null>(null);

  const fetchVisualizations = useCallback(async () => {
    try {
      const res = await fetch("/api/visualizations");
      if (res.ok) setVisualizations(await res.json());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisualizations();
  }, [fetchVisualizations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/visualizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          eventDate: form.eventDate || null,
        }),
      });
      if (res.ok) {
        setForm(emptyForm());
        setShowForm(false);
        await fetchVisualizations();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/visualizations?id=${id}`, { method: "DELETE" });
      setVisualizations((prev) => prev.filter((v) => v.id !== id));
      if (activeViz?.id === id) setActiveViz(null);
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
        chapterNumber={4}
        pageTitle="🎬 Счёт №3 — Визуализация"
        contextNote="Мозг не всегда отличает ярко представленное от реального. Каждая детальная визуализация — реальный депозит уверенности в Счёт №3."
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            <span aria-hidden="true">🎬</span> Счёт №3 — Визуализация
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Глава 4. Яркое, детальное воображение будущего успеха. Мозг не
            отличает ярко представленное от реального.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/30"
        >
          + Новый скрипт
        </button>
      </div>

      {/* Empty state */}
      {visualizations.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mb-3 text-4xl">🎬</div>
          <p className="mb-2 text-slate-300">
            Сценариев визуализации пока нет
          </p>
          <p className="text-xs text-slate-500">
            Создайте яркий, детальный сценарий вашего будущего успеха — это
            пополнит Счёт №3
          </p>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-100">
              🎬 Новый сценарий визуализации
            </h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Название
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Например: Идеальная презентация"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Дата события (необязательно)
              </label>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, eventDate: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Сценарий
              </label>
              <p className="mb-2 text-xs text-slate-600">
                Пишите от первого лица, в настоящем времени. Используйте все
                органы чувств: что видите, слышите, чувствуете? Представьте
                и преодоление трудностей.
              </p>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Я выхожу на сцену. Свет слепит глаза, но я чувствую только спокойствие и готовность. Я слышу свои первые слова — они звучат уверенно. Я вижу, как зал слушает..."
                className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={12}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                {isSaving ? "Сохраняю…" : "💾 Сохранить"}
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

      {/* Visualizations list */}
      {visualizations.length > 0 && (
        <div className="grid gap-4">
          {visualizations.map((viz) => (
            <div
              key={viz.id}
              onClick={() =>
                setActiveViz(activeViz?.id === viz.id ? null : viz)
              }
              className={`glass-card cursor-pointer rounded-2xl border p-5 transition-all ${
                activeViz?.id === viz.id
                  ? "border-amber-500/30"
                  : "border-transparent hover:border-slate-600/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {viz.title}
                  </h3>
                  {viz.eventDate && (
                    <p className="text-xs text-slate-600">
                      📅 {new Date(viz.eventDate).toLocaleDateString("ru-RU")}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-600">
                  {new Date(viz.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {activeViz?.id === viz.id && (
                <div className="mt-4 space-y-4 border-t border-slate-700/50 pt-4">
                  <div
                    className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-slate-300"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {viz.content}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveViz(null);
                        // Read aloud simulation: just scroll to top
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-lg bg-amber-500/15 px-4 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/25"
                    >
                      🎯 Начать визуализацию
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(viz.id);
                      }}
                      className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400 transition-colors hover:bg-rose-500/20"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
