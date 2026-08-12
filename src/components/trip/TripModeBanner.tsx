"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CloudSun,
  Clock3,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  formatTripDate,
  getBrowserLocalCountdown,
  getTripContext,
} from "@/lib/dates";
import type { DayItinerary, Destination, Trip } from "@/types/trip";

interface TripModeBannerProps {
  trip: Pick<Trip, "startDate" | "endDate">;
  itinerary: readonly DayItinerary[];
  destinations: readonly Destination[];
}

const linkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-[var(--brass-300)] underline decoration-[rgba(209,180,123,0.55)] underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brass-300)] motion-reduce:transition-none";

export function TripModeBanner({
  trip,
  itinerary,
  destinations,
}: TripModeBannerProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const refresh = () => setNow(new Date());
    refresh();

    // The countdown intentionally refreshes no more than once per minute.
    const intervalId = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const context = useMemo(
    () =>
      now ? getTripContext(now, trip, itinerary, destinations) : undefined,
    [destinations, itinerary, now, trip],
  );

  const startLabel = formatTripDate(trip.startDate, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const endLabel = formatTripDate(trip.endDate, {
    month: "long",
    day: "numeric",
  });

  if (!now || !context) {
    return (
      <aside
        className="rounded-[var(--radius-card)] border border-white/20 bg-[rgba(11,37,32,0.94)] p-5 text-[var(--snow)] shadow-2xl sm:p-6"
        aria-label="旅行模式"
      >
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brass-300)]">
          <Clock3 className="size-4" aria-hidden />
          Trip mode
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight sm:text-3xl">
          {startLabel}啟程
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--mist-100)]">
          {startLabel}至{endLabel}。抵達後會依每日最終住宿地的北歐當地日期，自動顯示今天的 Day N。
        </p>
        <Link className={`${linkClass} mt-4`} href="/prepare">
          先查看行前準備
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </aside>
    );
  }

  if (context.phase === "before") {
    const countdown = getBrowserLocalCountdown(now, trip.startDate);

    return (
      <aside
        className="rounded-[var(--radius-card)] border border-white/20 bg-[rgba(11,37,32,0.94)] p-5 text-[var(--snow)] shadow-2xl sm:p-6"
        aria-label="旅程倒數"
      >
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brass-300)]">
          <Clock3 className="size-4" aria-hidden />
          距離出發
        </p>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 font-[family-name:var(--font-display)]">
          <strong className="text-4xl font-semibold tabular-nums sm:text-5xl">
            {countdown.days}
          </strong>
          <span className="text-lg">天</span>
          <span className="text-base tabular-nums text-[var(--mist-100)]">
            {String(countdown.hours).padStart(2, "0")} 小時 {String(countdown.minutes).padStart(2, "0")} 分
          </span>
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--mist-100)]">
          下一步：前往行前準備清單，先核對護照、旅行文件與隨身必需品。
        </p>
        <Link className={`${linkClass} mt-4`} href="/prepare">
          開啟行前準備
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </aside>
    );
  }

  if (context.phase === "after") {
    return (
      <aside
        className="rounded-[var(--radius-card)] border border-white/20 bg-[rgba(11,37,32,0.94)] p-5 text-[var(--snow)] shadow-2xl sm:p-6"
        aria-label="旅程回憶"
      >
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brass-300)]">
          <BookOpenText className="size-4" aria-hidden />
          Journey archive
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
          旅程回憶
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--mist-100)]">
          十三天的城市、峽灣與沿途故事，已依日期留在完整行程導覽中。
        </p>
        <Link className={`${linkClass} mt-4`} href="/itinerary">
          重遊完整行程
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </aside>
    );
  }

  const current = context.currentDay;
  if (!current) {
    return (
      <aside
        className="rounded-[var(--radius-card)] border border-white/20 bg-[rgba(11,37,32,0.94)] p-5 text-[var(--snow)] shadow-2xl sm:p-6"
        aria-label="旅行模式"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brass-300)]">
          Trip mode
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
          旅程進行中
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--mist-100)]">
          今天是國際航程日，沒有對應的北歐天氣地點；請查看完整行程並依領隊最新通知行動。
        </p>
        <Link className={`${linkClass} mt-4`} href="/itinerary">
          查看完整行程
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </aside>
    );
  }

  const confirmedHighlight = current.day.activities.find(
    (activity) => activity.status === "confirmed",
  );
  const mapUrl = confirmedHighlight?.mapsUrl ?? current.destination?.mapsUrl;
  const hasMultipleMapPlaces = (confirmedHighlight?.mapsLinks?.length ?? 0) > 1;
  const city = current.day.endLocation ?? current.destination?.name ?? current.day.title;
  const hasWeatherDestination = current.day.weatherLocationIds.length > 0;

  return (
    <aside
      className="rounded-[var(--radius-card)] border border-white/20 bg-[rgba(11,37,32,0.94)] p-5 text-[var(--snow)] shadow-2xl sm:p-6"
      aria-label={`今天是 Day ${current.day.day}`}
    >
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brass-300)]">
        <MapPin className="size-4" aria-hidden />
        Nordic local · {current.timeZone}
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
        今天是 Day {current.day.day}
      </h2>
      <p className="mt-2 text-base font-semibold text-white">{city}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--mist-100)]">
        今日重點：{confirmedHighlight?.name ?? current.day.title}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Link className={linkClass} href={`/itinerary#day-${current.day.day}`}>
          今日行程
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        {hasWeatherDestination ? (
          <Link className={linkClass} href={`/itinerary#day-${current.day.day}`}>
            <CloudSun className="size-4" aria-hidden />
            天氣入口
          </Link>
        ) : null}
        {hasMultipleMapPlaces ? (
          <Link className={linkClass} href={`/itinerary#day-${current.day.day}`}>
            今日地圖清單
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : mapUrl ? (
          <a
            className={linkClass}
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            主要地圖
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ) : null}
      </div>
    </aside>
  );
}

export default TripModeBanner;
