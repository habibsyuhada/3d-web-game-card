# QA Review
Story ID: STORY-007
Title: Game Engine: Win Condition & Deadlock Resolution
QA Reviewer: QA Engineer (AI)
QA Date: 2026-05-31
Status: **PASS**

---

## Summary

STORY-007 delivers three pure functions (`checkWinCondition`, `resolveDeadlock`, `isDeadlock`) for win detection and deadlock resolution in the game engine. All three functions are implemented correctly as pure, stateless functions with no side effects or external dependencies beyond `hasPlayableCard` from the established `cards.ts` module. All 115 tests pass (including 15 new tests for this story), the production build succeeds, and ESLint reports zero violations. Both acceptance criteria (AC-015, AC-023) are fully satisfied.

---

## Acceptance Criteria Check

| AC ID | Criterion | Evidence | Status |
|---|---|---|---|
| AC-015 | Victory/defeat state when 1 alive player remains | `checkWinCondition` returns the single alive player when exactly 1 remains (test line 68), returns null for 0, 2, or 4 alive (tests lines 82, 93, 104). UI screen out of scope (STORY-019). | PASS |
| AC-023 | Deadlock resolved by most lives, lowest index tie-breaker | `resolveDeadlock` sorts alive by lives DESC then id ASC. Verified: [5,3,2,1] returns id=1 (test line 117), tied [3,3,2,1] returns id=2 (test line 131), all same [3,3,3,3] returns id=1 (test line 145). | PASS |

**Result:** 2/2 acceptance criteria MET.

---

## Test Commands Run

| Command | Command String | Pass? |
|---|---|---|
| Unit Tests | `npm test` | PASS |
| Production Build | `npm run build` | PASS |
| Lint | `npm run lint` | PASS |

---

## Test Results

### `npm test`
- **Result:** PASS
- **Output:** 115 tests passed, 0 failed, 9 test files
- **Duration:** 21.92s
- **Verdict:** All tests green. No flaky tests observed.

### `npm run build`
- **Result:** PASS
- **Output:** `tsc -b && vite build` — 31 modules transformed, built in 15.48s. Output: `dist/` with HTML, CSS, JS chunks (three-vendor 140.93 kB gzipped to 45.29 kB).
- **Verdict:** Clean production build, no type errors, no bundling issues.

### `npm run lint`
- **Result:** PASS
- **Output:** `eslint .` — zero exit code, no errors, no warnings.
- **Verdict:** Clean lint.

---

## Manual Review

### Win Condition Logic Score: 25/25

#### `checkWinCondition` (win-condition.ts:12-14)
- Filters players by `PlayerStatus.Alive` into `alive` array.
- Returns `alive[0]` if `alive.length === 1`, otherwise `null`.
- Defensive: returns `null` for 0 alive (edge case where all eliminated simultaneously).
- Pure: no mutations, no side effects.
- **Verdict:** CORRECT

#### `resolveDeadlock` (win-condition.ts:23-31)
- Filters alive players.
- Returns `null` if `alive.length === 0` (defensive — should not happen but handled).
- Sorts alive by `b.lives - a.lives` (descending lives) then `a.id - b.id` (ascending id for tie-breaker).
- Uses `[...alive].sort(...)` — spread operator prevents mutation of the filtered array.
- Returns `sorted[0]`.
- Pure: no mutations, no side effects.
- **Verdict:** CORRECT

#### `isDeadlock` (win-condition.ts:42-47)
- Filters alive players from `state.players`.
- Returns `false` if `alive.length <= 1` (0 or 1 alive is not a deadlock).
- Checks `alive.every(p => !hasPlayableCard(p.hand, state.lastValue))` — returns `true` only if ALL alive players have no playable cards.
- Uses `hasPlayableCard(hand: Card[], lastValue: number | null): boolean` from `./cards` — signature matches call correctly.
- Pure: no mutations, no side effects.
- **Verdict:** CORRECT

### Engineering Quality Score: 15/15

| Check | Result |
|---|---|
| Pure functions (no mutations) | PASS — `resolveDeadlock` uses `[...alive]`; `filter` returns new arrays |
| No React/3D imports | PASS — only imports from `../types` and `./cards` |
| Correct `hasPlayableCard` usage | PASS — signature `(Card[], number \| null) => boolean` matches call |
| Type safety | PASS — all return types `Player \| null` or `boolean` correctly typed |
| Export barrel updated | PASS — `src/engine/index.ts` line 27 exports all 3 functions |
| No circular dependencies | PASS — `win-condition.ts` imports from `cards`, not vice versa |

---

## Test Coverage Review

### Test File: `src/engine/win-condition.test.ts` (287 lines, 15 test cases, 3 describe blocks)

### Required Test Cases: 9/9 PASS

| # | Required Case | Test Location | Actual Assertion | Status |
|---|---|---|---|---|
| 1 | 4 players, 3 eliminated returns alive player | Line 68 | `winner.id === 2` | PASS |
| 2 | 2 alive returns null | Line 82 | `toBeNull()` | PASS |
| 3 | All alive returns null | Line 93 | `toBeNull()` | PASS |
| 4 | Lives [5,3,2,1] returns player with 5 lives | Line 117 | `winner.id === 1`, `winner.lives === 5` | PASS |
| 5 | Tied [3,3,2,1] returns lowest id | Line 131 | `winner.id === 2`, `winner.lives === 3` | PASS |
| 6 | All same [3,3,3,3] returns id=1 | Line 145 | `winner.id === 1`, `winner.lives === 3` | PASS |
| 7 | All alive, no playable cards returns true | Line 186 | `toBe(true)` | PASS |
| 8 | At least one has playable card returns false | Line 203 | `toBe(false)` | PASS |
| 9 | Only 1 alive returns false | Line 219 | `toBe(false)` | PASS |

### Edge Case Tests: 6/6 PASS

| # | Edge Case | Test Location | Assertion | Status |
|---|---|---|---|---|
| 10 | All 4 eliminated in `checkWinCondition` returns null | Line 104 | `toBeNull()` | PASS |
| 11 | All eliminated in `resolveDeadlock` returns null | Line 159 | `toBeNull()` | PASS |
| 12 | Eliminated players ignored in `resolveDeadlock` | Line 170 | `winner.id === 4` (only alive), `winner.lives === 3` | PASS |
| 13 | lastValue=null with specials not deadlock | Line 235 | `toBe(false)` (specials always playable) | PASS |
| 14 | Empty hands deadlock (all alive) | Line 252 | `toBe(true)` (assertion CORRECT, description says "false") | PASS* |
| 15 | No alive players not deadlock | Line 271 | `toBe(false)` (`alive.length <= 1` branch) | PASS |

*Test case #14: description says "returns false" but assertion is `toBe(true)`. The **assertion is correct** — all 4 players are alive with empty hands, `alive.length > 1`, no playable cards exist, therefore deadlock is `true`. Description is misleading, assertion is correct. See SM Issue #2 analysis below.

### Test Coverage Score: 23/25
- All 9 required tests present and correct: +18/18
- All 6 edge cases covered: +5/7 (minor doc issues, see below)

---

## SM Issues Verification

The Scrum Master flagged 2 low-severity issues. QA verification below:

### Issue 1: Dev notes claim 16 tests; actual count is 15
- **Verification:** Manually counted `it()` blocks in `win-condition.test.ts`:
  - `checkWinCondition` describe block: 4 `it()` blocks (lines 68, 82, 93, 104)
  - `resolveDeadlock` describe block: 5 `it()` blocks (lines 117, 131, 145, 159, 170)
  - `isDeadlock` describe block: 6 `it()` blocks (lines 186, 203, 219, 235, 252, 271)
  - **Total: 15 `it()` blocks**
- **Status:** CONFIRMED — doc-only discrepancy. No code defect. Non-blocking.

### Issue 2: Test #14 description mismatch (line 252)
- **Test description:** `"returns false when players have empty hands and lastValue is null"`
- **Actual assertion:** `expect(isDeadlock(state)).toBe(true)` (line 268)
- **Analysis:** The setup creates 4 players all alive with empty hands and `lastValue: null`. Since `alive.length === 4 > 1` and `hasPlayableCard([], null)` returns `false` for every player (no cards in hand means no playable cards), `every` returns `true`, so `isDeadlock` correctly returns `true`. The **assertion is logically correct**. The description should say `"returns true when all alive players have empty hands"`.
- **Status:** CONFIRMED — cosmetic/doc-only discrepancy. Assertion logic is correct. Non-blocking.

---

## Defects Found

| # | Severity | Category | Description |
|---|---|---|---|
| — | — | — | **No defects found.** |

*(Note: The 2 SM-flagged doc issues are non-blocking cosmetic discrepancies, not functional defects.)*

---

## Regression Risk

**RISK LEVEL: LOW**

- `win-condition.ts` is a new, isolated engine module with no dependencies from other modules.
- `src/engine/index.ts` was modified to add exports — additive only, no existing exports changed.
- No shared state or global side effects.
- Existing test suite (115 tests pre-existing from STORY-001 through STORY-006) continues to pass without modification.
- Production build unaffected (tree-shaking ensures unused exports are eliminated).

---

## Final Verdict

### QA PASS

**Recommendation:** STORY-007 should be marked as **QA PASSED** and closed.

**Justification:**
- All 3 required functions are implemented as pure, stateless functions per architecture spec (Section 8.6).
- Both acceptance criteria (AC-015, AC-023) are fully met.
- All 115 tests pass, including all 9 required test cases and 6 edge cases.
- Production build succeeds cleanly.
- ESLint reports zero violations.
- No functional defects found.
- The 2 minor documentation discrepancies (test count in dev notes, misleading test description) are non-blocking and cosmetic in nature.

---

## QA Score

| Category | Score | Max | Notes |
|---|---|---|---|
| Build / Test / Lint Pass | 20 | 20 | 115/115 tests, clean build, clean lint |
| Logic Correctness | 25 | 25 | All 3 functions verified correct, defensive coding |
| Test Coverage | 23 | 25 | All required + edge cases present; -2 for doc discrepancies |
| Engineering Quality | 15 | 15 | Pure, no mutations, no UI deps, correct API usage |
| Acceptance Criteria | 10 | 10 | AC-015 and AC-023 both fully satisfied |
| Regression Risk (deduction) | 0 | 0 | Low risk, isolated module |
| **TOTAL** | **93** | **95** | |

**Normalized: 97.9 / 100** — **QA PASS**

---

*End of QA Review for STORY-007*
