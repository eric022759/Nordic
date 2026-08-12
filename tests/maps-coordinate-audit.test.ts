import { describe, expect, it } from "vitest";

import { destinations } from "@/data/destinations";
import {
  ACCOMMODATION_GOOGLE_MAPS_URLS_BY_DAY,
  ACTIVITY_GOOGLE_MAPS_LINKS,
  ACTIVITY_GOOGLE_MAPS_URLS,
  DESTINATION_GOOGLE_MAPS_URLS,
  GOOGLE_MAPS_PLACE_CATALOG,
  GOOGLE_MAPS_SHARED_LIST_PLACE_COUNT,
  isExactGoogleMapsPlaceUrl,
} from "@/data/google-maps";
import { itinerary } from "@/data/itinerary";
import type { GeoCoordinates } from "@/types/trip";

function expectCoordinatePin(url: string, coordinates: GeoCoordinates): void {
  const parsed = new URL(url);
  expect(parsed.origin).toBe("https://www.google.com");
  expect(parsed.pathname).toBe("/maps/search/");
  expect(parsed.searchParams.get("api")).toBe("1");
  expect(parsed.searchParams.get("query")).toBe(
    `${coordinates.latitude},${coordinates.longitude}`,
  );
}

describe("Google Maps shared-list audit", () => {
  it("keeps all 81 saved-list rows and exact CID URLs", () => {
    const places = Object.values(GOOGLE_MAPS_PLACE_CATALOG);
    expect(places).toHaveLength(GOOGLE_MAPS_SHARED_LIST_PLACE_COUNT);
    expect(places.map((place) => place.listIndex)).toEqual(
      Array.from({ length: 81 }, (_, index) => index + 1),
    );
    for (const place of places) {
      expect(isExactGoogleMapsPlaceUrl(place.url), place.name).toBe(true);
    }
  });

  it("uses saved exact places when approved and coordinate pins only as fallback", () => {
    const approved = ACTIVITY_GOOGLE_MAPS_URLS as Readonly<Record<string, string>>;
    const approvedGroups = ACTIVITY_GOOGLE_MAPS_LINKS as Readonly<
      Record<string, readonly { label: string; url: string }[]>
    >;
    const mappedActivities = itinerary.flatMap((day) =>
      day.activities
        .filter((activity) => activity.mapsQuery)
        .map((activity) => ({ day: day.day, activity })),
    );
    expect(mappedActivities).toHaveLength(38);

    for (const { day, activity } of mappedActivities) {
      const label = `Day ${day}: ${activity.name}`;
      expect(activity.mapsCoordinates, label).toBeDefined();
      expect(activity.mapsUrl, label).toBeTruthy();
      if (!activity.mapsQuery || !activity.mapsCoordinates || !activity.mapsUrl) continue;

      const approvedUrl = approved[activity.mapsQuery];
      if (approvedUrl) {
        expect(activity.mapsUrl, label).toBe(approvedUrl);
        expect(isExactGoogleMapsPlaceUrl(activity.mapsUrl), label).toBe(true);
      } else {
        expectCoordinatePin(activity.mapsUrl, activity.mapsCoordinates);
      }

      const groupedLinks = approvedGroups[activity.mapsQuery];
      if (groupedLinks) {
        expect(activity.mapsLinks, label).toEqual(groupedLinks);
        groupedLinks.forEach((link) =>
          expect(isExactGoogleMapsPlaceUrl(link.url), link.label).toBe(true),
        );
      }
    }
  });

  it("uses approved destination places and retains coordinates for unmapped cities", () => {
    const approved = DESTINATION_GOOGLE_MAPS_URLS as Readonly<Record<string, string>>;
    expect(destinations).toHaveLength(22);
    for (const destination of destinations) {
      const approvedUrl = approved[destination.id];
      if (approvedUrl) {
        expect(destination.mapsUrl, destination.name).toBe(approvedUrl);
        expect(isExactGoogleMapsPlaceUrl(destination.mapsUrl), destination.name).toBe(true);
      } else {
        expectCoordinatePin(destination.mapsUrl, {
          latitude: destination.latitude,
          longitude: destination.longitude,
        });
      }
    }
  });

  it("adds exact Google Maps links to every confirmed land hotel", () => {
    const entries = Object.entries(ACCOMMODATION_GOOGLE_MAPS_URLS_BY_DAY);
    expect(entries).toHaveLength(9);
    for (const [dayValue, expectedUrl] of entries) {
      const day = Number(dayValue);
      const stay = itinerary.find((item) => item.day === day)?.accommodation;
      expect(stay?.mapsUrl, `Day ${day}`).toBe(expectedUrl);
      expect(isExactGoogleMapsPlaceUrl(expectedUrl), `Day ${day}`).toBe(true);
    }
    expect(itinerary.find((day) => day.day === 1)?.accommodation?.mapsUrl).toBeUndefined();
    expect(itinerary.find((day) => day.day === 10)?.accommodation?.mapsUrl).toBeUndefined();
    expect(itinerary.find((day) => day.day === 12)?.accommodation?.mapsUrl).toBeUndefined();
    expect(itinerary.find((day) => day.day === 13)?.accommodation?.mapsUrl).toBeUndefined();
  });
});
