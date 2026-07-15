import { expect, test } from '@playwright/test';
test('shows dashboard and quick capture action', async ({ page }) => { await page.goto('/'); await expect(page.getByText('Macht-Es-Euch-Schön').first()).toBeVisible(); await expect(page.getByRole('button', { name: /Aufgabe in 30 Sek/ })).toBeVisible(); });
