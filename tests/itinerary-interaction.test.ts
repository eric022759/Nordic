import { describe, expect, it } from "vitest";

import {
  findDayInReadingArea,
  getDayFromHash,
  getOpenDaysAfterActivation,
  getReadingActivationLine,
} from "@/components/trip/itinerary-interaction";

describe("itinerary interaction helpers", () => {
  it("accepts only valid itinerary day hashes", () => {
    const validDays = new Set([1, 2, 13]);

    expect(getDayFromHash("#day-13", validDays)).toBe(13);
    expect(getDayFromHash("#day-12", validDays)).toBeNull();
    expect(getDayFromHash("#day-2-extra", validDays)).toBeNull();
    expect(getDayFromHash("#other", validDays)).toBeNull();
  });

  it("uses a lower reading line without collapsing on short viewports", () => {
    expect(getReadingActivationLine(1_000)).toBe(720);
    expect(getReadingActivationLine(200)).toBe(180);
  });

  it("advances to the next visible summary even while the previous day is tall", () => {
    expect(
      findDayInReadingArea(
        [
          { day: 7, top: -900, bottom: 800 },
          { day: 8, top: 690, bottom: 810 },
          { day: 9, top: 840, bottom: 960 },
        ],
        1_000,
      ),
    ).toBe(8);
  });

  it("does not activate a day that has not reached the reading area", () => {
    expect(
      findDayInReadingArea(
        [
          { day: 7, top: -900, bottom: 90 },
          { day: 8, top: 750, bottom: 870 },
        ],
        1_000,
      ),
    ).toBeNull();
  });

  it("resolves the previous visible day when the reader scrolls back up", () => {
    expect(
      findDayInReadingArea(
        [
          { day: 7, top: 110, bottom: 680 },
          { day: 8, top: 760, bottom: 880 },
        ],
        1_000,
      ),
    ).toBe(7);
  });

  it("keeps the previous day open during scroll-driven activation", () => {
    expect(
      [...getOpenDaysAfterActivation(new Set([7]), 8, 7, false)],
    ).toEqual([7, 8]);
  });

  it("can still close the previously managed day for explicit navigation", () => {
    expect(
      [...getOpenDaysAfterActivation(new Set([7]), 8, 7, true)],
    ).toEqual([8]);
  });
});
