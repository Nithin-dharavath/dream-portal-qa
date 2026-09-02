# Dream Portal QA Automation Suite

Playwright + JavaScript test automation for **Dream Portal** (https://arjitnigam.github.io/myDreams/).

## Quick Start

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npm test

# Run with UI mode
npm run test:ui

# View Allure report (after test run)
npm run test:allure

# Generate static Allure report
npm run report:generate
```

## Project Structure

```
dream-portal-qa/
├── pages/                 # Page Object Model classes
│   ├── HomePage.js        # Home page: loading animation, "My Dreams" button, tab capture
│   ├── DreamsDiaryPage.js # Dreams Diary: table rows, dream types, cell validation
│   └── DreamsTotalPage.js # Dreams Total: counts, recurring dreams list
├── tests/                 # Test specs
│   ├── home.spec.js       # Loading animation, main content, tab navigation
│   ├── dreamsDiary.spec.js # 10 rows, Good/Bad types, non-empty cells
│   ├── dreamsTotal.spec.js # Dual validation: spec values + diary-derived consistency
│   └── aiValidation.spec.js # Bonus: LLM classification vs table values (skipped if no key)
├── utils/
│   └── config.js          # Base URL, shared constants, spec values
├── playwright.config.js   # Playwright config with Allure reporter
├── .env                   # OPENAI_API_KEY / OLLAMA config (gitignored)
├── .gitignore             # node_modules, .env, test-results, playwright-report, allure-results, screenshots
├── package.json
└── README.md
```

## Page Object Model (POM)

Each page has a dedicated class encapsulating selectors and actions:

- **HomePage**: `goto()`, `getLoadingSpinner()`, `getLoadingContainer()`, `getMainContent()`, `getDreamButton()`, `clickMyDreams()`
- **DreamsDiaryPage**: `getRows()`, `getRowCount()`, `getRowCells(index)`, `getRowData(index)`, `getAllRowData()`, `getDreamTypes()`
- **DreamsTotalPage**: `getCounts()` returns `{ good, bad, total, recurring }`

Selectors are verified against the live deployed site DOM.

## Test Case Matrix

| Requirement | Test File | Test Step | Validation |
|-------------|-----------|-----------|------------|
| Loading spinner visible initially | `home.spec.js` | "Loading spinner is visible on initial load" | `.spinner` visible |
| Loading animation disappears after ~3s | `home.spec.js` | "Loading container gets hidden class" | `#loadingAnimation.hidden` |
| Main content appears | `home.spec.js` | "Main content becomes visible within 10s" | `#mainContent` visible |
| My Dreams button appears | `home.spec.js` | "My Dreams button is visible" | `#dreamButton` visible |
| Click My Dreams opens 2 tabs | `home.spec.js` | "My Dreams opens and loads both tabs" | 2 new tabs, both load |
| Diary tab URL & table | `home.spec.js` | "Both pages load with correct URLs" | `dreams-diary.html`, `#dreamsDiary` |
| Total tab URL & table | `home.spec.js` | "Both pages load with correct URLs" | `dreams-total.html`, `#dreamsTotal` |
| Diary has exactly 10 rows | `dreamsDiary.spec.js` | "Validate diary structure: 10 rows x 3 cells" | `rowCount === 10` |
| Each row has 3 cells | `dreamsDiary.spec.js` | "Validate diary structure: 10 rows x 3 cells" | `cellCount === 3` |
| All cells non-empty | `dreamsDiary.spec.js` | "Validate all types are Good/Bad, Days Ago numeric" | `name/daysAgo/type` truthy |
| Dream types only Good/Bad | `dreamsDiary.spec.js` | "Validate all types are Good/Bad, Days Ago numeric" | `type ∈ {Good, Bad}` |
| Days Ago parseable numeric | `dreamsDiary.spec.js` | "Validate all types are Good/Bad, Days Ago numeric" | Regex `N day(s) ago` → int ≥ 0 |
| Summary: Good = 6 | `dreamsTotal.spec.js` | "Specification validation" | `summary.good === 6` |
| Summary: Bad = 4 | `dreamsTotal.spec.js` | "Specification validation" | `summary.bad === 4` |
| Summary: Total = 10 | `dreamsTotal.spec.js` | "Specification validation" | `summary.total === 10` |
| Summary: Recurring = 2 | `dreamsTotal.spec.js` | "Specification validation" | `summary.recurring === 2` |
| Summary matches diary counts | `dreamsTotal.spec.js` | "Internal consistency" | Derived counts match summary |
| Recurring names match count>1 rule | `dreamsTotal.spec.js` | "Recurring names match derived from diary" | `['Flying over mountains', 'Lost in maze']` |

## Dual Validation (Core QA Strength)

`dreamsTotal.spec.js` implements **two independent sources of truth**:

1. **Specification Validation** — Asserts hardcoded assignment requirements (Good=6, Bad=4, Total=10, Recurring=2)
2. **Internal Consistency Validation** — Derives expected counts from diary data using verified recurrence rule (name appears >1 time)

This catches both defect classes:
| Defect | Spec Check | Consistency Check |
|--------|------------|-------------------|
| Diary=5/5, Summary=5/5 | **FAIL** (expects 6/4) | PASS |
| Diary=6/4, Summary=5/4 | FAIL | **FAIL** |
| Correct (6/4) | PASS | PASS |

Recurring logic verified from source: exact name match, count > 1.

## AI Validation

Isolated in `tests/aiValidation.spec.js`. **Only runs if API key present:**

- **OpenAI**: Set `OPENAI_API_KEY` in `.env` — uses `gpt-4o-mini`, temperature 0, single batch call
- **Ollama (local)**: Set `OLLAMA_URL` (default `http://localhost:11434`) and `OLLAMA_MODEL` (default `llama3.2:3b`)

No keyword fallback. No fake AI. Test fails with clear error if API call fails.

```bash
# Run AI validation (requires API key in .env)
npm test -- tests/aiValidation.spec.js
```

## Screenshot Strategy

| Type | Trigger | Location |
|------|---------|----------|
| Failure | Automatic on test failure | `test-results/` |
| Success (explicit, 3) | End of each test suite | `screenshots/` |

Explicit success screenshots captured:
1. `screenshots/home-loaded.png` — Home page after full load
2. `screenshots/diary-table.png` — Dreams Diary table
3. `screenshots/total-summary.png` — Dreams Total summary table

## Allure Reporting

Allure reporter configured in `playwright.config.js`. Results in `allure-results/`.

### Install Allure CLI

```bash
# Windows (Scoop)
scoop install allure

# macOS (Homebrew)
brew install allure

# Linux / cross-platform (npm)
npm install -g allure-commandline
```

Then run:
```bash
npm run test:allure
```

Report opens in browser with step hierarchy matching `test.step()` blocks.

## CI/CD

GitHub Actions workflow at `.github/workflows/playwright.yml`:
- Runs on push/PR to main/master
- Ubuntu latest, Node LTS
- `npm ci` → `npx playwright install --with-deps` → `npm test`
- Uploads `playwright-report` artifact (30-day retention)

## Configuration

### Environment Variables (`.env`, gitignored)

```env
# OpenAI (optional - for AI bonus)
OPENAI_API_KEY=your_key_here

# Ollama local LLM (optional - for AI bonus)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Base URL (not required - in playwright.config.js)
BASE_URL=https://arjitnigam.github.io/myDreams/
```

### Constants (`utils/config.js`)

```js
export const BASE_URL = 'https://arjitnigam.github.io/myDreams/';
export const DREAM_TYPES = ['Good', 'Bad'];
export const EXPECTED_DIARY_ROWS = 10;

// SPECIFICATION VALUES (assignment requirements) - independent source of truth
export const SPEC_COUNTS = { good: 6, bad: 4, total: 10, recurring: 2 };
export const SPEC_RECURRING_NAMES = ['Flying over mountains', 'Lost in maze'].sort();
export const RECURRING_RULE = 'count > 1'; // verified: same name appears >1 in diary
```

## Running Tests

```bash
# All tests, headless
npm test

# Specific test file
npx playwright test tests/home.spec.js

# Specific test file with UI
npx playwright test tests/home.spec.js --ui

# Debug mode
npx playwright test --debug

# Run on specific browser
npx playwright test --project=chromium
```

## Notes

- Target: deployed site at `https://arjitnigam.github.io/myDreams/`
- Stack: Playwright + JavaScript (NOT TypeScript)
- Pattern: Page Object Model (mandatory)
- Allure reporter via `allure-playwright`
- Screenshots on failure: `screenshot: 'only-on-failure'`
- Use `test.step()` blocks for clear report logs
- No `waitForTimeout` — use Playwright auto-waiting
- Tests are state-based, not timing-based (10s timeout for loading lifecycle)