import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Файл service worker'а (TypeScript, собирается на этапе build)
  swSrc: "src/app/sw.ts",
  // Куда кладётся скомпилированный worker
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.135"],
};

export default withSerwist(nextConfig);
