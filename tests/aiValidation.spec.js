// @ts-check
import { test, expect } from '@playwright/test';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage.js';
import { classifyDreams, isOllamaAvailable } from '../utils/aiValidator.js';

test.describe('AI Validation (Ollama — local LLM)', () => {
  // Skip entire suite if Ollama not reachable — check once before all
  test.beforeAll(async () => {
    const available = await isOllamaAvailable();
    test.skip(!available, 'Ollama not reachable at http://localhost:11434 — run `ollama serve` and `ollama pull llama3.2:3b` to enable AI validation');
  });

  test('Ollama classification matches diary Dream Type for all 10 dreams (matched by name)', async ({ page }) => {
    test.setTimeout(90000);
    const diaryPage = new DreamsDiaryPage(page);

    await test.step('Navigate to Dreams Diary and collect 10 rows', async () => {
      await page.goto('dreams-diary.html');
      await expect(page.locator('#dreamsDiary')).toBeVisible();
      const count = await diaryPage.getRowCount();
      expect(count).toBe(10);
    });

    const diaryRows = await diaryPage.getAllRowData();
    const dreamNames = diaryRows.map((r) => r.name);
    // Build map: normalized dream name -> expected type (first occurrence; diary duplicates are consistent)
    const expectedByName = new Map();
    for (const row of diaryRows) {
      const norm = row.name.trim().toLowerCase();
      if (!expectedByName.has(norm)) expectedByName.set(norm, row.type);
      else {
        // Diary duplicates must have same type — assert data integrity
        expect(row.type).toBe(expectedByName.get(norm));
      }
    }

    const aiResults = await test.step('Classify all 10 dreams via Ollama (single batch call, temp 0, json)', async () => {
      const results = await classifyDreams(dreamNames);
      expect(results).toHaveLength(10);
      return results;
    });

    await test.step('Assert each AI type matches diary table (matched by normalized name, not position)', async () => {
      for (const { dream, type } of aiResults) {
        const norm = dream.trim().toLowerCase();
        const expected = expectedByName.get(norm);
        expect(expected, `Diary has no entry for AI dream "${dream}"`).toBeDefined();
        expect(type, `AI mismatch for "${dream}" (expected ${expected}, got ${type})`).toBe(expected);
      }
    });
  });
});
