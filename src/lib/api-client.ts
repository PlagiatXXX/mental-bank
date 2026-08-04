/**
 * Перехватчик fetch для /api/* — обслуживает запросы локально из localStorage.
 *
 * Устанавливается один раз на клиенте (installLocalApi) и повторяет
 * поведение прежних серверных роутов, чтобы весь клиентский код
 * продолжал работать без изменений.
 */
import * as db from "./local-db";

let installed = false;

type Handler = (
  params: URLSearchParams,
  body: unknown,
) => Promise<{ status: number; body: unknown }> | { status: number; body: unknown };

type MethodMap = Record<string, Handler>;

const routes: Record<string, MethodMap> = {
  "/api/auth/me": {
    GET: (_p, _b) => db.authMe(),
    PATCH: (_p, body) => db.authPatch(body as Record<string, unknown>),
    DELETE: () => db.authDelete(),
  },
  "/api/auth/start": {
    POST: (_p, body) => {
      const b = (body ?? {}) as Record<string, unknown>;
      return db.authStart(b.nickname, b.avatar);
    },
  },
  "/api/deposits": {
    GET: (params) => db.depositsGet(params),
    POST: (_p, body) => db.depositsPost(body as Record<string, unknown>),
  },
  "/api/esp": {
    GET: (params) => db.espGet(params),
    POST: (_p, body) => db.espPost(body as Record<string, unknown>),
    PATCH: (_p, body) => db.espPatch(body as Record<string, unknown>),
  },
  "/api/victories": {
    GET: () => db.victoriesGet(),
    POST: (_p, body) => db.victoriesPost(body as Record<string, unknown>),
    PATCH: (_p, body) => db.victoriesPatch(body as Record<string, unknown>),
    DELETE: (params) => db.victoriesDelete(params),
  },
  "/api/affirmations": {
    GET: () => db.affirmationsGet(),
    POST: (_p, body) => db.affirmationsPost(body as Record<string, unknown>),
    PATCH: (_p, body) => db.affirmationsPatch(body as Record<string, unknown>),
    DELETE: (params) => db.affirmationsDelete(params),
  },
  "/api/visualizations": {
    GET: () => db.visualizationsGet(),
    POST: (_p, body) => db.visualizationsPost(body as Record<string, unknown>),
    DELETE: (params) => db.visualizationsDelete(params),
  },
  "/api/attacks": {
    GET: () => db.attacksGet(),
    POST: (_p, body) => db.attacksPost(body as Record<string, unknown>),
    PATCH: (_p, body) => db.attacksPatch(body as Record<string, unknown>),
    DELETE: (params) => db.attacksDelete(params),
  },
  "/api/rituals": {
    GET: () => db.ritualsGet(),
    POST: (_p, body) => db.ritualsPost(body as Record<string, unknown>),
    DELETE: (params) => db.ritualsDelete(params),
  },
  "/api/aar": {
    GET: () => db.aarsGet(),
    POST: (_p, body) => db.aarsPost(body as Record<string, unknown>),
    DELETE: (params) => db.aarsDelete(params),
  },
  "/api/balance": {
    GET: (params) => db.balanceGet(params),
  },
  "/api/confirm-day": {
    POST: () => db.confirmDay(),
  },
  "/api/earnings": {
    POST: (_p, body) => db.earningsPost(body as Record<string, unknown>),
  },
  "/api/upload": {
    POST: (_p, body) => db.uploadPost(body as FormData),
  },
  "/api/ai": {
    POST: (_p, body) => db.aiPost(body as Record<string, unknown>),
  },
};

async function readBody(input: RequestInfo | URL, init?: RequestInit): Promise<unknown> {
  if (!init?.body) return null;
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body);
    } catch {
      return null;
    }
  }
  if (init.body instanceof FormData) return init.body;
  if (init.body instanceof URLSearchParams) return init.body;
  if (init.body instanceof Blob) {
    try {
      return JSON.parse(await init.body.text());
    } catch {
      return null;
    }
  }
  return null;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleLocal(url: URL, init?: RequestInit): Promise<Response> {
  const handler = routes[url.pathname]?.[init?.method || "GET"];
  if (!handler) {
    return jsonResponse(404, { error: "Not Found" });
  }
  try {
    const body = await readBody(url, init);
    const result = await handler(url.searchParams, body);
    return jsonResponse(result.status, result.body);
  } catch (error) {
    console.error(`[local-api] ${init?.method || "GET"} ${url.pathname} error:`, error);
    return jsonResponse(500, { error: "Внутренняя ошибка" });
  }
}

/** Устанавливает перехватчик /api/* — вызвать один раз на клиенте. */
export function installLocalApi(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === "string" ? new URL(input, window.location.origin) : input;
    if (url instanceof URL && url.pathname.startsWith("/api/")) {
      return handleLocal(url, init);
    }
    return originalFetch(input, init);
  };
}
