import { describe, expect, it } from "vitest";

import { createGoogleMapsUrl } from "@/lib/maps";

describe("createGoogleMapsUrl", () => {
  it("creates an exact coordinate pin while retaining a separate audit label", () => {
    const url = createGoogleMapsUrl("Nyhavn Copenhagen Denmark", {
      latitude: 55.679776,
      longitude: 12.5913041,
    });

    expect(url).toBe(
      "https://www.google.com/maps/search/?api=1&query=55.679776%2C12.5913041",
    );
    expect(url).not.toContain("Nyhavn");
  });

  it("rejects missing labels and out-of-range coordinates", () => {
    expect(() =>
      createGoogleMapsUrl(" ", { latitude: 55.679776, longitude: 12.5913041 }),
    ).toThrow(TypeError);
    expect(() =>
      createGoogleMapsUrl("Invalid latitude", { latitude: 91, longitude: 12 }),
    ).toThrow(RangeError);
    expect(() =>
      createGoogleMapsUrl("Invalid longitude", { latitude: 55, longitude: -181 }),
    ).toThrow(RangeError);
  });
});
