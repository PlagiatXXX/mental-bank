import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-100">
        <span aria-hidden="true">⚡</span> Инструменты уверенности
      </h2>
      <p className="text-sm text-slate-400">
        Инструменты из книги для защиты уверенности, ритуалов и управления
        стрессом в реальном времени.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/protection"
          className="glass-card group rounded-2xl p-5 text-center transition-all hover:border-rose-500/30"
        >
          <div className="mb-2 text-3xl transition-transform group-hover:scale-110">🛡️</div>
          <div className="text-sm font-semibold text-slate-200">
            Защита уверенности
          </div>
          <div className="text-xs text-slate-500">Глава 5 — 4 шага защиты</div>
        </Link>

        <Link
          href="/rituals"
          className="glass-card group rounded-2xl p-5 text-center transition-all hover:border-purple-500/30"
        >
          <div className="mb-2 text-3xl transition-transform group-hover:scale-110">⚡</div>
          <div className="text-sm font-semibold text-slate-200">Ритуалы</div>
          <div className="text-xs text-slate-500">Глава 7 — вход на арену</div>
        </Link>

        <Link
          href="/cba"
          className="glass-card group rounded-2xl p-5 text-center transition-all hover:border-sky-500/30"
        >
          <div className="mb-2 text-3xl transition-transform group-hover:scale-110">🌬️</div>
          <div className="text-sm font-semibold text-slate-200">
            C-B-A / Дыхание
          </div>
          <div className="text-xs text-slate-500">Глава 8 — управление стрессом</div>
        </Link>

        <Link
          href="/aar"
          className="glass-card group rounded-2xl p-5 text-center transition-all hover:border-emerald-500/30"
        >
          <div className="mb-2 text-3xl transition-transform group-hover:scale-110">🔄</div>
          <div className="text-sm font-semibold text-slate-200">AAR — Разбор</div>
          <div className="text-xs text-slate-500">Глава 9 — после действия</div>
        </Link>
      </div>
    </div>
  );
}
