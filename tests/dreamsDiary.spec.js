// @ts-check
import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';

test.describe('Dreams Diary structure and data', () => {
  test('exactly 10 rows with 3 cells each', async ({ page }) => {
    const diaryPage = new DreamsDiaryPage(page);

    await test.step('Navigate to dreams diary page', async () => {
      await page.goto('dreams-diary.html');
    });

    await test.step('Validate diary structure: 10 rows x 3 cells', async () => {
      const rowCount = await diaryPage.getRowCount();
      expect(rowCount).toBe(10);

      for (let i = 0; i < rowCount; i++) {
        const cellCount = await diaryPage.getRowCells(i).count();
        expect(cellCount).toBe(3);
      }
    });
  });
});

test.describe('Dreams Diary data validity', () => {
  test('all cells non-empty, types valid, days ago numeric', async ({ page }) => {
    const diaryPage = new DreamsDiaryPage(page);

    await test.step('Navigate to dreams diary page', async () => {
      await page.goto('dreams-diary.html');
    });

    await test.step('Validate all types are Good/Bad, Days Ago numeric', async () => {
      const rowCount = await diaryPage.getRowCount();

      for (let i = 0; i < rowCount; i++) {
        const { name, daysAgo, type } = await diaryPage.getRowData(i);

        expect(name).toBeTruthy();
        expect(daysAgo).toBeTruthy();
        expect(type).toBeTruthy();
        expect(['Good', 'Bad']).toContain(type);

        const match = daysAgo.match(/(\d+)\s+days?\s+ago/);
        expect(match).toBeTruthy();
        const days = parseInt(match[1], 10);
        expect(days).toBeGreaterThanOrEqual(0);
      }
    });
  });
});