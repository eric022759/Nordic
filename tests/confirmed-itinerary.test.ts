import { describe, expect, it } from "vitest";

import { itinerary } from "@/data/itinerary";
import type { DayItinerary, Transport } from "@/types/trip";

function day(number: number): DayItinerary {
  const result = itinerary.find((item) => item.day === number);

  if (!result) {
    throw new Error(`Missing itinerary day ${number}`);
  }

  return result;
}

function transportText(item: Transport): string {
  return [
    item.type,
    item.route,
    item.description,
    item.operator,
    item.referenceSchedule,
    item.notes,
  ]
    .filter(Boolean)
    .join(" ");
}

function normalizedSchedule(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

describe("2026-08-11 confirmed itinerary", () => {
  it("keeps all 13 calendar days confirmed", () => {
    expect(
      itinerary.map(({ day: dayNumber, date }) => ({ day: dayNumber, date })),
    ).toEqual([
      { day: 1, date: "2026-08-28" },
      { day: 2, date: "2026-08-29" },
      { day: 3, date: "2026-08-30" },
      { day: 4, date: "2026-08-31" },
      { day: 5, date: "2026-09-01" },
      { day: 6, date: "2026-09-02" },
      { day: 7, date: "2026-09-03" },
      { day: 8, date: "2026-09-04" },
      { day: 9, date: "2026-09-05" },
      { day: 10, date: "2026-09-06" },
      { day: 11, date: "2026-09-07" },
      { day: 12, date: "2026-09-08" },
      { day: 13, date: "2026-09-09" },
    ]);

    expect(itinerary.every((item) => item.status === "confirmed")).toBe(true);
  });

  it("does not regress confirmed activities, transport, meals, or stays to placeholders", () => {
    for (const item of itinerary) {
      expect(item.activities.some(({ status }) => status === "pending")).toBe(false);
      expect(item.transport?.some(({ status }) => status === "pending") ?? false).toBe(false);
      expect(item.meals?.status).not.toBe("pending");
      expect(item.accommodation?.status).not.toBe("pending");
      expect(item.accommodation?.name).not.toMatch(/候選|待確認/);
    }
  });

  it("places each confirmed flight on the correct day with the exact schedule", () => {
    const expectedFlights = [
      { day: 1, code: "TK025", schedule: "TK025 21:45–05:10+1" },
      { day: 2, code: "TK1783", schedule: "TK1783 07:15–09:30" },
      { day: 12, code: "TK1764", schedule: "TK1764 19:40–23:20" },
      { day: 13, code: "TK024", schedule: "TK024 01:30–17:55" },
    ] as const;

    for (const expected of expectedFlights) {
      const matches = (day(expected.day).transport ?? []).filter((item) =>
        transportText(item).includes(expected.code),
      );

      expect(matches, `${expected.code} must appear once on Day ${expected.day}`).toHaveLength(1);
      expect(normalizedSchedule(matches[0].referenceSchedule)).toBe(expected.schedule);
      expect(matches[0].status).toBe("confirmed");
    }

    for (const item of itinerary) {
      const allTransportText = (item.transport ?? []).map(transportText).join(" ");

      for (const flight of expectedFlights) {
        if (item.day !== flight.day) {
          expect(allTransportText.includes(flight.code)).toBe(false);
        }
      }
    }
  });

  it("uses the confirmed accommodation for Days 2 through 12", () => {
    const confirmedAccommodationNames = new Map<number, string>([
      [2, "Crowne Plaza Copenhagen Towers by IHG"],
      [3, "Quality Hotel 11"],
      [4, "Vestlia Resort"],
      [5, "Scandic Flesland Airport"],
      [6, "Quality Hotel Sogndal"],
      [7, "Havila Hotel Geiranger"],
      [8, "Thon Partner Hotel Victoria Hamar"],
      [9, "Clarion Hotel Örebro"],
      [10, "Tallink Silja Line"],
      [11, "Scandic Park Helsinki"],
      [12, "夜宿機上"],
    ]);

    for (const [dayNumber, expectedName] of confirmedAccommodationNames) {
      const accommodation = day(dayNumber).accommodation;

      expect(accommodation, `Day ${dayNumber} accommodation`).toBeDefined();
      expect(accommodation?.name).toContain(expectedName);
      expect(accommodation?.status).toBe("confirmed");
    }
  });

  it("marks the PDF-confirmed meal plan for Days 2 through 12", () => {
    for (let dayNumber = 2; dayNumber <= 12; dayNumber += 1) {
      const mealPlan = day(dayNumber).meals;

      expect(mealPlan, `Day ${dayNumber} meals`).toBeDefined();
      expect(mealPlan?.status).toBe("confirmed");
      expect(mealPlan?.breakfast?.trim()).not.toBe("");
      expect(mealPlan?.lunch?.trim()).not.toBe("");
      expect(mealPlan?.dinner?.trim()).not.toBe("");
    }
  });

  it("keeps Trollstigen optional because the road remains weather-dependent", () => {
    const trollstigen = day(8).activities.filter((activity) =>
      `${activity.name} ${activity.mapsQuery ?? ""}`.match(/Trollstigen|精靈之路/i),
    );

    expect(trollstigen).toHaveLength(1);
    expect(trollstigen[0].status).toBe("optional");
  });

  it("confirms only approximate Day 6 train and cruise durations", () => {
    const transports = day(6).transport ?? [];
    const train = transports.find((item) =>
      /米達爾|Myrdal|Flåm Railway|Flåmsbana/i.test(transportText(item)),
    );
    const cruise = transports.find((item) =>
      /峽灣.*遊船|遊船.*峽灣|Sognefjord.*cruise/i.test(transportText(item)),
    );

    expect(train, "Day 6 train segment").toBeDefined();
    expect(cruise, "Day 6 Sognefjord cruise segment").toBeDefined();
    expect(train?.status).toBe("confirmed");
    expect(cruise?.status).toBe("confirmed");
    expect(normalizedSchedule(train?.referenceSchedule)).toMatch(/約\s*1\.5\s*小時/);
    expect(normalizedSchedule(cruise?.referenceSchedule)).toMatch(/約\s*1\.5[–-]2\s*小時/);
    expect(normalizedSchedule(train?.referenceSchedule)).not.toMatch(/\b\d{1,2}:\d{2}\b/);
    expect(normalizedSchedule(cruise?.referenceSchedule)).not.toMatch(/\b\d{1,2}:\d{2}\b/);
  });

  it("traces every day to the 2026-08-11 confirmed edition", () => {
    for (const item of itinerary) {
      expect(item.sourceReference).toMatch(/2026-08-11\s*確認版/);
    }
  });
});
