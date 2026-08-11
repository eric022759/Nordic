import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
});
