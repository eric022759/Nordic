"use client";

import {
  ArrowUpRight,
  BedDouble,
  Bus,
  CalendarDays,
  ChevronDown,
  Clock,
  Info,
  MapPin,
  Moon,
  Navigation,
  Sun,
  Utensils,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { StatusBadge } from "@/components/site/StatusBadge";
import { DayPhoto } from "@/components/trip/DayPhoto";
import {
  findDayInReadingArea,
  getDayFromHash,
  getOpenDaysAfterActivation,
} from "@/components/trip/itinerary-interaction";
import { WeatherPanel } from "@/components/weather/WeatherPanel";
import { getCurrentTripDay, resolveFinalLodgingDestination } from "@/lib/dates";
import type {
  Activity,
  ActivityPeriod,
  DayItinerary,
  Destination,
} from "@/types/trip";

interface ItineraryTimelineProps {
  days: readonly DayItinerary[];
  destinations: readonly Destination[];
}

interface PeriodDefinition {
  key: ActivityPeriod;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const periods: readonly PeriodDefinition[] = [
  { key: "morning", label: "上午", icon: Sun },
  { key: "afternoon", label: "下午", icon: Clock },
  { key: "evening", label: "晚間", icon: Moon },
  { key: "allDay", label: "全日", icon: CalendarDays },
];

const weekdayFormatter = new Intl.DateTimeFormat("zh-TW", {
  weekday: "long",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function toDisplayDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`);
  return {
    date: dateFormatter.format(parsed),
    weekday: weekdayFormatter.format(parsed),
  };
}

function getMapUrl(activity: Activity) {
  return activity.mapsUrl;
}

function ActivityList({
  dayNumber,
  activities,
}: {
  dayNumber: number;
  activities: readonly Activity[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {periods.map((period) => {
        const periodActivities = activities.filter(
          (activity) => (activity.period ?? "allDay") === period.key,
        );

        if (periodActivities.length === 0) return null;

        const PeriodIcon = period.icon;
        return (
          <section
            key={period.key}
            aria-labelledby={`day-${dayNumber}-period-${period.key}`}
          >
            <h4
              id={`day-${dayNumber}-period-${period.key}`}
              className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.12em] text-[var(--pine-700)]"
            >
              <PeriodIcon className="size-4" aria-hidden />
              {period.label}
            </h4>
            <ol className="space-y-3">
              {periodActivities.map((activity, index) => {
                const mapsUrl = getMapUrl(activity);
                const mapsLinks = activity.mapsLinks?.length
                  ? activity.mapsLinks
                  : mapsUrl
                    ? [{ label: activity.name + " Google Maps", url: mapsUrl }]
                    : [];
                return (
                  <li
                    key={`${activity.name}-${index}`}
                    className="rounded-2xl border border-[var(--stone-200)] bg-[var(--stone-50)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--pine-950)]">{activity.name}</p>
                        {activity.description ? (
                          <p className="mt-1 text-sm leading-6 text-[var(--stone-700)]">
                            {activity.description}
                          </p>
                        ) : null}
                      </div>
                      <StatusBadge status={activity.status} />
                    </div>
                    {mapsLinks.length ? (
                      <div
                        className="mt-3 flex flex-wrap gap-x-4 gap-y-1"
                        role="group"
                        aria-label={activity.name + " Google Maps 連結"}
                      >
                        {mapsLinks.map((link) => (
                          <a
                            key={link.label + "-" + link.url}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-[var(--pine-700)] underline decoration-[var(--brass-400)] underline-offset-4 transition-colors hover:text-[var(--pine-950)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brass-500)] motion-reduce:transition-none"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={"在 Google Maps 開啟 " + link.label + "（新分頁）"}
                          >
                            <MapPin className="size-4" aria-hidden />
                            {link.label}
                            <ArrowUpRight className="size-3.5" aria-hidden />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function DayDetails({
  day,
  destination,
}: {
  day: DayItinerary;
  destination?: Destination;
}) {
  const cultureNote = destination?.cultureAndEtiquette[0];

  return (
    <div className="border-t border-[var(--stone-200)] px-5 py-6 sm:px-8 sm:py-8">
      <p className="max-w-3xl text-base leading-7 text-[var(--stone-700)]">{day.summary}</p>

      <DayPhoto day={day.day} title={day.title} />

      <div className="mt-8">
        <h3 className="section-title mb-5 text-2xl">每日安排</h3>
        <ActivityList dayNumber={day.day} activities={day.activities} />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-3">
        {day.transport?.length ? (
          <section className="rounded-2xl border border-[var(--stone-200)] p-5" aria-labelledby={`day-${day.day}-transport`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[var(--mist-100)] text-[var(--pine-700)]">
                <Bus className="size-4" aria-hidden />
              </span>
              <h3 id={`day-${day.day}-transport`} className="font-semibold text-[var(--pine-950)]">
                交通
              </h3>
            </div>
            <ul className="space-y-4">
              {day.transport.map((transport, index) => {
                const detail = [
                  transport.description,
                  transport.route,
                  transport.distance,
                  transport.operator,
                  transport.referenceSchedule,
                  transport.notes,
                ].filter((value): value is string => Boolean(value));
                return (
                  <li key={`${transport.type}-${index}`} className="border-t border-[var(--stone-100)] pt-4 first:border-0 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-[var(--pine-900)]">{transport.type}</p>
                      <StatusBadge status={transport.status} />
                    </div>
                    {detail.length ? (
                      <p className="mt-2 text-sm leading-6 text-[var(--stone-700)]">{detail.join(" · ")}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {day.meals ? (
          <section className="rounded-2xl border border-[var(--stone-200)] p-5" aria-labelledby={`day-${day.day}-meals`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[var(--mist-100)] text-[var(--pine-700)]">
                <Utensils className="size-4" aria-hidden />
              </span>
              <h3 id={`day-${day.day}-meals`} className="font-semibold text-[var(--pine-950)]">
                餐食
              </h3>
              {day.meals.status ? <StatusBadge status={day.meals.status} className="ml-auto" /> : null}
            </div>
            <dl className="space-y-3 text-sm">
              {day.meals.breakfast ? (
                <div className="grid grid-cols-[3rem_1fr] gap-3">
                  <dt className="font-semibold text-[var(--pine-700)]">早餐</dt>
                  <dd className="text-[var(--stone-700)]">{day.meals.breakfast}</dd>
                </div>
              ) : null}
              {day.meals.lunch ? (
                <div className="grid grid-cols-[3rem_1fr] gap-3">
                  <dt className="font-semibold text-[var(--pine-700)]">午餐</dt>
                  <dd className="text-[var(--stone-700)]">{day.meals.lunch}</dd>
                </div>
              ) : null}
              {day.meals.dinner ? (
                <div className="grid grid-cols-[3rem_1fr] gap-3">
                  <dt className="font-semibold text-[var(--pine-700)]">晚餐</dt>
                  <dd className="text-[var(--stone-700)]">{day.meals.dinner}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {day.accommodation ? (
          <section className="rounded-2xl border border-[var(--stone-200)] p-5" aria-labelledby={`day-${day.day}-stay`}>
            <div className="mb-4 flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--mist-100)] text-[var(--pine-700)]">
                <BedDouble className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id={`day-${day.day}-stay`} className="font-semibold text-[var(--pine-950)]">
                  住宿
                </h3>
                <p className="mt-0.5 text-sm text-[var(--stone-500)]">{day.accommodation.cityOrRegion}</p>
              </div>
              <StatusBadge status={day.accommodation.status} />
            </div>
            {day.accommodation.name ? (
              <p className="text-sm font-semibold leading-6 text-[var(--stone-700)]">{day.accommodation.name}</p>
            ) : null}
            {day.accommodation.notes ? (
              <p className="mt-3 text-sm leading-6 text-[var(--stone-500)]">{day.accommodation.notes}</p>
            ) : null}
            {day.accommodation.mapsUrl ? (
              <a
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-[var(--pine-700)] underline decoration-[var(--brass-400)] underline-offset-4 transition-colors hover:text-[var(--pine-950)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brass-500)] motion-reduce:transition-none"
                href={day.accommodation.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={"在 Google Maps 開啟 " + (day.accommodation.name ?? day.accommodation.cityOrRegion) + "（新分頁）"}
              >
                <Navigation className="size-4" aria-hidden />
                Google Maps
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ) : null}
          </section>
        ) : null}
      </div>

      {destination ? (
        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,0.45fr)_minmax(0,1.55fr)]">
          <aside className="rounded-2xl bg-[var(--pine-900)] p-5 text-[var(--snow)] sm:p-6" aria-labelledby={`day-${day.day}-culture`}>
            <div className="flex items-center gap-3">
              <Info className="size-4 text-[var(--brass-300)]" aria-hidden />
              <h3 id={`day-${day.day}-culture`} className="font-semibold">
                文化提示 · {destination.name}
              </h3>
            </div>
            {cultureNote ? <p className="mt-3 text-sm leading-6 text-[var(--mist-100)]">{cultureNote}</p> : null}
            <a
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[var(--brass-300)] underline underline-offset-4 transition-colors hover:text-[var(--snow)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brass-300)] motion-reduce:transition-none"
              href={destination.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Navigation className="size-4" aria-hidden />
              開啟 {destination.name} 地圖
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </aside>

          <section aria-label={`${destination.name} 天氣`}>
            <WeatherPanel destination={destination} tripDay={day.day} tripDate={day.date} />
          </section>
        </div>
      ) : null}
    </div>
  );
}

function subscribeToClock(onStoreChange: () => void) {
  const timer = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(timer);
}

export function ItineraryTimeline({ days, destinations }: ItineraryTimelineProps) {
  const firstDay = days[0]?.day ?? null;
  const itemByDayRef = useRef(new Map<number, HTMLLIElement>());
  const mobileStripRef = useRef<HTMLOListElement>(null);
  const mobileLinkByDayRef = useRef(new Map<number, HTMLAnchorElement>());
  const desktopSidebarRef = useRef<HTMLElement>(null);
  const desktopLinkByDayRef = useRef(new Map<number, HTMLAnchorElement>());
  const [openDays, setOpenDays] = useState<ReadonlySet<number>>(
    () => new Set(days.some((day) => day.day === 1) ? [1] : []),
  );
  const [readingDay, setReadingDay] = useState<number | null>(firstDay);
  const managedOpenDayRef = useRef<number | null>(
    days.some((day) => day.day === 1) ? 1 : null,
  );
  const lastScrollYRef = useRef(0);
  const lastReadingDayRef = useRef<number | null>(firstDay);
  const scrollFrameRef = useRef<number | null>(null);
  const suppressScrollUntilRef = useRef(0);
  const scrollReleaseTimerRef = useRef<number | null>(null);

  const todayDay = useSyncExternalStore(
    subscribeToClock,
    () => getCurrentTripDay(new Date(), days, destinations)?.day.day ?? null,
    () => null,
  );

  const destinationByDay = useMemo(
    () =>
      new Map(
        days.map((day) => [day.day, resolveFinalLodgingDestination(day, destinations)] as const),
      ),
    [days, destinations],
  );

  const validDays = useMemo(
    () => new Set(days.map((day) => day.day)),
    [days],
  );

  const openManagedDay = useCallback((day: number) => {
    const previousDay = managedOpenDayRef.current;
    setOpenDays((currentOpenDays) =>
      getOpenDaysAfterActivation(currentOpenDays, day, previousDay, true),
    );
    managedOpenDayRef.current = day;
    lastReadingDayRef.current = day;
    setReadingDay(day);
  }, []);

  const openScrolledDay = useCallback((day: number) => {
    setOpenDays((currentOpenDays) =>
      getOpenDaysAfterActivation(
        currentOpenDays,
        day,
        managedOpenDayRef.current,
        false,
      ),
    );
    managedOpenDayRef.current = day;
    lastReadingDayRef.current = day;
    setReadingDay(day);
  }, []);

  const releaseProgrammaticScroll = useCallback((delay = 0) => {
    if (scrollReleaseTimerRef.current !== null) {
      window.clearTimeout(scrollReleaseTimerRef.current);
    }

    scrollReleaseTimerRef.current = window.setTimeout(() => {
      suppressScrollUntilRef.current = 0;
      lastScrollYRef.current = window.scrollY;
      scrollReleaseTimerRef.current = null;
    }, delay);
  }, []);

  const navigateToDay = useCallback(
    (day: number, updateHistory: boolean) => {
      const item = itemByDayRef.current.get(day);
      if (!item) return;

      openManagedDay(day);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scrollDuration = reduceMotion ? 100 : 1_600;
      suppressScrollUntilRef.current = performance.now() + scrollDuration;

      if (updateHistory && window.location.hash !== `#day-${day}`) {
        window.history.pushState(null, "", `#day-${day}`);
      }

      window.requestAnimationFrame(() => {
        item.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        releaseProgrammaticScroll(scrollDuration);
      });
    },
    [openManagedDay, releaseProgrammaticScroll],
  );

  const handleDayLink = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, day: number) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      navigateToDay(day, true);
    },
    [navigateToDay],
  );

  const handleDetailsToggle = useCallback((day: number, details: HTMLDetailsElement) => {
    setOpenDays((currentOpenDays) => {
      if (currentOpenDays.has(day) === details.open) return currentOpenDays;

      const nextOpenDays = new Set(currentOpenDays);
      if (details.open) nextOpenDays.add(day);
      else nextOpenDays.delete(day);
      return nextOpenDays;
    });
    if (!details.open && managedOpenDayRef.current === day) {
      managedOpenDayRef.current = null;
    }
    if (details.open) {
      lastReadingDayRef.current = day;
      setReadingDay(day);
    }
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const openHashDay = () => {
      const day = getDayFromHash(window.location.hash, validDays);
      if (day !== null) navigateToDay(day, false);
    };

    openHashDay();
    window.addEventListener("hashchange", openHashDay);
    return () => window.removeEventListener("hashchange", openHashDay);
  }, [navigateToDay, validDays]);

  useEffect(() => {
    const inspectReadingPosition = () => {
      scrollFrameRef.current = null;
      const scrollY = window.scrollY;
      const isScrollingDown = scrollY > lastScrollYRef.current + 1;
      lastScrollYRef.current = scrollY;

      if (performance.now() < suppressScrollUntilRef.current) {
        return;
      }

      const positions = days.flatMap((day) => {
        const item = itemByDayRef.current.get(day.day);
        if (!item) return [];
        const bounds = item.getBoundingClientRect();
        return [{ day: day.day, top: bounds.top, bottom: bounds.bottom }];
      });
      const readingDay = findDayInReadingArea(positions, window.innerHeight);

      if (readingDay === null || readingDay === lastReadingDayRef.current) return;
      lastReadingDayRef.current = readingDay;
      setReadingDay(readingDay);
      if (isScrollingDown) openScrolledDay(readingDay);
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(inspectReadingPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      if (scrollReleaseTimerRef.current !== null) {
        window.clearTimeout(scrollReleaseTimerRef.current);
      }
    };
  }, [days, openScrolledDay]);

  useEffect(() => {
    if (readingDay === null) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduceMotion ? "auto" : "smooth";
    const strip = mobileStripRef.current;
    const mobileLink = mobileLinkByDayRef.current.get(readingDay);
    if (strip && mobileLink && strip.clientWidth > 0) {
      const targetLeft = mobileLink.offsetLeft - (strip.clientWidth - mobileLink.clientWidth) / 2;
      strip.scrollTo({ left: Math.max(0, targetLeft), behavior });
    }

    const sidebar = desktopSidebarRef.current;
    const desktopLink = desktopLinkByDayRef.current.get(readingDay);
    if (sidebar && desktopLink && sidebar.clientHeight > 0) {
      const sidebarBounds = sidebar.getBoundingClientRect();
      const linkBounds = desktopLink.getBoundingClientRect();
      const targetTop =
        sidebar.scrollTop +
        linkBounds.top -
        sidebarBounds.top -
        (sidebar.clientHeight - linkBounds.height) / 2;
      sidebar.scrollTo({ top: Math.max(0, targetTop), behavior });
    }
  }, [readingDay]);

  return (
    <>
      <nav
        className="sticky top-16 z-20 mb-8 border-y border-[var(--stone-200)] bg-[color:var(--snow)]/95 px-4 py-3 backdrop-blur lg:hidden"
        aria-label="行動版行程日期導覽"
      >
        <ol
          className="itinerary-day-strip flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
          ref={mobileStripRef}
        >
          {days.map((day) => {
            const { date } = toDisplayDate(day.date);
            const isReading = readingDay === day.day;
            return (
              <li key={day.day} className="snap-start">
                <a
                  className={`flex min-h-11 min-w-[4.75rem] flex-col justify-center rounded-full border px-4 text-center text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brass-500)] motion-reduce:transition-none ${
                    isReading
                      ? "border-[var(--brass-400)] bg-[var(--pine-900)] text-[var(--snow)]"
                      : "border-[var(--stone-200)] bg-[var(--snow)] text-[var(--pine-800)] hover:border-[var(--brass-400)]"
                  }`}
                  href={`#day-${day.day}`}
                  aria-controls={`day-${day.day}-details`}
                  aria-current={isReading ? "location" : undefined}
                  aria-label={`Day ${day.day}，${date}${isReading ? "，目前閱讀" : ""}`}
                  data-reading-day={isReading ? "true" : undefined}
                  onClick={(event) => handleDayLink(event, day.day)}
                  ref={(link) => {
                    if (link) mobileLinkByDayRef.current.set(day.day, link);
                    else mobileLinkByDayRef.current.delete(day.day);
                  }}
                >
                  <span>Day {day.day}</span>
                  <span className={isReading ? "text-[var(--brass-300)]" : "text-[var(--stone-500)]"}>{date}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-[10rem_minmax(0,1fr)] xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-12">
        <aside
          className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pr-1 lg:block"
          ref={desktopSidebarRef}
        >
          <nav aria-label="行程日期導覽">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--stone-500)]">13 days</p>
            <ol className="border-l border-[var(--stone-200)]">
              {days.map((day) => {
                const { date } = toDisplayDate(day.date);
                const isReading = readingDay === day.day;
                return (
                  <li key={day.day} className="py-0.5 pl-2">
                    <a
                      className={`relative flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 text-sm transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brass-500)] motion-reduce:transition-none ${
                        isReading
                          ? "border-[var(--brass-400)] bg-[var(--pine-900)] font-semibold text-[var(--snow)] shadow-[0_8px_24px_rgba(13,54,46,0.18)]"
                          : "border-transparent text-[var(--stone-500)] hover:border-[var(--stone-200)] hover:bg-[color:var(--snow)]/80 hover:text-[var(--pine-900)]"
                      }`}
                      href={`#day-${day.day}`}
                      aria-controls={`day-${day.day}-details`}
                      aria-current={isReading ? "location" : undefined}
                      aria-label={`Day ${day.day}，${date}${isReading ? "，目前閱讀" : ""}`}
                      data-reading-day={isReading ? "true" : undefined}
                      onClick={(event) => handleDayLink(event, day.day)}
                      ref={(link) => {
                        if (link) desktopLinkByDayRef.current.set(day.day, link);
                        else desktopLinkByDayRef.current.delete(day.day);
                      }}
                    >
                      <span>Day {day.day}</span>
                      <span className={`text-xs ${isReading ? "text-[var(--brass-200)]" : ""}`}>{date}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <ol className="relative space-y-6 border-l border-[var(--brass-400)] pl-5 sm:pl-8">
          {days.map((day) => {
            const { date, weekday } = toDisplayDate(day.date);
            const destination = destinationByDay.get(day.day);
            const isCurrent = todayDay === day.day;
            const route = [day.startLocation, day.endLocation].filter(
              (location): location is string => Boolean(location),
            );

            return (
              <li
                id={`day-${day.day}`}
                key={day.day}
                className="scroll-mt-32"
                ref={(item) => {
                  if (item) itemByDayRef.current.set(day.day, item);
                  else itemByDayRef.current.delete(day.day);
                }}
              >
                <span
                  className={`absolute -left-[0.55rem] mt-8 grid size-[1.05rem] place-items-center rounded-full border-4 border-[var(--snow)] ${
                    isCurrent ? "bg-[var(--brass-400)] ring-4 ring-[var(--mist-100)]" : "bg-[var(--pine-700)]"
                  }`}
                  aria-hidden
                />
                <details
                  id={`day-${day.day}-details`}
                  className={`group surface-card overflow-hidden ${
                    isCurrent ? "ring-2 ring-[var(--brass-400)] ring-offset-4 ring-offset-[var(--snow)]" : ""
                  }`}
                  open={openDays.has(day.day)}
                  onToggle={(event) => handleDetailsToggle(day.day, event.currentTarget)}
                >
                  <summary className="flex min-h-24 cursor-pointer list-none items-start gap-4 px-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--brass-500)] sm:items-center sm:px-8 [&::-webkit-details-marker]:hidden">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[var(--pine-900)] font-[family-name:var(--font-display)] text-xl text-[var(--snow)]">
                      {String(day.day).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brass-500)]">
                          Day {day.day}
                        </span>
                        <time className="text-sm text-[var(--stone-500)]" dateTime={day.date}>
                          {date} · {weekday}
                        </time>
                        {isCurrent ? (
                          <span className="rounded-full bg-[var(--brass-400)] px-2.5 py-1 text-xs font-bold text-[var(--pine-950)]">
                            今日行程
                          </span>
                        ) : null}
                        <StatusBadge status={day.status} />
                      </span>
                      <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[var(--pine-950)] sm:text-3xl">
                        {day.title}
                      </span>
                      {route.length ? (
                        <span className="mt-2 flex items-center gap-2 text-sm text-[var(--stone-500)]">
                          <MapPin className="size-4 shrink-0 text-[var(--brass-500)]" aria-hidden />
                          {route.join(" → ")}
                        </span>
                      ) : null}
                    </span>

                    <ChevronDown
                      className="mt-2 size-5 shrink-0 text-[var(--pine-700)] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </summary>

                  <DayDetails day={day} destination={destination} />
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

export default ItineraryTimeline;
