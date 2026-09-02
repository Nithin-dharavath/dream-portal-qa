# Step 4 Spec: Dreams Diary Tests

## Overview
Test Dreams Diary page structure and data validity. Uses `DreamsDiaryPage` POM from Step 2.

---

## Test File

### `tests/dreamsDiary.spec.js`

**Structure**
```js
test.describe('Dreams Diary structure and data', () => {
  test('exactly 10 rows with 3 cells each', async ({ page }) => { ... });
  test('all cells non-empty, types valid, days ago numeric', async ({ page }) => { ... });
});
```

---

## Test 1: Structure Validation (10 rows × 3 cells)

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Navigate to diary page via home click (or direct if context passed) | Page ready |
| 2 | `const rowCount = await diaryPage.getRowCount()` | `expect(rowCount).toBe(10)` |
| 3 | Loop 0..9: `const cellCount = await diaryPage.getRowCells(i).count()` | `expect(cellCount).toBe(3)` |

**Notes**
- Diary page loaded from home test tab capture or direct navigation
- `getRowCells(index)` returns locator; test asserts `.count() === 3`
- No `waitForTimeout` — Playwright auto-waiting

---

## Test 2: Data Validity (Non-empty, Types, Days Ago)

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | For each row (0..9): `const {name, daysAgo, type} = await diaryPage.getRowData(i)` | — |
| 2 | `expect(name).toBeTruthy()` | Name non-empty |
| 3 | `expect(daysAgo).toBeTruthy()` | Days Ago non-empty |
| 4 | `expect(type).toBeTruthy()` | Type non-empty |
| 5 | `expect(['Good', 'Bad']).toContain(type)` | Type ∈ {Good, Bad} |
| 6 | Parse integer N from `daysAgo` (pattern: "N day(s) ago") | `expect(N).toBeGreaterThanOrEqual(0)` |

**Days Ago Parsing**
- Format verified in Step 0: "1 day ago", "2 days ago", "3 days ago"...
- Pattern: `N day(s) ago` → extract integer N via regex
- Bonus QA check, not explicitly required by assignment

---

## Acceptance Criteria

- [ ] File exists at `tests/dreamsDiary.spec.js`
- [ ] Two `test.describe` blocks as above
- [ ] All assertions use `test.step()` with meaningful QA action names
- [ ] Structure test: row count = 10, each row cell count = 3
- [ ] Data test: all 3 columns non-empty, types ∈ {Good, Bad}, days ago numeric ≥ 0
- [ ] No `waitForTimeout` — state-based waits only
- [ ] Reuses `DreamsDiaryPage` POM methods from Step 2

---

## POM Dependency

Uses `DreamsDiaryPage` from Step 2:
```js
import { DreamsDiaryPage } from '../pages/DreamsDiaryPage';
```

Methods used:
- `getRowCount()`
- `getRowCells(index)`
- `getRowData(index)`

---

## test.step() Usage

```js
// Structure
await test.step('Validate diary structure: 10 rows × 3 cells', async () => { ... });

// Data
await test.step('Validate all types are Good/Bad, Days Ago numeric', async () => { ... });
```

Not per-cell/per-assertion steps.