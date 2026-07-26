"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nickname: string;
  avatar: string;
}

const AVATARS = ["🦁", "🐯", "🐻", "🐺", "🦅", "🐉", "🦈", "🐆", "🦌", "🦊", "🪙", "⭐"];

export default function UserMenu({
  user,
  onSaved,
}: {
  user: User;
  onSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (!res.ok) return;
      // Очищаем всё локальное и редиректим на приветствие
      localStorage.clear();
      window.location.href = "/welcome";
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, avatar }),
      });
      setOpen(false);
      onSaved?.();
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-slate-800"
        title="Профиль"
      >
        <span className="text-lg">{user.avatar}</span>
        <span className="max-w-24 truncate text-xs text-slate-300">
          {user.nickname}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl shadow-black/20">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Профиль
          </h3>

          {/* Avatar picker */}
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Аватар
          </label>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all ${
                  avatar === emoji
                    ? "scale-110 bg-amber-500/20 ring-2 ring-amber-400"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Nickname */}
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Имя
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500/50 focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? "…" : "Сохранить"}
            </button>
          </div>

          {/* Delete account */}
          <div className="mt-4 border-t border-slate-700/50 pt-3">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                >
                  {deleting ? "…" : "Удалить"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-lg py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/30"
              >
                Удалить аккаунт
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
