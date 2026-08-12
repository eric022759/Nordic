import { describe, expect, it } from "vitest";

import { createGoogleMapsUrl } from "@/lib/maps";
import {
  createExactGoogleMapsPlaceUrl,
  isExactGoogleMapsPlaceUrl,
} from "@/data/google-maps";

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

describe("exact Google Maps place URLs", () => {
  it("creates and validates a CID-backed place URL", () => {
    const url = createExactGoogleMapsPlaceUrl(
      "新港",
      "0x46525322aa676daf:0x99c2a00928e5eaeb",
    );

    expect(url).toBe(
      "https://www.google.com/maps/place/%E6%96%B0%E6%B8%AF/data=!4m2!3m1!1s0x46525322aa676daf:0x99c2a00928e5eaeb",
    );
    expect(isExactGoogleMapsPlaceUrl(url)).toBe(true);
  });

  it("rejects search, short, insecure and malformed URLs", () => {
    expect(isExactGoogleMapsPlaceUrl("https://www.google.com/maps/search/?api=1&query=55,12")).toBe(false);
    expect(isExactGoogleMapsPlaceUrl("https://maps.app.goo.gl/example")).toBe(false);
    expect(isExactGoogleMapsPlaceUrl("http://www.google.com/maps/place/Test/data=!4m2!3m1!1s0x1:0x2")).toBe(false);
    expect(isExactGoogleMapsPlaceUrl("not-a-url")).toBe(false);
    expect(() => createExactGoogleMapsPlaceUrl(" ", "0x1:0x2")).toThrow();
    expect(() => createExactGoogleMapsPlaceUrl("Test", "bad-cid")).toThrow();
  });
});
