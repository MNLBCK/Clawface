import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir: './tests', webServer: { command: 'npm run dev', url: 'http://127.0.0.1:3000', reuseExistingServer: true }, use: { baseURL: 'http://127.0.0.1:3000' }, projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'iphone', use: { ...devices['iPhone 15'] } }] });
