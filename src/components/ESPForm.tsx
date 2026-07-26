"use client";

import { useEffect, useState, useCallback } from "react";

interface ESPData {
  id?: string;
  date: string;
  effort: string;
  success: string;
  progress: string;
}

const prompts = {
  effort: "Когда и как ты честно приложил усилия сегодня?",
  success: "Что ты сделал правильно сегодня? (даже самое маленькое)",
  progress: "В чём ты сегодня стал хоть немного лучше?",
};

const placeholders = {
  effort: "Например: я работал над проектом, хотя было тяжело…",
  success: "Например: я закончил важную задачу, помог коллеге…",
  progress: "Например: я стал лучше понимать новую технологию…",
};

export default function ESPForm() {
  const [todayEntry, setTodayEntry] = useState<ESPData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [effort, setEffort] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null); // id поля, которое загружается

  const fetchToday = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/esp?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setTodayEntry(data);
          setEffort(data.effort);
          setSuccess(data.success);
          setProgress(data.progress);
        }
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effort.trim() || !success.trim() || !progress.trim()) return;

    setIsSaving(true);
    try {
      const method = todayEntry ? "PATCH" : "POST";
      const body = {
        id: todayEntry?.id,
        effort: effort.trim(),
        success: success.trim(),
        progress: progress.trim(),
      };

      const res = await fetch("/api/esp", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setTodayEntry(data);
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  // AI-assist handler
  const askAI = async (field: "effort" | "success" | "progress", text: string) => {
    if (!text.trim()) return;
    setAiLoading(field);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reframe", text: text.trim(), field }),
      });
      if (res.ok) {
        const { suggestion } = await res.json();
        if (suggestion) {
          switch (field) {
            case "effort": setEffort(suggestion); break;
            case "success": setSuccess(suggestion); break;
            case "progress": setProgress(suggestion); break;
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setAiLoading(null);
    }
  };

  const isToday =
    todayEntry &&
    new Date(todayEntry.date).toDateString() === new Date().toDateString();

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка дневника…</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">
          <span aria-hidden="true">📝</span> Ежедневный E-S-P дневник
        </h2>
        {isToday && (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
            ✅ Запись за сегодня
          </span>
        )}
      </div>

      {/* E, S, P fields — stacked on mobile, columns on desktop */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* E - Effort */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400">E</span>
              <label className="text-sm font-semibold text-amber-400">Усилие (Effort)</label>
            </div>
            <button
              type="button"
              onClick={() => askAI("effort", effort)}
              disabled={aiLoading === "effort"}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
              title="Помоги сформулировать"
            >
              {aiLoading === "effort" ? "⏳" : "✨ AI"}
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500">{prompts.effort}</p>
          <textarea
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
            placeholder={placeholders.effort}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            rows={3}
            maxLength={1000}
            required
          />
        </div>

        {/* S - Success */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">S</span>
              <label className="text-sm font-semibold text-emerald-400">Успех (Success)</label>
            </div>
            <button
              type="button"
              onClick={() => askAI("success", success)}
              disabled={aiLoading === "success"}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
              title="Помоги сформулировать"
            >
              {aiLoading === "success" ? "⏳" : "✨ AI"}
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500">{prompts.success}</p>
          <textarea
            value={success}
            onChange={(e) => setSuccess(e.target.value)}
            placeholder={placeholders.success}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={3}
            maxLength={1000}
            required
          />
        </div>

        {/* P - Progress */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-400">P</span>
              <label className="text-sm font-semibold text-sky-400">Прогресс (Progress)</label>
            </div>
            <button
              type="button"
              onClick={() => askAI("progress", progress)}
              disabled={aiLoading === "progress"}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-sky-500/10 hover:text-sky-400 disabled:opacity-50"
              title="Помоги сформулировать"
            >
              {aiLoading === "progress" ? "⏳" : "✨ AI"}
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500">{prompts.progress}</p>
          <textarea
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder={placeholders.progress}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            rows={3}
            maxLength={1000}
            required
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 gold-glow"
      >
        {isSaving
          ? "Сохраняю…"
          : isToday
            ? "🔄 Обновить запись"
            : "💾 Сохранить запись"}
      </button>

      {todayEntry && !isToday && (
        <p className="text-center text-xs text-slate-500">
          Показана запись от {new Date(todayEntry.date).toLocaleDateString()}.
          Сегодняшняя запись будет создана заново.
        </p>
      )}
    </form>
  );
}
