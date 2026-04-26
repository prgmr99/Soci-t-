import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "packages/**/src/**/*.test.{ts,tsx}",
      "apps/web/app/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/e2e/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "packages/db/src/**/*.{ts,tsx}",
        "packages/emails/src/render.ts",
        "packages/ui/src/**/*.{ts,tsx}",
        "apps/web/app/apply/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "apps/web/app/apply/page.tsx",
        "apps/web/app/apply/submitted/**",
        "apps/web/app/apply/ApplyForm.tsx",
        "packages/emails/src/templates/**",
        "packages/emails/src/layout/**",
        "packages/emails/src/index.ts",
        "packages/db/src/index.ts",
        "packages/ui/src/index.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 70,
      },
    },
  },
});
