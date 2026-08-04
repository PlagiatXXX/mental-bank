/**
 * Полностью локальное хранилище данных — замена серверных API-роутов и Prisma.
 *
 * Все данные пользователя живут в localStorage (ключ "mb_local_db_v1").
 * Формат объектов и логика (UTC-сутки, лимиты, конфликты "один на день")
 * повторяют прежние серверные роуты 1-в-1, чтобы клиентский код не менялся.
 */

// ---- Типы (соответствуют JSON, который раньше отдавали API-роуты) ----

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface Deposit {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
}

export interface Victory {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ESPEntry {
  id: string;
  date: string; // ISO, полночь UTC дня
  effort: string;
  success: string;
  progress: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Affirmation {
  id: string;
  text: string;
  context: string | null;
  isValid: boolean;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Visualization {
  id: string;
  title: string;
  content: string;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ConfidenceAttack {
  id: string;
  source: string;
  type: string;
  context: string;
  defence: string | null;
  resolved: boolean;
  createdAt: string;
  userId: string;
}

export interface Ritual {
  id: string;
  name: string;
  steps: string; // JSON-строка (как в БД) — фронт парсит сам
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface AAR {
  id: string;
  eventTitle: string;
  whatHappened: string | null;
  soWhat: string | null;
  nowWhat: string | null;
  balanceType: string;
  lessons: string | null; // JSON-строка
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface PendingEarning {
  id: string;
  amount: number;
  source: string;
  sourceId: string | null;
  confirmed: boolean;
  confirmedAt: string | null;
  createdAt: string;
  userId: string;
}

interface DB {
  user: User | null;
  deposits: Deposit[];
  victories: Victory[];
  espEntries: ESPEntry[];
  affirmations: Affirmation[];
  visualizations: Visualization[];
  attacks: ConfidenceAttack[];
  rituals: Ritual[];
  aars: AAR[];
  pendingEarnings: PendingEarning[];
}

const KEY = "mb_local_db_v1";

let cache: DB | null = null;

function emptyDB(): DB {
  return {
    user: null,
    deposits: [],
    victories: [],
    espEntries: [],
    affirmations: [],
    visualizations: [],
    attacks: [],
    rituals: [],
    aars: [],
    pendingEarnings: [],
  };
}

function load(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      cache = { ...emptyDB(), ...parsed };
      return cache;
    }
  } catch {
    // повреждённые данные — начинаем с чистого листа
  }
  cache = emptyDB();
  return cache;
}

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(load()));
  } catch {
    // переполнение localStorage — пусть бросит выше
    throw new Error("localStorage full");
  }
}

/** Сброс всех данных (для тестов). */
export function resetLocalDB(): void {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

// ---- UTC-сутки (как на сервере) ----

function utcDayStart(d: Date = new Date()): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function utcDayKey(d: Date = new Date()): string {
  return utcDayStart(d).toISOString();
}

function isSameUtcDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

// ---- Вспомогательное ----

function addPendingEarning(
  db: DB,
  source: string,
  sourceId: string | null = null,
  amount: number = 1,
): PendingEarning {
  const earning: PendingEarning = {
    id: genId(),
    amount,
    source,
    sourceId,
    confirmed: false,
    confirmedAt: null,
    createdAt: nowIso(),
    userId: db.user!.id,
  };
  db.pendingEarnings.push(earning);
  return earning;
}

// ================= Auth =================

export function authStart(nicknameRaw: unknown, avatarRaw: unknown): { status: number; body: unknown } {
  const nickname =
    typeof nicknameRaw === "string" ? nicknameRaw.trim() : "";
  if (!nickname) {
    return { status: 400, body: { error: "Никнейм обязателен" } };
  }
  const db = load();
  let avatar = "";
  if (typeof avatarRaw === "string") avatar = avatarRaw.trim().slice(0, 8);
  db.user = {
    id: genId(),
    nickname: nickname.slice(0, 30),
    avatar: avatar || "🪙",
    createdAt: nowIso(),
    lastSeenAt: nowIso(),
  };
  save();
  return { status: 200, body: { user: db.user } };
}

export function authMe(): { status: number; body: unknown } {
  const db = load();
  return { status: 200, body: { user: db.user } };
}

export function authPatch(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const updates: Partial<User> = {};
  if (body.nickname !== undefined) {
    const nickname = String(body.nickname).trim();
    if (nickname) updates.nickname = nickname.slice(0, 30);
  }
  if (body.avatar !== undefined) {
    const avatar = String(body.avatar).trim();
    if (avatar) updates.avatar = avatar;
  }
  if (Object.keys(updates).length === 0) {
    return { status: 400, body: { error: "Нет данных для обновления" } };
  }
  db.user = { ...db.user, ...updates, lastSeenAt: nowIso() };
  save();
  return { status: 200, body: { user: db.user } };
}

export function authDelete(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  cache = emptyDB();
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return { status: 200, body: { success: true } };
}

// ================= Deposits =================

export function depositsGet(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: { deposits: [], today: null } };
  if (params.get("today") === "true") {
    const todayKey = utcDayKey();
    const today = db.deposits.find((d) => isSameUtcDay(d.createdAt, todayKey)) ?? null;
    return { status: 200, body: { today } };
  }
  const deposits = [...db.deposits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { status: 200, body: { deposits } };
}

export function depositsPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return { status: 400, body: { error: "Текст депозита обязателен" } };
  const todayKey = utcDayKey();
  if (db.deposits.some((d) => isSameUtcDay(d.createdAt, todayKey))) {
    return {
      status: 409,
      body: { error: "Сегодня вы уже сделали депозит. Один депозит в день — это ритуал." },
    };
  }
  const deposit: Deposit = {
    id: genId(),
    text: text.slice(0, 500),
    createdAt: nowIso(),
    userId: db.user.id,
  };
  db.deposits.push(deposit);
  addPendingEarning(db, "deposit", deposit.id);
  save();
  return { status: 201, body: deposit };
}

// ================= ESP =================

export function espGet(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const sorted = [...db.espEntries].sort((a, b) => b.date.localeCompare(a.date));

  if (params.get("calendar")) {
    const month = params.get("calendar")!; // "YYYY-MM"
    const days = sorted
      .filter((e) => e.date.slice(0, 7) === month)
      .map((e) => e.date.slice(0, 10));
    return { status: 200, body: days };
  }

  if (params.get("search")) {
    const q = params.get("search")!.toLowerCase();
    const filter = params.get("filter");
    const fields = filter === "effort" || filter === "success" || filter === "progress"
      ? [filter]
      : ["effort", "success", "progress"];
    const limit = Math.min(100, parseInt(params.get("limit") || "50", 10) || 50);
    const offset = parseInt(params.get("offset") || "0", 10) || 0;
    const filtered = sorted.filter((e) =>
      fields.some((f) => (e as unknown as Record<string, string>)[f].toLowerCase().includes(q)),
    );
    return {
      status: 200,
      body: { entries: filtered.slice(offset, offset + limit), total: filtered.length },
    };
  }

  if (params.get("date")) {
    const day = params.get("date")!; // "YYYY-MM-DD"
    const entry = sorted.find((e) => e.date.slice(0, 10) === day) ?? null;
    return { status: 200, body: entry };
  }

  return { status: 200, body: sorted };
}

export function espPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const effort = typeof body.effort === "string" ? body.effort.trim() : "";
  const success = typeof body.success === "string" ? body.success.trim() : "";
  const progress = typeof body.progress === "string" ? body.progress.trim() : "";
  if (!effort || !success || !progress) {
    return { status: 400, body: { error: "Все поля (effort, success, progress) обязательны" } };
  }
  const today = utcDayStart().toISOString();
  if (db.espEntries.some((e) => e.date === today)) {
    return {
      status: 409,
      body: { error: "Запись на сегодня уже существует. Используйте PATCH для обновления." },
    };
  }
  const entry: ESPEntry = {
    id: genId(),
    date: today,
    effort,
    success,
    progress,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: db.user.id,
  };
  db.espEntries.push(entry);
  addPendingEarning(db, "esp", entry.id);
  save();
  return { status: 201, body: entry };
}

export function espPatch(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return { status: 400, body: { error: "ID записи обязателен" } };
  const entry = db.espEntries.find((e) => e.id === id && e.userId === db.user!.id);
  if (!entry) return { status: 500, body: { error: "Не удалось обновить запись" } };
  if (body.effort !== undefined) entry.effort = String(body.effort).trim();
  if (body.success !== undefined) entry.success = String(body.success).trim();
  if (body.progress !== undefined) entry.progress = String(body.progress).trim();
  entry.updatedAt = nowIso();
  save();
  return { status: 200, body: entry };
}

// ================= Victories =================

export function victoriesGet(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const list = [...db.victories].sort((a, b) => a.position - b.position);
  return { status: 200, body: list };
}

export function victoriesPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return { status: 400, body: { error: "Название победы обязательно" } };
  if (db.victories.length >= 10) {
    return { status: 400, body: { error: "Максимум 10 побед" } };
  }
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  const imageUrl =
    typeof body.imageUrl === "string" && body.imageUrl.trim()
      ? body.imageUrl.trim()
      : null;
  const victory: Victory = {
    id: genId(),
    title,
    description,
    imageUrl,
    position: db.victories.length + 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: db.user.id,
  };
  db.victories.push(victory);
  addPendingEarning(db, "victory", victory.id);
  save();
  return { status: 201, body: victory };
}

export function victoriesPatch(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return { status: 400, body: { error: "ID победы обязателен" } };

  if (body.position !== undefined) {
    // Режим A: перемещение по списку
    const target = db.victories.find((v) => v.id === id);
    if (!target) return { status: 404, body: { error: "Победа не найдена" } };
    const newPos = Math.max(1, Math.min(10, Number(body.position)));
    const oldPos = target.position;
    if (oldPos !== newPos) {
      for (const v of db.victories) {
        if (v.id === id) continue;
        if (oldPos < v.position && v.position <= newPos) v.position -= 1;
        else if (newPos <= v.position && v.position < oldPos) v.position += 1;
      }
      target.position = newPos;
      target.updatedAt = nowIso();
    }
    save();
    return {
      status: 200,
      body: [...db.victories].sort((a, b) => a.position - b.position),
    };
  }

  // Режим B: обновление полей
  const target = db.victories.find((v) => v.id === id && v.userId === db.user!.id);
  if (!target) return { status: 500, body: { error: "Не удалось обновить победу" } };
  if (typeof body.title === "string" && body.title.trim()) target.title = body.title.trim();
  if (body.description !== undefined) {
    target.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
  }
  if (body.imageUrl !== undefined) {
    target.imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null;
  }
  target.updatedAt = nowIso();
  save();
  return { status: 200, body: target };
}

export function victoriesDelete(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = params.get("id") || "";
  if (!id) return { status: 400, body: { error: "ID победы обязателен" } };
  db.victories = db.victories.filter((v) => v.id !== id);
  db.victories.sort((a, b) => a.position - b.position);
  db.victories.forEach((v, i) => {
    v.position = i + 1;
    v.updatedAt = nowIso();
  });
  save();
  return { status: 200, body: { success: true } };
}

// ================= Affirmations =================

export function affirmationsGet(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const list = [...db.affirmations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { status: 200, body: list };
}

export function affirmationsPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return { status: 400, body: { error: "Текст аффирмации обязателен" } };
  const affirmation: Affirmation = {
    id: genId(),
    text,
    context:
      typeof body.context === "string" && body.context.trim() ? body.context.trim() : null,
    isValid: true,
    hitCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: db.user.id,
  };
  db.affirmations.push(affirmation);
  addPendingEarning(db, "affirmation", affirmation.id);
  save();
  return { status: 201, body: affirmation };
}

export function affirmationsPatch(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return { status: 400, body: { error: "ID аффирмации обязателен" } };
  const target = db.affirmations.find((a) => a.id === id && a.userId === db.user!.id);
  if (!target) return { status: 500, body: { error: "Не удалось обновить аффирмацию" } };
  if (body.text !== undefined) target.text = String(body.text).trim();
  if (body.context !== undefined) {
    target.context =
      typeof body.context === "string" && body.context.trim() ? body.context.trim() : null;
  }
  if (body.hitCount !== undefined) target.hitCount = Number(body.hitCount);
  target.updatedAt = nowIso();
  save();
  return { status: 200, body: target };
}

export function affirmationsDelete(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = params.get("id") || "";
  if (!id) return { status: 400, body: { error: "ID аффирмации обязателен" } };
  db.affirmations = db.affirmations.filter((a) => a.id !== id);
  save();
  return { status: 200, body: { success: true } };
}

// ================= Visualizations =================

export function visualizationsGet(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const list = [...db.visualizations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { status: 200, body: list };
}

export function visualizationsPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!title || !content) {
    return { status: 400, body: { error: "Название и содержание обязательны" } };
  }
  const visualization: Visualization = {
    id: genId(),
    title,
    content,
    eventDate: body.eventDate ? new Date(String(body.eventDate)).toISOString() : null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: db.user.id,
  };
  db.visualizations.push(visualization);
  save();
  return { status: 201, body: visualization };
}

export function visualizationsDelete(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = params.get("id") || "";
  if (!id) return { status: 400, body: { error: "ID визуализации обязателен" } };
  db.visualizations = db.visualizations.filter((v) => v.id !== id);
  save();
  return { status: 200, body: { success: true } };
}

// ================= Attacks =================

export function attacksGet(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const list = [...db.attacks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { status: 200, body: list };
}

export function attacksPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const source = typeof body.source === "string" ? body.source.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const context = typeof body.context === "string" ? body.context.trim() : "";
  if (!source || !type || !context) {
    return { status: 400, body: { error: "source, type и context обязательны" } };
  }
  const attack: ConfidenceAttack = {
    id: genId(),
    source,
    type,
    context,
    defence: null,
    resolved: false,
    createdAt: nowIso(),
    userId: db.user.id,
  };
  db.attacks.push(attack);
  save();
  return { status: 201, body: attack };
}

export function attacksPatch(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return { status: 400, body: { error: "ID атаки обязателен" } };
  const target = db.attacks.find((a) => a.id === id && a.userId === db.user!.id);
  if (!target) return { status: 500, body: { error: "Не удалось обновить запись об атаке" } };
  if (body.defence !== undefined) target.defence = String(body.defence).trim();
  if (body.resolved !== undefined) target.resolved = Boolean(body.resolved);
  save();
  return { status: 200, body: target };
}

export function attacksDelete(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = params.get("id") || "";
  if (!id) return { status: 400, body: { error: "ID атаки обязателен" } };
  db.attacks = db.attacks.filter((a) => a.id !== id);
  save();
  return { status: 200, body: { success: true } };
}

// ================= Rituals =================

export function ritualsGet(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const list = [...db.rituals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { status: 200, body: list };
}

export function ritualsPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || body.steps === undefined) {
    return { status: 400, body: { error: "name и steps обязательны" } };
  }
  const ritual: Ritual = {
    id: genId(),
    name,
    steps: JSON.stringify(body.steps),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: db.user.id,
  };
  db.rituals.push(ritual);
  addPendingEarning(db, "ritual", ritual.id);
  save();
  return { status: 201, body: ritual };
}

export function ritualsDelete(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = params.get("id") || "";
  if (!id) return { status: 400, body: { error: "ID ритуала обязателен" } };
  db.rituals = db.rituals.filter((r) => r.id !== id);
  save();
  return { status: 200, body: { success: true } };
}

// ================= AAR =================

export function aarsGet(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 200, body: [] };
  const list = [...db.aars].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { status: 200, body: list };
}

export function aarsPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const eventTitle = typeof body.eventTitle === "string" ? body.eventTitle.trim() : "";
  if (!eventTitle) return { status: 400, body: { error: "Название события обязательно" } };
  const clean = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  const aar: AAR = {
    id: genId(),
    eventTitle,
    whatHappened: clean(body.whatHappened),
    soWhat: clean(body.soWhat),
    nowWhat: clean(body.nowWhat),
    balanceType: typeof body.balanceType === "string" ? body.balanceType : "loss",
    lessons: body.lessons ? JSON.stringify(body.lessons) : null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    userId: db.user.id,
  };
  db.aars.push(aar);
  addPendingEarning(db, "aar", aar.id);
  save();
  return { status: 201, body: aar };
}

export function aarsDelete(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const id = params.get("id") || "";
  if (!id) return { status: 400, body: { error: "ID AAR обязателен" } };
  db.aars = db.aars.filter((a) => a.id !== id);
  save();
  return { status: 200, body: { success: true } };
}

// ================= Balance =================

export function balanceGet(params: URLSearchParams): { status: number; body: unknown } {
  const db = load();
  const counts = {
    victories: db.victories.length,
    espEntries: db.espEntries.length,
    affirmations: db.affirmations.length,
    visualizations: db.visualizations.length,
    aars: db.aars.length,
    rituals: db.rituals.length,
    deposits: db.deposits.length,
  };
  const account1 = counts.victories + counts.espEntries;
  const account2 = counts.affirmations;
  const account3 = counts.visualizations;
  const total = account1 + account2 + account3 + counts.aars + counts.rituals + counts.deposits;

  const todayKey = utcDayKey();
  const todayPending = db.pendingEarnings.filter(
    (p) => !p.confirmed && isSameUtcDay(p.createdAt, todayKey),
  );
  const pendingBalance = todayPending.reduce((sum, p) => sum + p.amount, 0);
  const pendingItems = todayPending
    .map((p) => ({ source: p.source, amount: p.amount, createdAt: p.createdAt }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const result: Record<string, unknown> = {
    total,
    account1,
    account2,
    account3,
    victories: counts.victories,
    espEntries: counts.espEntries,
    affirmations: counts.affirmations,
    visualizations: counts.visualizations,
    aars: counts.aars,
    rituals: counts.rituals,
    deposits: counts.deposits,
    pendingBalance,
    pendingCount: todayPending.length,
    pendingItems,
  };

  if (params.get("history") === "true") {
    const events = [
      ...db.victories,
      ...db.espEntries,
      ...db.affirmations,
      ...db.visualizations,
      ...db.aars,
      ...db.rituals,
      ...db.deposits,
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const byDay = new Map<string, number>();
    for (const ev of events) {
      const day = ev.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }
    const history = [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, cumulative: count }));
    let cumulative = 0;
    for (const h of history) {
      cumulative += h.cumulative;
      h.cumulative = cumulative;
    }
    if (history.length > 1) result.history = history;
  }

  return { status: 200, body: result };
}

// ================= Confirm day =================

export function confirmDay(): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const todayKey = utcDayKey();
  const pending = db.pendingEarnings.filter(
    (p) => !p.confirmed && isSameUtcDay(p.createdAt, todayKey),
  );
  const totalAmount = pending.reduce((sum, p) => sum + p.amount, 0);
  const confirmedAt = nowIso();
  for (const p of pending) {
    p.confirmed = true;
    p.confirmedAt = confirmedAt;
  }
  save();
  const message =
    pending.length > 0
      ? `Подтверждено ${pending.length} действий на ${totalAmount} ОУ`
      : "Нет неподтверждённых заработков за сегодня";
  return { status: 200, body: { confirmed: pending.length, totalAmount, message } };
}

// ================= Earnings =================

const ALLOWED_SOURCES = [
  "victory",
  "esp",
  "affirmation",
  "visualization",
  "aar",
  "ritual",
  "deposit",
];

export function earningsPost(body: Record<string, unknown>): { status: number; body: unknown } {
  const db = load();
  if (!db.user) return { status: 401, body: { error: "Unauthorized" } };
  const source = typeof body.source === "string" ? body.source : "";
  if (!ALLOWED_SOURCES.includes(source)) {
    return {
      status: 400,
      body: { error: "Поле source обязательно: victory | esp | affirmation | visualization | aar | ritual | deposit" },
    };
  }
  const sourceId = typeof body.sourceId === "string" ? body.sourceId : null;
  const amount =
    typeof body.amount === "number" && body.amount >= 0 ? body.amount : 1;
  const earning = addPendingEarning(db, source, sourceId, amount);
  save();
  return { status: 201, body: earning };
}

// ================= Upload =================

export async function uploadPost(formData: FormData): Promise<{ status: number; body: unknown }> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: 400, body: { error: "Файл не предоставлен" } };
  }
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED.includes(file.type)) {
    return { status: 400, body: { error: "Допустимы только JPEG, PNG, WebP и GIF" } };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { status: 400, body: { error: "Файл не должен превышать 5MB" } };
  }
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    // Проверяем, что картинка влезает в localStorage
    const db = load();
    const size = (localStorage.getItem(KEY) || "{}").length + dataUrl.length;
    if (size > 4_500_000) {
      return { status: 400, body: { error: "Файл не должен превышать 5MB" } };
    }
    void db;
    return { status: 200, body: { url: dataUrl } };
  } catch {
    return { status: 500, body: { error: "Не удалось загрузить файл" } };
  }
}

// ================= AI (заглушка, как на сервере) =================

const STUB_SUGGESTIONS: Record<string, string[]> = {
  effort: [
    "Проявил настойчивость в работе над сложной задачей, не сдаваясь после первой неудачи.",
    "Потратил время на изучение нового подхода, хотя было проще сделать «по-старому».",
    "Выполнил работу, требующую концентрации, несмотря на усталость или отвлечения.",
  ],
  success: [
    "Успешно завершил задачу, которая казалась нерешаемой. Получил работающий результат.",
    "Сделал важный шаг к цели — написал/настроил/запустил ключевую часть проекта.",
    "Помог коллеге или получил положительную обратную связь о своей работе.",
  ],
  progress: [
    "Разобрался в новой технологии/инструменте, который раньше казался сложным.",
    "Стал лучше понимать архитектуру проекта, увидел взаимосвязи между компонентами.",
    "Улучшил свои навыки: быстрее нахожу ошибки, пишу чище, принимаю решения увереннее.",
  ],
};

const STUB_VALIDATION = [
  "Отличная победа! Сфокусирована на результате, а не на процессе.",
  "Хорошее достижение. Советую добавить конкретный контекст (цифры, сроки).",
  "Сильная формулировка. Она будет напоминать о реальном прогрессе.",
];

export async function aiPost(body: Record<string, unknown>): Promise<{ status: number; body: unknown }> {
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return { status: 400, body: { error: "Текст обязателен" } };
  await new Promise((r) => setTimeout(r, 600));
  if (body.type === "validate") {
    const suggestion =
      STUB_VALIDATION[Math.floor(Math.random() * STUB_VALIDATION.length)];
    return { status: 200, body: { suggestion } };
  }
  const field =
    typeof body.field === "string" && STUB_SUGGESTIONS[body.field]
      ? body.field
      : "effort";
  const pool = STUB_SUGGESTIONS[field];
  const suggestion = pool[Math.floor(Math.random() * pool.length)];
  return { status: 200, body: { suggestion } };
}
