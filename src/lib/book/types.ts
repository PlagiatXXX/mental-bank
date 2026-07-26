/**
 * Базовые типы для формализации концепций книги
 * «The Confident Mind: A Battle-Tested Guide to Unshakable Performance»
 */

/** Мета-информация о главе */
export interface ChapterMeta {
  /** Порядковый номер (0 — введение, 99 — эпилог) */
  number: number
  /** Название главы */
  title: string
  /** Подзаголовок (если есть) */
  subtitle?: string
  /** Краткое содержание (1–2 предложения) */
  summary: string
  /** Ключевые темы главы */
  tags: string[]
}

/** Закон / принцип / аксиома, которую предписывает книга */
export interface Rule {
  /** Уникальный идентификатор, напр. "01-01" */
  id: string
  /** Номер главы */
  chapter: number
  /** Формулировка закона (как в книге) */
  statement: string
  /** Объяснение своими словами */
  explanation: string
  /** К какой области уверенности относится */
  domain: Domain
}

/** Упражнение из книги */
export interface Exercise {
  id: string
  chapter: number
  name: string
  purpose: string
  /** Пошаговая инструкция */
  steps: string[]
  /** Частота выполнения (если указана) */
  frequency?: string
}

/** Ключевое понятие */
export interface Concept {
  term: string
  definition: string
  chapter: number
}

/** Значимая цитата из книги */
export interface Quote {
  text: string
  author: string
  chapter: number
}

/** Область уверенности (к какому «счету» относится) */
export type Domain =
  | "first-victory"
  | "account-1-past"
  | "account-2-present"
  | "account-3-future"
  | "protection"
  | "mindset"
  | "ritual"
  | "stress"
  | "reflection"
  | "foundation"

/** Счёт уверенности */
export type AccountNumber = 1 | 2 | 3

/** Результат проверки действия пользователя на соответствие правилам книги */
export interface ValidationResult {
  /** Правило, по которому идёт проверка */
  ruleId: string
  /** Соответствует ли */
  passed: boolean
  /** Понятное объяснение, что не так (если !passed) */
  feedback?: string
  /** Совет из книги, как исправить */
  tip?: string
}
