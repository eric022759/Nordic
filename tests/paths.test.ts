import { afterEach, describe, expect, it, vi } from "vitest";

async function loadPaths() {
  vi.resetModules();
  return import("@/lib/paths");
}

describe("deployment paths", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("keeps root-relative assets unchanged for root deployments", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");

    const { assetPath } = await loadPaths();

    expect(assetPath("/images/day-01.webp")).toBe("/images/day-01.webp");
  });

  it("prefixes assets with the public deployment base path", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Nordic");

    const { assetPath } = await loadPaths();

    expect(assetPath("/images/day-01.webp")).toBe(
      "/Nordic/images/day-01.webp",
    );
    expect(assetPath("/Nordic/images/day-01.webp")).toBe(
      "/Nordic/images/day-01.webp",
    );
  });

  it("leaves absolute and fragment URLs unchanged", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/Nordic");

    const { assetPath } = await loadPaths();

    expect(assetPath("https://example.com/photo.webp")).toBe(
      "https://example.com/photo.webp",
    );
    expect(assetPath("#day-3")).toBe("#day-3");
  });
});
