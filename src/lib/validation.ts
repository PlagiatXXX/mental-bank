/**
 * Функции валидации пользовательского ввода по правилам из книги.
 * Используются для обратной связи в реальном времени.
 */
import { allRules } from "./book"

/**
 * Проверка аффирмации по 5 правилам из Главы 3.
 * Возвращает массив нарушенных правил с объяснением.
 */
export function validateAffirmation(text: string): {
  passed: boolean
  checks: { rule: string; passed: boolean; hint: string }[]
} {
  const checks = [
    {
      rule: "Первое лицо (Я)",
      passed: /^\s*я\s/i.test(text),
      hint: "Аффирмация должна начинаться с «Я» или «Я —»",
    },
    {
      rule: "Настоящее время",
      passed: !/\b(буду|стану|смогу)\b/i.test(text) && /^\s*я\s/i.test(text),
      hint: "Используйте настоящее время: «Я справляюсь», а не «Я справлюсь»",
    },
    {
      rule: "Позитивная формулировка",
      passed: !/\b(не |ни |без |никогда|перестану|избавлюсь)\b/i.test(text),
      hint: "Формулируйте, что ЕСТЬ, а не чего НЕТ. Вместо «Я не нервничаю» → «Я спокоен»",
    },
    {
      rule: "Точность (конкретность)",
      passed:
        text.split(" ").length >= 3 && text.length >= 15,
      hint: "Будьте конкретнее. «Я уверен в себе» → «Я уверенно отвечаю на вопросы по проекту X»",
    },
    {
      rule: "Сила (энергия)",
      passed:
        !/\b(кажется|наверное|возможно|попробую|постараюсь|хотелось бы)\b/i.test(
          text,
        ),
      hint: "Уберите слова сомнения: «кажется», «наверное», «попробую». Утверждайте без колебаний",
    },
  ]

  return {
    passed: checks.every((c) => c.passed),
    checks,
  }
}

/**
 * Проверка ESP-записи на осмысленность.
 */
export function validateESPEntry(
  field: "effort" | "success" | "progress",
  text: string,
): { passed: boolean; hint?: string } {
  if (text.length < 10) {
    return {
      passed: false,
      hint: "Слишком коротко. Добавьте деталей — что именно произошло?",
    }
  }

  if (/^(не было|ничего|всё|как обычно|нормально|никак)$/i.test(text.trim())) {
    return {
      passed: false,
      hint: "Попробуйте найти хотя бы маленький момент. Вспомните: что вы сделали? Что получилось?",
    }
  }

  return { passed: true }
}

/**
 * Оценка AAR по правилу 80/20 (Глава 9).
 */
export function assessAARBalance(
  whatHappened: string,
  soWhat: string,
  nowWhat: string,
  balanceType: "win" | "loss",
): {
  score: number
  feedback: string
} {
  const totalLength = whatHappened.length + soWhat.length + nowWhat.length
  const positiveRatio =
    (whatHappened.match(/хорошо|успех|получилось|здорово|молодец/i)?.length ??
      0) /
    Math.max(
      (whatHappened.match(/плохо|ошибка|неудач|провал|не получилось/i)
        ?.length ?? 0) + 1,
      1,
    )

  const expectedRatio = balanceType === "loss" ? 4 : 0.67 // 80/20 vs 60/40

  if (positiveRatio >= expectedRatio) {
    return {
      score: 100,
      feedback: "Отличный баланс! Вы следуете правилу из Главы 9.",
    }
  }

  if (balanceType === "loss") {
    return {
      score: Math.round((positiveRatio / expectedRatio) * 100),
      feedback: `После поражения книга рекомендует фокус 80% на успехах и 20% на ошибках. Попробуйте добавить больше «драгоценностей» в раздел «Что произошло».`,
    }
  }

  return {
    score: Math.round((positiveRatio / expectedRatio) * 100),
    feedback: `После победы полезно усилить самокритику (60% на ошибки, 40% на успехи), чтобы не расслабляться. Добавьте анализа ошибок.`,
  }
}
