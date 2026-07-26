"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

interface Victory {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
}

interface FormState {
  id?: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageFile: File | null;
  imagePreview: string | null;
}

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  imageUrl: null,
  imageFile: null,
  imagePreview: null,
});

export default function VictoryPoster() {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [aiValidate, setAiValidate] = useState<string | null>(null); // сообщение валидации
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVictories = useCallback(async () => {
    try {
      const res = await fetch("/api/victories");
      if (res.ok) {
        setVictories(await res.json());
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

  // Блокировка скролла при открытой модалке
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showForm]);

  const openAddForm = () => {
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEditForm = (v: Victory) => {
    setForm({
      id: v.id,
      title: v.title,
      description: v.description ?? "",
      imageUrl: v.imageUrl,
      imageFile: null,
      imagePreview: null,
    });
    setAiValidate(null);
    setShowForm(true);
  };

  const handleAiValidate = async () => {
    if (!form.title.trim()) return;
    setAiLoading(true);
    setAiValidate(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "validate", text: form.title.trim() }),
      });
      if (res.ok) {
        const { suggestion } = await res.json();
        setAiValidate(suggestion);
      }
    } catch {
      // silently fail
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      imageUrl: null,
      imageFile: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSaving(true);

    try {
      let imageUrl = form.imageUrl;

      // Загружаем файл если выбран
      if (form.imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", form.imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          imageUrl = url;
        }
      }

      const method = form.id ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        imageUrl,
      };
      if (form.id) body.id = form.id;

      const res = await fetch("/api/victories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setForm(emptyForm());
        await fetchVictories();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
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

  // Drag-n-drop handlers
  const handleDragStart = (id: string) => setDragId(id);

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragId && dragId !== id) {
      setDragId(id); // visual cue
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }

    const dragged = victories.find((v) => v.id === dragId);
    const target = victories.find((v) => v.id === targetId);
    if (!dragged || !target) {
      setDragId(null);
      return;
    }

    // Optimistic update
    const reordered = [...victories];
    const fromIdx = reordered.indexOf(dragged);
    const toIdx = reordered.indexOf(target);
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, dragged);
    setVictories(reordered);
    setDragId(null);

    // Сохраняем на сервере
    await fetch("/api/victories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dragged.id, position: target.position }),
    });

    await fetchVictories();
  };

  // Touch drag-n-drop для мобильных
  const touchDragRef = useRef<{ id: string; startY: number; startX: number } | null>(null);

  const handleTouchStart = (id: string) => (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchDragRef.current = { id, startY: touch.clientY, startX: touch.clientX };
    setDragId(id);
  };

  const handleTouchEnd = (id: string) => async (e: React.TouchEvent) => {
    if (!touchDragRef.current || touchDragRef.current.id !== id) return;
    const touch = e.changedTouches[0];
    const dy = touch.clientY - touchDragRef.current.startY;
    touchDragRef.current = null;
    setDragId(null);

    if (Math.abs(dy) < 30) return; // слишком маленькое движение

    const fromIdx = victories.findIndex((v) => v.id === id);
    if (fromIdx === -1) return;

    // Находим карту под пальцем в момент отпускания
    const cards = document.querySelectorAll('[data-victory-id]');
    let targetIdx = -1;
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx === -1 || targetIdx === fromIdx) return;
    const targetId = cards[targetIdx]?.getAttribute('data-victory-id');
    if (!targetId) return;

    const dragged = victories[fromIdx];
    const target = victories.find((v) => v.id === targetId);
    if (!target) return;

    const reordered = [...victories];
    reordered.splice(fromIdx, 1);
    reordered.splice(targetIdx, 0, dragged);
    setVictories(reordered);

    await fetch("/api/victories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dragged.id, position: target.position }),
    });

    await fetchVictories();
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-pulse text-slate-600">Загрузка побед…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">
          <span aria-hidden="true">🏆</span> Мои 10 лучших побед
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
          <div className="mb-3 text-5xl" aria-hidden="true">🏅</div>
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

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-100">
              {form.id ? "✏️ Редактировать победу" : "✨ Новая победа"}
            </h3>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-400">
                  Название победы
                </label>
                <button
                  type="button"
                  onClick={handleAiValidate}
                  disabled={aiLoading || !form.title.trim()}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
                >
                  {aiLoading ? "⏳" : "✨ Проверить"}
                </button>
              </div>
              {aiValidate && (
                <p className="mb-2 text-xs text-emerald-400">{aiValidate}</p>
              )}
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
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
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Что сделало эту победу особенной?"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">
                Скриншот/изображение (необязательно)
              </label>

              {form.imagePreview || form.imageUrl ? (
                <div className="relative mb-2 overflow-hidden rounded-xl">
                  <Image
                    src={form.imagePreview || form.imageUrl!}
                    alt="Превью"
                    width={400}
                    height={200}
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-lg bg-red-900/80 px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-800"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 p-6 transition-colors hover:border-amber-500/50"
                >
                  <span className="mb-1 text-2xl">📎</span>
                  <span className="text-sm text-slate-400">
                    Нажмите, чтобы выбрать файл
                  </span>
                  <span className="text-xs text-slate-600">
                    PNG, JPEG, WebP, GIF до 5MB
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                {isSaving
                  ? "Сохраняю…"
                  : form.id
                    ? "Сохранить"
                    : "Добавить победу"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm());
                }}
                className="rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-300"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Poster grid */}
      {victories.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {victories.map((victory, index) => (
            <div
              key={victory.id}
              data-victory-id={victory.id}
              draggable
              onDragStart={() => handleDragStart(victory.id)}
              onDragOver={(e) => handleDragOver(e, victory.id)}
              onDrop={(e) => handleDrop(e, victory.id)}
              onDragEnd={() => setDragId(null)}
              onTouchStart={handleTouchStart(victory.id)}
              onTouchEnd={handleTouchEnd(victory.id)}
              className={`group relative overflow-hidden rounded-2xl border transition-all ${
                dragId === victory.id
                  ? "border-amber-500/50 opacity-50"
                  : "border-slate-700/50 hover:border-amber-500/30"
              }`}
            >
              {/* Drag handle */}
              <div className="absolute left-2 top-2 z-10 cursor-grab rounded-lg bg-slate-900/80 px-2 py-1 text-xs text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                ⠿
              </div>

              {/* Position badge */}
              <div className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-400">
                {index + 1}
              </div>

              {/* Edit/delete buttons */}
              <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-60 md:opacity-0 md:group-hover:opacity-100">
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

              {/* Image poster */}
              {victory.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={victory.imageUrl}
                    alt={victory.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div
                className={`${
                  victory.imageUrl ? "p-4 pt-3" : "p-5"
                }`}
              >
                <h3 className="text-base font-semibold text-slate-100">
                  {victory.title}
                </h3>
                {victory.description && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
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
