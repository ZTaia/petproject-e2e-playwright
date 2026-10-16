import { defineConfig, devices } from '@playwright/test';
import { environment } from './config/environment';

export default defineConfig({
    testDir: './tests',

    // The target is a shared public demo. Serial execution avoids concurrent
    // authentication and data mutations against the same tenant.
    fullyParallel: false,

    forbidOnly: !!process.env.CI,

    // Retry transient failures from the shared public demo once locally.
    retries: process.env.CI ? 2 : 1,

    workers: 1,

    reporter: 'html',

    use: {
        baseURL: environment.baseURL,

        trace: 'on-first-retry',

        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
