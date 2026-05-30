# QA Review
**Story ID:** STORY-006 — Game Engine: Bot AI Decision Tree
**Status:** PASS
**Date:** 2026-05-31
**Reviewer:** QA Engineer

---

## Summary

STORY-006 implements `decideBotPlay()`, a pure function that executes a 5-branch deterministic priority decision tree for bot card play. Two new files were created (`src/engine/bot-ai.ts`, `src/engine/bot-ai.test.ts`) and one file was modified (`src/engine/index.ts` barrel export). All acceptance criteria are met, all 100 tests pass (including 11 new bot-AI tests), build and lint are clean, and the implementation faithfully follows architecture §8.5 with one minor and reasonable engineering enhancement (explicit empty-hand guard).

---

## Acceptance Criteria Check

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| AC-017 | Bot plays automatically after 1–2s delay with animation | **PARTIAL (scope-correct)** | `decideBotPlay()` engine function is complete and ready for integration. The 1–2s delay is correctly scoped to the `useBotTurn` hook (STORY-015) per architecture §8.7 (line 768: `setTimeout(1500ms)` is in the hook). The story scope document explicitly lists delay as "Out of Scope". This is a valid architectural separation. |
| AC-018 | Bot plays smallest valid number card | **PASS** | Branch 3 (lines 44–61): filters hand for `CardType.Number` cards where `value !== null && isCardPlayable(card, lastValue)`, then `.reduce` selects the minimum. Tests #4, #9, #11 confirm correct behavior. |
| AC-019 | Bot plays special card when no valid number cards | **PASS** | Branch 4 (lines 63–71): uses `.find(card => card.type === CardType.Special)` for first-special fallback. Tests #5, #6, #10, #11 confirm correct behavior. |

**AC Result: 2/2 fully PASS; AC-017 engine-side complete, UI delay correctly deferred.**

---

## Test Commands Run

| Command | Result |
|---------|--------|
| `npm test` (vitest run) | **100 tests passed**, 8 test files, 21.28s duration — zero failures |
| `npm run build` (tsc -b && vite build) | **PASS** — tsc zero type errors, vite build 31 modules in 17.20s |
| `npm run lint` (eslint .) | **PASS** — exit code 0, zero diagnostics |

---

## Test Results

### Full Suite
```
Test Files  8 passed (8)
Tests       100 passed (100)
Duration    21.28s
```

### Bot-AI Specific (11 tests)
All 11 tests in `src/engine/bot-ai.test.ts` pass. Each required test case from the story document maps to a named test:

| # | Required Test Case | Test Name | Branch | Assertion | Result |
|---|---|---|---|---|---|
| 1 | Empty pile + [3, 7, Reverse] → plays 3 | `'empty pile: plays the smallest card overall (value 3 over 7 and Reverse)'` | 2 | cardId = 'c3' | **PASS** |
| 2 | Empty pile + [Reverse, Skip, Bomb] → plays special | `'empty pile with only special cards: plays a special card'` | 2 | cardId in {cRev, cSkp, cBmb} | **PASS** |
| 3 | Empty pile + [5, 2, 9] → plays 2 | `'empty pile with number cards: plays value 2 (minimum)'` | 2 | cardId = 'c2' | **PASS** |
| 4 | Pile=8 + [3, 10, 12] → plays 10 | `'pile=8: plays the smallest number card >= lastValue (value 10)'` | 3 | cardId = 'c10' | **PASS** |
| 5 | Pile=8 + [3,5,7,Bomb] → plays Bomb | `'pile=8 with no valid numbers but has special: plays special card (Bomb)'` | 4 | cardId = 'cBmb' | **PASS** |
| 6 | Pile=8 + [3,5,7,Reverse] → plays Reverse | `'pile=8 with no valid numbers: plays Reverse when available'` | 4 | cardId = 'cRev' | **PASS** |
| 7 | Pile=8 + [3,5,7] → pass | `'pile=8 with only low number cards and no specials: passes'` | 5 | action='pass', cardId undefined | **PASS** |
| 8 | Empty hand → pass | `'empty hand: returns pass with "No cards in hand"'` | 1 | action='pass', reason exact match | **PASS** |
| 9 | Pile=13 + [13] → plays 13 | `'pile=13 with exact match: plays value 13'` | 3 | cardId = 'c13' | **PASS** |
| 10 | Multiple specials → first special | `'multiple special cards: plays the first special card in hand order'` | 4 | cardId = 'cSkip' | **PASS** |
| 11 | All branches → valid BotDecision | `'all decision branches return well-formed BotDecision objects'` | 1–5 | shape + cardId presence per branch | **PASS** |

**Test Coverage: 11/11 required cases covered. All BotDecision objects with action='play' have cardId set. All with action='pass' have cardId undefined. 100/100 total suite passing.**

---

## Decision Tree Logic Verification

Architecture §8.5 specifies a 4-case decision tree. The implementation uses 5 branches, adding an explicit empty-hand guard as priority #1.

| Priority | Rule (Architecture §8.5) | Implementation (bot-ai.ts) | Match |
|----------|--------------------------|----------------------------|-------|
| 1 | *(not in arch — engineering addition)* | Empty hand (`hand.length === 0`) → `{ action: 'pass', reason: 'No cards in hand' }` | **ENHANCEMENT** — Reasonable defensive programming. When hand is empty and lastValue is not null, the architecture pseudocode would implicitly fall through to "No playable cards". Making it explicit improves clarity and testability. |
| 2 | Empty pile (`lastValue === null`) → play smallest card (numbers first, specials last via `value ?? 14`) | Lines 32–42: `[...hand].sort((a, b) => (a.value ?? 14) - (b.value ?? 14))`, play `sorted[0]` | **EXACT MATCH** |
| 3 | Has valid number cards (`value >= lastValue`) → play smallest valid | Lines 44–61: Filter `CardType.Number && value !== null && isCardPlayable(card, lastValue)`, then `.reduce` for minimum | **EXACT MATCH** |
| 4 | No valid numbers, has special → play first special | Lines 63–71: `.find(card => card.type === CardType.Special)` | **EXACT MATCH** |
| 5 | No playable cards → pass | Lines 73–77: Fallthrough → `{ action: 'pass', reason: 'No playable cards (pile=X)' }` | **EXACT MATCH** |

**Decision Tree Logic Score: 5/5 correct. All branches match architecture with one documented and reasonable enhancement.**

---

## Manual Review

### Code Quality (src/engine/bot-ai.ts, 78 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Pure function — no state mutation | **PASS** | `[...hand].sort()` uses spread to create a copy before sorting (line 33). No `.sort()` on the input array directly. |
| No side effects | **PASS** | No I/O, no `console.log`, no `setTimeout`, no network calls. |
| No React/3D imports | **PASS** | Imports only: `CardType` from `../types`, `Card`/`BotDecision` from `../types`, `isCardPlayable` from `./cards`. |
| Returns fresh BotDecision objects | **PASS** | All 5 return paths create new object literals. No shared references. |
| Uses `isCardPlayable` from `cards.ts` correctly | **PASS** | Called at line 49 with `(card, lastValue)`. Cards.ts confirms: special cards always playable (line 16), number cards playable when lastValue is null (line 19) or `value >= lastValue` (line 23). The implementation correctly only calls `isCardPlayable` for number cards (filter already excludes specials via `card.type === CardType.Number`). |
| `value ?? 14` sort trick | **PASS** | Special cards have `value: null`, so `null ?? 14 = 14`. Since number card values range 1–13, all number cards sort before specials. Matches architecture. |
| Type safety | **PASS** | Function signature matches spec: `(hand: Card[], lastValue: number | null): BotDecision`. Uses `card.value!` (non-null assertion) after filtering with `card.value !== null` — safe. |

### Barrel Export (src/engine/index.ts, line 24)

`export { decideBotPlay } from './bot-ai'` — Correctly exports the new function. Commented with `// Bot AI (STORY-006)`. **PASS**.

### Test Quality (src/engine/bot-ai.test.ts, 245 lines)

| Check | Result | Notes |
|-------|--------|-------|
| Helper functions | **PASS** | `makeNumberCard` and `makeSpecialCard` produce well-typed `Card` objects. |
| Test isolation | **PASS** | Each test creates its own hand array. No shared mutable state. |
| Assertion quality | **PASS** | Tests assert `action`, `cardId`, and `reason` string content. Test 11 checks BotDecision shape for all 5 branches. |
| Edge case coverage | **PASS** | Covers empty hand, all-specials hand, exact match, no playable, multiple specials, mixed hand with specials. |

---

## Edge Cases Checked

| Edge Case | Covered? | Evidence |
|-----------|----------|----------|
| Empty hand (0 cards) | **YES** | Test #8: `decideBotPlay([], 5)` → `{ action: 'pass', cardId: undefined, reason: 'No cards in hand' }` |
| All specials on empty pile | **YES** | Test #2: Hand of [Reverse, Skip, Bomb], pile=null → plays a special |
| All specials on non-empty pile, no valid numbers | **YES** | Test #10: Hand has c1 (value=1) + 3 specials, pile=13 → plays first special (cSkip) |
| Exact match (pile=13, card=13) | **YES** | Test #9: Confirms `isCardPlayable` allows exact match (`13 >= 13` is true) |
| Multiple specials, first in hand order | **YES** | Test #10: `.find()` returns cSkip (first in array), confirmed |
| No playable cards at all | **YES** | Test #7: All cards below pile value, no specials → pass |
| Input array not mutated | **YES** | Implementation uses `[...hand].sort()` (line 33) — spread creates shallow copy |

---

## Bugs Found

**None.** No defects identified in code logic, test assertions, type definitions, or architectural compliance.

---

## Deviations Assessment

| Deviation | From Architecture §8.5 | Assessment |
|-----------|----------------------|------------|
| 5 branches instead of 4 | Architecture pseudocode has 4 cases; implementation adds explicit empty-hand check as priority #1 | **ACCEPTABLE.** The architecture pseudocode handles empty hand implicitly (would fall through to "No playable cards" when hand is empty and lastValue is not null). The explicit guard is defensive programming that improves clarity, testability, and provides a more specific reason string. The empty hand case is listed in the story's Edge Cases section (line 77). This is an engineering improvement, not a deviation. |
| Reason strings differ from pseudocode | Architecture uses shorter strings (e.g., `'Empty pile, play smallest'`), implementation uses more descriptive strings with interpolated values (e.g., `'Play smallest valid number card (value=10, pile=8)'`) | **ACCEPTABLE.** The story's technical context says `reason` is a "human-readable explanation for debugging". The implementation's strings are strictly more informative. |
| Sort on full hand vs pre-filtered cards | Architecture pre-filters `numberCards` and `specialCards` before sorting; implementation sorts `[...hand]` directly for the empty-pile case | **ACCEPTABLE.** When `lastValue === null`, ALL cards are playable per `isCardPlayable`. Sorting the full hand produces the same result as sorting pre-filtered playable cards, since no cards would be excluded. |

**All deviations are reasonable engineering enhancements that improve code quality without changing specified behavior.**

---

## Regression Risk

**Minimal.**

- The 89 pre-existing tests continue to pass (100 total suite).
- No existing files were modified except `src/engine/index.ts` (purely additive barrel export on line 24).
- The function is entirely new with no call sites yet — zero risk of breaking existing game logic.
- The `isCardPlayable` function from `cards.ts` is consumed but not modified.
- `src/types/index.ts` is not touched — `BotDecision` type was already defined (STORY-002).

---

## Final Verdict

### QA PASS

**Recommendation:** Approve STORY-006. Story is ready to be closed.

| Category | Score | Notes |
|----------|-------|-------|
| Build & Lint | 10/10 | tsc, vite build, eslint all clean |
| Test Execution | 10/10 | 100/100 suite passing, 11/11 bot-ai tests |
| Decision Tree Logic | 10/10 | All 5 branches correct, matches architecture §8.5 |
| Test Coverage | 10/10 | All 11 required cases covered, shape validation included |
| Engineering Quality | 10/10 | Pure function, no mutations, correct imports, fresh objects |
| Acceptance Criteria | 9.5/10 | AC-018 + AC-019 fully pass; AC-017 engine-side complete (delay correctly deferred) |
| Architecture Compliance | 10/10 | Faithful to §8.5 with documented improvements |
| Deviation Assessment | 10/10 | All deviations are reasonable enhancements |
| Regression Risk | 10/10 | Zero risk — purely additive, no call sites yet |

### Overall QA Score: 9.9 / 10

*The 0.1 deduction reflects that AC-017's full end-to-end behavior (1–2s delay) is not verifiable until the `useBotTurn` hook story (STORY-015) is complete. This is correct scoping — not a defect.*

---

*QA review conducted on 2026-05-31. No bug report required.*
