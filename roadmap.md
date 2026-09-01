# Implementation Plan: Dream Portal QA Automation Suite (Final)

## Context
Build complete Playwright + JavaScript test automation for https://arjitnigam.github.io/myDreams/
Per assignment requirements in `guidelines.md` — POM pattern, Allure reporting, AI validation bonus, clean git history.

**Core principle**: QA reasoning over framework polish. Two independent sources of truth: specification AND diary-derived.

---

## Step 0: Live DOM Reconnaissance — COMPLETED

### Verified Selectors

| Page | Element | Selector | Notes |
|------|---------|----------|-------|
| Home | Spinner | `.spinner` | Inside `#loadingAnimation` |
| Home | Loading container | `#loadingAnimation` | Gets `.hidden` class after 3s |
| Home | Main content | `#mainContent` | Gets `.hidden` removed, then `.show` added |
| Home | Dream button | `#dreamButton` | Gets `.hidden` removed, then `.show` added |
| Diary | Table | `#dreamsDiary` | |
| Diary | Rows | `#dreamsDiary tbody tr` | Exactly 10 |
| Diary | Name col | `td:nth-child(1)` | |
| Diary | Days Ago col | `td:nth-child(2)` | Format: "N day(s) ago" |
| Diary | Type col | `td:nth-child(3)` | "Good" or "Bad" |
| Total | Table | `#dreamsTotal` | |
| Total | Rows | `#dreamsTotal tbody tr` | Exactly 5 |
| Total | Type col | `td:nth-child(1)` | |
| Total | Count col | `td:nth-child(2)` | |

### Loading Behavior (from script.js)
- `setTimeout` = **3000ms** (3 seconds)
- After 3s: `#loadingAnimation.classList.add('hidden')` → hides spinner
- `#mainContent.classList.remove('hidden')` → then 100ms later `.classList.add('show')`
- `#dreamButton.classList.remove('hidden')` → then `.classList.add('show')`

### Tab Mechanism
- `window.open('dreams-diary.html', '_blank')`
- `window.open('dreams-total.html', '_blank')`
- **Exactly 2 new tabs** — both fire synchronously on click

### Recurring Logic
- **Confirmed by inspecting deployed site's source**: The application calculates recurrence by counting dream name occurrences in the diary data. The dreams-total.html comment confirms: `Flying over mountains` appears 3×, `Lost in maze` appears 2×.
- **Verified rule**: same dream name occurs >1 time in diary (exact match, no normalization needed)
- **Total page shows ONLY count (2)**, NOT the names

### Days Ago Format
- "1 day ago", "2 days ago", "3 days ago"...
- Pattern: `N day(s) ago` → parse integer N

---

## Roadmap (7 commits, proportional)

| Step | Commit | Files | Description |
|------|--------|-------|-------------|
| 1 | Initial project setup | `playwright.config.js`, `.gitignore`, `.env.example`, `utils/config.js` | Base config, Allure reporter, screenshot config, constants; fix gitignore |
| 2 | POM classes | `pages/HomePage.js`, `pages/DreamsDiaryPage.js`, `pages/DreamsTotalPage.js` | Three page objects with verified stable selectors |
| 3 | Home tests | `tests/home.spec.js` | Loading visible → hidden; main content; button; click opens 2 tabs that LOAD |
| 4 | Dreams Diary tests | `tests/dreamsDiary.spec.js` | 10 rows; 3 cells each; types ∈ {Good,Bad}; Days Ago numeric ≥0; all cells non-empty |
| 5 | Dreams Total tests | `tests/dreamsTotal.spec.js` | Dual validation: spec values (6/4/10/2) AND diary-derived consistency; recurring count from verified logic |
| 6 | Professional extras | `package.json` (scripts), `README.md` | Allure, screenshots (failure + 3 success), README with test-case matrix; AI test skipped if no key |

---

## Step 1: Initial Setup
- [ ] Update `playwright.config.js`:
  - `baseURL: 'https://arjitnigam.github.io/myDreams/'` (no env needed for URL)
  - Reporter: `['html', ['allure-playwright', { outputFolder: 'allure-results' }]]`
  - `screenshot: 'only-on-failure'`
  - `trace: 'on-first-retry'`
  - **REMOVE** `fullyParallel: true` (no value for tiny app)
- [ ] Create `.env.example` with `OPENAI_API_KEY=` only
- [ ] Create `.env` (gitignored) — user fills in for AI bonus
- [ ] Create `utils/config.js` exporting:
  ```js
  export const BASE_URL = 'https://arjitnigam.github.io/myDreams/';
  export const DREAM_TYPES = ['Good', 'Bad'];
  export const EXPECTED_DIARY_ROWS = 10;
  
  // SPECIFICATION VALUES (assignment requirements) - independent source of truth
  // HARDCODED INTENTIONALLY - these are the explicit assignment requirements
  export const SPEC_COUNTS = { good: 6, bad: 4, total: 10, recurring: 2 };
  export const SPEC_RECURRING_NAMES = ['Flying over mountains', 'Lost in maze'].sort();
  export const RECURRING_RULE = 'count > 1'; // verified: same name appears >1 in diary
  ```
- [ ] Fix `.gitignore`: remove `.claude/`, add `allure-results/`, `screenshots/`
- [ ] Verify Allure CLI available: `npx allure --version` (document exact install in README)

---

## Step 2: Page Objects (minimal, verified selectors)

**HomePage.js** (`pages/HomePage.js`)
- `constructor(page)` — store page
- `goto()` — `await page.goto('/')`
- `getLoadingSpinner()` — `page.locator('.spinner')` — **assert visible** (animation appears)
- `getLoadingContainer()` — `page.locator('#loadingAnimation')` — **assert `.hidden` class** (animation hidden)
- `getMainContent()` — `page.locator('#mainContent')`
- `getDreamButton()` — `page.locator('#dreamButton')`
- `clickMyDreams()` — `await page.locator('#dreamButton').click()` (returns void)

**DreamsDiaryPage.js** (`pages/DreamsDiaryPage.js`)
- `constructor(page)` — store page
- `getRows()` — `page.locator('#dreamsDiary tbody tr')`
- `getRowCount()` — `await this.getRows().count()`
- `getRowCells(index)` — returns row cell locator (`this.getRows().nth(index).locator('td')`); **test asserts count = 3**
- `getRowData(index)` — returns `{name, daysAgo, type}` from 3 cells
- `getAllRowData()` — array of all row objects
- `getDreamTypes()` — array of type strings from column 3

**DreamsTotalPage.js** (`pages/DreamsTotalPage.js`)
- `constructor(page)` — store page
- `getCounts()` — returns `{good, bad, total, recurring}` from table rows
- **NO** `getRecurringNames()` — total page does not expose names

---

## Step 3: Home Tests
- [ ] Navigate to home
- [ ] **Loading spinner is visible** (assert `.spinner` visible — proves animation appears)
- [ ] **Main content becomes visible** (wait for `#mainContent` visible, timeout 10s)
- [ ] **Spinner container hidden** (assert `#loadingAnimation` has `.hidden` class)
- [ ] **Dream button visible** after load (`#dreamButton` visible)
- [ ] **Click "My Dreams" — capture both tabs CONCURRENTLY**:
  ```js
  const pagePromises = [
    context.waitForEvent('page'),
    context.waitForEvent('page')
  ];
  await homePage.clickMyDreams();
  const [diaryPage, totalPage] = await Promise.all(pagePromises);
  ```
  - Verify diary page loads: `#dreamsDiary` visible
  - Verify total page loads: `#dreamsTotal` visible
  - Verify URLs end with `dreams-diary.html` and `dreams-total.html`

**Loading timing**: Application implements 3000ms delay (verified in Step 0). Test verifies observable lifecycle (visible → hidden) with 10s timeout rather than asserting exact wall-clock duration to avoid CI flakiness. Documents observed ~3s behavior.

---

## Step 4: Dreams Diary Tests
- [ ] **Exactly 10 rows**
- [ ] **Each row has exactly 3 cells** (test: `expect(await diaryPage.getRowCells(i).count()).toBe(3)`)
- [ ] **All 3 columns non-empty** for all rows (name, daysAgo, type)
- [ ] **Every Dream Type ∈ {"Good","Bad"}** (catches "Neutral", empty, etc.)
- [ ] **Days Ago column**: non-empty, parseable as non-negative integer (extract N from "N day(s) ago") — bonus QA check, not explicitly required

---

## Step 5: Dreams Total Tests (DUAL VALIDATION — core QA strength)

### 5a. Specification Validation (assignment requirements — HARDCODED INTENTIONALLY)
```js
// These are the explicit assignment values - independent of diary
expect(summary.good).toBe(SPEC_COUNTS.good);
expect(summary.bad).toBe(SPEC_COUNTS.bad);
expect(summary.total).toBe(SPEC_COUNTS.total);
expect(summary.recurring).toBe(SPEC_COUNTS.recurring);
```

### 5b. Internal Consistency Validation (diary → summary)
```js
// Derive from diary data independently using VERIFIED rule
const diaryRows = await diaryPage.getAllRowData();
const derived = deriveExpectedFromDiary(diaryRows);

expect(summary.good).toBe(derived.good);
expect(summary.bad).toBe(derived.bad);
expect(summary.total).toBe(derived.total);
expect(summary.recurring).toBe(derived.recurring);

// Recurring names: assignment specifies these two (total page doesn't expose names)
// Use SPEC_RECURRING_NAMES constant — single source of truth
expect(derived.recurringNames).toEqual(SPEC_RECURRING_NAMES);
```

### 5c. Derivation Logic (using VERIFIED recurring rule from Step 0)
```js
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

**Catches BOTH defect classes:**
| Defect | Spec Check | Consistency Check |
|--------|------------|-------------------|
| Diary=5/5, Summary=5/5 | **FAIL** (expects 6/4) | PASS |
| Diary=6/4, Summary=5/4 | FAIL | **FAIL** |
| Correct (6/4) | PASS | PASS |

---

## Step 6: Professional Extras
- [ ] Add npm scripts:
  - `"test": "npx playwright test"`
  - `"test:ui": "npx playwright test --ui"`
  - `"test:allure": "npx allure serve allure-results"`
  - `"report:generate": "npx allure generate allure-results --clean -o allure-report"`
- [ ] **Successful screenshots** (explicit, 3): capture home, diary table, summary in tests via `await page.screenshot()`
- [ ] Failure screenshots: automatic via `screenshot: 'only-on-failure'`
- [ ] Verify Allure report opens with clear step hierarchy
- [ ] `README.md`:
  - Overview, setup, run commands
  - POM explanation
  - **Test-case matrix** (requirement → test mapping)
  - AI bonus note (skipped if no key, no fake AI)
  - Screenshot strategy
  - **Allure CLI install**: `npm install -g allure-commandline` or `brew install allure` / `scoop install allure`

---

## AI Validation (Bonus - Isolated, Real Only)

**Only if `OPENAI_API_KEY` present in `.env`:**
- [ ] `utils/aiValidator.js`: `classifyDreams(names)` → array of `{dream, type}`
  - **Load dotenv first**: `import 'dotenv/config';`
  - **Model**: `gpt-4o-mini` (cheap, fast, more reproducible at temperature 0)
  - **Single call** with all 10 names → structured JSON response
  - Prompt: "Classify each dream as Good or Bad. Return JSON: {\"results\": [{\"dream\":\"...\",\"type\":\"Good|Bad\"},...]}"
  - `temperature: 0`, `max_tokens: 500`, `response_format: {type: "json_object"}`
  - Validate response structure: object with `results` array
  - Validate each `type` ∈ {"Good","Bad"} else throw
  - Validate exactly 10 results, no duplicate/missing dream names (match by normalized name)
- [ ] `tests/aiValidation.spec.js`: `test.describe.skip` if no key; else classify all → assert each matches diary table (match by name, not position)
- [ ] **If API call fails**: test fails with clear error (not silent skip)
- [ ] **No keyword fallback**. No fake AI.

---

## test.step() Usage (Meaningful QA Actions)

```js
// Home
await test.step('Loading animation appears then disappears', async () => { ... });
await test.step('Main content and button become visible', async () => { ... });
await test.step('My Dreams opens and loads both tabs', async () => { ... });

// Diary
await test.step('Validate diary structure: 10 rows × 3 cells', async () => { ... });
await test.step('Validate all types are Good/Bad, Days Ago numeric', async () => { ... });

// Total
await test.step('Specification validation: summary matches assignment', async () => { ... });
await test.step('Internal consistency: summary matches diary-derived counts', async () => { ... });
await test.step('Recurring names match derived from diary (count>1 rule)', async () => { ... });
```

Not per-cell/per-assertion steps.

---

## Verification Checklist

- [ ] **Step 0 done**: Selectors verified, recurring logic confirmed (count>1 from source), loading lifecycle documented
- [ ] `git clone` → `npm ci` → `npx playwright install --with-deps` → `npx playwright test` passes
- [ ] Run 10× on CI — no flakiness (state-based waits, no timing assumptions)
- [ ] `npx allure serve` opens report with clear step hierarchy
- [ ] Screenshots on failure in `test-results/` + 3 explicit success screenshots
- [ ] `.env` and `node_modules` not committed
- [ ] 6 logical commits in history
- [ ] Tests run against **deployed site** (baseURL), not local files
- [ ] Test-case matrix in README maps all assignment requirements

---

## Critical Files to Modify/Create

| Path | Action |
|------|--------|
| `playwright.config.js` | Update (Step 1) |
| `.gitignore` | Update (Step 1) |
| `.env.example` | Create (Step 1) |
| `.env` | Create user fills (Step 1) |
| `utils/config.js` | Create with SPEC constants (Step 1) |
| `pages/HomePage.js` | Create (Step 2) |
| `pages/DreamsDiaryPage.js` | Create (Step 2) |
| `pages/DreamsTotalPage.js` | Create (Step 2) |
| `tests/home.spec.js` | Create (Step 3) |
| `tests/dreamsDiary.spec.js` | Create (Step 4) |
| `tests/dreamsTotal.spec.js` | Create (Step 5) |
| `package.json` | Add scripts (Step 6) |
| `README.md` | Create with matrix (Step 6) |

**Bonus (after core stable):**
- `utils/aiValidator.js`
- `tests/aiValidation.spec.js`

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| Hardcode only spec values | Dual validation: spec AND diary-derived |
| Hardcode only diary-derived | Dual validation catches both defect classes |
| Assume recurring = count > 1 | **Verified in Step 0** from source inspection |
| Trust selector table without verification | **Step 0 completed above** |
| `clickMyDreamsAndCaptureTabs()` in POM | `clickMyDreams()` only; test captures pages |
| Per-cell `test.step()` | Per-QA-action steps |
| Keyword classifier as "AI" | Skip AI test if no real API key |
| Call OpenAI per dream | Single batch call, match by name |
| `fullyParallel: true` | Remove (no value) |
| "3 seconds" in test docs | Lifecycle test; document 3000ms source |
| Test against local HTML | Test against deployed `baseURL` |
| `getRecurringNames()` on Total page | Total page doesn't expose names |
| `response_format: json_object` with raw array | Wrap in object: `{results: [...]}` |
| AI result position matching | Match by normalized dream name |
| Duplicate SPEC_RECURRING_NAMES in test | Use constant from config.js |
| Skip dotenv load | `import 'dotenv/config';` before API key access |
| Vague Allure CLI note | Document exact install in README |
| AI output "deterministic" | "More reproducible at temp 0" |
| Sequential `waitForEvent('page')` | **Concurrent: Promise.all of two listeners** |
| Conflate spinner visibility with container state | `.spinner` visible → `#loadingAnimation` has `.hidden` |
| Say "normalized" without normalizing | "Exact name match" (data confirms) |