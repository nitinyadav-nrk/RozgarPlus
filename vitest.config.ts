import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    include: ["src/**/*.test.{ts,tsx}", "server/src/**/*.test.ts"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
