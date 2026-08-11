import { describe, expect, it } from "vitest";

import {
  formatDateInTimeZone,
  getBrowserLocalCountdown,
  getCurrentTripDay,
  getTripPhase,
  resolveFinalLodgingDestination,
} from "@/lib/dates";
import type { DayItinerary, Destination, Trip } from "@/types/trip";

const sourceReference = "測試資料";
const lastReviewedAt = "2026-07-20";

function destination(
  id: string,
  cityOrRegion: string,
  timezone: string,
  relatedDays: number[],
): Destination {
  return {
    id,
    name: cityOrRegion,
    country: "測試國",
    cityOrRegion,
    latitude: 0,
    longitude: 0,
    timezone,
    mapsQuery: cityOrRegion,
    mapsUrl: "https://example.com/maps",
    relatedDays,
    introduction: "測試目的地",
    highlights: [],
    foodAndDrink: [],
    cultureAndEtiquette: [],
    clothingAdvice: [],
    sourceReference,
    status: "confirmed",
    lastReviewedAt,
  };
}

function day(
  dayNumber: number,
  date: string,
  accommodationCity: string,
  weatherLocationIds: string[],
): DayItinerary {
  return {
    day: dayNumber,
    date,
    title: `Day ${dayNumber}`,
    summary: "測試行程",
    activities: [],
    accommodation: {
      cityOrRegion: accommodationCity,
      status: "confirmed",
      sourceReference,
    },
    weatherLocationIds,
    status: "confirmed",
    sourceReference,
    lastReviewedAt,
  };
}

const destinations = [
  destination("stockholm", "斯德哥爾摩", "Europe/Stockholm", [1]),
  destination("helsinki", "赫爾辛基", "Europe/Helsinki", [1, 2]),
];

const itinerary = [
  day(1, "2026-08-28", "赫爾辛基", ["stockholm", "helsinki"]),
  day(2, "2026-08-29", "赫爾辛基", ["helsinki"]),
];

const trip: Pick<Trip, "startDate" | "endDate"> = {
  startDate: "2026-08-28",
  endDate: "2026-08-29",
};

describe("formatDateInTimeZone", () => {
  it("formats the same instant as the destination-local calendar date", () => {
    const instant = new Date("2026-08-27T21:30:00.000Z");

    expect(formatDateInTimeZone(instant, "Europe/Helsinki")).toBe(
      "2026-08-28",
    );
    expect(formatDateInTimeZone(instant, "Asia/Taipei")).toBe("2026-08-28");
    expect(formatDateInTimeZone(instant, "America/Los_Angeles")).toBe(
      "2026-08-27",
    );
  });
});

describe("destination-local Day N", () => {
  it("uses the final lodging city instead of the first stop on a transfer day", () => {
    expect(resolveFinalLodgingDestination(itinerary[0], destinations)?.id).toBe(
      "helsinki",
    );

    const context = getCurrentTripDay(
      new Date("2026-08-27T21:30:00.000Z"),
      itinerary,
      destinations,
    );

    expect(context?.day.day).toBe(1);
    expect(context?.destination?.id).toBe("helsinki");
    expect(context?.timeZone).toBe("Europe/Helsinki");
  });

  it("falls back to the final weather location when accommodation cannot match", () => {
    const unresolved = day(1, "2026-08-28", "待確認", [
      "stockholm",
      "helsinki",
    ]);

    expect(resolveFinalLodgingDestination(unresolved, destinations)?.id).toBe(
      "helsinki",
    );
  });

  it("identifies outbound and return flight days in Taipei local time", () => {
    const outbound: DayItinerary = {
      day: 1,
      date: "2026-08-28",
      title: "台北出發",
      summary: "夜宿機上",
      startLocation: "台北／桃園國際機場",
      endLocation: "前往哥本哈根途中",
      activities: [],
      weatherLocationIds: [],
      status: "pending",
      sourceReference,
      lastReviewedAt,
    };
    const returnDay: DayItinerary = {
      ...outbound,
      day: 13,
      date: "2026-09-09",
      title: "返抵台北",
      startLocation: "返台途中",
      endLocation: "台北／桃園國際機場",
    };

    const outboundContext = getCurrentTripDay(
      new Date("2026-08-27T16:30:00.000Z"),
      [outbound, returnDay],
      destinations,
    );
    const returnContext = getCurrentTripDay(
      new Date("2026-09-08T16:30:00.000Z"),
      [outbound, returnDay],
      destinations,
    );

    expect(outboundContext).toMatchObject({
      day: { day: 1 },
      timeZone: "Asia/Taipei",
      localDate: "2026-08-28",
    });
    expect(outboundContext?.destination).toBeUndefined();
    expect(returnContext).toMatchObject({
      day: { day: 13 },
      timeZone: "Asia/Taipei",
      localDate: "2026-09-09",
    });
  });
});

describe("getTripPhase", () => {
  it.each([
    ["before", "2026-08-26T12:00:00.000Z", "before"],
    ["during Day 1", "2026-08-27T21:30:00.000Z", "during"],
    ["during Day 2", "2026-08-29T12:00:00.000Z", "during"],
    ["after", "2026-08-30T12:00:00.000Z", "after"],
  ])("returns %s", (_label, instant, expected) => {
    expect(
      getTripPhase(new Date(instant), trip, itinerary, destinations),
    ).toBe(expected);
  });
});

describe("getBrowserLocalCountdown", () => {
  it("returns stable day, hour, and minute parts", () => {
    const start = new Date(2026, 7, 28, 0, 0, 0);
    const now = new Date(start.getTime() - (2 * 24 * 60 + 3 * 60 + 17) * 60_000);

    expect(getBrowserLocalCountdown(now, "2026-08-28")).toMatchObject({
      days: 2,
      hours: 3,
      minutes: 17,
    });
  });
});
