"use client";

import { useLayoutEffect } from "react";
import { installLocalApi } from "@/lib/api-client";

/**
 * Устанавливает локальный перехватчик /api/* при монтировании.
 * useLayoutEffect (вместо useEffect), чтобы перехватчик был готов
 * до первых passive-эффектов страниц, которые делают fetch("/api/...").
 */
export function LocalApiBootstrap() {
  useLayoutEffect(() => {
    installLocalApi();
  }, []);

  return null;
}
