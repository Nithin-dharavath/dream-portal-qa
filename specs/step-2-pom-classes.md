# Step 2 Spec: Page Object Model Classes

## Overview
Create three POM classes with verified selectors from Step 0 reconnaissance.

---

## Files to Create

### 1. `pages/HomePage.js`

**Constructor**
```js
constructor(page) { this.page = page; }
```

**Methods**
| Method | Selector | Action |
|--------|----------|--------|
| `goto()` | `/` | `await page.goto('/')` |
| `getLoadingSpinner()` | `.spinner` | Return locator — **assert visible** |
| `getLoadingContainer()` | `#loadingAnimation` | Return locator — **assert has `.hidden` class** |
| `getMainContent()` | `#mainContent` | Return locator |
| `getDreamButton()` | `#dreamButton` | Return locator |
| `clickMyDreams()` | `#dreamButton` | Click — **returns void** |

**Loading behavior notes (from Step 0)**
- 3000ms timeout in app (`setTimeout` in script.js)
- `#loadingAnimation` gets `.hidden` class after 3s
- `#mainContent` loses `.hidden`, then gains `.show` after 100ms
- `#dreamButton` same pattern

---

### 2. `pages/DreamsDiaryPage.js`

**Constructor**
```js
constructor(page) { this.page = page; }
```

**Methods**
| Method | Selector | Returns |
|--------|----------|---------|
| `getRows()` | `#dreamsDiary tbody tr` | Locator (exactly 10) |
| `getRowCount()` | — | `await this.getRows().count()` |
| `getRowCells(index)` | `this.getRows().nth(index).locator('td')` | Cell locator — **test asserts count = 3** |
| `getRowData(index)` | 3 cells | `{name, daysAgo, type}` |
| `getAllRowData()` | — | Array of all row objects |
| `getDreamTypes()` | Column 3 | Array of type strings |

**Diary structure (verified)**
- Table: `#dreamsDiary`
- Exactly 10 rows
- 3 columns: Dream Name (td:nth-child(1)), Days Ago (td:nth-child(2)), Dream Type (td:nth-child(3))
- Dream Type values: "Good" or "Bad" only

---

### 3. `pages/DreamsTotalPage.js`

**Constructor**
```js
constructor(page) { this.page = page; }
```

**Methods**
| Method | Selector | Returns |
|--------|----------|---------|
| `getCounts()` | `#dreamsTotal tbody tr` | `{good, bad, total, recurring}` |

**Total structure (verified)**
- Table: `#dreamsTotal`
- Exactly 5 rows
- Column 1: Type, Column 2: Count
- Rows: Good=6, Bad=4, Total=10, This Week=7, Recurring=2
- **NO `getRecurringNames()`** — total page does not expose names

---

## Acceptance Criteria

- [ ] All three files exist in `pages/`
- [ ] Each exports a class with methods above
- [ ] Selectors match verified Step 0 table exactly
- [ ] No `waitForTimeout` — use Playwright auto-waiting
- [ ] `clickMyDreams()` returns void (test captures tabs)
- [ ] `getRowCells()` returns locator; test asserts `.count() === 3`
- [ ] No `getRecurringNames()` on Total page

---

## Test Integration Preview

HomePage used by `tests/home.spec.js`:
- Loading spinner visible → hidden
- Main content visible
- Button visible → click → capture 2 tabs concurrently

DreamsDiaryPage used by `tests/dreamsDiary.spec.js`:
- 10 rows, 3 cells each
- All cells non-empty
- Types ∈ {Good, Bad}
- Days Ago parseable as non-negative integer

DreamsTotalPage used by `tests/dreamsTotal.spec.js`:
- Dual validation: spec counts AND diary-derived consistency