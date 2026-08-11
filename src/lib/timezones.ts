const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface TripTimeZoneOffset {
  utcOffset: string;
  taiwanDifference: string;
  observesDifferentOffsets: boolean;
}

function parseDateOnly(value: string): [number, number, number] {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    throw new RangeError(`Expected an ISO date (YYYY-MM-DD), received: ${value}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function dateAtUtcNoon(value: string): Date {
  const [year, month, day] = parseDateOnly(value);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function isoDateFromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function datesInRange(startDate: string, endDate: string): string[] {
  const start = dateAtUtcNoon(startDate);
  const end = dateAtUtcNoon(endDate);

  if (start > end) {
    throw new RangeError(`Start date must not be after end date: ${startDate} > ${endDate}`);
  }

  const dates: string[] = [];
  for (
    let current = start;
    current <= end;
    current = new Date(current.getTime() + 86_400_000)
  ) {
    dates.push(isoDateFromUtc(current));
  }

  return dates;
}

/**
 * Return the UTC offset in minutes for an IANA time zone on a calendar date.
 * Noon UTC avoids ambiguous local times around midnight and DST transitions.
 */
export function getUtcOffsetMinutes(timeZone: string, isoDate: string): number {
  const instant = dateAtUtcNoon(isoDate);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const value = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((candidate) => candidate.type === type)?.value;
    if (!part) {
      throw new RangeError(`Could not resolve ${type} for time zone: ${timeZone}`);
    }
    return Number(part);
  };

  const localAsUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );

  return Math.round((localAsUtc - instant.getTime()) / 60_000);
}

export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;

  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

export function formatTimeDifference(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "相同時間";

  const sign = offsetMinutes > 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  const duration = minutes
    ? `${hours ? `${hours} 小時 ` : ""}${minutes} 分鐘`
    : `${hours} 小時`;

  return `${sign}${duration}`;
}

/** Calculate offsets across every date in the trip, including DST changes. */
export function getTripTimeZoneOffset(
  timeZone: string,
  startDate: string,
  endDate: string,
  comparisonTimeZone = "Asia/Taipei",
): TripTimeZoneOffset {
  const offsets = datesInRange(startDate, endDate).map((date) => {
    const localOffset = getUtcOffsetMinutes(timeZone, date);
    const comparisonOffset = getUtcOffsetMinutes(comparisonTimeZone, date);

    return {
      localOffset,
      difference: localOffset - comparisonOffset,
    };
  });

  const utcOffsets = [...new Set(offsets.map(({ localOffset }) => localOffset))];
  const differences = [...new Set(offsets.map(({ difference }) => difference))];

  return {
    utcOffset: utcOffsets.map(formatUtcOffset).join(" → "),
    taiwanDifference: differences.map(formatTimeDifference).join(" → "),
    observesDifferentOffsets: utcOffsets.length > 1 || differences.length > 1,
  };
}
