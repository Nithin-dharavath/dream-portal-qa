# Step 5 Spec: Dreams Total Tests (Dual Validation)

## Overview
Create `tests/dreamsTotal.spec.js` implementing dual validation strategy — the core QA strength of this suite. Two independent sources of truth catch both defect classes.

---

## File to Create

### `tests/dreamsTotal.spec.js`

**Imports**
```js
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage.js';
import { DreamsTotalPage } from '../pages/DreamsTotalPage.js';
import { 
  SPEC_COUNTS, 
  SPEC_RECURRING_NAMES, 
  RECURRING_RULE 
} from '../utils/config.js';
```

**Test Structure**
```js
test.describe('Dreams Total — Dual Validation', () => {
  let homePage;
  let diaryPage;
  let totalPage;
  let diaryContext;
  let totalContext;

  test.beforeEach(async ({ context }) => {
    homePage = new HomePage(context.pages()[0]);
    await homePage.goto();
    
    // Capture both tabs opened by "My Dreams" button
    const pagePromises = [
      context.waitForEvent('page'),
      context.waitForEvent('page')
    ];
    await homePage.clickMyDreams();
    const [diaryTab, totalTab] = await Promise.all(pagePromises);
    
    // Wait for both tabs to load their tables
    await Promise.all([
      diaryTab.waitForSelector('#dreamsDiary'),
      totalTab.waitForSelector('#dreamsTotal')
    ]);
    
    diaryPage = new DreamsDiaryPage(diaryTab);
    totalPage = new DreamsTotalPage(totalTab);
  });

  test('Specification validation: summary matches assignment requirements', async () => {
    const summary = await totalPage.getCounts();
    
    await expect(summary.good).toBe(SPEC_COUNTS.good);
    await expect(summary.bad).toBe(SPEC_COUNTS.bad);
    await expect(summary.total).toBe(SPEC_COUNTS.total);
    await expect(summary.recurring).toBe(SPEC_COUNTS.recurring);
  });

  test('Internal consistency: summary matches diary-derived counts', async () => {
    const summary = await totalPage.getCounts();
    const diaryRows = await diaryPage.getAllRowData();
    const derived = deriveExpectedFromDiary(diaryRows);
    
    await expect(summary.good).toBe(derived.good);
    await expect(summary.bad).toBe(derived.bad);
    await expect(summary.total).toBe(derived.total);
    await expect(summary.recurring).toBe(derived.recurring);
  });

  test('Recurring names match derived from diary (count>1 rule)', async () => {
    const diaryRows = await diaryPage.getAllRowData();
    const derived = deriveExpectedFromDiary(diaryRows);
    
    await expect(derived.recurringNames).toEqual(SPEC_RECURRING_NAMES);
  });
});

function deriveExpectedFromDiary(rows) {
  const good = rows.filter(r => r.type === 'Good').length;
  const bad = rows.filter(r => r.type === 'Bad').length;
  const total = rows.length;
  
  // RECURRENCE RULE VERIFIED IN STEP 0: count > 1 (exact name match)
  const nameCounts = {};
  rows.forEach(r => { nameCounts[r.name] = (nameCounts[r.name] || 0) + 1; });
  const recurringNames = Object.entries(nameCounts)
    .filter(([_, count]) => count > 1)
    .map(([name]) => name)
    .sort();
  const recurring = recurringNames.length;
  
  return { good, bad, total, recurring, recurringNames };
}
```

---

## Test Step Blocks (for Allure)

```js
await test.step('Specification validation: summary matches assignment', async () => { ... });
await test.step('Internal consistency: summary matches diary-derived counts', async () => { ... });
await test.step('Recurring names match derived from diary (count>1 rule)', async () => { ... });
```

---

## Acceptance Criteria

- [ ] `tests/dreamsTotal.spec.js` exists
- [ ] Uses `test.beforeEach` to capture both tabs concurrently via `Promise.all`
- [ ] **Test 1**: Specification validation — asserts all 4 counts against `SPEC_COUNTS` constants
- [ ] **Test 2**: Internal consistency — derives counts from diary rows, compares to summary
- [ ] **Test 3**: Recurring names — derives from diary using `count > 1` rule, compares to `SPEC_RECURRING_NAMES`
- [ ] Uses `deriveExpectedFromDiary()` helper function (defined in spec file, NOT in POM)
- [ ] No `waitForTimeout` — uses `waitForSelector` for table load
- [ ] Uses `test.step()` blocks for three major QA actions
- [ ] Dual validation catches both defect classes (see matrix below)

---

## Defect Detection Matrix

| Defect Scenario | Spec Check | Consistency Check |
|----------------|------------|-------------------|
| Diary=5/5, Summary=5/5 | **FAIL** (expects 6/4) | PASS |
| Diary=6/4, Summary=5/4 | FAIL | **FAIL** |
| Correct (6/4) | PASS | PASS |

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `deriveExpectedFromDiary` in spec file, not POM | Pure derivation logic; POM only exposes raw data |
| `SPEC_COUNTS` and `SPEC_RECURRING_NAMES` from `config.js` | Single source of truth for assignment requirements |
| Recurring rule `count > 1` hardcoded in helper | Verified in Step 0 from deployed source inspection |
| `Promise.all` for tab capture | Both tabs fire synchronously — concurrent listeners required |
| `waitForSelector` not URL assertion | Tables are stable load indicators; URLs verified in home tests |
| `test.step()` at QA-action level | Not per-assertion; clear report hierarchy |

---

## Dependencies

- Requires Step 2 POM classes: `HomePage`, `DreamsDiaryPage`, `DreamsTotalPage`
- Requires Step 1 `utils/config.js` with constants
- Home tests must pass first (tab capture logic validated there)

---

## Anti-Patterns (from roadmap)

| ❌ Don't | ✅ Do |
|----------|-------|
| Hardcode only spec values | Dual validation: spec AND diary-derived |
| Hardcode only diary-derived | Dual validation catches both defect classes |
| `getRecurringNames()` on Total page | Total page doesn't expose names — derive from diary |
| Duplicate `SPEC_RECURRING_NAMES` in test | Use constant from `config.js` |
| Position matching for names | Exact name match (data confirms) |
| `waitForTimeout` for tab load | `waitForSelector('#dreamsDiary')` and `waitForSelector('#dreamsTotal')` |