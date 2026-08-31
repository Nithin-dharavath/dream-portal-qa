# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Playwright + JavaScript test automation suite for Dream Portal (https://arjitnigam.github.io/myDreams/). Uses Page Object Model (POM) pattern with Allure reporting and optional AI validation via OpenAI.

## Commands

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/home.spec.js

# Run with UI mode
npx playwright test --ui

# View Allure report (after test run)
npx allure serve

# Generate Allure report (static)
npx allure generate allure-results --clean -o allure-report
```

## Architecture

### Folder Structure
```
dream-portal-qa/
├── pages/                 # Page Object classes (POM)
│   ├── HomePage.js        # Home page: loading animation, "My Dreams" button, tab capture
│   ├── DreamsDiaryPage.js # Dreams Diary: table rows, dream types, cell validation
│   └── DreamsTotalPage.js # Dreams Total: counts, recurring dreams list
├── tests/                 # Test specs
│   ├── home.spec.js       # Loading animation, main content, tab navigation
│   ├── dreamsDiary.spec.js # 10 rows, Good/Bad types, non-empty cells
│   ├── dreamsTotal.spec.js # Counts: Good=6, Bad=4, Total=10, Recurring=2
│   └── aiValidation.spec.js # Bonus: LLM classification vs table values
├── utils/
│   └── config.js          # Base URL, shared constants
├── playwright.config.js   # Playwright config with Allure reporter
├── .env                   # OPENAI_API_KEY (gitignored)
├── .gitignore             # node_modules, .env, test-results, playwright-report, allure-results
├── package.json
└── README.md
```

### Key Page Selectors (from live site DOM)

**Home Page (index.html):**
- Loading spinner: `.spinner` or `.loading-animation`
- Main content: `.main-content` (hidden initially, `.show` class when visible)
- "My Dreams" button: `#dreamButton` (hidden initially, `.show` class when visible)

**Dreams Diary (dreams-diary.html):**
- Table: `#dreamsDiary`
- Rows: `#dreamsDiary tbody tr` (exactly 10)
- Columns: Dream Name (td:nth-child(1)), Days Ago (td:nth-child(2)), Dream Type (td:nth-child(3))

**Dreams Total (dreams-total.html):**
- Table: `#dreamsTotal`
- Rows: Good Dreams=6, Bad Dreams=4, Total Dreams=10, Dreams This Week=7, Recurring Dreams=2
- Recurring names: "Flying over mountains", "Lost in maze"

### Test Data Constants (from specs)
- Diary rows: 10
- Dream types: only "Good" or "Bad"
- Summary counts: Good=6, Bad=4, Total=10, Recurring=2
- Recurring names: ["Flying over mountains", "Lost in maze"]

## Configuration

### playwright.config.js
- Test dir: `./tests`
- Fully parallel: true
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, undefined locally
- Reporter: `html` (plus Allure via package.json)
- Trace: `on-first-retry`
- Projects: chromium, firefox, webkit

### utils/config.js
Exports base URL and constants — no hardcoded URLs in specs.

### .env
```
OPENAI_API_KEY=your_key_here
BASE_URL=https://arjitnigam.github.io/myDreams/
```

## CI/CD

GitHub Actions workflow at `.github/workflows/playwright.yml`:
- Runs on push/PR to main/master
- Ubuntu latest, Node LTS
- `npm ci` → `npx playwright install --with-deps` → `npx playwright test`
- Uploads playwright-report artifact (30-day retention)

## Git Hygiene (target commit sequence)
1. Initial project setup (scaffold, config, gitignore)
2. Add POM classes for all three pages
3. Add home page tests
4. Add dreams-diary tests
4. Add dreams-total tests
5. Add Allure reporting + screenshot config
6. Add AI validation bonus
7. Add README

## Notes
- Target site: https://arjitnigam.github.io/myDreams/
- Stack: Playwright + JavaScript (NOT TypeScript)
- Pattern: Page Object Model (mandatory)
- Allure reporter via `allure-playwright`
- AI validation bonus: OpenAI classification with fallback/mock if no API key
- Screenshots on failure: `screenshot: 'only-on-failure'`
- Use `test.step()` blocks for clear report logs
- No `waitForTimeout` — use Playwright auto-waiting