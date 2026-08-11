import { describe, expect, it } from "vitest";

import {
  formatTimeDifference,
  formatUtcOffset,
  getTripTimeZoneOffset,
  getUtcOffsetMinutes,
} from "@/lib/timezones";

const tripStart = "2026-08-28";
const tripEnd = "2026-09-09";

describe("trip timezone offsets", () => {
  it.each([
    ["Europe/Copenhagen", 120, "UTC+2", "-6 小時"],
    ["Europe/Oslo", 120, "UTC+2", "-6 小時"],
    ["Europe/Stockholm", 120, "UTC+2", "-6 小時"],
    ["Europe/Helsinki", 180, "UTC+3", "-5 小時"],
  ])(
    "calculates %s from IANA rules throughout the trip",
    (timeZone, expectedMinutes, expectedUtc, expectedDifference) => {
      expect(getUtcOffsetMinutes(timeZone, tripStart)).toBe(expectedMinutes);
      expect(getUtcOffsetMinutes(timeZone, tripEnd)).toBe(expectedMinutes);
      expect(getTripTimeZoneOffset(timeZone, tripStart, tripEnd)).toEqual({
        utcOffset: expectedUtc,
        taiwanDifference: expectedDifference,
        observesDifferentOffsets: false,
      });
    },
  );

  it("uses Asia/Taipei as the comparison timezone", () => {
    expect(getUtcOffsetMinutes("Asia/Taipei", tripStart)).toBe(480);
    expect(
      getTripTimeZoneOffset("Asia/Taipei", tripStart, tripEnd),
    ).toMatchObject({
      utcOffset: "UTC+8",
      taiwanDifference: "相同時間",
    });
  });

  it("detects a DST offset change when a date range crosses one", () => {
    expect(
      getTripTimeZoneOffset(
        "Europe/Copenhagen",
        "2026-10-24",
        "2026-10-26",
      ),
    ).toEqual({
      utcOffset: "UTC+2 → UTC+1",
      taiwanDifference: "-6 小時 → -7 小時",
      observesDifferentOffsets: true,
    });
  });
});

describe("timezone offset formatting", () => {
  it("supports zero and fractional-hour offsets", () => {
    expect(formatUtcOffset(0)).toBe("UTC+0");
    expect(formatUtcOffset(330)).toBe("UTC+5:30");
    expect(formatTimeDifference(-330)).toBe("-5 小時 30 分鐘");
  });
});
