import type { Destination } from "@/types/trip";

export const OPEN_METEO_FORECAST_ENDPOINT =
  "https://api.open-meteo.com/v1/forecast";

export const OPEN_METEO_CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "weather_code",
  "relative_humidity_2m",
] as const;

export const OPEN_METEO_DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "relative_humidity_2m_mean",
] as const;

export const OPEN_METEO_FORECAST_DAYS = 6;

export const PRECISE_FORECAST_UNAVAILABLE_MESSAGE =
  "此行程日的精準預報尚未開放；目前顯示此地點近期天氣。";

export type WeatherDestination = Pick<
  Destination,
  "id" | "name" | "latitude" | "longitude" | "timezone"
>;

export type WeatherIconName =
  | "sun"
  | "cloud-sun"
  | "cloud"
  | "cloud-fog"
  | "cloud-drizzle"
  | "cloud-rain"
  | "snowflake"
  | "cloud-snow"
  | "cloud-lightning"
  | "circle-help";

export interface WeatherCondition {
  description: string;
  icon: WeatherIconName;
}

const UNKNOWN_WEATHER: WeatherCondition = {
  description: "天氣狀況未明",
  icon: "circle-help",
};

const WMO_WEATHER: Readonly<Record<number, WeatherCondition>> = {
  0: { description: "晴朗", icon: "sun" },
  1: { description: "大致晴朗", icon: "sun" },
  2: { description: "局部多雲", icon: "cloud-sun" },
  3: { description: "陰天", icon: "cloud" },
  45: { description: "霧", icon: "cloud-fog" },
  48: { description: "霧淞", icon: "cloud-fog" },
  51: { description: "小毛毛雨", icon: "cloud-drizzle" },
  53: { description: "毛毛雨", icon: "cloud-drizzle" },
  55: { description: "強毛毛雨", icon: "cloud-drizzle" },
  56: { description: "小凍毛毛雨", icon: "cloud-drizzle" },
  57: { description: "強凍毛毛雨", icon: "cloud-drizzle" },
  61: { description: "小雨", icon: "cloud-rain" },
  63: { description: "中雨", icon: "cloud-rain" },
  65: { description: "大雨", icon: "cloud-rain" },
  66: { description: "小凍雨", icon: "cloud-rain" },
  67: { description: "大凍雨", icon: "cloud-rain" },
  71: { description: "小雪", icon: "cloud-snow" },
  73: { description: "中雪", icon: "cloud-snow" },
  75: { description: "大雪", icon: "cloud-snow" },
  77: { description: "雪粒", icon: "snowflake" },
  80: { description: "小陣雨", icon: "cloud-rain" },
  81: { description: "中陣雨", icon: "cloud-rain" },
  82: { description: "強陣雨", icon: "cloud-rain" },
  85: { description: "小陣雪", icon: "cloud-snow" },
  86: { description: "強陣雪", icon: "cloud-snow" },
  95: { description: "雷雨", icon: "cloud-lightning" },
  96: { description: "雷雨伴小冰雹", icon: "cloud-lightning" },
  99: { description: "雷雨伴大冰雹", icon: "cloud-lightning" },
};

export function getWmoWeather(
  code: number | null | undefined,
): WeatherCondition {
  if (code === null || code === undefined || !Number.isFinite(code)) {
    return UNKNOWN_WEATHER;
  }

  return WMO_WEATHER[code] ?? UNKNOWN_WEATHER;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number | null;
  apparent_temperature: number | null;
  weather_code: number | null;
  relative_humidity_2m: number | null;
}

export interface DailyWeather {
  time: string[];
  weather_code: Array<number | null>;
  temperature_2m_max: Array<number | null>;
  temperature_2m_min: Array<number | null>;
  apparent_temperature_max: Array<number | null>;
  apparent_temperature_min: Array<number | null>;
  relative_humidity_2m_mean: Array<number | null>;
}

export interface WeatherForecast {
  timezone: string;
  current: CurrentWeather | null;
  daily: DailyWeather;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  apparentTemperatureMax: number | null;
  apparentTemperatureMin: number | null;
  relativeHumidityMean: number | null;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function numberArray(value: unknown): Array<number | null> {
  return Array.isArray(value) ? value.map(finiteNumber) : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => (typeof item === "string" ? item : ""))
    : [];
}

/**
 * Converts the Open-Meteo payload into the small, serializable shape used by
 * the UI and local cache. A payload without either current or daily data is an
 * intentional empty result rather than an exception.
 */
export function normalizeWeatherForecast(
  value: unknown,
  fallbackTimezone = "UTC",
): WeatherForecast | null {
  if (!isRecord(value)) {
    return null;
  }

  const currentValue = isRecord(value.current) ? value.current : null;
  const hasCurrentValues = Boolean(
    currentValue &&
      [
        currentValue.temperature_2m,
        currentValue.apparent_temperature,
        currentValue.weather_code,
        currentValue.relative_humidity_2m,
      ].some((item) => finiteNumber(item) !== null),
  );

  const current: CurrentWeather | null =
    currentValue && hasCurrentValues
      ? {
          time:
            typeof currentValue.time === "string" ? currentValue.time : "",
          temperature_2m: finiteNumber(currentValue.temperature_2m),
          apparent_temperature: finiteNumber(
            currentValue.apparent_temperature,
          ),
          weather_code: finiteNumber(currentValue.weather_code),
          relative_humidity_2m: finiteNumber(currentValue.relative_humidity_2m),
        }
      : null;

  const dailyValue = isRecord(value.daily) ? value.daily : {};
  const daily: DailyWeather = {
    time: stringArray(dailyValue.time),
    weather_code: numberArray(dailyValue.weather_code),
    temperature_2m_max: numberArray(dailyValue.temperature_2m_max),
    temperature_2m_min: numberArray(dailyValue.temperature_2m_min),
    apparent_temperature_max: numberArray(dailyValue.apparent_temperature_max),
    apparent_temperature_min: numberArray(dailyValue.apparent_temperature_min),
    relative_humidity_2m_mean: numberArray(
      dailyValue.relative_humidity_2m_mean,
    ),
  };

  if (!current && daily.time.every((date) => !date)) {
    return null;
  }

  return {
    timezone:
      typeof value.timezone === "string" && value.timezone
        ? value.timezone
        : fallbackTimezone,
    current,
    daily,
  };
}

export function buildOpenMeteoUrl(
  destination: Pick<
    WeatherDestination,
    "latitude" | "longitude" | "timezone"
  >,
): string {
  if (
    !Number.isFinite(destination.latitude) ||
    !Number.isFinite(destination.longitude) ||
    !destination.timezone
  ) {
    throw new TypeError("天氣地點缺少有效的座標或時區");
  }

  const url = new URL(OPEN_METEO_FORECAST_ENDPOINT);
  url.searchParams.set("latitude", String(destination.latitude));
  url.searchParams.set("longitude", String(destination.longitude));
  url.searchParams.set("current", OPEN_METEO_CURRENT_FIELDS.join(","));
  url.searchParams.set("daily", OPEN_METEO_DAILY_FIELDS.join(","));
  url.searchParams.set("forecast_days", String(OPEN_METEO_FORECAST_DAYS));
  url.searchParams.set("timezone", destination.timezone);
  return url.toString();
}

export type WeatherServiceErrorKind =
  | "rate-limit"
  | "http"
  | "network"
  | "invalid-response";

export class WeatherServiceError extends Error {
  readonly kind: WeatherServiceErrorKind;
  readonly status: number | null;

  constructor(
    message: string,
    kind: WeatherServiceErrorKind,
    status: number | null = null,
  ) {
    super(message);
    this.name = "WeatherServiceError";
    this.kind = kind;
    this.status = status;
  }
}

export function isWeatherRateLimitError(error: unknown): boolean {
  return (
    error instanceof WeatherServiceError &&
    (error.kind === "rate-limit" || error.status === 429)
  );
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (isRecord(error) && error.name === "AbortError")
  );
}

export async function fetchWeatherForecast(
  destination: WeatherDestination,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<WeatherForecast | null> {
  let response: Response;

  try {
    response = await fetcher(buildOpenMeteoUrl(destination), { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new WeatherServiceError(
      "無法連線至天氣服務",
      "network",
    );
  }

  if (response.status === 429) {
    throw new WeatherServiceError(
      "天氣服務暫時繁忙，請稍後再試",
      "rate-limit",
      429,
    );
  }

  if (!response.ok) {
    throw new WeatherServiceError(
      `天氣服務回應錯誤（${response.status}）`,
      "http",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(
      "天氣服務回傳的資料格式不正確",
      "invalid-response",
      response.status,
    );
  }

  return normalizeWeatherForecast(payload, destination.timezone);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The returned Open-Meteo daily dates form an inclusive forecast range. */
export function isTripDateInForecastRange(
  tripDate: string,
  forecastDates: readonly string[],
): boolean {
  if (!ISO_DATE.test(tripDate)) {
    return false;
  }

  const dates = forecastDates.filter((date) => ISO_DATE.test(date)).sort();
  if (dates.length === 0) {
    return false;
  }

  return tripDate >= dates[0] && tripDate <= dates[dates.length - 1];
}

export function getTripForecastMessage(
  tripDay: number | undefined,
  tripDate: string | undefined,
  forecastDates: readonly string[],
): string | null {
  if (tripDay === undefined || tripDate === undefined) {
    return null;
  }

  return isTripDateInForecastRange(tripDate, forecastDates)
    ? `旅程 Day ${tripDay} 天氣預報`
    : PRECISE_FORECAST_UNAVAILABLE_MESSAGE;
}

export function getNextFiveDayForecast(
  forecast: WeatherForecast,
): DailyForecastItem[] {
  const dates = forecast.daily.time;
  const currentDate = forecast.current?.time.slice(0, 10) ?? "";
  const currentIndex = dates.indexOf(currentDate);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

  return dates.slice(startIndex, startIndex + 5).flatMap((date, offset) => {
    if (!ISO_DATE.test(date)) {
      return [];
    }

    const index = startIndex + offset;
    return [
      {
        date,
        weatherCode: forecast.daily.weather_code[index] ?? null,
        temperatureMax:
          forecast.daily.temperature_2m_max[index] ?? null,
        temperatureMin:
          forecast.daily.temperature_2m_min[index] ?? null,
        apparentTemperatureMax:
          forecast.daily.apparent_temperature_max[index] ?? null,
        apparentTemperatureMin:
          forecast.daily.apparent_temperature_min[index] ?? null,
        relativeHumidityMean:
          forecast.daily.relative_humidity_2m_mean[index] ?? null,
      },
    ];
  });
}

function parseWeatherDate(date: string): Date | null {
  const parsed = ISO_DATE.test(date)
    ? new Date(`${date}T12:00:00.000Z`)
    : new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatWeatherDate(date: string, timezone: string): string {
  const parsed = parseWeatherDate(date);
  if (!parsed) {
    return date;
  }

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: timezone,
      month: "numeric",
      day: "numeric",
    }).format(parsed);
  } catch {
    return date;
  }
}

export function formatWeatherWeekday(date: string, timezone: string): string {
  const parsed = parseWeatherDate(date);
  if (!parsed) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: timezone,
      weekday: "short",
    }).format(parsed);
  } catch {
    return "";
  }
}

export function formatWeatherUpdatedAt(
  timestamp: number,
  timezone: string,
): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "時間未明";
  }

  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(parsed);
  } catch {
    return "時間未明";
  }
}
