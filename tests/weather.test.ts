import { describe, expect, it, vi } from "vitest";

import {
  OPEN_METEO_CURRENT_FIELDS,
  OPEN_METEO_DAILY_FIELDS,
  OPEN_METEO_FORECAST_DAYS,
  OPEN_METEO_FORECAST_ENDPOINT,
  PRECISE_FORECAST_UNAVAILABLE_MESSAGE,
  WeatherServiceError,
  buildOpenMeteoUrl,
  fetchWeatherForecast,
  formatWeatherDate,
  formatWeatherUpdatedAt,
  getNextFiveDayForecast,
  getTripForecastMessage,
  getWmoWeather,
  isTripDateInForecastRange,
  normalizeWeatherForecast,
  type WeatherDestination,
} from "@/lib/weather";

const destination: WeatherDestination = {
  id: "copenhagen",
  name: "哥本哈根",
  latitude: 55.6761,
  longitude: 12.5683,
  timezone: "Europe/Copenhagen",
};

const payload = {
  timezone: "Europe/Copenhagen",
  current: {
    time: "2026-08-28T12:00",
    temperature_2m: 17.4,
    apparent_temperature: 16.2,
    weather_code: 2,
    wind_speed_10m: 13,
  },
  daily: {
    time: [
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ],
    weather_code: [2, 3, 61, 0, 45, 95],
    temperature_2m_max: [18, 17, 16, 19, 17, 15],
    temperature_2m_min: [12, 11, 10, 12, 10, 9],
    precipitation_probability_max: [20, 30, 60, 10, 25, 70],
    wind_speed_10m_max: [20, 18, 25, 12, 15, 28],
  },
};

describe("WMO weather mapping", () => {
  it.each([
    [0, "晴朗", "sun"],
    [2, "局部多雲", "cloud-sun"],
    [48, "霧淞", "cloud-fog"],
    [63, "中雨", "cloud-rain"],
    [75, "大雪", "cloud-snow"],
    [99, "雷雨伴大冰雹", "cloud-lightning"],
  ] as const)("maps code %i", (code, description, icon) => {
    expect(getWmoWeather(code)).toEqual({ description, icon });
  });

  it("returns an accessible unknown condition for unsupported codes", () => {
    expect(getWmoWeather(1234)).toEqual({
      description: "天氣狀況未明",
      icon: "circle-help",
    });
  });
});

describe("Open-Meteo request and normalization", () => {
  it("builds the exact browser forecast endpoint and requested fields", () => {
    const url = new URL(buildOpenMeteoUrl(destination));
    expect(`${url.origin}${url.pathname}`).toBe(OPEN_METEO_FORECAST_ENDPOINT);
    expect(url.searchParams.get("latitude")).toBe("55.6761");
    expect(url.searchParams.get("longitude")).toBe("12.5683");
    expect(url.searchParams.get("current")).toBe(
      OPEN_METEO_CURRENT_FIELDS.join(","),
    );
    expect(url.searchParams.get("daily")).toBe(
      OPEN_METEO_DAILY_FIELDS.join(","),
    );
    expect(url.searchParams.get("forecast_days")).toBe(
      String(OPEN_METEO_FORECAST_DAYS),
    );
    expect(url.searchParams.get("timezone")).toBe("Europe/Copenhagen");
    expect([...url.searchParams.keys()]).toEqual([
      "latitude",
      "longitude",
      "current",
      "daily",
      "forecast_days",
      "timezone",
    ]);
  });

  it("normalizes the response and returns the five days after current day", () => {
    const forecast = normalizeWeatherForecast(payload);
    expect(forecast).not.toBeNull();
    expect(getNextFiveDayForecast(forecast!)).toHaveLength(5);
    expect(getNextFiveDayForecast(forecast!).map((day) => day.date)).toEqual([
      "2026-08-29",
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
  });

  it("classifies HTTP 429 without retrying", async () => {
    const fetcher = vi.fn(async () =>
      ({
        ok: false,
        status: 429,
        json: async () => ({}),
      }) as Response,
    ) as unknown as typeof fetch;

    await expect(
      fetchWeatherForecast(destination, undefined, fetcher),
    ).rejects.toEqual(
      expect.objectContaining<Partial<WeatherServiceError>>({
        kind: "rate-limit",
        status: 429,
        message: "天氣服務暫時繁忙，請稍後再試",
      }),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("forecast range and destination timezone", () => {
  const dates = payload.daily.time;

  it("uses an inclusive returned forecast range", () => {
    expect(isTripDateInForecastRange("2026-08-28", dates)).toBe(true);
    expect(isTripDateInForecastRange("2026-09-02", dates)).toBe(true);
    expect(isTripDateInForecastRange("2026-09-03", dates)).toBe(false);
  });

  it("labels only a day inside the response as a trip-day forecast", () => {
    expect(getTripForecastMessage(2, "2026-08-29", dates)).toBe(
      "旅程 Day 2 天氣預報",
    );
    expect(getTripForecastMessage(12, "2026-09-08", dates)).toBe(
      PRECISE_FORECAST_UNAVAILABLE_MESSAGE,
    );
  });

  it("formats dates and update time in the destination timezone", () => {
    expect(formatWeatherDate("2026-08-29", destination.timezone)).toContain(
      "週六",
    );
    const formatted = formatWeatherUpdatedAt(
      Date.UTC(2026, 7, 28, 22, 30),
      destination.timezone,
    );
    expect(formatted).toMatch(/2026\D+8\D+29/);
    expect(formatted).toContain("00:30");
  });
});
