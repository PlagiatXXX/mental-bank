"use client";

import { useEffect } from "react";

/**
 * Регистрирует service worker для офлайн-режима и установки PWA.
 * Регистрируем только в production — в dev worker мешает горячей перезагрузке.
 */
export function RegisterSW() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Тихий фолбэк: без SW приложение просто работает онлайн.
      });
    }
  }, []);

  return null;
}
