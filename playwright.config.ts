import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();


export default defineConfig({
    // Test directory
    testDir: './src/tests',

    // Global test timeout
    timeout: 30 * 1000,

    // Expect timeout
    expect: {
        timeout: 5000
    },

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'reports/html' }],
        ['json', { outputFile: 'reports/test-results.json' }],
        ['junit', { outputFile: 'reports/junit.xml' }],
        ['line'],
        ['allure-playwright', { outputFolder: 'reports/allure-results' }]
    ],

    // Shared settings for all projects
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: process.env.BASE_URL || 'https://test.deribit.com',

        // Defining data test attribute
        testIdAttribute: 'data-id',
        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Record video only when retrying
        video: 'retain-on-failure',

        // Headless mode config
        headless: process.env.HEADLESS === 'true',

        // Take screenshot only when retrying
        screenshot: 'only-on-failure',

        // Browser context options
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,

        // API testing
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    },

    // Configure projects for major browsers
    projects: [
        // API Testing Project (no browser needed)
        {
            name: 'api',
            testDir: './src/tests/api',
            testMatch: '**/*.spec.ts',
            use: {
                // API testing configuration
                baseURL: process.env.API_BASE_URL || 'https://test.deribit.com/api/v2',
                extraHTTPHeaders: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        },

        // UI Testing Projects (browser-based)
        {
            name: 'ui-chromium',
            testDir: './src/tests/ui',
            testMatch: '**/*.spec.ts',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'ui-firefox',
            testDir: './src/tests/ui',
            testMatch: '**/*.spec.ts',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'ui-webkit',
            testDir: './src/tests/ui',
            testMatch: '**/*.spec.ts',
            use: { ...devices['Desktop Safari'] }
        },
        {
            name: 'ui-mobile-chrome',
            testDir: './src/tests/ui',
            testMatch: '**/*.spec.ts',
            use: { ...devices['Pixel 5'] }
        },
        {
            name: 'ui-mobile-safari',
            testDir: './src/tests/ui',
            testMatch: '**/*.spec.ts',
            use: { ...devices['iPhone 12'] }
        },

        // E2E Testing Projects (browser-based)
        {
            name: 'e2e-chromium',
            testDir: './src/tests/e2e',
            testMatch: '**/*.spec.ts',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'e2e-firefox',
            testDir: './src/tests/e2e',
            testMatch: '**/*.spec.ts',
            use: { ...devices['Desktop Firefox'] }
        }
    ],

    // Output directory
    outputDir: 'test-results/',

    // Folder for test artifacts
    snapshotDir: 'screenshots/',

    // Configure test match patterns
    testMatch: [
        '**/*.spec.ts',
        '**/*.test.ts'
    ],

    // Test ignore patterns
    testIgnore: [
        '**/node_modules/**',
        '**/dist/**'
    ]
});