/**
 * Генерирует WAV-файлы звуков для сейфа.
 * Запуск: node scripts/generate-sounds.mjs
 *
 * Параметры осцилляторов — точная копия логики из audio-haptics.ts,
 * но рендеринг через OfflineAudioContext для экспорта в файл.
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/sounds");

const SAMPLE_RATE = 44100;

// ---- WAV encoder ----

function encodeWav(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s * 0x7fff, true);
  }

  return Buffer.from(buffer);
}

// ---- Генераторы звуков ----

/**
 * Звон монеты (как в playCoinSound)
 */
function generateCoinSound(duration = 0.12) {
  const len = Math.ceil(SAMPLE_RATE * duration);
  const out = new Float32Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 30); // затухание
    // Основной тон 880 -> 1320
    const freq1 = 880 + (1320 - 880) * (t / duration);
    const s1 = Math.sin(2 * Math.PI * freq1 * t);
    // Square harmonic 1320 -> 1760
    const freq2 = 1320 + (1760 - 1320) * (t / duration);
    const s2 = Math.sign(Math.sin(2 * Math.PI * freq2 * t));

    out[i] = env * (s1 * 0.15 + s2 * 0.04);
  }

  return out;
}

/**
 * Глухой стук закрытия (как в playSafeCloseSound)
 */
function generateSafeCloseSound(duration = 0.3) {
  const len = Math.ceil(SAMPLE_RATE * duration);
  const out = new Float32Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 12);
    // Triangle wave 200 -> 80
    const phase = (200 + (80 - 200) * (t / duration)) * t;
    const tri = 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1;
    // Sine sub 60 Hz
    const sub = Math.sin(2 * Math.PI * 60 * t);

    out[i] = env * (tri * 0.3 + sub * 0.15);
  }

  return out;
}

/**
 * Триумф — восходящие ноты C5, E5, G5, C6 (как в playTriumphSound)
 */
function generateTriumphSound() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const noteDuration = 0.35;
  const totalDuration = noteDuration * notes.length + 0.15;
  const len = Math.ceil(SAMPLE_RATE * totalDuration);
  const out = new Float32Array(len);

  for (let n = 0; n < notes.length; n++) {
    const freq = notes[n];
    const startSample = Math.ceil(SAMPLE_RATE * n * noteDuration);
    const noteLen = Math.ceil(SAMPLE_RATE * noteDuration);
    for (let i = 0; i < noteLen; i++) {
      const idx = startSample + i;
      if (idx >= len) break;
      const t = i / SAMPLE_RATE;
      const attack = Math.min(1, t / 0.02);
      const decay = Math.exp(-t * 4);
      const env = attack * decay;
      const s = Math.sin(2 * Math.PI * freq * t);
      out[idx] += env * s * 0.12;
    }
  }

  // Хвостовое затухание
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    out[i] *= Math.min(1, 1 - (t - totalDuration + 0.15) / 0.15 || 1);
  }

  return out;
}

// ---- Сборка ----

mkdirSync(OUT, { recursive: true });

const sounds = [
  { name: "coin.wav", fn: generateCoinSound, duration: 0.12 },
  { name: "safe-close.wav", fn: generateSafeCloseSound, duration: 0.3 },
  { name: "triumph.wav", fn: generateTriumphSound, duration: 1.55 },
];

for (const { name, fn, duration } of sounds) {
  const samples = fn(duration);
  const wav = encodeWav(samples, SAMPLE_RATE);
  const path = resolve(OUT, name);
  writeFileSync(path, wav);
  console.log(`✓ ${name}  ${(wav.length / 1024).toFixed(1)} KB  ${samples.length} samples`);
}

console.log("\nDone. Generated in", OUT);
