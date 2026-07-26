"use client";

import { useState } from "react";

export default function DonateBlock() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardNumber = "2202 2006 0938 9554";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = cardNumber;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <p className="text-[15px] leading-relaxed text-slate-300">
        Если проект приносит пользу —{" "}
        <button
          id="donate-button"
          onClick={() => setShow(!show)}
          className="inline font-medium text-amber-400 underline decoration-amber-400/30 underline-offset-2 transition-colors hover:decoration-amber-400/80"
          style={{
            cursor: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Ctext y=\'20\' font-size=\'20\'%3E❤️%3C/text%3E%3C/svg%3E") 12 12, pointer',
          }}
        >
          можете поддержать автора
        </button>
        .
      </p>

      {show && (
        <div className="mt-3 animate-modal-in rounded-xl border border-slate-700/60 bg-slate-800/60 px-5 py-4 text-[15px] leading-relaxed">
          <div className="flex items-center gap-3">
            <span className="text-lg">💳</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-200">
                Сбербанк
              </div>
              <div className="text-xs text-slate-500">
                Перевод по номеру карты
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-slate-700/60 px-4 py-2.5 text-center text-base font-mono tracking-widest text-amber-300">
              {cardNumber}
            </code>
            <button
              onClick={handleCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/60 text-sm transition-colors hover:bg-slate-700"
              title="Скопировать номер карты"
            >
              {copied ? "✅" : "📋"}
            </button>
          </div>

          {copied && (
            <p className="mt-2 text-xs text-emerald-400">
              Номер карты скопирован
            </p>
          )}
        </div>
      )}
    </div>
  );
}
