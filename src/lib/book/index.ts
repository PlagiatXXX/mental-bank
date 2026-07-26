/**
 * Доменная модель книги «The Confident Mind: A Battle-Tested Guide to Unshakable Performance»
 *
 * Формализация всех концепций, правил, упражнений и цитат из книги
 * в TypeScript — для использования в качестве source of truth
 * для бизнес-логики приложения mental-bank.
 */

// ─── Shared types ─────────────────────────────────────────────────
export type {
  ChapterMeta,
  Rule,
  Exercise,
  Concept,
  Quote,
  Domain,
  AccountNumber,
  ValidationResult,
} from "./types"

// ─── Chapter metadata ─────────────────────────────────────────────
export { chapters, getChapter } from "./chapters"

// ─── Glossary ─────────────────────────────────────────────────────
export { concepts } from "./concepts"

// ─── Chapter modules ──────────────────────────────────────────────
export * as chapter1 from "./chapter-01-first-victory"
export * as chapter2 from "./chapter-02-account-past"
export * as chapter3 from "./chapter-03-account-present"
export * as chapter4 from "./chapter-04-account-future"
export * as chapter5 from "./chapter-05-protecting-confidence"
export * as chapter6 from "./chapter-06-decision-to-be-different"
export * as chapter7 from "./chapter-07-entering-the-arena"
export * as chapter8 from "./chapter-08-playing-confident"
export * as chapter9 from "./chapter-09-after-action-review"
export * as epilogue from "./epilogue"

// ─── Aggregated collections ───────────────────────────────────────
import type { Rule, Exercise, Quote, Concept } from "./types"
import { chapters } from "./chapters"
import * as c1 from "./chapter-01-first-victory"
import * as c2 from "./chapter-02-account-past"
import * as c3 from "./chapter-03-account-present"
import * as c4 from "./chapter-04-account-future"
import * as c5 from "./chapter-05-protecting-confidence"
import * as c6 from "./chapter-06-decision-to-be-different"
import * as c7 from "./chapter-07-entering-the-arena"
import * as c8 from "./chapter-08-playing-confident"
import * as c9 from "./chapter-09-after-action-review"
import * as e from "./epilogue"

const chaptersArray = [c1, c2, c3, c4, c5, c6, c7, c8, c9, e]

/** Все правила (законы) из книги, собранные в один массив */
export const allRules: Rule[] = chaptersArray.flatMap((ch) => ch.rules ?? [])

/** Все упражнения из книги */
export const allExercises: Exercise[] = chaptersArray.flatMap(
  (ch) => ch.exercises ?? [],
)

/** Все цитаты из книги */
export const allQuotes: Quote[] = chaptersArray.flatMap((ch) => ch.quotes ?? [])

/** Найти правило по ID */
export function findRule(id: string): Rule | undefined {
  return allRules.find((r) => r.id === id)
}

/** Найти все правила для главы */
export function rulesByChapter(chapterNumber: number): Rule[] {
  return allRules.filter((r) => r.chapter === chapterNumber)
}

/** Найти все упражнения для домена */
export function exercisesByDomain(domain: string): Exercise[] {
  return allExercises.filter((ex) => {
    const rule = allRules.find((r) => r.id.startsWith(`ex-${String(ex.chapter).padStart(2, "0")}`))
    return rule?.domain === domain
  })
}

/** Случайная цитата для отображения */
export function randomQuote(): Quote {
  return allQuotes[Math.floor(Math.random() * allQuotes.length)]
}
