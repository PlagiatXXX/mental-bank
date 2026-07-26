"use client";

import { useEffect, useState, useCallback } from "react";
import ChapterInfo from "@/components/ChapterInfo";

interface Attack {
  id: string;
  source: string;
  type: "internal" | "external";
  context: string;
  defence: string | null;
  resolved: boolean;
  createdAt: string;
}

const emptyForm = () => ({
  source: "",
  type: "external" as "internal" | "external",
  context: "",
});

const protectionSteps = [
  { step: 1, title: "Осознать", desc: "Заметить, что атака произошла. Сказать себе: «Мою уверенность атакуют»." },
  { step: 2, title: "Заглушить", desc: "Остановить источник. Выйти из разговора, закрыть email, сказать «Стоп»." },
  { step: 3, title: "Переключить", desc: "Направить внимание на что-то другое. 3 глубоких вдоха, взгляд в окно." },
  { step: 4, title: "Восстановить", desc: "ESP-воспоминание, аффирмация, Топ-10 или визуализация успеха." },
];

export default function ProtectionPage() {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [isSaving, setIsSaving] = useState(false);

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
    fetchAttacks();
  }, [fetchAttacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.source.trim() || !form.context.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/attacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(emptyForm());
        setShowForm(false);
        await fetchAttacks();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolve = async (attack: Attack) => {
    try {
      const res = await fetch("/api/attacks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: attack.id,
          resolved: true,
          defence: "4 шага защиты",
        }),
      });
      if (res.ok) await fetchAttacks();
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
        chapterNumber={5}
        pageTitle="🛡️ Защита уверенности"
        contextNote="Уверенность — ценный ресурс, который нужно защищать. 4 шага защиты — это алгоритм немедленного реагирования на любую атаку: внешнюю или внутреннюю."
      />

      <h2 className="text-xl font-bold text-slate-100">
        <span aria-hidden="true">🛡️</span> Защита уверенности
      </h2>
      <p className="text-xs text-slate-500">
        Глава 5. Уверенность постоянно атакуют. Используйте 4 шага защиты,
        чтобы отразить атаки и восстановить состояние.
      </p>

      {/* 4 steps card */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="mb-3 text-sm font-semibold text-rose-400">
          🛡️ 4 шага защиты
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {protectionSteps.map((ps) => (
            <div key={ps.step} className="rounded-xl bg-slate-800/50 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-400">
                  {ps.step}
                </span>
                <span className="text-sm font-medium text-slate-200">
                  {ps.title}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{ps.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Log attack button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 font-semibold text-white transition-all hover:from-rose-400 hover:to-rose-500"
        >
          🛡️ Зафиксировать атаку
        </button>
      </div>

      {/* Attack form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="glass-card w-full max-w-md rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-100">
              🛡️ Новая атака
            </h3>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Кто или что атаковало?
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) =>
                  setForm((f) => ({ ...f, source: e.target.value }))
                }
                placeholder="Например: комментарий коллеги, собственные мысли"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Тип атаки
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: "external" }))}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    form.type === "external"
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                      : "border-slate-600 text-slate-500"
                  }`}
                >
                  🔴 Внешняя
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: "internal" }))}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    form.type === "internal"
                      ? "border-rose-500/50 bg-rose-500/15 text-rose-400"
                      : "border-slate-600 text-slate-500"
                  }`}
                >
                  🟡 Внутренняя
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Что произошло?
              </label>
              <textarea
                value={form.context}
                onChange={(e) =>
                  setForm((f) => ({ ...f, context: e.target.value }))
                }
                placeholder="Опишите ситуацию: что случилось, как вы отреагировали?"
                className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 font-semibold text-white transition-all hover:from-rose-400 hover:to-rose-500 disabled:opacity-50"
              >
                {isSaving ? "Сохраняю…" : "🛡️ Защититься"}
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

      {/* Attack log */}
      {attacks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400">
            📋 Журнал атак ({attacks.length})
          </h3>
          {attacks.map((attack) => (
            <div
              key={attack.id}
              className={`glass-card rounded-2xl p-4 border ${
                attack.resolved
                  ? "border-emerald-500/20"
                  : "border-rose-500/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">
                    {attack.type === "external" ? "🔴" : "🟡"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {attack.source}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {attack.context}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {new Date(attack.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>
                {!attack.resolved && (
                  <button
                    onClick={() => handleResolve(attack)}
                    className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25"
                  >
                    ✅ Отразить
                  </button>
                )}
                {attack.resolved && (
                  <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                    ✅ Защищено
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
