"use client";

import { useState } from "react";
import ESPForm from "@/components/ESPForm";
import ESPCalendar from "@/components/ESPCalendar";
import ESPHistory from "@/components/ESPHistory";

export const dynamic = "force-dynamic";

export default function ESPJournalPage() {
  const [tab, setTab] = useState<"diary" | "history">("diary");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-800/50 p-1">
        <button
          onClick={() => setTab("diary")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === "diary"
              ? "bg-amber-500/20 text-amber-400 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          📝 Дневник
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === "history"
              ? "bg-amber-500/20 text-amber-400 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          📚 История
        </button>
      </div>

      {tab === "diary" && <ESPForm />}

      {tab === "history" && (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <ESPCalendar
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
          <ESPHistory />
        </div>
      )}
    </div>
  );
}
