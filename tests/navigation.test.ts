import { describe, expect, it } from "vitest";

import { isNavigationItemActive } from "@/components/site/navigation";

describe("site navigation active state", () => {
  it("marks Home active only on the site root", () => {
    expect(isNavigationItemActive("/", "/")).toBe(true);
    expect(isNavigationItemActive("/itinerary/", "/")).toBe(false);
    expect(isNavigationItemActive("/Nordic/itinerary/", "/")).toBe(false);
  });

  it("marks only the matching inner page active", () => {
    expect(isNavigationItemActive("/itinerary/", "/itinerary/")).toBe(true);
    expect(isNavigationItemActive("/destinations", "/destinations/")).toBe(true);
    expect(isNavigationItemActive("/destinations/", "/itinerary/")).toBe(false);
  });

  it("supports a deployment base path and deeper routes", () => {
    expect(
      isNavigationItemActive("/Nordic/itinerary/day-3/", "/itinerary/"),
    ).toBe(true);
  });
});
