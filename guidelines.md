# Prompt: Build Dream Portal QA Automation Suite

Use this as a single prompt for an AI coding assistant (e.g. Claude Code) to scaffold and build the full project in one go.

---

## Context

I'm completing a QA Intern take-home assignment. I need a complete, production-quality **Playwright + JavaScript** test automation suite for a small dream-journaling website. My submission is evaluated on test coverage, code structure, reporting, optional AI integration, git hygiene, and bonus polish — I need to score as high as possible to get selected for the next hiring round.

**Target site:** https://arjitnigam.github.io/myDreams/
**Stack:** Playwright + JavaScript (NOT TypeScript, NOT Selenium)
**Pattern:** Page Object Model (POM), mandatory

---

## Task

Set up and build a complete Playwright + JS automation project with the following:

### 1. Project setup
- Initialize with `npm init playwright@latest`, choosing JavaScript.
- Install `allure-playwright`, `dotenv`, and `openai` (for the AI bonus).
- Folder structure:
```
dream-portal-qa/
├── pages/
│   ├── HomePage.js
│   ├── DreamsDiaryPage.js
│   └── DreamsTotalPage.js
├── tests/
│   ├── home.spec.js
│   ├── dreamsDiary.spec.js
│   ├── dreamsTotal.spec.js
│   └── aiValidation.spec.js
├── utils/
│   └── config.js
├── .env
├── .gitignore
├── playwright.config.js
├── README.md
└── package.json
```
- Configure `playwright.config.js` with the Allure reporter alongside the default list reporter.
- `.gitignore` must exclude `node_modules/`, `.env`, `test-results/`, `playwright-report/`, `allure-results/`.

### 2. Page Objects (`pages/`)
Build one class per page. No raw locators inside test files — everything routed through these classes.

- **HomePage.js** — methods to: navigate to the site, check the loading animation is visible then becomes hidden (~3s), check main content/"My Dreams" button is visible, click "My Dreams" and capture the two new tabs/pages it opens.
- **DreamsDiaryPage.js** — methods to: get row count, get all dream type values, get all row data (name/days ago/type) to check no cell is empty.
- **DreamsTotalPage.js** — methods to: get Good/Bad/Total/Recurring counts, get the list of recurring dream names.

### 3. Test specs (`tests/`)
- **home.spec.js**: loading animation appears then disappears within ~3s (use Playwright's auto-waiting / `waitFor` state, never `waitForTimeout` as the actual assertion mechanism); main content becomes visible; clicking "My Dreams" opens both `dreams-diary.html` and `dreams-total.html` in new tabs.
- **dreamsDiary.spec.js**: exactly 10 rows; every Dream Type is strictly "Good" or "Bad"; every row has all 3 columns non-empty.
- **dreamsTotal.spec.js**: Good = 6, Bad = 4, Total = 10, Recurring = 2; recurring list contains exactly "Flying over mountains" and "Lost in maze".
- **aiValidation.spec.js** (bonus): for each dream name scraped from the diary table, call an LLM (OpenAI via `OPENAI_API_KEY` in `.env`, with a documented fallback/mock mode if no key is present) to classify Good/Bad, and assert it matches the table's value.

### 4. Reporting & logging
- Wire Allure so `npx playwright test` produces results viewable via `npx allure serve`.
- Add `test.step()` blocks around each logical assertion so the report reads clearly, not just pass/fail.
- Capture a screenshot on failure (Playwright config: `screenshot: 'only-on-failure'`), and optionally one screenshot per major assertion, saved under `screenshots/`.

### 5. Config & secrets
- `utils/config.js` exports the base URL and any shared constants — no hardcoded URLs inside spec files.
- `.env` holds `OPENAI_API_KEY` (and base URL override if useful); load via `dotenv`.

### 6. README.md
Include: project overview, setup steps, how to run tests, how to view the Allure report, an explanation of the POM structure and why it's organized that way, and a short note on the AI validation approach (including the fallback if no API key is configured).

### 7. Git hygiene
Produce commits in this logical sequence (guide me through making them, don't squash into one):
1. Initial project setup (scaffold, config, gitignore)
2. Add POM classes for all three pages
3. Add home page tests
4. Add dreams-diary tests
5. Add dreams-total tests
6. Add Allure reporting + screenshot config
7. Add AI validation bonus
8. Add README

---

## Constraints / must-follow rules

- **Must**: Playwright + JS only, POM only, exact numeric/text assertions as specified above, no hardcoded sleeps for the loading check, Allure or HTML report wired up, clean incremental commits, `.env`/`node_modules` gitignored, README included.
- **Should**: a couple of edge cases beyond the literal spec (e.g. reload replays animation, tab count check, header text check), meaningful step logs, keep the project proportionate — don't over-engineer a 3-page site with excessive abstraction.
- Before finalizing locators, inspect the live site's actual DOM (IDs/classes) rather than guessing from the spec wording — confirm selectors are real.
- Final suite must pass cleanly on a **fresh clone** (`git clone` → `npm install` → `npx playwright test`), run 3–4 times to catch flakiness.

---

## Deliverable

A working Playwright + JS repo matching the structure above, all tests passing against the live site, Allure report generating correctly, README complete, and a clean commit history ready to push to a private GitHub repo (to be shared with collaborator `qawingify`).