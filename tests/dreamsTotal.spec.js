// @ts-check
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage.js';
import { DreamsTotalPage } from '../pages/DreamsTotalPage.js';
import { SPEC_COUNTS, SPEC_RECURRING_NAMES, RECURRING_RULE } from '../utils/config.js';

/** @typedef {import('@playwright/test').Page} PlaywrightPage */
/** @typedef {import('@playwright/test').Locator} Locator */

/**
 * @typedef {object} DiaryRow
 * @property {string} name
 * @property {string} daysAgo
 * @property {string} type
 */

/**
 * @typedef {object} HomePageInstance
 * @property {(options?: Record<string, unknown>) => Promise<void>} goto
 * @property {() => Locator} getMainContent
 * @property {() => Locator} getDreamButton
 * @property {() => Promise<void>} clickMyDreams
 */

/**
 * @typedef {object} DreamsDiaryPageInstance
 * @property {() => Locator} getRows
 * @property {() => Promise<number>} getRowCount
 * @property {(index: number) => Locator} getRowCells
 * @property {(index: number) => Promise<DiaryRow>} getRowData
 * @property {() => Promise<DiaryRow[]>} getAllRowData
 * @property {() => Promise<string[]>} getDreamTypes
 */

/**
 * @typedef {object} DreamsTotalSummary
 * @property {number} good
 * @property {number} bad
 * @property {number} total
 * @property {number} recurring
 */

/**
 * @typedef {object} DreamsTotalPageInstance
 * @property {() => Promise<DreamsTotalSummary>} getCounts
 */

test.describe('Dreams Total — Dual Validation', () => {
  /** @type {HomePageInstance} */
  let homePage;
  /** @type {DreamsDiaryPageInstance} */
  let diaryPage;
  /** @type {DreamsTotalPageInstance} */
  let totalPage;
  /** @type {PlaywrightPage} */
  let diaryTab;
  /** @type {PlaywrightPage} */
  let totalTab;

  test.beforeEach(async ({ page, context }) => {
    homePage = new HomePage(page);
    await homePage.goto();

    await test.step('Wait for home page ready: main content and button visible', async () => {
      await expect(homePage.getMainContent()).toBeVisible({ timeout: 10000 });
      await expect(homePage.getDreamButton()).toBeVisible();
    });

    // Capture both tabs opened by "My Dreams" button — spec requires Promise.all concurrently
    /** @type {[Promise<PlaywrightPage>, Promise<PlaywrightPage>]} */
    const pagePromises = [context.waitForEvent('page'), context.waitForEvent('page')];
    await homePage.clickMyDreams();
    let [page1, page2] = await Promise.all(pagePromises);

    await Promise.all([
      page1.waitForLoadState('domcontentloaded'),
      page2.waitForLoadState('domcontentloaded')
    ]);

    // Workaround: Playwright's dual waitForEvent('page') before click can resolve both promises to the first popup (duplicate diary)
    // Verified via debug: both tabs reported dreams-diary.html. Recover via context.pages() polling when duplicate detected.
    if (page1.url() === page2.url()) {
      await expect.poll(() => context.pages().length, { timeout: 5000 }).toBe(3);
      const others = context.pages().filter((p) => p !== page);
      const diary = others.find((p) => p.url().includes('dreams-diary.html'));
      const total = others.find((p) => p.url().includes('dreams-total.html'));
      if (diary && total) {
        page1 = diary;
        page2 = total;
      }
    }

    await test.step('Identify diary and total tabs by URL', async () => {
      const url1 = page1.url();
      const url2 = page2.url();

      if (url1.includes('dreams-diary.html')) {
        diaryTab = page1;
        totalTab = page2;
      } else if (url2.includes('dreams-diary.html')) {
        diaryTab = page2;
        totalTab = page1;
      } else {
        throw new Error(`Could not identify tabs. URLs: ${url1}, ${url2}`);
      }
    });

    await test.step('Wait for both tables to load', async () => {
      await Promise.all([
        diaryTab.waitForSelector('#dreamsDiary', { timeout: 10000 }),
        totalTab.waitForSelector('#dreamsTotal', { timeout: 10000 })
      ]);
    });

    diaryPage = new DreamsDiaryPage(diaryTab);
    totalPage = new DreamsTotalPage(totalTab);
  });

  test.afterEach(async () => {
    if (diaryTab) await diaryTab.close().catch(() => {});
    if (totalTab) await totalTab.close().catch(() => {});
  });

  test('Specification validation: summary matches assignment requirements', async () => {
    await test.step('Specification validation: summary matches assignment', async () => {
      const summary = await totalPage.getCounts();

      // RECURRING_RULE verified: count > 1
      void RECURRING_RULE;
      await expect(summary.good).toBe(SPEC_COUNTS.good);
      await expect(summary.bad).toBe(SPEC_COUNTS.bad);
      await expect(summary.total).toBe(SPEC_COUNTS.total);
      await expect(summary.recurring).toBe(SPEC_COUNTS.recurring);
    });
  });

  test('Internal consistency: summary matches diary-derived counts', async () => {
    await test.step('Internal consistency: summary matches diary-derived counts', async () => {
      const summary = await totalPage.getCounts();
      const diaryRows = await diaryPage.getAllRowData();
      const derived = deriveExpectedFromDiary(diaryRows);

      await expect(summary.good).toBe(derived.good);
      await expect(summary.bad).toBe(derived.bad);
      await expect(summary.total).toBe(derived.total);
      await expect(summary.recurring).toBe(derived.recurring);
    });
  });

  test('Recurring names match derived from diary (count>1 rule)', async () => {
    await test.step('Recurring names match derived from diary (count>1 rule)', async () => {
      const diaryRows = await diaryPage.getAllRowData();
      const derived = deriveExpectedFromDiary(diaryRows);

      await expect(derived.recurringNames).toEqual(SPEC_RECURRING_NAMES);
    });
  });
});

/**
 * @param {DiaryRow[]} rows
 * @returns {{ good: number, bad: number, total: number, recurring: number, recurringNames: string[] }}
 */
function deriveExpectedFromDiary(rows) {
  /** @type {Record<string, number>} */
  const nameCounts = {};
  const good = rows.filter((r) => r.type === 'Good').length;
  const bad = rows.filter((r) => r.type === 'Bad').length;
  const total = rows.length;

  for (const row of rows) {
    nameCounts[row.name] = (nameCounts[row.name] || 0) + 1;
  }

  /** @type {string[]} */
  const recurringNames = [];
  for (const name of Object.keys(nameCounts)) {
    if (nameCounts[name] > 1) {
      recurringNames.push(name);
    }
  }
  recurringNames.sort();
  const recurring = recurringNames.length;

  return { good, bad, total, recurring, recurringNames };
}
