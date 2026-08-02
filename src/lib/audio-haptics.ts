/**
 * Аудио + тактильная обратная связь для колбы.
 * Использует Howler.js для звуков и Vibration API для мобильных.
 */

import { Howl } from "howler";

// ---- Ленивая инициализация (только после первого взаимодействия) ----

let triumphSound: Howl | null = null;

function initSounds() {
  if (triumphSound) return;
  triumphSound = new Howl({
    src: ["/sounds/triumph.wav"],
    volume: 0.5,
    preload: true,
  });
}

/** Звук триумфа — подтверждение дня */
export function playTriumphSound() {
  try {
    initSounds();
    triumphSound?.play();
  } catch {
    // игнорируем
  }
}

/** Тактильная обратная связь */
export function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // игнорируем
  }
}

/** Комбинированный эффект: звук + вибрация */
export function depositFeedback() {
  vibrate(30);
}

export function confirmDayFeedback() {
  playTriumphSound();
  vibrate([50, 100, 50, 100, 50]);
}
