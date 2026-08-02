"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "mental-bank:info-modal-dismissed";

export default function InfoModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Синхронизация с localStorage — внешняя система (React-паттерн для эффектов)
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setOpen(true);
  }, []);

  function handleClose() {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-4 overflow-y-auto">
      {/* overlay — только фон, закрытие только по крестику */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* card */}
      <div
        className="relative mx-auto w-full max-w-2xl animate-modal-in rounded-2xl bg-slate-900 p-5 shadow-2xl ring-1 ring-slate-700/50 sm:p-8 sm:pt-6 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200"
          aria-label="Закрыть"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {children}

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-700/50 pt-4">
          <button
            onClick={handleClose}
            className="gold-glow rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3 text-sm font-bold tracking-wider text-slate-900 transition-all hover:from-amber-400 hover:to-amber-500"
          >
            Вперёд! →
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
