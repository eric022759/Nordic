import {
  fetchWeatherForecast,
  isWeatherRateLimitError,
  normalizeWeatherForecast,
  type WeatherDestination,
  type WeatherForecast,
} from "@/lib/weather";

export const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;
export const WEATHER_REFRESH_COOLDOWN_MS = 60 * 1000;
export const WEATHER_CACHE_PREFIX = "nordic-trip-weather:";

export interface WeatherCacheEntry {
  fetchedAt: number;
  data: WeatherForecast;
}

export interface WeatherCacheRead {
  entry: WeatherCacheEntry | null;
  isFresh: boolean;
  isStale: boolean;
}

export type WeatherStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

function browserStorage(): WeatherStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getWeatherCacheKey(destinationId: string): string {
  return `${WEATHER_CACHE_PREFIX}${destinationId}`;
}

export function readWeatherCache(
  destinationId: string,
  now = Date.now(),
  storage: WeatherStorage | null = browserStorage(),
): WeatherCacheRead {
  const miss: WeatherCacheRead = {
    entry: null,
    isFresh: false,
    isStale: false,
  };
  if (!storage) return miss;

  const key = getWeatherCacheKey(destinationId);
  try {
    const raw = storage.getItem(key);
    if (!raw) return miss;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      storage.removeItem(key);
      return miss;
    }

    const candidate = parsed as Record<string, unknown>;
    const data = normalizeWeatherForecast(candidate.data);
    if (
      typeof candidate.fetchedAt !== "number" ||
      !Number.isFinite(candidate.fetchedAt) ||
      !data
    ) {
      storage.removeItem(key);
      return miss;
    }

    const fetchedAt = candidate.fetchedAt;
    const isFresh = Math.max(0, now - fetchedAt) < WEATHER_CACHE_TTL_MS;
    return {
      entry: { fetchedAt, data },
      isFresh,
      isStale: !isFresh,
    };
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      // localStorage is optional and can be unavailable in privacy mode.
    }
    return miss;
  }
}

export function writeWeatherCache(
  destinationId: string,
  data: WeatherForecast,
  fetchedAt = Date.now(),
  storage: WeatherStorage | null = browserStorage(),
): boolean {
  if (!storage || !Number.isFinite(fetchedAt)) return false;
  try {
    storage.setItem(
      getWeatherCacheKey(destinationId),
      JSON.stringify({ fetchedAt, data } satisfies WeatherCacheEntry),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearWeatherCache(
  destinationId: string,
  storage: WeatherStorage | null = browserStorage(),
): void {
  try {
    storage?.removeItem(getWeatherCacheKey(destinationId));
  } catch {
    // Cache failure must not prevent the itinerary from rendering.
  }
}

export type WeatherFallbackKind =
  | "offline"
  | "rate-limited"
  | "stale"
  | "error";

export interface WeatherFallback {
  kind: WeatherFallbackKind;
  data: WeatherForecast | null;
  fetchedAt: number | null;
  message: string;
  secondaryMessage: string | null;
}

export function resolveWeatherFallback(
  error: unknown,
  cachedEntry: WeatherCacheEntry | null,
  offline = false,
): WeatherFallback {
  const data = cachedEntry?.data ?? null;
  const fetchedAt = cachedEntry?.fetchedAt ?? null;

  if (offline) {
    return {
      kind: "offline",
      data,
      fetchedAt,
      message: data
        ? "離線模式／非即時資料"
        : "暫時無法載入天氣，請稍後再試",
      secondaryMessage: data ? "可能非最新資料" : null,
    };
  }
  if (isWeatherRateLimitError(error)) {
    return {
      kind: "rate-limited",
      data,
      fetchedAt,
      message: "天氣服務暫時繁忙，請稍後再試",
      secondaryMessage: data ? "可能非最新資料" : null,
    };
  }
  if (data) {
    return {
      kind: "stale",
      data,
      fetchedAt,
      message: "可能非最新資料",
      secondaryMessage: null,
    };
  }
  return {
    kind: "error",
    data: null,
    fetchedAt: null,
    message: "暫時無法載入天氣，請稍後再試",
    secondaryMessage: null,
  };
}

interface InflightWeatherRequest {
  controller: AbortController;
  promise: Promise<WeatherForecast | null>;
  consumers: Set<symbol>;
  settled: boolean;
}

export interface WeatherRequestLease {
  promise: Promise<WeatherForecast | null>;
  signal: AbortSignal;
  release: () => void;
}

const inflightRequests = new Map<string, InflightWeatherRequest>();

/**
 * Acquires the page-lifetime request for one destination. A lease releases one
 * consumer; the AbortController fires only after every consumer has released.
 */
export function acquireWeatherRequest(
  destination: WeatherDestination,
  fetcher: typeof fetch = fetch,
): WeatherRequestLease {
  let request = inflightRequests.get(destination.id);
  if (!request) {
    const controller = new AbortController();
    const nextRequest: InflightWeatherRequest = {
      controller,
      promise: Promise.resolve(null),
      consumers: new Set(),
      settled: false,
    };
    nextRequest.promise = fetchWeatherForecast(
      destination,
      controller.signal,
      fetcher,
    );
    request = nextRequest;
    inflightRequests.set(destination.id, request);

    const settle = () => {
      nextRequest.settled = true;
      if (inflightRequests.get(destination.id) === nextRequest) {
        inflightRequests.delete(destination.id);
      }
    };
    void nextRequest.promise.then(settle, settle);
  }

  const consumer = Symbol(destination.id);
  request.consumers.add(consumer);
  let released = false;
  return {
    promise: request.promise,
    signal: request.controller.signal,
    release: () => {
      if (released) return;
      released = true;
      request?.consumers.delete(consumer);
      if (request && request.consumers.size === 0 && !request.settled) {
        request.controller.abort();
        if (inflightRequests.get(destination.id) === request) {
          inflightRequests.delete(destination.id);
        }
      }
    },
  };
}

const lastRefreshAt = new Map<string, number>();

export interface WeatherRefreshClaim {
  allowed: boolean;
  remainingMs: number;
  retryAt: number;
}

export function getWeatherRefreshCooldownRemaining(
  destinationId: string,
  now = Date.now(),
): number {
  const lastAttempt = lastRefreshAt.get(destinationId);
  return lastAttempt === undefined
    ? 0
    : Math.max(0, WEATHER_REFRESH_COOLDOWN_MS - (now - lastAttempt));
}

export function claimWeatherRefresh(
  destinationId: string,
  now = Date.now(),
): WeatherRefreshClaim {
  const remainingMs = getWeatherRefreshCooldownRemaining(destinationId, now);
  if (remainingMs > 0) {
    return { allowed: false, remainingMs, retryAt: now + remainingMs };
  }
  lastRefreshAt.set(destinationId, now);
  return {
    allowed: true,
    remainingMs: WEATHER_REFRESH_COOLDOWN_MS,
    retryAt: now + WEATHER_REFRESH_COOLDOWN_MS,
  };
}

/** Test-only reset for module-lifetime request and cooldown state. */
export function resetWeatherRuntimeStateForTests(): void {
  for (const request of inflightRequests.values()) {
    if (!request.settled) request.controller.abort();
  }
  inflightRequests.clear();
  lastRefreshAt.clear();
}
