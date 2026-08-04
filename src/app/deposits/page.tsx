import type { Metadata } from "next";
import DepositHistoryList from "@/components/DepositHistoryList";

export const metadata: Metadata = {
  title: "История депозитов",
};

export default function DepositsPage() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="glass-card rounded-2xl p-5">
        <h1 className="flex items-center gap-2 text-lg font-bold text-slate-100">
          📜 История депозитов
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Одно действие в день, которое заслужило место в Ментальном банке.
          Каждый депозит — шаг к укреплению уверенности.
        </p>
      </div>

      <DepositHistoryList />
    </div>
  );
}
