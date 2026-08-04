import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Параметры с префиксом "_" (напр. неиспользуемые _params/_body
      // в хендлерах локального API) игнорируются.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Сгенерированный Serwist service worker — не редактируется руками.
    "public/sw.js",
    // Android-проект: скопированные web-ассеты и сгенерированный код
    // (Capacitor) не редактируются руками.
    "android/**",
  ]),
]);

export default eslintConfig;
