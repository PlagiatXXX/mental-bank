import { NextRequest, NextResponse } from "next/server";

/**
 * AI-Pilot API
 *
 * Сейчас — заглушка. Чтобы подключить реальную OpenAI-совместимую модель:
 *
 * 1. Установи переменные окружения:
 *    AI_API_URL="https://api.openai.com/v1/chat/completions"
 *    AI_API_KEY="sk-..."
 *    AI_MODEL="gpt-4o-mini"
 *
 * 2. Консрукт запроса к /v1/chat/completions уже заготовлен в коде ниже.
 */

interface RequestBody {
  type: "reframe" | "validate";
  text: string;
  field?: "effort" | "success" | "progress";
}

interface StubResponse {
  suggestion: string;
}

// Примеры ответов для заглушки
const STUB_SUGGESTIONS: Record<string, string[]> = {
  effort: [
    "Проявил настойчивость в работе над сложной задачей, не сдаваясь после первой неудачи.",
    "Потратил время на изучение нового подхода, хотя было проще сделать «по-старому».",
    "Выполнил работу, требующую концентрации, несмотря на усталость или отвлечения.",
  ],
  success: [
    "Успешно завершил задачу, которая казалась нерешаемой. Получил работающий результат.",
    "Сделал важный шаг к цели — написал/настроил/запустил ключевую часть проекта.",
    "Помог коллеге или получил положительную обратную связь о своей работе.",
  ],
  progress: [
    "Разобрался в новой технологии/инструменте, который раньше казался сложным.",
    "Стал лучше понимать архитектуру проекта, увидел взаимосвязи между компонентами.",
    "Улучшил свои навыки: быстрее нахожу ошибки, пишу чище, принимаю решения увереннее.",
  ],
};

const STUB_VALIDATION = [
  "Отличная победа! Сфокусирована на результате, а не на процессе.",
  "Хорошее достижение. Советую добавить конкретный контекст (цифры, сроки).",
  "Сильная формулировка. Она будет напоминать о реальном прогрессе.",
];

// ---- Реальная интеграция (раскомментировать при подключении API) ----
// async function callAI(systemPrompt: string, userText: string): Promise<string> {
//   const url = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
//   const key = process.env.AI_API_KEY;
//   const model = process.env.AI_MODEL || "gpt-4o-mini";
//
//   if (!key) throw new Error("AI_API_KEY не настроен");
//
//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${key}`,
//     },
//     body: JSON.stringify({
//       model,
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: userText },
//       ],
//       temperature: 0.7,
//       max_tokens: 200,
//     }),
//   });
//
//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`AI API error (${res.status}): ${err}`);
//   }
//
//   const data = await res.json();
//   return data.choices?.[0]?.message?.content || "";
// }

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { type, text, field } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Текст обязателен" },
        { status: 400 }
      );
    }

    // Проверяем, настроена ли реальная AI модель
    const aiKey = process.env.AI_API_KEY;

    if (aiKey) {
      // TODO: раскомментировать код выше и подключить реальную интеграцию
      return NextResponse.json({
        suggestion:
          "Реальная AI-модель пока не подключена. Используется заглушка.",
      });
    }

    // ---- Заглушка ----
    await new Promise((r) => setTimeout(r, 600)); // имитация задержки

    let suggestion = "";

    if (type === "validate") {
      const idx = Math.floor(Math.random() * STUB_VALIDATION.length);
      suggestion = STUB_VALIDATION[idx];
    } else {
      const targetField = field || "effort";
      const suggestions = STUB_SUGGESTIONS[targetField] || STUB_SUGGESTIONS.effort;
      const idx = Math.floor(Math.random() * suggestions.length);
      suggestion = suggestions[idx];
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("POST /api/ai error:", error);
    return NextResponse.json(
      { error: "Не удалось обработать запрос" },
      { status: 500 }
    );
  }
}
