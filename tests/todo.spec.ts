import { test, expect } from '@playwright/test';

test.describe('TodoMVC demo app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/');
  });

  test('can add a todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Learn Jenkins');
    await input.press('Enter');

    await expect(page.getByTestId('todo-title')).toHaveText(['Learn Jenkins']);
  });

  test('can complete a todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Write Playwright tests');
    await input.press('Enter');

    await page.getByTestId('todo-item').getByRole('checkbox').check();
    await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toContainText('0 items left');
  });
});
