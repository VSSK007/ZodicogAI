import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. They run against a production build (`npm run build` first)
 * served on :3100. Analyses are answered from recorded fixtures (e2e/fixtures),
 * so no Gemini key, cost or flakiness; the few endpoints that never call an LLM
 * (/results, /health) hit a real backend when E2E_BACKEND is set (CI does).
 *
 *   npm run build && npm run test:e2e
 *   E2E_BACKEND=1 npm run test:e2e          # also start the FastAPI backend
 *   npm run test:e2e:update                 # regenerate visual baselines
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Baselines are per-platform; only the Linux ones (generated in CI) are committed.
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}-{platform}{ext}",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: /(visual|mobile)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "visual",
      testMatch: /visual\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: [
    {
      command: `npm run start -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    ...(process.env.E2E_BACKEND
      ? [
          {
            command: "python -m uvicorn main:app --port 8000",
            cwd: "../backend",
            url: "http://127.0.0.1:8000/health",
            reuseExistingServer: !process.env.CI,
            timeout: 60_000,
            env: {
              GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "e2e-dummy-key",
              CORS_ORIGINS: `http://localhost:${PORT}`,
              AUTH_DEV_LINKS: "1",
              FRONTEND_URL: `http://localhost:${PORT}`,
              AUTH_MAX_LINKS_PER_IP_HOUR: "10000",
            },
          },
        ]
      : []),
  ],
});
