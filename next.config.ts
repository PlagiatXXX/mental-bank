import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const PAGE_ROUTES = [
  "/",
  "/aar/",
  "/account-2/",
  "/account-3/",
  "/cba/",
  "/deposits/",
  "/esp-journal/",
  "/mindset/",
  "/offline/",
  "/privacy/",
  "/protection/",
  "/rituals/",
  "/tools/",
  "/top-10/",
  "/welcome/",
];

const withSerwist = withSerwistInit({
  // Отключаем Serwist в dev — Turbopack не поддерживается.
  disable: process.env.NODE_ENV !== "production",
  // Файл service worker'а (TypeScript, собирается на этапе build)
  swSrc: "src/app/sw.ts",
  // Куда кладётся скомпилированный worker
  swDest: "public/sw.js",
  // Офлайн-страница для navigateFallback должна быть в precache,
  // иначе Serwist падает при инициализации worker'а.
  additionalPrecacheEntries: [
    // При статическом экспорте HTML-страницы не попадают в precache
    // автоматически (в отличие от серверной сборки) — добавляем вручную,
    // чтобы посещённые/все страницы открывались офлайн.
    ...PAGE_ROUTES.map((url) => ({ url, revision: "1.0.0" })),
  ],
});

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.135"],
  // Статический экспорт: приложение полностью живёт в браузере (localStorage),
  // сервер не нужен — ни для API, ни для данных.
  output: "export",
  // next/image не может оптимизировать картинки в статическом экспорте
  // (нет сервера /_next/image) — отдаём оригиналы как есть.
  images: { unoptimized: true },
  // Каждая страница — директория с index.html (/esp-journal → /esp-journal/),
  // чтобы прямые переходы по URL работали в Capacitor WebView.
  trailingSlash: true,
};

export default withSerwist(nextConfig);
