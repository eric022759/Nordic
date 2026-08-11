import type { DayItinerary, Destination, Trip } from "@/types/trip";

export type TripPhase = "before" | "during" | "after";

export interface TripDayContext {
  day: DayItinerary;
  destination?: Destination;
  timeZone: string;
  localDate: string;
}

function fallbackTravelTimeZone(day: DayItinerary): string {
  const location = `${day.startLocation ?? ""} ${day.endLocation ?? ""}`;

  if (/台北|桃園|Taipei|Taoyuan/i.test(location)) {
    return "Asia/Taipei";
  }

  return "UTC";
}

export interface TripContext {
  phase: TripPhase;
  currentDay: TripDayContext | null;
}

export interface CountdownParts {
  totalMilliseconds: number;
  days: number;
  hours: number;
  minutes: number;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function dateOnlyParts(value: string): [number, number, number] {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    throw new RangeError(`Expected an ISO date (YYYY-MM-DD), received: ${value}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function normaliseLocation(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("zh-TW")
    .replace(/[\s,，.。·・/／()（）-]/g, "");
}

function locationMatches(left: string, right: string): boolean {
  const normalisedLeft = normaliseLocation(left);
  const normalisedRight = normaliseLocation(right);

  return (
    normalisedLeft.length > 0 &&
    normalisedRight.length > 0 &&
    (normalisedLeft.includes(normalisedRight) ||
      normalisedRight.includes(normalisedLeft))
  );
}

/** Return the calendar date at an instant in a named IANA time zone. */
export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");

  if (!year || !month || !day) {
    throw new RangeError(`Could not format date in time zone: ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

/** Format a date-only value without allowing the runtime time zone to shift it. */
export function formatTripDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  },
): string {
  const [year, month, day] = dateOnlyParts(isoDate);

  return new Intl.DateTimeFormat("zh-TW", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

/**
 * Resolve the destination whose time zone controls a travel day.
 * Accommodation city is authoritative; the final weather destination is the
 * data-model fallback for transfer days with more than one stop.
 */
export function resolveFinalLodgingDestination(
  day: DayItinerary,
  destinations: readonly Destination[],
): Destination | undefined {
  const weatherDestinations = day.weatherLocationIds
    .map((id) => destinations.find((destination) => destination.id === id))
    .filter((destination): destination is Destination => Boolean(destination));

  const lodging = day.accommodation?.cityOrRegion;
  if (lodging) {
    const lodgingDestination = destinations.find(
      (destination) =>
        destination.relatedDays.includes(day.day) &&
        (locationMatches(lodging, destination.cityOrRegion) ||
          locationMatches(lodging, destination.name)),
    );

    if (lodgingDestination) {
      return lodgingDestination;
    }
  }

  return weatherDestinations.at(-1);
}

/** Find Day N using each day's final-lodging time zone, not device time. */
export function getCurrentTripDay(
  now: Date,
  itinerary: readonly DayItinerary[],
  destinations: readonly Destination[],
): TripDayContext | null {
  for (const day of itinerary) {
    const destination = resolveFinalLodgingDestination(day, destinations);
    const timeZone = destination?.timezone ?? fallbackTravelTimeZone(day);
    const localDate = formatDateInTimeZone(now, timeZone);
    if (localDate === day.date) {
      return {
        day,
        destination,
        timeZone,
        localDate,
      };
    }
  }

  return null;
}

function boundaryTimeZone(
  itinerary: readonly DayItinerary[],
  destinations: readonly Destination[],
  edge: "start" | "end",
): string {
  const day = edge === "start" ? itinerary.at(0) : itinerary.at(-1);
  if (!day) return "UTC";

  return (
    resolveFinalLodgingDestination(day, destinations)?.timezone ??
    fallbackTravelTimeZone(day)
  );
}

/**
 * Determine the trip phase from Nordic calendar dates. Start and end checks
 * use the first and final lodging time zones respectively.
 */
export function getTripPhase(
  now: Date,
  trip: Pick<Trip, "startDate" | "endDate">,
  itinerary: readonly DayItinerary[],
  destinations: readonly Destination[],
): TripPhase {
  if (getCurrentTripDay(now, itinerary, destinations)) {
    return "during";
  }

  const startLocalDate = formatDateInTimeZone(
    now,
    boundaryTimeZone(itinerary, destinations, "start"),
  );
  if (startLocalDate < trip.startDate) {
    return "before";
  }

  const endLocalDate = formatDateInTimeZone(
    now,
    boundaryTimeZone(itinerary, destinations, "end"),
  );

  return endLocalDate > trip.endDate ? "after" : "during";
}

export function getTripContext(
  now: Date,
  trip: Pick<Trip, "startDate" | "endDate">,
  itinerary: readonly DayItinerary[],
  destinations: readonly Destination[],
): TripContext {
  return {
    phase: getTripPhase(now, trip, itinerary, destinations),
    currentDay: getCurrentTripDay(now, itinerary, destinations),
  };
}

/**
 * Browser-local countdown to midnight on a date-only value. Call this only
 * after mount when browser-local semantics are required.
 */
export function getBrowserLocalCountdown(
  now: Date,
  startDate: string,
): CountdownParts {
  const [year, month, day] = dateOnlyParts(startDate);
  const start = new Date(year, month - 1, day);
  const totalMilliseconds = Math.max(0, start.getTime() - now.getTime());
  const totalMinutes = Math.floor(totalMilliseconds / 60_000);

  return {
    totalMilliseconds,
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  };
}
