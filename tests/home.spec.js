// @ts-check
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home page loading lifecycle', () => {
  test('loading animation appears then disappears', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('Navigate to home page', async () => {
      await homePage.goto();
    });

    await test.step('Loading spinner is visible on initial load', async () => {
      await expect(homePage.getLoadingSpinner()).toBeVisible();
    });

    await test.step('Main content becomes visible within 10s', async () => {
      await expect(homePage.getMainContent()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Loading container gets hidden class', async () => {
      await expect(homePage.getLoadingContainer()).toHaveClass(/hidden/);
    });

    await test.step('My Dreams button is visible', async () => {
      await expect(homePage.getDreamButton()).toBeVisible();
    });

    await test.step('Capture success screenshot: home page loaded', async () => {
      await page.screenshot({ path: 'screenshots/home-loaded.png', fullPage: true });
    });
  });
});

test.describe('My Dreams opens and loads both tabs', () => {
  test('clicking My Dreams opens diary and total pages that load', async ({ page, context }) => {
    const homePage = new HomePage(page);

    await test.step('Navigate and wait for page ready', async () => {
      await homePage.goto();
      await expect(homePage.getMainContent()).toBeVisible({ timeout: 10000 });
      await expect(homePage.getDreamButton()).toBeVisible();
    });

    await test.step('Setup concurrent page listeners and click My Dreams', async () => {
      const pagePromises = [
        context.waitForEvent('page'),
        context.waitForEvent('page'),
      ];
      await homePage.clickMyDreams();
      const [page1, page2] = await Promise.all(pagePromises);

      await test.step('Both pages load with correct URLs', async () => {
        const pages = [page1, page2];

        for (const page of pages) {
          await page.waitForLoadState('domcontentloaded');
          const url = page.url();
          if (url.includes('dreams-diary.html')) {
            await expect(page.locator('#dreamsDiary')).toBeVisible();
            await expect(url).toMatch(/dreams-diary\.html$/);
          } else if (url.includes('dreams-total.html')) {
            await expect(page.locator('#dreamsTotal')).toBeVisible();
            await expect(url).toMatch(/dreams-total\.html$/);
          }
        }
      });

      await test.step('Cleanup: close both opened tabs', async () => {
        await page1.close();
        await page2.close();
      });
    });
  });
});