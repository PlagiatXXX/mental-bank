"use client";

import { useEffect, useState, useCallback } from "react";

interface ESPEntry {
  id: string;
  date: string;
  effort: string;
  success: string;
  progress: string;
}

interface SearchResult {
  entries: ESPEntry[];
  total: number;
}

const FILTER_LABELS: Record<string, string> = {
  effort: "E",
  success: "S",
  progress: "P",
};

const filterOptions = [
  { value: "", label: "Все поля" },
  { value: "effort", label: "E — Усилие" },
  { value: "success", label: "S — Успех" },
  { value: "progress", label: "P — Прогресс" },
];

export default function ESPHistory() {
  const [data, setData] = useState<ESPEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter) params.set("filter", filter);
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      const url = `/api/esp?${params.toString()}`;
      const res = await fetch(url);

      if (res.ok) {
        if (search || filter) {
          const result: SearchResult = await res.json();
          setData(result.entries);
          setTotal(result.total);
        } else {
          const entries: ESPEntry[] = await res.json();
          setData(entries);
          setTotal(entries.length);
        }
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [search, filter, limit, offset]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchEntries();
  };

  const groupByDate = (entries: ESPEntry[]) => {
    const groups: Record<string, ESPEntry[]> = {};
    for (const entry of entries) {
      const key = new Date(entry.date).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return groups;
  };

  const grouped = groupByDate(data);

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск в ESP записях…"
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            🔍
          </span>
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setOffset(0);
          }}
          className="rounded-xl border border-slate-600 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-300 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </form>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-slate-500">
          {search || filter
            ? `Найдено ${total} записей`
            : `Всего ${total} записей`}
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse rounded-2xl p-5">
              <div className="mb-2 h-4 w-1/3 rounded bg-slate-700" />
              <div className="mb-1 h-3 w-full rounded bg-slate-700/50" />
              <div className="mb-1 h-3 w-5/6 rounded bg-slate-700/50" />
              <div className="h-3 w-4/6 rounded bg-slate-700/50" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">
            {search || filter
              ? "Ничего не найдено. Попробуйте изменить запрос."
              : "Пока нет ESP записей. Заполните дневник."}
          </p>
        </div>
      )}

      {/* Entries grouped by date */}
      {!isLoading && data.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, entries]) => (
            <div key={dateLabel}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {dateLabel}
              </h3>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="glass-card rounded-2xl p-4 transition-all hover:border-amber-500/20"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                          E
                        </span>
                        <p className="text-sm leading-relaxed text-slate-300">
                          {entry.effort}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                          S
                        </span>
                        <p className="text-sm leading-relaxed text-slate-300">
                          {entry.success}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-400">
                          P
                        </span>
                        <p className="text-sm leading-relaxed text-slate-300">
                          {entry.progress}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {!isLoading && data.length > 0 && data.length < total && (
        <div className="text-center">
          <button
            onClick={() => setOffset((prev) => prev + limit)}
            className="rounded-xl border border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
          >
            Загрузить ещё
          </button>
        </div>
      )}
    </div>
  );
}
