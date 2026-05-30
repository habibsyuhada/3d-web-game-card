# Dev Notes
Story ID: STORY-006

## Story Context Reviewed
- `docs/stories/STORY-006.md` — Bot AI Decision Tree (status: Ready, deps: STORY-001/002/003 all done)
- `docs/queue/dev-queue.md` — Wave 2, item 6, queued for implementation
- `docs/prd/prd.md` — FR-060–FR-066 (bot auto-play, smallest-card rule, special-card fallback, life loss on pass)
- `docs/architecture/architecture.md` — Section 8.5 specifies `decideBotPlay()` pure function signature and decision priorities
- `src/types/index.ts` — `Card`, `CardType`, `BotDecision`, `SpecialEffect` all imported
- `src/engine/cards.ts` — `isCardPlayable` used for playability validation
- `src/engine/index.ts` — barrel file updated with new export

## Files Changed
- `src/engine/bot-ai.ts` — **Created.** Implements `decideBotPlay(hand, lastValue)` with the 5-branch priority decision tree.
- `src/engine/index.ts` — **Modified.** Added `export { decideBotPlay } from './bot-ai'`.
- `src/engine/bot-ai.test.ts` — **Created.** 11 test cases covering all decision branches + edge cases.

## Implementation Summary

### Decision Tree (5 branches, evaluated in order)

| # | Condition | Action | cardId | Reason pattern |
|---|-----------|--------|--------|----------------|
| 1 | `hand.length === 0` | `pass` | — | `No cards in hand` |
| 2 | `lastValue === null` (empty pile) | `play` | smallest card by `value ?? 14` | `Play smallest card (empty pile)` |
| 3 | Has number card(s) with `value >= lastValue` | `play` | smallest such card | `Play smallest valid number card (value=X, pile=Y)` |
| 4 | No valid number cards, but has special card | `play` | first special in hand order | `Play special card (no valid numbers, pile=Y)` |
| 5 | None of the above | `pass` | — | `No playable cards (pile=X)` |

### Key implementation details

- **`value ?? 14` sort trick**: When sorting for the empty-pile branch, number cards are sorted by their natural value; special cards (which have `value: null`) are pushed to the end by treating them as value 14 (any number card will come before them).
- **`.reduce` for minimum**: The smallest valid number card is found via `Array.reduce`, which is O(n) and deterministic.
- **`.find` for first special**: The special-card fallback uses `Array.find`, preserving insertion order (test 10 validates this).
- **Pure function**: No side-effects. Delay, animation, and rendering are all out of scope (handled in later stories).

## Tests Added or Updated

**File:** `src/engine/bot-ai.test.ts`

**Test helpers:**
- `makeNumberCard(id, value)` — returns a `Card` with `CardType.Number`
- `makeSpecialCard(id, effect)` — returns a `Card` with `CardType.Special`

**11 tests (all passing):**

| # | Test name | Branch exercised | Key assertion |
|---|-----------|-----------------|---------------|
| 1 | empty pile + [3, 7, Reverse] | 2 | cardId = `c3` |
| 2 | empty pile + [Reverse, Skip, Bomb] | 2 (all specials) | cardId in {cRev, cSkp, cBmb} |
| 3 | empty pile + [5, 2, 9] | 2 | cardId = `c2` |
| 4 | pile=8 + [3, 10, 12] | 3 | cardId = `c10` |
| 5 | pile=8 + [3, 5, 7, Bomb] | 4 | cardId = `cBmb` |
| 6 | pile=8 + [3, 5, 7, Reverse] | 4 | cardId = `cRev` |
| 7 | pile=8 + [3, 5, 7] | 5 | action = `pass` |
| 8 | empty hand | 1 | action = `pass`, cardId undefined |
| 9 | pile=13 + [13] | 3 (exact match) | cardId = `c13` |
| 10 | multiple specials + pile=13 | 4 (first special) | cardId = `cSkip` (first in hand) |
| 11 | all 5 branches checked | 1–5 | each produces valid `BotDecision` shape |

## Test Commands Run
```powershell
npm test -- --run src/engine/bot-ai.test.ts   # bot-ai tests only
npm test -- --run                              # full suite
npm run build                                  # tsc + vite build
npm run lint                                   # eslint .
```

## Test Results
- **Bot-AI tests:** 11 passed / 11 (file: 1 passed)
- **Full suite:** 100 passed / 100 (8 files passed, 0 failures)
- **Build:** `tsc -b` — no type errors. `vite build` — 15.56 s, 31 modules, no warnings.
- **Lint:** `eslint .` — exited 0, no diagnostics.

## Commit Notes

Suggested commit message:
```
feat(engine): add bot AI decision tree (STORY-006)

Adds decideBotPlay() — a pure function implementing the 5-branch
priority decision tree for automated bot play:

1. Empty hand       → pass
2. Empty pile       → play smallest card (value ?? 14 sort)
3. Valid numbers    → play smallest card >= lastValue
4. Special fallback → play first special card in hand
5. No playable      → pass

Includes 11 unit tests covering all branches, edge cases (exact
match, empty hand, all-specials hand), and BotDecision shape
validation. All existing 89 tests still pass (100 total).
```

## Risks / Limitations
- **"First special card" ordering** — The special-card fallback uses `Array.find`, which preserves insertion order. If the deck/hand ordering changes in a later story, the bot may pick a different special card for the equivalent scenario. This is acceptable for MVP (architecture §8.5 explicitly allows any special card).
- **No difficulty levels** — The bot is purely deterministic with a single strategy. Difficulty tuning is out of scope for STORY-006.
- **No randomness** — There is currently no tie-breaker when two number cards have the same value. The first encountered card wins via `reduce`. This is deterministic given stable hand order.
- **Delayed play not implemented** — The 1–2 s delay (FR-065) is correctly excluded from this pure function; it will be added in the `useBotTurn` hook (STORY-015).

## Ready for Scrum Master Review?
Status: **READY_FOR_SM_REVIEW**

All acceptance criteria met:
- Code implemented in `src/engine/bot-ai.ts`
- Barrel export added to `src/engine/index.ts`
- 11/11 test cases pass; full suite (100 tests) green
- Build clean (tsc + vite); lint clean
- Dev notes created at `docs/dev-notes/DEV-NOTES-STORY-006.md`
- No out-of-scope work performed
