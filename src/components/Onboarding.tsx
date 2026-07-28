"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_KEY = "mb_onboarding_done";
const INDEX_KEY = "mb_tour_index";
const MODAL_KEY = "mental-bank:info-modal-dismissed";

interface Step {
  /** CSS-селектор элемента для подсветки */
  element?: string;
  /** Куда перейти перед показом этого шага */
  navigateTo?: string;
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
  // 4 — ESP: показываем на странице ESP
  {
    navigateTo: "/esp-journal",
    popover: {
      title: "📝 ESP-дневник",
      description:
        "ESP — это 'Доказательство уверенности' (Evidence of Self-confidence). Записывайте сюда любые свои победы, даже маленькие. Каждая запись — кирпичик в фундаменте вашей уверенности. Начните с трёх побед за сегодня.",
    },
  },
  // 5 — Аффирмации
  {
    navigateTo: "/account-2",
    popover: {
      title: "💬 Аффирмации",
      description:
        "Короткие фразы, которые перепрограммируют внутренний диалог. Формула: настоящее время, без частицы 'не'. 'Я уверен в себе' вместо 'я не буду бояться'. Повторяйте утром и перед важными встречами.",
    },
  },
  // 6 — Визуализация
  {
    navigateTo: "/account-3",
    popover: {
      title: "🎬 Визуализация",
      description:
        "Репетиция успеха в голове. Закройте глаза и представьте ситуацию в деталях: где вы, что видите, слышите, чувствуете. Мозг не отличает яркую визуализацию от реальности. Спортсмены используют это перед стартом.",
    },
  },
  // 7 — Топ-10
  {
    navigateTo: "/top-10",
    popover: {
      title: "🏆 Топ-10 побед",
      description:
        "Ваш личный зал славы. 10 самых важных достижений. Держите этот список под рукой и перечитывайте перед важными событиями. Каждая победа — доказательство: 'Я могу'.",
    },
  },
  // 8 — AAR
  {
    navigateTo: "/aar",
    popover: {
      title: "🔄 AAR — разбор действий",
      description:
        "After Action Review — инструмент спецназа. После любого дела отвечайте на 4 вопроса: 'Что планировал?', 'Что получилось?', 'Почему?', 'Что делать иначе?'. Без самобичевания. Только анализ.",
    },
  },
  // 9 — Убеждения
  {
    navigateTo: "/mindset",
    popover: {
      title: "🧠 Убеждения",
      description:
        "Наши убеждения — это фильтры реальности. Если вы считаете 'я невезучий' — мозг будет искать подтверждения. Хорошая новость: убеждения можно менять. Этот инструмент поможет найти и переписать ограничивающие установки.",
    },
  },
  // 10 — Защита уверенности
  {
    navigateTo: "/protection",
    popover: {
      title: "🛡️ Защита уверенности",
      description:
        "Внешний мир будет атаковать вашу уверенность — критика, сравнение, обесценивание. Этот инструмент — ваша психологическая броня. Отслеживайте атаки и отвечайте на них осознанно, а не реактивно.",
    },
  },
  // 11 — Ритуалы
  {
    navigateTo: "/rituals",
    popover: {
      title: "⚡ Ритуалы",
      description:
        "Ритуалы — это якоря состояния. Определённая последовательность действий перед важным событием настраивает мозг на нужный лад. Певцы делают распевку, спортсмены — разминку. Создайте свой ритуал уверенности.",
    },
  },
  // 12 — C-B-A
  {
    navigateTo: "/cba",
    popover: {
      title: "🌬️ C-B-A / Дыхание",
      description:
        "C-B-A — это перезагрузка: Событие → Мысль → Реакция. Когда происходит триггер, у вас есть 3 секунды, чтобы поймать автоматическую мысль и выбрать реакцию. Дыхание — якорь для этой паузы.",
    },
  },
  // 13 — История депозитов
  {
    navigateTo: "/deposits",
    popover: {
      title: "📜 История депозитов",
      description:
        "Здесь хранятся все ваши депозиты — от первого до сегодняшнего. Полезно возвращаться в трудные дни и видеть: 'Я уже прошёл этот путь'. Это ваш дневник роста уверенности.",
    },
  },
  // 14 — Соцсети (на главной)
  {
    navigateTo: "/",
    popover: {
      title: "🌐 Подпишитесь",
      description:
        "Чтобы не потерять проект и получать обновления, подпишитесь на соцсети. Приятного пути!",
    },
  },
  // 15 — Донат (на главной)
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
    const currentPath = window.location.pathname;

    // Ищем первый видимый элемент среди всех, подходящих под селектор
    function findVisible(selector: string): Element | null {
      const all = document.querySelectorAll(selector);
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) return el;
      }
      return null;
    }

    // Строим шаги: для каждого ALL_STEPS решаем, показывать на этой странице
    // или сперва перейти на другую.
    const steps: {
      element?: () => Element;
      popover?: { title: string; description: string; side?: string };
      onNext?: () => false | void;
    }[] = [];

    for (let i = 0; i < ALL_STEPS.length; i++) {
      const s = ALL_STEPS[i];

      // Шаг требует перехода на другую страницу
      if (s.navigateTo && s.navigateTo !== currentPath) {
        steps.push({
          popover: {
            title: s.popover.title,
            description: s.popover.description,
          },
          onNext: () => {
            localStorage.setItem(INDEX_KEY, String(i + 1));
            window.location.href = s.navigateTo!;
            return false;
          },
        });
        continue;
      }

      // Мы на правильной странице — показываем элемент, если он есть и видим
      const el = s.element ? findVisible(s.element) : null;
      steps.push({
        element: el ? () => el as Element : undefined,
        popover: {
          title: s.popover.title,
          description: s.popover.description,
          ...(s.popover.side ? { side: s.popover.side } : {}),
        },
      });
    }

    // Проверяем, не продолжаем ли тур после перехода между страницами
    const savedIndex = localStorage.getItem(INDEX_KEY);
    let startIndex = 0;
    if (savedIndex) {
      startIndex = parseInt(savedIndex, 10);
      localStorage.removeItem(INDEX_KEY);
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: "Далее →",
      prevBtnText: "← Назад",
      doneBtnText: "Готово!",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: steps as any,
      onDestroyed: () => {
        localStorage.removeItem(INDEX_KEY);
        localStorage.setItem(STORAGE_KEY, "true");
        setShowButton(true);
      },
    });

    driverObj.drive(startIndex);
  }, []);

  // Автостарт после регистрации: модалка закрыта + мы на главной
  useEffect(() => {
    if (autoStartedRef.current) return;

    const modalDismissed = localStorage.getItem(MODAL_KEY) === "true";
    const tourDone = localStorage.getItem(STORAGE_KEY) === "true";
    const savedIndex = localStorage.getItem(INDEX_KEY);

    // Продолжаем тур после перехода между страницами
    if (savedIndex !== null && !tourDone) {
      autoStartedRef.current = true;
      const timer = setTimeout(() => startTour(), 600);
      return () => clearTimeout(timer);
    }

    // Первый запуск: модалка закрыта + мы на главной
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
