# Dev Notes
Story ID: STORY-005

## Story Context Reviewed
- docs/stories/STORY-005.md — Special Card Effects engine module
- docs/prd/prd.md — FR-040 through FR-045 (special card functional requirements)
- docs/architecture/architecture.md — Section 8.4 (Special Card Effects design)
- docs/queue/dev-queue.md — Wave 2, first story in implementation order
- Existing engine modules: deck.ts, cards.ts, turn.ts, player.ts (all from STORY-001 through STORY-004)
- Existing types: SpecialEffect enum, Direction enum, GameState interface

## Files Changed
| File | Action | Description |
|------|--------|-------------|
| `src/engine/special-cards.ts` | **Created** | `SpecialEffectResult` interface + `applySpecialEffect()` function with 5 effect handlers |
| `src/engine/special-cards.test.ts` | **Created** | 15 test cases covering all effects + edge cases + exhaustive enum handling |
| `src/engine/index.ts` | **Modified** | Added exports for `applySpecialEffect` and `SpecialEffectResult` |
| `docs/stories/STORY-005.md` | **Modified** | Marked Definition of Done checkboxes, status set to In Review |
| `docs/queue/dev-queue.md` | **Modified** | Updated STORY-005 status to In Review |

## Implementation Summary

### `SpecialEffectResult` interface
Added the `clearMiddlePile: boolean` field per story spec, which differentiates Bomb (reset value only) from Nuclear (reset value + clear card array). Also added optional `randomValue?: number` for Random effect VFX display.

### `applySpecialEffect()` function
Pure function with exhaustive switch over `SpecialEffect` enum:
- **Reverse:** Toggles `Direction.Clockwise` ↔ `Direction.CounterClockwise`. All other fields unchanged/preserved.
- **Skip:** Sets `skipNext: true`. Direction and lastValue unchanged.
- **Bomb:** Sets `newLastValue: null`. Direction unchanged, `clearMiddlePile: false` (cards stay visually).
- **Nuclear:** Sets `newLastValue: null` and `clearMiddlePile: true` (signals store to clear array).
- **Random:** Generates `randomInt(1, 13)` using the shared utility from `src/utils/math.ts`. Sets both `newLastValue` and `randomValue`.

### Design decisions
- Used existing `randomInt(1, 13)` from `src/utils/math.ts` instead of inline `Math.floor(Math.random() * 13) + 1` — more consistent with codebase and the function already handles inclusive bounds correctly.
- The function is pure and does not mutate state. The store action (STORY-009) will read the result and apply mutations.
- TypeScript's exhaustive switch ensures compile-time error if a new `SpecialEffect` value is added without a handler.

## Tests Added or Updated
Created `src/engine/special-cards.test.ts` with 15 tests:

| # | Test | Effect |
|---|------|--------|
| 1 | Reverse flips Clockwise → CounterClockwise | Reverse |
| 2 | Reverse flips CounterClockwise → Clockwise | Reverse |
| 3 | Reverse: skipNext false, newLastValue unchanged, clearMiddlePile false | Reverse |
| 4 | Skip: direction unchanged, skipNext true, newLastValue unchanged | Skip |
| 5 | Bomb: newLastValue null, clearMiddlePile false | Bomb |
| 6 | Bomb: direction unchanged, skipNext false | Bomb |
| 7 | Bomb: stays null when lastValue already null (edge case) | Bomb |
| 8 | Nuclear: newLastValue null, clearMiddlePile true | Nuclear |
| 9 | Nuclear: direction unchanged, skipNext false | Nuclear |
| 10 | Nuclear: stays null when lastValue already null (edge case) | Nuclear |
| 11 | Random: newLastValue between 1–13 inclusive | Random |
| 12 | Random: randomValue equals newLastValue | Random |
| 13 | Random: 20 calls produce at least 2 different values (statistical) | Random |
| 14 | Random: 50 rolls all produce valid integer values in range | Random |
| 15 | All SpecialEffect enum values are handled without throwing | Exhaustive |

## Test Commands Run
- `npm test` — Full suite: 7 test files, **89 tests passed** (15 new from this story)
- `vitest run src/engine/special-cards.test.ts --reporter=verbose` — Isolated: 15/15 passed
- `npm run build` — TypeScript compilation + Vite production build: **success**
- `npm run lint` — ESLint: **no errors**

## Test Results
```
Test Files  7 passed (7)
Tests       89 passed (89)
Build       ✓ built in 14.79s
Lint        ✓ clean
```

## Commit Notes
Suggested commit message:
```
feat(engine): implement special card effects (STORY-005)

Add applySpecialEffect() with five handlers: Reverse, Skip, Bomb,
Nuclear, and Random. Each returns a SpecialEffectResult describing
state mutations for the store layer to apply.

- Create src/engine/special-cards.ts with SpecialEffectResult interface
- Export applySpecialEffect and SpecialEffectResult from engine barrel
- Add 15 unit tests covering all effects, edge cases, and exhaustive enum
- All 89 tests pass; build and lint clean
```

## Risks / Limitations
- **Random uses `Math.random()`:** Not cryptographically random, which is fine for a card game but means tests for randomness are statistical.
- **No store integration:** The `clearMiddlePile` signal is not yet consumed — that happens in STORY-009 (Zustand store).
- **No visual effects:** VFX triggers are signaled by the result object but rendering is out of scope (handled in STORY-018).
- **Skip only sets a flag:** Actual turn-skipping logic is handled by the turn manager / game orchestration (STORY-008/015), not this module.

## Ready for Scrum Master Review?
Status: **READY_FOR_SM_REVIEW**
