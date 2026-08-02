"use client";

import { useEffect, useState } from "react";

interface ESPCalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function ESPCalendar({ onSelectDate, selectedDate }: ESPCalendarProps) {
  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [month, setMonth] = useState(new Date().getUTCMonth() + 1);
  const [entryDates, setEntryDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    fetch(`/api/esp?calendar=${key}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((dates) => {
        if (!cancelled) setEntryDates(dates);
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
  }, [year, month]);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun
  // Сдвигаем чтобы Пн был первым (0=Mon, 6=Sun)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const today = new Date().toISOString().split("T")[0];

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(d);
    const hasEntry = entryDates.includes(dateStr);
    const isToday = dateStr === today;
    const isSelected = dateStr === selectedDate;

    days.push(
      <button
        key={d}
        onClick={() => onSelectDate(dateStr)}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors
          ${isSelected ? "bg-amber-500 text-slate-900" : ""}
          ${!isSelected && hasEntry ? "bg-emerald-500/20 text-emerald-400" : ""}
          ${!isSelected && !hasEntry ? "text-slate-500 hover:bg-slate-700/50" : ""}
          ${isToday && !isSelected ? "ring-1 ring-amber-500/50" : ""}
        `}
      >
        {d}
      </button>
    );
  }

  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString("ru-RU", {
    month: "long",
  });

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
        >
          ◀
        </button>
        <span className="text-sm font-semibold capitalize text-slate-200">
          {monthName} {year}
        </span>
        <button
          onClick={nextMonth}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
        >
          ▶
        </button>
      </div>

      {/* Day names */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-slate-500"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {isLoading
          ? Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-slate-800"
              />
            ))
          : days}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
          <span>Есть запись</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Выбрано</span>
        </div>
      </div>
    </div>
  );
}
