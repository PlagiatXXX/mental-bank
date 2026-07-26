"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_KEY = "mb_onboarding_done";
const MODAL_KEY = "mental-bank:info-modal-dismissed";

interface Step {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
  };
}

const ALL_STEPS: Step[] = [
  // 1 — Шапка: лого + Ментальный банк + подпись
  {
    element: "#app-header",
    popover: {
      title: "🏦 Ментальный банк",
      description:
        "Добро пожаловать! Это приложение — ваш личный тренажёр уверенности. 'Только депозиты. Никаких списаний.' Каждая запись здесь — это вклад на ваш внутренний счёт, с которого никто не сможет сделать списание.",
      side: "bottom",
    },
  },
  {
    element: "#main-balance",
    popover: {
      title: "💰 Общий ментальный баланс",
      description:
        "Ваша главная цифра. Она растёт с каждым депозитом и показывает, сколько уверенности вы накопили. Цель — наблюдать за ростом, а не за абсолютным числом. Сегодня — 10, через месяц — 100, через год — 1000.",
      side: "bottom",
    },
  },
  {
    element: "#deposit-form",
    popover: {
      title: "🪙 Ежедневный депозит",
      description:
        "С чего начать? Прямо сейчас. Раз в день описывайте одно действие, которое заслуживает места в банке. Это может быть победа, сложный разговор, новый навык или просто 'сделал то, на что не решался'. Один депозит в день — это ритуал, который меняет мышление.",
      side: "bottom",
    },
  },
  {
    element: "#nav-esp",
    popover: {
      title: "📝 ESP-дневник",
      description:
        "ESP — это 'Доказательство уверенности' (Evidence of Self-confidence). Записывайте сюда любые свои победы, даже маленькие. Каждая запись — кирпичик в фундаменте вашей уверенности. Начните с трёх побед за сегодня.",
      side: "right",
    },
  },
  {
    element: "#nav-affirmations",
    popover: {
      title: "💬 Аффирмации",
      description:
        "Короткие фразы, которые перепрограммируют внутренний диалог. Формула: настоящее время, без частицы 'не'. 'Я уверен в себе' вместо 'я не буду бояться'. Повторяйте утром и перед важными встречами.",
      side: "right",
    },
  },
  {
    element: "#nav-visualization",
    popover: {
      title: "🎬 Визуализация",
      description:
        "Репетиция успеха в голове. Закройте глаза и представьте ситуацию в деталях: где вы, что видите, слышите, чувствуете. Мозг не отличает яркую визуализацию от реальности. Спортсмены используют это перед стартом.",
      side: "right",
    },
  },
  {
    element: "#nav-top10",
    popover: {
      title: "🏆 Топ-10 побед",
      description:
        "Ваш личный зал славы. 10 самых важных достижений. Держите этот список под рукой и перечитывайте перед важными событиями. Каждая победа — доказательство: 'Я могу'.",
      side: "top",
    },
  },
  {
    element: "#nav-aar",
    popover: {
      title: "🔄 AAR — разбор действий",
      description:
        "After Action Review — инструмент спецназа. После любого дела отвечайте на 4 вопроса: 'Что планировал?', 'Что получилось?', 'Почему?', 'Что делать иначе?'. Без самобичевания. Только анализ.",
      side: "top",
    },
  },
  {
    element: "#nav-mindset",
    popover: {
      title: "🧠 Убеждения",
      description:
        "Наши убеждения — это фильтры реальности. Если вы считаете 'я невезучий' — мозг будет искать подтверждения. Хорошая новость: убеждения можно менять. Этот инструмент поможет найти и переписать ограничивающие установки.",
      side: "right",
    },
  },
  {
    element: "#nav-protection",
    popover: {
      title: "🛡️ Защита уверенности",
      description:
        "Внешний мир будет атаковать вашу уверенность — критика, сравнение, обесценивание. Этот инструмент — ваша психологическая броня. Отслеживайте атаки и отвечайте на них осознанно, а не реактивно.",
      side: "right",
    },
  },
  {
    element: "#nav-rituals",
    popover: {
      title: "⚡ Ритуалы",
      description:
        "Ритуалы — это якоря состояния. Определённая последовательность действий перед важным событием настраивает мозг на нужный лад. Певцы делают распевку, спортсмены — разминку. Создайте свой ритуал уверенности.",
      side: "right",
    },
  },
  {
    element: "#nav-cba",
    popover: {
      title: "🌬️ C-B-A / Дыхание",
      description:
        "C-B-A — это перезагрузка: Событие → Мысль → Реакция. Когда происходит триггер, у вас есть 3 секунды, чтобы поймать автоматическую мысль и выбрать реакцию. Дыхание — якорь для этой паузы.",
      side: "right",
    },
  },
  {
    element: "#nav-deposits",
    popover: {
      title: "📜 История депозитов",
      description:
        "Здесь хранятся все ваши депозиты — от первого до сегодняшнего. Полезно возвращаться в трудные дни и видеть: 'Я уже прошёл этот путь'. Это ваш дневник роста уверенности.",
      side: "top",
    },
  },
  {
    element: "#social-links",
    popover: {
      title: "🌐 Подпишитесь",
      description:
        "Чтобы не потерять проект и получать обновления, подпишитесь на соцсети. Приятного пути!",
      side: "top",
    },
  },
  {
    element: "#donate-button",
    popover: {
      title: "❤️ Поддержать проект",
      description:
        "Если приложение приносит пользу — вы можете поддержать автора. Никаких обязательств, проект остаётся бесплатным. Спасибо, что дошли до конца обучения! 🎉",
      side: "top",
    },
  },
];

export default function Onboarding() {
  const pathname = usePathname();
  const [showButton, setShowButton] = useState(false);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    const steps = ALL_STEPS.filter(
      (s) => !s.element || document.querySelector(s.element),
    );
    if (steps.length === 0) {
      localStorage.setItem(STORAGE_KEY, "true");
      setShowButton(true);
      return;
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: "Далее →",
      prevBtnText: "← Назад",
      doneBtnText: "Готово!",
      steps: steps.map((s) => ({
        element: s.element,
        popover: {
          title: s.popover.title,
          description: s.popover.description,
          ...(s.popover.side ? { side: s.popover.side } : {}),
        },
      })),
      onDestroyed: () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setShowButton(true);
      },
    });

    driverObj.drive();
  }, []);

  // Автостарт после регистрации: модалка закрыта + мы на главной
  useEffect(() => {
    if (autoStartedRef.current) return;

    const modalDismissed = localStorage.getItem(MODAL_KEY) === "true";
    const tourDone = localStorage.getItem(STORAGE_KEY) === "true";

    if (modalDismissed && !tourDone && pathname === "/") {
      autoStartedRef.current = true;
      const timer = setTimeout(() => startTour(), 800);
      return () => clearTimeout(timer);
    }

    if (tourDone) setShowButton(true);
  }, [pathname, startTour]);

  if (!showButton) return null;

  return (
    <button
      onClick={startTour}
      className="fixed bottom-24 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-sm text-amber-400 shadow-lg backdrop-blur-sm transition-colors hover:bg-amber-500/30 lg:bottom-6"
      title="Обучение"
      aria-label="Запустить обучение"
    >
      ?
    </button>
  );
}
