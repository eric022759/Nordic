"use client";

import {
  CircleHelp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  LoaderCircle,
  RefreshCw,
  PersonStanding,
  Snowflake,
  Sun,
  Thermometer,
  TriangleAlert,
  WifiOff,
  Wind,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  acquireWeatherRequest,
  claimWeatherRefresh,
  getWeatherRefreshCooldownRemaining,
  readWeatherCache,
  resolveWeatherFallback,
  writeWeatherCache,
  type WeatherCacheEntry,
  type WeatherFallbackKind,
  type WeatherRequestLease,
} from "@/lib/weather-cache";
import {
  formatWeatherDate,
  formatWeatherWeekday,
  formatWeatherUpdatedAt,
  getNextFiveDayForecast,
  getTripForecastMessage,
  getWmoWeather,
  isAbortError,
  type WeatherDestination,
  type WeatherForecast,
  type WeatherIconName,
} from "@/lib/weather";

export interface WeatherPanelProps {
  destination: WeatherDestination;
  tripDay?: number;
  tripDate?: string;
  /** Keep false while an enclosing destination card is collapsed. */
  isActive?: boolean;
  className?: string;
}

type ViewStatus = "idle" | "loading" | "ready" | "empty" | "error";

interface WeatherViewState {
  status: ViewStatus;
  data: WeatherForecast | null;
  fetchedAt: number | null;
  stale: boolean;
  isRefreshing: boolean;
  issue: WeatherFallbackKind | null;
  message: string | null;
  secondaryMessage: string | null;
}

const INITIAL_STATE: WeatherViewState = {
  status: "idle",
  data: null,
  fetchedAt: null,
  stale: false,
  isRefreshing: false,
  issue: null,
  message: null,
  secondaryMessage: null,
};

const WEATHER_ICONS: Record<WeatherIconName, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  snowflake: Snowflake,
  "cloud-snow": CloudSnow,
  "cloud-lightning": CloudLightning,
  "circle-help": CircleHelp,
};

function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function metric(value: number | null, suffix: string): string {
  return value === null ? "—" : `${Math.round(value)}${suffix}`;
}

function temperatureRange(min: number | null, max: number | null): string {
  if (min === null || max === null) {
    return "—";
  }
  return `${Math.round(min)}–${Math.round(max)}°C`;
}

function WeatherConditionIcon({
  code,
  className,
}: {
  code: number | null;
  className?: string;
}) {
  const condition = getWmoWeather(code);
  const Icon = WEATHER_ICONS[condition.icon];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.6} />;
}

export function WeatherPanel({
  destination,
  tripDay,
  tripDate,
  isActive = true,
  className = "",
}: WeatherPanelProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const activeLeaseRef = useRef<WeatherRequestLease | null>(null);
  const requestSequenceRef = useRef(0);
  const mountedRef = useRef(false);
  const [visibleDestinationId, setVisibleDestinationId] = useState<
    string | null
  >(null);
  const [state, setState] = useState<WeatherViewState>(INITIAL_STATE);
  const [offline, setOffline] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [clock, setClock] = useState(0);
  const reactId = useId().replaceAll(":", "");
  const headingId = `weather-${destination.id}-${reactId}`;

  const requestDestination = useMemo<WeatherDestination>(
    () => ({
      id: destination.id,
      name: destination.name,
      latitude: destination.latitude,
      longitude: destination.longitude,
      timezone: destination.timezone,
    }),
    [
      destination.id,
      destination.latitude,
      destination.longitude,
      destination.name,
      destination.timezone,
    ],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
      activeLeaseRef.current?.release();
      activeLeaseRef.current = null;
    };
  }, []);

  useEffect(() => {
    const updateConnectivity = () => setOffline(isBrowserOffline());
    updateConnectivity();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
    };
  }, []);

  useEffect(() => {
    if (!isActive || visibleDestinationId === destination.id) return;
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setVisibleDestinationId(destination.id);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleDestinationId(destination.id);
          observer.disconnect();
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [destination.id, isActive, visibleDestinationId]);

  const applyFallback = useCallback(
    (error: unknown, cachedEntry: WeatherCacheEntry | null) => {
      const fallback = resolveWeatherFallback(
        error,
        cachedEntry,
        isBrowserOffline(),
      );
      setState({
        status: fallback.data ? "ready" : "error",
        data: fallback.data,
        fetchedAt: fallback.fetchedAt,
        stale: Boolean(fallback.data),
        isRefreshing: false,
        issue: fallback.kind,
        message: fallback.message,
        secondaryMessage: fallback.secondaryMessage,
      });
    },
    [],
  );

  const requestFromNetwork = useCallback(
    async (fallbackEntry: WeatherCacheEntry | null, manual: boolean) => {
      if (activeLeaseRef.current) return;

      const sequence = ++requestSequenceRef.current;
      setState({
        status: fallbackEntry ? "ready" : "loading",
        data: fallbackEntry?.data ?? null,
        fetchedAt: fallbackEntry?.fetchedAt ?? null,
        stale: Boolean(fallbackEntry) && !manual,
        isRefreshing: Boolean(fallbackEntry) || manual,
        issue: null,
        message: null,
        secondaryMessage: null,
      });

      const lease = acquireWeatherRequest(requestDestination);
      activeLeaseRef.current = lease;

      try {
        const data = await lease.promise;
        if (!mountedRef.current || sequence !== requestSequenceRef.current) {
          return;
        }

        if (!data) {
          if (fallbackEntry) {
            setState({
              status: "ready",
              data: fallbackEntry.data,
              fetchedAt: fallbackEntry.fetchedAt,
              stale: true,
              isRefreshing: false,
              issue: "stale",
              message: "目前未取得新的天氣資料",
              secondaryMessage: "可能非最新資料",
            });
          } else {
            setState({
              ...INITIAL_STATE,
              status: "empty",
              message: "目前沒有可顯示的天氣資料",
            });
          }
          return;
        }

        const fetchedAt = Date.now();
        writeWeatherCache(destination.id, data, fetchedAt);
        setState({
          status: "ready",
          data,
          fetchedAt,
          stale: false,
          isRefreshing: false,
          issue: null,
          message: null,
          secondaryMessage: null,
        });
      } catch (error) {
        if (
          !mountedRef.current ||
          sequence !== requestSequenceRef.current ||
          isAbortError(error)
        ) {
          return;
        }
        const latestCache = readWeatherCache(destination.id).entry;
        applyFallback(error, latestCache ?? fallbackEntry);
      } finally {
        lease.release();
        if (activeLeaseRef.current === lease) {
          activeLeaseRef.current = null;
        }
      }
    },
    [applyFallback, destination.id, requestDestination],
  );

  useEffect(() => {
    if (!isActive || visibleDestinationId !== destination.id) return;

    let cancelled = false;
    const cached = readWeatherCache(destination.id);
    if (cached.isFresh && cached.entry) {
      const browserIsOffline = isBrowserOffline();
      queueMicrotask(() => {
        if (cancelled) return;
        setState({
          status: "ready",
          data: cached.entry!.data,
          fetchedAt: cached.entry!.fetchedAt,
          stale: browserIsOffline,
          isRefreshing: false,
          issue: browserIsOffline ? "offline" : null,
          message: browserIsOffline ? "離線模式／非即時資料" : null,
          secondaryMessage: browserIsOffline ? "可能非最新資料" : null,
        });
      });
      return () => {
        cancelled = true;
      };
    }

    if (isBrowserOffline()) {
      queueMicrotask(() => {
        if (!cancelled) applyFallback(null, cached.entry);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) void requestFromNetwork(cached.entry, false);
    });
    return () => {
      cancelled = true;
      requestSequenceRef.current += 1;
      activeLeaseRef.current?.release();
      activeLeaseRef.current = null;
    };
  }, [
    applyFallback,
    destination.id,
    isActive,
    requestFromNetwork,
    visibleDestinationId,
  ]);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    const remaining = getWeatherRefreshCooldownRemaining(destination.id, now);
    queueMicrotask(() => {
      if (cancelled) return;
      setClock(now);
      setCooldownUntil(remaining > 0 ? now + remaining : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [destination.id]);

  useEffect(() => {
    if (cooldownUntil <= 0) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setClock(now);
      if (now >= cooldownUntil) {
        setCooldownUntil(0);
        window.clearInterval(timer);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const handleRefresh = () => {
    if (state.status === "loading" || state.isRefreshing) return;

    const now = Date.now();
    const claim = claimWeatherRefresh(destination.id, now);
    setClock(now);
    setCooldownUntil(claim.retryAt);
    if (!claim.allowed) return;

    const cachedEntry = readWeatherCache(destination.id).entry;
    if (isBrowserOffline()) {
      applyFallback(null, cachedEntry);
      return;
    }
    void requestFromNetwork(cachedEntry, true);
  };

  const forecastDays = useMemo(
    () => (state.data ? getNextFiveDayForecast(state.data) : []),
    [state.data],
  );
  const tripMessage = state.data
    ? getTripForecastMessage(tripDay, tripDate, state.data.daily.time)
    : null;
  const currentCondition = getWmoWeather(
    state.data?.current?.weather_code ?? null,
  );
  const effectiveOffline = offline && Boolean(state.data);
  const statusMessage = effectiveOffline
    ? "離線模式／非即時資料"
    : state.message;
  const cooldownSeconds =
    cooldownUntil > clock
      ? Math.ceil((cooldownUntil - clock) / 1000)
      : 0;
  const refreshDisabled =
    state.status === "loading" ||
    state.isRefreshing ||
    cooldownSeconds > 0;

  return (
    <section
      ref={rootRef}
      aria-busy={state.status === "loading" || state.isRefreshing}
      aria-labelledby={headingId}
      className={`rounded-2xl border border-[#cad2cd] bg-[#f7f8f5] p-5 text-[#183128] shadow-[0_16px_45px_rgba(24,49,40,0.08)] sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d8ded9] pb-4">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-[#806f4a] uppercase">
            當地天氣
          </p>
          <h3 id={headingId} className="text-xl font-semibold sm:text-2xl">
            {destination.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshDisabled}
          aria-label={`重新整理${destination.name}天氣`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#9aa9a0] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#e8ece8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183128] disabled:cursor-not-allowed disabled:opacity-55"
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-4 ${state.isRefreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
          {cooldownSeconds > 0
            ? `${cooldownSeconds} 秒後可刷新`
            : state.isRefreshing
              ? "更新中"
              : "重新整理"}
        </button>
      </div>

      {statusMessage ? (
        <div
          role={state.issue === "rate-limited" ? "alert" : "status"}
          aria-live="polite"
          className="mt-4 flex items-start gap-2 rounded-xl border border-[#d5c8aa] bg-[#f3eee2] px-3 py-2.5 text-sm text-[#5d5137]"
        >
          {effectiveOffline || state.issue === "offline" ? (
            <WifiOff aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
          )}
          <span>
            {statusMessage}
            {(state.secondaryMessage || effectiveOffline) &&
            statusMessage !== "可能非最新資料"
              ? `；${state.secondaryMessage ?? "可能非最新資料"}`
              : ""}
          </span>
        </div>
      ) : null}

      {tripMessage ? (
        <p
          className={`mt-4 rounded-xl px-3 py-2.5 text-sm ${
            tripMessage.startsWith("旅程 Day")
              ? "bg-[#e3ebe6] text-[#24483a]"
              : "border border-[#d8ded9] bg-white text-[#4d5c54]"
          }`}
        >
          {tripMessage}
        </p>
      ) : null}

      {state.status === "idle" ? (
        <p role="status" className="py-10 text-center text-sm text-[#59675f]">
          {isActive
            ? "天氣將在此區塊進入畫面後載入。"
            : "展開後載入天氣。"}
        </p>
      ) : null}

      {state.status === "loading" && !state.data ? (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-40 items-center justify-center gap-3 text-sm text-[#59675f]"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-5 animate-spin motion-reduce:animate-none"
          />
          正在載入天氣…
        </div>
      ) : null}

      {state.status === "empty" ? (
        <p role="status" className="py-10 text-center text-sm text-[#59675f]">
          目前沒有可顯示的天氣資料
        </p>
      ) : null}

      {state.status === "error" && !state.data ? (
        <p role="alert" className="py-10 text-center text-sm text-[#6f4c43]">
          {state.message ?? "暫時無法載入天氣，請稍後再試"}
        </p>
      ) : null}

      {state.data ? (
        <div className="mt-5">
          {state.isRefreshing ? (
            <p role="status" className="mb-3 text-sm text-[#59675f]">
              正在更新天氣資料…
            </p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,2.25fr)]">
            <div className="rounded-2xl bg-[#17372c] p-4 text-white">
              <p className="text-xs text-[#cbd8d1]">目前天氣</p>
              {state.data.current ? (
                <>
                  <div className="mt-4 flex items-center gap-4">
                    <WeatherConditionIcon
                      code={state.data.current.weather_code}
                      className="size-9 text-[#e0cf9c]"
                    />
                    <div>
                      <p className="text-3xl font-light tabular-nums">
                        {metric(state.data.current.temperature_2m, "°")}
                      </p>
                      <p className="mt-1 text-xs text-[#d8e1dc]">
                        {currentCondition.description}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-white/15 pt-3 text-xs">
                    <div>
                      <dt className="flex items-center gap-1.5 text-[#b9c9c0]">
                        <PersonStanding aria-hidden="true" className="size-4" />
                        體感
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {metric(
                          state.data.current.apparent_temperature,
                          "°C",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 text-[#b9c9c0]">
                        <Wind aria-hidden="true" className="size-4" />
                        風速
                      </dt>
                      <dd className="mt-1 tabular-nums">
                        {metric(state.data.current.wind_speed_10m, " km/h")}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="mt-6 text-sm text-[#d8e1dc]">目前天氣資料暫缺</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold tracking-[0.08em] text-[#3d544a]">
                未來五天
              </h4>
              {forecastDays.length > 0 ? (
                <ul className="mt-3 grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(7.25rem,1fr))]">
                  {forecastDays.map((day) => {
                    const condition = getWmoWeather(day.weatherCode);
                    const isTripDate = tripDate === day.date;
                    return (
                      <li
                        key={day.date}
                        className={`rounded-xl border p-2.5 ${
                          isTripDate
                            ? "border-[#9a8657] bg-[#f3eee2]"
                            : "border-[#d8ded9] bg-white"
                        }`}
                      >
                        <time
                          dateTime={day.date}
                          className="block whitespace-nowrap text-sm font-semibold tabular-nums text-[#183128]"
                        >
                          {formatWeatherDate(day.date, destination.timezone)}
                        </time>
                        <p className="mt-0.5 whitespace-nowrap text-xs text-[#4d5c54]">
                          {formatWeatherWeekday(day.date, destination.timezone)}
                        </p>
                        <WeatherConditionIcon
                          code={day.weatherCode}
                          className="mt-3 size-7 text-[#365c4b]"
                        />
                        <p className="mt-2 min-h-10 text-xs leading-5 text-[#4d5c54]">
                          {condition.description}
                        </p>
                        <dl className="mt-2 space-y-1.5 text-sm text-[#4d5c54]">
                          <div
                            className="flex items-center gap-1.5 whitespace-nowrap"
                            title="天氣"
                          >
                            <dt className="shrink-0">
                              <Thermometer
                                aria-hidden="true"
                                className="size-4 text-[#8a6d33]"
                                strokeWidth={1.6}
                              />
                              <span className="sr-only">天氣</span>
                            </dt>
                            <dd className="font-semibold tabular-nums text-[#183128]">
                              {temperatureRange(day.temperatureMin, day.temperatureMax)}
                            </dd>
                          </div>
                          <div
                            className="flex items-center gap-1.5 whitespace-nowrap"
                            title="體感"
                          >
                            <dt className="shrink-0">
                              <PersonStanding
                                aria-hidden="true"
                                className="size-4 text-[#8a6d33]"
                                strokeWidth={1.6}
                              />
                              <span className="sr-only">體感</span>
                            </dt>
                            <dd className="tabular-nums">
                              {temperatureRange(
                                day.apparentTemperatureMin,
                                day.apparentTemperatureMax,
                              )}
                            </dd>
                          </div>
                          <div
                            className="flex items-center gap-1.5 whitespace-nowrap"
                            title="濕度"
                          >
                            <dt className="shrink-0">
                              <Droplets
                                aria-hidden="true"
                                className="size-4 text-[#8a6d33]"
                                strokeWidth={1.6}
                              />
                              <span className="sr-only">濕度</span>
                            </dt>
                            <dd className="tabular-nums">
                              {metric(day.relativeHumidityMean, "%")}
                            </dd>
                          </div>
                        </dl>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl border border-[#d8ded9] bg-white p-4 text-sm text-[#59675f]">
                  未來五天天氣資料暫缺
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#d8ded9] pt-4 text-xs text-[#5f6d65]">
            <p>
              {state.fetchedAt
                ? `最後取得：${formatWeatherUpdatedAt(
                    state.fetchedAt,
                    destination.timezone,
                  )}`
                : "最後取得時間未明"}
              {state.stale && !effectiveOffline ? " · 可能非最新資料" : ""}
            </p>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm underline decoration-[#9a8657] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183128]"
            >
              天氣資料：Open-Meteo（僅供參考）
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default WeatherPanel;
