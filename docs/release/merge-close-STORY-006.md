# Merge and Close Notes
**Story ID:** STORY-006 — Game Engine: Bot AI Decision Tree
**Wave:** Wave 2 — Engine Completion & State Entry
**Status:** CLOSED
**Close Date:** 2026-05-31
**Story Points:** 3

---

## Story Summary

STORY-006 delivers the bot AI decision engine for the Zinky Zoogle 3D card game. The implementation provides `decideBotPlay()`, a pure function that determines which card a bot should play (or whether to pass) based on a 5-branch priority decision tree. The function takes the bot's hand and the current pile value and returns a `BotDecision` object containing the action, optional card ID, and a human-readable reason string.

This module enables the three AI opponents in single-player mode to make deterministic, rule-based decisions following the exact priority rules specified in the PRD (FR-060 through FR-066) and architecture document (Section 8.5).

---

## Gate Summary

| Gate | Reviewer | Score | Result | Date |
|------|----------|-------|--------|------|
| Dev Complete | Developer | — | READY_FOR_SM_REVIEW | 2026-05-31 |
| Scrum Master Review | SM Agent | 9.5 / 10 | FORWARD_TO_QA | 2026-05-31 |
| QA Review | QA Engineer | 9.9 / 10 | PASS (0 defects) | 2026-05-31 |

**All gates passed. Story approved for merge and close.**

---

## Files Delivered

| File | Action | Lines | Purpose |
|------|--------|-------|---------|
| `src/engine/bot-ai.ts` | **Created** | 78 | Core `decideBotPlay()` function with 5-branch decision tree |
| `src/engine/bot-ai.test.ts` | **Created** | 245 | 11 unit tests covering all decision branches + edge cases |
| `src/engine/index.ts` | **Modified** | +1 | Barrel export: `export { decideBotPlay } from './bot-ai'` |

---

## Decision Tree Logic (5 Branches)

The bot AI evaluates branches in strict priority order:

| Priority | Trigger Condition | Action | Card Selection | Reason Pattern |
|----------|-------------------|--------|----------------|----------------|
| 1 | `hand.length === 0` | `pass` | — | `No cards in hand` |
| 2 | `lastValue === null` (empty pile) | `play` | Smallest card overall; number cards preferred over specials via `value ?? 14` sort | `Play smallest card (empty pile)` |
| 3 | Has number card(s) with `value >= lastValue` | `play` | Smallest valid number card (via `.reduce`) | `Play smallest valid number card (value=X, pile=Y)` |
| 4 | No valid numbers, but has special card(s) | `play` | First special card in hand order (via `.find`) | `Play special card (no valid numbers, pile=Y)` |
| 5 | None of the above | `pass` | — | `No playable cards (pile=X)` |

### Key Implementation Details
- **Pure function:** No state mutation, no side effects, no I/O. Input hand array is copied via spread before sorting.
- **`value ?? 14` sort trick:** Special cards (`value: null`) are sorted after all number cards (values 1–13) by treating null as 14.
- **Architecture compliance:** Faithfully implements Section 8.5 with one reasonable engineering addition (explicit empty-hand guard as Branch 1).
- **Delay handling:** The 1–2 second bot delay (AC-017/FR-065) is correctly excluded from this pure function and deferred to `useBotTurn` hook (STORY-015).

---

## Test Coverage

### New Tests (STORY-006)
- **File:** `src/engine/bot-ai.test.ts`
- **Tests added:** 11
- **All passing:** Yes

| # | Test Case | Branch | Key Assertion |
|---|-----------|--------|---------------|
| 1 | Empty pile + [3, 7, Reverse] → plays 3 | 2 | `cardId = 'c3'` |
| 2 | Empty pile + [Reverse, Skip, Bomb] → plays special | 2 | `cardId in {cRev, cSkp, cBmb}` |
| 3 | Empty pile + [5, 2, 9] → plays 2 | 2 | `cardId = 'c2'` |
| 4 | Pile=8 + [3, 10, 12] → plays 10 | 3 | `cardId = 'c10'` |
| 5 | Pile=8 + [3,5,7,Bomb] → plays Bomb | 4 | `cardId = 'cBmb'` |
| 6 | Pile=8 + [3,5,7,Reverse] → plays Reverse | 4 | `cardId = 'cRev'` |
| 7 | Pile=8 + [3,5,7] → pass | 5 | `action = 'pass'` |
| 8 | Empty hand → pass | 1 | `action = 'pass', cardId undefined` |
| 9 | Pile=13 + [13] → plays 13 (exact match) | 3 | `cardId = 'c13'` |
| 10 | Multiple specials → first special in hand order | 4 | `cardId = 'cSkip'` |
| 11 | All branches → valid BotDecision shape | 1–5 | Shape validation all branches |

### Full Project Suite
```
Test Files:  8 passed (8)
Tests:       100 passed (100)
Failures:    0
Duration:    ~21s
```

### Build & Lint
```
tsc -b:      No type errors
vite build:  Built in ~15s (31 modules)
eslint .:    Exit 0, no diagnostics
```

---

## Acceptance Criteria

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| AC-017 | Bot plays automatically after 1–2s delay with animation | **ENGINE COMPLETE** | `decideBotPlay()` is ready for integration. The timed delay is correctly scoped to `useBotTurn` hook (STORY-015) per architecture §8.7. |
| AC-018 | Bot plays smallest valid number card | **PASS** | Branch 3: filters playable number cards, `.reduce` selects minimum. Validated by tests #4, #9, #11. |
| AC-019 | Bot plays special card when no valid number cards | **PASS** | Branch 4: `.find(CardType.Special)` fallback. Validated by tests #5, #6, #10, #11. |

**All acceptance criteria met within STORY-006 scope.**

---

## Story Points

**3 points** (Low-Medium complexity)

Delivered on scope, on quality, with zero defects. Excellent test-to-code ratio (11 tests for 78 lines of implementation).

---

## Next Stories Unlocked

STORY-006's completion directly unblocks:

| Story ID | Title | Points | Dependency on STORY-006 |
|----------|-------|--------|-------------------------|
| **STORY-007** | Game Engine: Win Condition & Deadlock Resolution | 2 | Requires bot AI to simulate games for win/loss detection |
| **STORY-008** | Game Engine: Full Orchestration (initGame, resetGame) | 3 | Needs `decideBotPlay` to drive bot turns in full game simulation |

Both STORY-007 and STORY-008 can now proceed. STORY-009 (Zustand Store) depends on the completion of all engine stories (005–008).

---

## Recommended Commit Message

```
feat(engine): add bot AI decision tree (STORY-006)

- Implement decideBotPlay with 5-branch priority decision tree:
  1. Empty hand -> pass
  2. Empty pile -> play smallest card (numbers < specials)
  3. Valid number cards -> play smallest valid number
  4. No valid numbers + has special -> play first special
  5. No playable at all -> pass
- Pure function, no state mutation, returns BotDecision
- Add 11 unit tests covering all branches + edge cases
- Integrates with isCardPlayable from cards.ts
- Project now has 100 passing tests across 8 files

Closes STORY-006
```

---

## Git Instructions

```powershell
# Stage all STORY-006 deliverables
git add src/engine/bot-ai.ts src/engine/bot-ai.test.ts src/engine/index.ts
git add docs/stories/STORY-006.md
git add docs/dev-notes/DEV-NOTES-STORY-006.md
git add docs/queue/completion-review-STORY-006.md
git add docs/qa/QA-REVIEW-STORY-006.md
git add docs/release/merge-close-STORY-006.md
git add docs/queue/dev-queue.md

# Commit
git commit -m "feat(engine): add bot AI decision tree (STORY-006)

- Implement decideBotPlay with 5-branch priority decision tree:
  1. Empty hand -> pass
  2. Empty pile -> play smallest card (numbers < specials)
  3. Valid number cards -> play smallest valid number
  4. No valid numbers + has special -> play first special
  5. No playable at all -> pass
- Pure function, no state mutation, returns BotDecision
- Add 11 unit tests covering all branches + edge cases
- Integrates with isCardPlayable from cards.ts
- Project now has 100 passing tests across 8 files

Closes STORY-006"

# Push
git push origin main
```

---

## Final Checklist

| Item | Status |
|------|--------|
| Code implemented | ✅ |
| Tests written (11 new, 100 total) | ✅ |
| Tests pass (100/100) | ✅ |
| Build clean (tsc + vite) | ✅ |
| Lint clean (eslint) | ✅ |
| Dev notes created | ✅ |
| Scrum Master review passed (9.5/10) | ✅ |
| QA review passed (9.9/10, 0 defects) | ✅ |
| Story status updated to CLOSED | ✅ |
| Dev queue updated to Done | ✅ |
| Merge/close notes created | ✅ |
| Next stories identified | ✅ |

---

## Close Decision

**APPROVED FOR MERGE AND CLOSE**

STORY-006 has passed all quality gates with exemplary scores. The implementation is complete, well-tested, architecturally compliant, and free of defects. All required documentation has been created. The story is hereby **CLOSED**.

---

*Merge and close authorized by Scrum Master on 2026-05-31.*
