"use client";

import { useEffect, useState, useCallback } from "react";
import ChapterInfo from "@/components/ChapterInfo";
import BackToTools from "@/components/BackToTools";

interface Ritual {
  id: string;
  name: string;
  steps: string; // JSON string
  createdAt: string;
}

const emptyForm = () => ({
  name: "",
  steps: [] as string[],
  currentStep: "",
});

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

  const fetchRituals = useCallback(async () => {
    try {
      const res = await fetch("/api/rituals");
      if (res.ok) setRituals(await res.json());
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rituals")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setRituals(data);
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

  const addStep = () => {
    if (form.currentStep.trim()) {
      setForm((f) => ({
        ...f,
        steps: [...f.steps, f.currentStep.trim()],
        currentStep: "",
      }));
    }
  };

  const removeStep = (idx: number) => {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.steps.length === 0) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/rituals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), steps: form.steps }),
      });
      if (res.ok) {
        setForm(emptyForm());
        setShowForm(false);
        await fetchRituals();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
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
      <BackToTools />

      <ChapterInfo
        chapterNumber={4}
        pageTitle="⚡ Ритуалы"
        contextNote="Ритуалы — это мосты между намерением и действием. Они превращают хаос в порядок, а страх — в готовность."
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            <span aria-hidden="true">⚡</span> Ритуалы
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Глава 7. Предигровые процедуры — якоря, которые включают состояние
            уверенности.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-400 transition-all hover:bg-purple-500/30"
        >
          + Новый ритуал
        </button>
      </div>

      {/* I Am Enough section */}
      <div className="glass-card rounded-2xl border border-amber-500/20 p-5 text-center">
        <p className="mb-3 text-sm text-slate-400">
          Перед выступлением примите решение:
        </p>
        <button
          onClick={() => {
            // Trigger "I am enough" affirmation
            if (typeof window !== "undefined" && window.speechSynthesis) {
              const msg = new SpeechSynthesisUtterance(
                "Я достаточен. Прямо сейчас, с тем, что у меня есть — я достаточен."
              );
              msg.lang = "ru-RU";
              window.speechSynthesis.speak(msg);
            }
          }}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 gold-glow"
        >
          🔑 Я ДОСТАТОЧЕН
        </button>
        <p className="mt-3 text-xs text-slate-600">
          Нажмите, чтобы произнести решение вслух (Глава 7)
        </p>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-100">
              ⚡ Новый ритуал
            </h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Название ритуала
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Например: Мой предматчевый ритуал"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Шаги ритуала
              </label>
              {form.steps.length === 0 && (
                <p className="mb-2 text-xs text-slate-600">
                  Добавьте 3–5 последовательных действий
                </p>
              )}
              <ul className="mb-3 space-y-2">
                {form.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                        {idx + 1}
                      </span>
                      {step}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-xs text-rose-500"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.currentStep}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentStep: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
                  placeholder="Например: Сделать 3 глубоких вдоха"
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addStep}
                  disabled={!form.currentStep.trim()}
                  className="rounded-xl bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/30 disabled:opacity-50"
                >
                  + Добавить
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || form.steps.length === 0}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-400 hover:to-purple-500 disabled:opacity-50"
              >
                {isSaving ? "Сохраняю…" : "💾 Сохранить ритуал"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-400 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rituals list */}
      {rituals.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mb-3 text-4xl">⚡</div>
          <p className="mb-2 text-slate-300">
            Ритуалов пока нет
          </p>
          <p className="text-xs text-slate-500">
            Создайте последовательность действий перед выступлением, которая
            будет якорем уверенности
          </p>
        </div>
      )}

      {rituals.length > 0 && (
        <div className="grid gap-4">
          {rituals.map((ritual) => {
            const steps = JSON.parse(ritual.steps) as string[];
            return (
              <div
                key={ritual.id}
                className="glass-card rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-slate-100">
                  {ritual.name}
                </h3>
                <ol className="mt-3 space-y-2">
                  {steps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-slate-400"
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
