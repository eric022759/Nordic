import { afterEach, describe, expect, it, vi } from "vitest";

import {
  WEATHER_CACHE_TTL_MS,
  WEATHER_REFRESH_COOLDOWN_MS,
  acquireWeatherRequest,
  claimWeatherRefresh,
  getWeatherCacheKey,
  getWeatherRefreshCooldownRemaining,
  readWeatherCache,
  resetWeatherRuntimeStateForTests,
  resolveWeatherFallback,
  writeWeatherCache,
  type WeatherStorage,
} from "@/lib/weather-cache";
import {
  WeatherServiceError,
  normalizeWeatherForecast,
  type WeatherDestination,
} from "@/lib/weather";

class MemoryStorage implements WeatherStorage {
  readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const destination: WeatherDestination = {
  id: "oslo",
  name: "奧斯陸",
  latitude: 59.9139,
  longitude: 10.7522,
  timezone: "Europe/Oslo",
};

const forecast = normalizeWeatherForecast({
  timezone: destination.timezone,
  current: {
    time: "2026-08-28T12:00",
    temperature_2m: 15,
    apparent_temperature: 14,
    weather_code: 3,
    relative_humidity_2m: 82,
  },
  daily: {
    time: ["2026-08-28", "2026-08-29"],
    weather_code: [3, 61],
    temperature_2m_max: [16, 15],
    temperature_2m_min: [10, 9],
    apparent_temperature_max: [15, 14],
    apparent_temperature_min: [9, 8],
    relative_humidity_2m_mean: [82, 96],
  },
})!;

afterEach(() => {
  resetWeatherRuntimeStateForTests();
  vi.restoreAllMocks();
});

describe("weather localStorage cache", () => {
  it("uses the exact key and remains fresh for less than 30 minutes", () => {
    const storage = new MemoryStorage();
    const fetchedAt = 1_000_000;
    expect(writeWeatherCache(destination.id, forecast, fetchedAt, storage)).toBe(
      true,
    );
    expect(getWeatherCacheKey(destination.id)).toBe(
      "nordic-trip-weather:oslo",
    );

    expect(
      readWeatherCache(
        destination.id,
        fetchedAt + WEATHER_CACHE_TTL_MS - 1,
        storage,
      ),
    ).toMatchObject({ isFresh: true, isStale: false });
    expect(
      readWeatherCache(
        destination.id,
        fetchedAt + WEATHER_CACHE_TTL_MS,
        storage,
      ),
    ).toMatchObject({ isFresh: false, isStale: true });
  });

  it("discards malformed entries without throwing", () => {
    const storage = new MemoryStorage();
    storage.setItem(getWeatherCacheKey(destination.id), "{not-json");
    expect(readWeatherCache(destination.id, Date.now(), storage)).toEqual({
      entry: null,
      isFresh: false,
      isStale: false,
    });
    expect(storage.getItem(getWeatherCacheKey(destination.id))).toBeNull();
  });
});

describe("stale, offline, and 429 fallback", () => {
  const cachedEntry = { fetchedAt: 500, data: forecast };

  it("retains old cache after an ordinary fetch failure", () => {
    const result = resolveWeatherFallback(new Error("network"), cachedEntry);
    expect(result.kind).toBe("stale");
    expect(result.data).toBe(forecast);
    expect(result.message).toBe("可能非最新資料");
  });

  it("retains old cache and uses the exact HTTP 429 message", () => {
    const error = new WeatherServiceError(
      "busy",
      "rate-limit",
      429,
    );
    const result = resolveWeatherFallback(error, cachedEntry);
    expect(result).toMatchObject({
      kind: "rate-limited",
      data: forecast,
      message: "天氣服務暫時繁忙，請稍後再試",
      secondaryMessage: "可能非最新資料",
    });
  });

  it("clearly labels cached data while offline", () => {
    expect(resolveWeatherFallback(null, cachedEntry, true)).toMatchObject({
      kind: "offline",
      data: forecast,
      message: "離線模式／非即時資料",
    });
  });

  it("uses the exact generic message when there is no fallback", () => {
    expect(resolveWeatherFallback(new Error("network"), null).message).toBe(
      "暫時無法載入天氣，請稍後再試",
    );
  });
});

describe("manual refresh cooldown", () => {
  it("allows one refresh per destination every 60 seconds", () => {
    const first = claimWeatherRefresh(destination.id, 10_000);
    expect(first.allowed).toBe(true);
    expect(
      getWeatherRefreshCooldownRemaining(destination.id, 10_001),
    ).toBe(WEATHER_REFRESH_COOLDOWN_MS - 1);
    expect(claimWeatherRefresh(destination.id, 69_999).allowed).toBe(false);
    expect(claimWeatherRefresh(destination.id, 70_000).allowed).toBe(true);
  });
});

describe("shared in-flight request", () => {
  it("aborts only after the final mounted consumer releases", async () => {
    let requestSignal: AbortSignal | undefined;
    const fetcher = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal ?? undefined;
          requestSignal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    ) as unknown as typeof fetch;

    const first = acquireWeatherRequest(destination, fetcher);
    const second = acquireWeatherRequest(destination, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first.promise).toBe(second.promise);

    first.release();
    expect(requestSignal?.aborted).toBe(false);
    second.release();
    expect(requestSignal?.aborted).toBe(true);
    await expect(first.promise).rejects.toMatchObject({ name: "AbortError" });
  });
});
