import BalanceCounter from "@/components/BalanceCounter";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Balance card */}
      <BalanceCounter />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/top-10"
          className="glass-card group flex-1 basis-[200px] rounded-2xl p-5 text-center transition-all hover:border-amber-500/30"
        >
          <div className="mb-2 text-3xl transition-transform group-hover:scale-110" aria-hidden="true">
            🏆
          </div>
          <div className="text-sm font-semibold text-slate-200">
            Мои победы
          </div>
          <div className="text-xs text-slate-500">Топ-10 достижений</div>
        </Link>

        <Link
          href="/esp-journal"
          className="glass-card group flex-1 basis-[200px] rounded-2xl p-5 text-center transition-all hover:border-emerald-500/30"
        >
          <div className="mb-2 text-3xl transition-transform group-hover:scale-110" aria-hidden="true">
            📝
          </div>
          <div className="text-sm font-semibold text-slate-200">
            E-S-P дневник
          </div>
          <div className="text-xs text-slate-500">Ежедневный чекин</div>
        </Link>
      </div>

      {/* Quote of the day */}
      <div className="glass-card rounded-2xl p-6 text-center italic">
        <p className="text-sm leading-relaxed text-slate-300">
          &laquo;Уверенность — это не результат успеха. Это результат
          подготовки, усилий и осознания, что ты сделал всё, что мог.&raquo;
        </p>
        <p className="mt-3 text-xs text-slate-500">
          — Dr. Joseph Parent, First Victory
        </p>
      </div>
    </div>
  );
}
