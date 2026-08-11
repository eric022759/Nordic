import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  dayImages,
  pageBackgroundImages,
} from "@/data/travel-images";

describe("travel photo manifest", () => {
  it("provides one photo for every itinerary day", () => {
    expect(Object.keys(dayImages).map(Number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ]);
  });

  it("provides a distinct background for every inner page", () => {
    expect(Object.keys(pageBackgroundImages).sort()).toEqual([
      "destinations",
      "info",
      "itinerary",
      "prepare",
    ]);
  });

  it("references 17 distinct local WebP assets that exist", () => {
    const photos = [
      ...Object.values(dayImages),
      ...Object.values(pageBackgroundImages),
    ];

    expect(new Set(photos.map((photo) => photo.src)).size).toBe(17);

    for (const photo of photos) {
      expect(photo.src).toMatch(/^\/images\/.+\.webp$/);
      expect(photo.alt.trim()).not.toBe("");
      expect(
        existsSync(join(process.cwd(), "public", photo.src.replace(/^\//, ""))),
      ).toBe(true);
    }
  });
});
