"use client";

import { useState } from "react";
import { getChapter, concepts, rulesByChapter, allQuotes } from "@/lib/book";

interface ChapterInfoProps {
  /** Номер главы (1–9, 99 — эпилог) */
  chapterNumber: number;
  /** Заголовок страницы (будет показан над кнопкой) */
  pageTitle?: string;
  /** Дополнительный контекст, зачем эта страница */
  contextNote?: string;
}

export default function ChapterInfo({
  chapterNumber,
  pageTitle,
  contextNote,
}: ChapterInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  const meta = getChapter(chapterNumber);
  if (!meta) return null;

  const chapterConcepts = concepts.filter((c) => c.chapter === chapterNumber);
  const chapterRules = rulesByChapter(chapterNumber).slice(0, 5);
  const chapterQuote = allQuotes.find((q) => q.chapter === chapterNumber);

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 transition-all">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-800/50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-sm font-bold text-amber-400">
            {chapterNumber <= 9 ? chapterNumber : "✦"}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              {pageTitle || meta.title}
            </div>
            {meta.subtitle && (
              <div className="text-xs text-slate-500">{meta.subtitle}</div>
            )}
          </div>
        </div>
        <span
          className={`text-lg text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="space-y-5 border-t border-slate-700/50 px-5 pb-5 pt-4">
          {/* Core idea */}
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
              📖 Основная идея главы
            </h4>
            <p className="text-sm leading-relaxed text-slate-300">
              {meta.summary}
            </p>
          </div>

          {/* Context note */}
          {contextNote && (
            <div className="rounded-xl bg-amber-500/5 p-3">
              <p className="text-xs leading-relaxed text-amber-300/80">
                💡 {contextNote}
              </p>
            </div>
          )}

          {/* Key concepts */}
          {chapterConcepts.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                🔑 Ключевые понятия
              </h4>
              <div className="space-y-2">
                {chapterConcepts.map((c) => (
                  <div
                    key={c.term}
                    className="rounded-xl bg-slate-700/30 p-3"
                  >
                    <div className="text-sm font-medium text-slate-100">
                      {c.term}
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
                      {c.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key rules */}
          {chapterRules.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
                📋 Законы главы
              </h4>
              <div className="space-y-2">
                {chapterRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-0.5 flex-shrink-0 text-amber-500">•</span>
                    <div>
                      <p className="text-slate-200">{rule.statement}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {rule.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {chapterQuote && (
            <div className="border-t border-slate-700/30 pt-3 text-center">
              <p className="text-sm italic leading-relaxed text-slate-500">
                &laquo;{chapterQuote.text}&raquo;
              </p>
              <p className="mt-1 text-xs text-slate-600">
                — {chapterQuote.author}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
