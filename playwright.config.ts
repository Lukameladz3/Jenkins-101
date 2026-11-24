import { defineConfig, devices } from '@playwright/test';

// Jenkins sets CI=true automatically (and the Jenkinsfile sets it too).
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: isCI,         // fail the build if someone left test.only in the code
  retries: isCI ? 1 : 0,    // retry flaky tests once on CI
  workers: isCI ? 2 : undefined,

  reporter: [
    ['list'],                                            // readable console output
    ['junit', { outputFile: 'test-results/junit.xml' }], // read by Jenkins "junit" step
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
