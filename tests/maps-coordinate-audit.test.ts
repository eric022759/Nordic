import { describe, expect, it } from "vitest";

import { destinations } from "@/data/destinations";
import { itinerary } from "@/data/itinerary";
import type { GeoCoordinates } from "@/types/trip";

function expectCoordinatePin(url: string, coordinates: GeoCoordinates): void {
  const parsed = new URL(url);
  const query = parsed.searchParams.get("query");

  expect(parsed.origin).toBe("https://www.google.com");
  expect(parsed.pathname).toBe("/maps/search/");
  expect(parsed.searchParams.get("api")).toBe("1");
  expect(query).toBe(`${coordinates.latitude},${coordinates.longitude}`);
  expect(query).toMatch(/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/);
}

describe("Google Maps data audit", () => {
  it("pins Nyhavn to the user-verified Google place coordinates", () => {
    const nyhavn = itinerary
      .flatMap((day) => day.activities)
      .find((activity) => activity.mapsQuery === "Nyhavn Copenhagen Denmark");

    expect(nyhavn?.mapsCoordinates).toEqual({
      latitude: 55.679776,
      longitude: 12.5913041,
    });
    expect(nyhavn?.mapsUrl).toBe(
      "https://www.google.com/maps/search/?api=1&query=55.679776%2C12.5913041",
    );
  });

  it("uses coordinate pins for every mapped itinerary activity", () => {
    const mappedActivities = itinerary.flatMap((day) =>
      day.activities
        .filter((activity) => activity.mapsQuery || activity.mapsUrl || activity.mapsCoordinates)
        .map((activity) => ({ day: day.day, activity })),
    );

    expect(mappedActivities).toHaveLength(38);

    for (const { day, activity } of mappedActivities) {
      const label = `Day ${day}: ${activity.name}`;

      expect(activity.mapsQuery, label).toBeTruthy();
      expect(activity.mapsCoordinates, label).toBeDefined();
      expect(activity.mapsUrl, label).toBeTruthy();

      if (!activity.mapsCoordinates || !activity.mapsUrl) {
        throw new Error(`${label} is missing its coordinate pin.`);
      }

      expectCoordinatePin(activity.mapsUrl, activity.mapsCoordinates);
    }
  });

  it("uses every destination's verified coordinates instead of text search", () => {
    expect(destinations).toHaveLength(22);

    for (const destination of destinations) {
      const coordinates = {
        latitude: destination.latitude,
        longitude: destination.longitude,
      };

      expect(destination.mapsQuery, destination.name).toBeTruthy();
      expectCoordinatePin(destination.mapsUrl, coordinates);
      expect(new URL(destination.mapsUrl).searchParams.get("query")).not.toBe(
        destination.mapsQuery,
      );
    }
  });
});
