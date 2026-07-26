"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "mental-bank:info-modal-dismissed";

export default function InfoModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* overlay — только фон, закрытие только по крестику */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* card */}
      <div
        className="relative mx-auto w-full max-w-xl animate-modal-in rounded-2xl bg-slate-900 p-8 pt-6 shadow-2xl ring-1 ring-slate-700/50"
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
      </div>
    </div>,
    document.body,
  );
}
