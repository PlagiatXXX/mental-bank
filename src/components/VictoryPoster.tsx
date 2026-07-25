"use client";

import { useEffect, useState, useCallback } from "react";

interface Victory {
  id: string;
  title: string;
  description: string | null;
  position: number;
}

export default function VictoryPoster() {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const fetchVictories = useCallback(async () => {
    try {
      const res = await fetch("/api/victories");
      if (res.ok) {
        const data = await res.json();
        setVictories(data);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVictories();
  }, [fetchVictories]);

  const openAddForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setShowForm(true);
  };

  const openEditForm = (v: Victory) => {
    setEditingId(v.id);
    setFormTitle(v.title);
    setFormDescription(v.description ?? "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const method = editingId ? "PATCH" : "POST";
    const body = editingId
      ? { id: editingId, title: formTitle.trim(), description: formDescription.trim() }
      : { title: formTitle.trim(), description: formDescription.trim() };

    try {
      const res = await fetch("/api/victories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormTitle("");
        setFormDescription("");
        await fetchVictories();
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/victories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchVictories();
      }
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка побед…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">
          🏆 Мои 10 лучших побед
        </h2>
        {victories.length < 10 && (
          <button
            onClick={openAddForm}
            className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/30 gold-glow"
          >
            + Добавить
          </button>
        )}
      </div>

      {/* Empty state */}
      {victories.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mb-3 text-5xl">🏅</div>
          <p className="mb-2 text-lg font-medium text-slate-300">
            Ваш список побед пока пуст
          </p>
          <p className="mb-6 text-sm text-slate-500">
            Добавьте свои главные достижения. Вспомните моменты, которыми вы
            гордитесь.
          </p>
          <button
            onClick={openAddForm}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 gold-glow"
          >
            ✨ Добавить первую победу
          </button>
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">
              Название победы
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Например: Запустил свой первый проект"
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              maxLength={200}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">
              Описание (необязательно)
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Что сделало эту победу особенной?"
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500"
            >
              {editingId ? "Сохранить" : "Добавить победу"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Victory list */}
      {victories.length > 0 && (
        <div className="space-y-3">
          {victories.map((victory, index) => (
            <div
              key={victory.id}
              className="glass-card group relative overflow-hidden rounded-2xl p-5 transition-all hover:border-amber-500/30"
            >
              {/* Position badge */}
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-400">
                {index + 1}
              </div>

              {/* Edit/delete buttons */}
              <div className="absolute right-3 top-14 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEditForm(victory)}
                  className="rounded-lg bg-slate-700/80 p-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-600 hover:text-slate-200"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(victory.id)}
                  className="rounded-lg bg-slate-700/80 p-1.5 text-xs text-slate-400 transition-colors hover:bg-red-900/50 hover:text-red-400"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>

              {/* Content */}
              <div className="pr-12">
                <h3 className="text-lg font-semibold text-slate-100">
                  {victory.title}
                </h3>
                {victory.description && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    {victory.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
