# Step 3 Spec: Home Page Tests

## Overview
Test home page loading lifecycle and "My Dreams" tab navigation. Uses `HomePage` POM from Step 2.

---

## Test File

### `tests/home.spec.js`

**Structure**
```js
test.describe('Home page loading lifecycle', () => {
  test('loading animation appears then disappears', async ({ page }) => { ... });
});

test.describe('My Dreams opens and loads both tabs', () => {
  test('clicking My Dreams opens diary and total pages that load', async ({ page, context }) => { ... });
});
```

---

## Test 1: Loading Lifecycle

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | `homePage.goto()` | — |
| 2 | `expect(homePage.getLoadingSpinner()).toBeVisible()` | Spinner visible on load |
| 3 | `expect(homePage.getMainContent()).toBeVisible({ timeout: 10000 })` | Main content visible |
| 3 | `expect(homePage.getLoadingContainer()).toHaveClass(/hidden/)` | Container has `.hidden` class |
| 4 | `expect(homePage.getDreamButton()).toBeVisible()` | Button visible |

**Notes**
- App implements 3000ms delay (Step 0 verified in script.js)
- Test verifies observable lifecycle (visible → hidden) with 10s timeout
- Does **not** assert exact wall-clock duration (avoids CI flakiness)

---

## Test 2: My Dreams Opens Both Tabs

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | `homePage.goto()` + wait for main content + button | Page ready |
| 2 | Setup concurrent listeners: `const pagePromises = [context.waitForEvent('page'), context.waitForEvent('page')]` | — |
| 3 | `await homePage.clickMyDreams()` | Click fires 2 tabs synchronously |
| 4 | `const [diaryPage, totalPage] = await Promise.all(pagePromises)` | Capture both |
| 5 | `expect(diaryPage.locator('#dreamsDiary')).toBeVisible()` | Diary loads |
| 5 | `expect(diaryPage.url()).toMatch(/dreams-diary\.html$/)` | URL correct |
| 6 | `expect(totalPage.locator('#dreamsTotal')).toBeVisible()` | Total loads |
| 6 | `expect(totalPage.url()).toMatch(/dreams-total\.html$/)` | URL correct |
| 7 | `await diaryPage.close(); await totalPage.close()` | Cleanup |

**Critical: concurrent capture**
```js
const pagePromises = [
  context.waitForEvent('page'),
  context.waitForEvent('page'),
];
await homePage.clickMyDreams();
const [diaryPage, totalPage] = await Promise.all(pagePromises);
```
Sequential `waitForEvent` would miss second tab (both fire on same click).

---

## Acceptance Criteria

- [ ] File exists at `tests/home.spec.js`
- [ ] Two `test.describe` blocks as above
- [ ] All assertions use `test.step()` with meaningful QA action names
- [ ] Loading test: 4 steps covering spinner → content → container hidden → button
- [ ] Tabs test: concurrent capture, verify both load + correct URLs
- [ ] Cleanup closes both opened tabs
- [ ] No `waitForTimeout` — state-based waits only
- [ ] 10s timeout on main content wait (covers 3s app delay + CI margin)

---

## POM Dependency

Uses `HomePage` from Step 2:
```js
import { HomePage } from '../pages/HomePage';
```

Methods used:
- `goto()`
- `getLoadingSpinner()`
- `getMainContent()`
- `getLoadingContainer()`
- `getDreamButton()`
- `clickMyDreams()`