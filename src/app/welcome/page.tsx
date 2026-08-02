"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AVATARS = ["🦁", "🐯", "🐻", "🐺", "🦅", "🐉", "🦈", "🐆", "🦌", "🦊"];

export default function WelcomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError("Введите имя");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed, avatar }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full coin-glow bg-linear-to-br from-amber-400 to-amber-600">
              <span className="text-4xl">🪙</span>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-100">
            Ментальный банк
          </h1>
          <p className="mb-2 text-sm leading-relaxed text-slate-400">
            Тренируйте уверенность по методу First Victory.
            <br />
            Фиксируйте достижения, стройте ритуалы, анализируйте прорывы.
          </p>
          <p className="mb-8 text-xs text-slate-500">
            Только депозиты. Никаких списаний.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar picker */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Выберите аватар
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all ${
                      avatar === emoji
                        ? "scale-110 bg-amber-500/20 ring-2 ring-amber-400"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname */}
            <div>
              <label
                htmlFor="nickname"
                className="mb-1.5 block text-left text-xs font-medium text-slate-400"
              >
                Ваше имя
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Например, Храбрый Воин"
                maxLength={30}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
            >
              {loading ? "Создаём профиль…" : "Начать"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Основано на книге «The Confident Mind» Нэйта Занссера
        </p>
      </div>
    </div>
  );
}
