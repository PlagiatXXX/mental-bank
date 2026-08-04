import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Файл service worker'а (TypeScript, собирается на этапе build)
  swSrc: "src/app/sw.ts",
  // Куда кладётся скомпилированный worker
  swDest: "public/sw.js",
  // Офлайн-страница для navigateFallback должна быть в precache,
  // иначе Serwist падает при инициализации worker'а.
  additionalPrecacheEntries: [{ url: "/offline", revision: "1" }],
});

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.135"],
};

export default withSerwist(nextConfig);
