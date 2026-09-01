# Step 1: Initial Project Setup — Specification

## Objective
Establish base project configuration for Playwright + JavaScript test automation suite targeting https://arjitnigam.github.io/myDreams/

---

## Files to Create/Modify

### 1. `playwright.config.js` — Update
**Configuration:**
- `baseURL: 'https://arjitnigam.github.io/myDreams/'`
- Reporter: `['html', ['allure-playwright', { outputFolder: 'allure-results' }]]`
- `screenshot: 'only-on-failure'`
- `trace: 'on-first-retry'`
- **Remove** `fullyParallel: true` (no value for tiny app)
- Test dir: `./tests`
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, undefined locally
- Projects: chromium, firefox, webkit

### 2. `.env.example` — Create
```bash
OPENAI_API_KEY=
```

### 3. `.env` — Create (gitignored)
User fills in `OPENAI_API_KEY` for AI validation bonus.

### 4. `utils/config.js` — Create
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

### 5. `.gitignore` — Fix
**Remove:** `.claude/`
**Add:** `allure-results/`, `screenshots/`

Keep existing: `node_modules/`, `.env`, `test-results/`, `playwright-report/`

### 6. Allure CLI Verification
Verify available: `npx allure --version`
Document exact install command in README (Step 6).

---

## Acceptance Criteria

- [ ] `npm ci` installs without error
- [ ] `npx playwright install --with-deps` completes
- [ ] `npx playwright test` runs (no tests yet, but config valid)
- [ ] `npx allure --version` outputs version
- [ ] `.env` and `node_modules/` not committed
- [ ] `allure-results/` and `screenshots/` in `.gitignore`

---

## Dependencies
None — this is the first step.

---

## Next Step
Step 2: Create Page Object classes (`pages/HomePage.js`, `pages/DreamsDiaryPage.js`, `pages/DreamsTotalPage.js`)