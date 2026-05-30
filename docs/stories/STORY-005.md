# STORY-005 — Game Engine: Special Card Effects

**Status:** Ready

---

## Requirement IDs
- FR-040 (Reverse: reverses turn direction)
- FR-041 (Skip: skips next active player)
- FR-042 (Bomb: resets middle pile value to null)
- FR-043 (Nuclear: clears all cards from middle pile, resets to null)
- FR-044 (Random: generates random number 1-13 as new middle value)
- FR-045 (Special cards always playable regardless of pile value)

## Acceptance Criteria IDs
- AC-008 (Reverse changes direction indicator and subsequent flow)
- AC-009 (Skip skips the next active player)
- AC-010 (Bomb resets middle pile value to null with VFX trigger)
- AC-011 (Nuclear clears all middle pile cards with VFX trigger)
- AC-012 (Random generates random 1-13 with VFX trigger)

## Business Context
Special cards are the core strategic element of the game, creating dynamic turn flow and pile resets. Each special card has a unique effect that must be applied deterministically and produce results for the animation/VFX layer.

## Technical Context
Per architecture Section 8.4, `applySpecialEffect` is a pure function that takes an effect type and current game state, returning the state modifications. The Nuclear effect also requires clearing `middlePile` (handled by the store action, but the engine signals it via the return value).

## Scope
1. Create `src/engine/special-cards.ts`:
   - `applySpecialEffect(effect: SpecialEffect, state: GameState): SpecialEffectResult`
   - `SpecialEffectResult` interface:
     ```typescript
     interface SpecialEffectResult {
       newLastValue: number | null;
       newDirection: Direction;
       skipNext: boolean;
       clearMiddlePile: boolean;  // true only for Nuclear
       randomValue?: number;       // set only for Random
     }
     ```
   - Five internal handler functions (or switch cases):
     - **Reverse:** Flips `Direction.Clockwise` ↔ `Direction.CounterClockwise`. `skipNext: false`. `newLastValue` unchanged.
     - **Skip:** Same direction. `skipNext: true`. `newLastValue` unchanged.
     - **Bomb:** Same direction. `newLastValue: null`. `skipNext: false`. `clearMiddlePile: false` (pile value resets but cards remain visually).
     - **Nuclear:** Same direction. `newLastValue: null`. `skipNext: false`. `clearMiddlePile: true` (all cards removed from middle pile).
     - **Random:** Same direction. `newLastValue: randomInt(1, 13)`. `skipNext: false`. `randomValue` set.

2. Update `src/engine/index.ts` to export `applySpecialEffect` and `SpecialEffectResult`

## Out of Scope
- Visual effects / particle animation (handled in VFX stories)
- Turn advancement after skip (handled by turn manager / game orchestration)
- Integration with Zustand store (handled in STORY-009)

## Files Likely Affected
- `src/engine/special-cards.ts` (create)
- `src/engine/index.ts` (modify — add export)
- `src/engine/special-cards.test.ts` (create)

## Implementation Notes
- The function signature returns a result object; the store action maps the result to state mutations
- `clearMiddlePile` is a new field that differentiates Bomb (reset value only) from Nuclear (reset value + clear card array)
- Random uses `Math.floor(Math.random() * 13) + 1` for values 1-13
- Reverse simply toggles: `state.direction === Direction.Clockwise ? Direction.CounterClockwise : Direction.Clockwise`
- All effects preserve any unrelated state (they only modify what's relevant to their effect)

## Test Requirements
- [x] Reverse: direction flips from Clockwise to CounterClockwise
- [x] Reverse: direction flips from CounterClockwise to Clockwise
- [x] Reverse: `skipNext` is false, `newLastValue` unchanged
- [x] Skip: direction unchanged, `skipNext` is true, `newLastValue` unchanged
- [x] Bomb: `newLastValue` is null, `clearMiddlePile` is false
- [x] Bomb: direction unchanged, `skipNext` is false
- [x] Nuclear: `newLastValue` is null, `clearMiddlePile` is true
- [x] Nuclear: direction unchanged, `skipNext` is false
- [x] Random: `newLastValue` is between 1 and 13 (inclusive)
- [x] Random: `randomValue` is set and equals `newLastValue`
- [x] Random: multiple calls produce varied results (statistical)
- [x] All effects: `SpecialEffect` enum values are exhaustive (no missing case)

## Edge Cases
- Reverse played multiple times in a row (direction toggles back and forth)
- Bomb played when pile is already null (should be idempotent — stays null)
- Nuclear played when pile is already empty (idempotent)
- Random generates the same value as current lastValue (valid, just happens to be the same)
- Skip when only 2 alive players (skip effectively skips to current player — caller should handle this at turn level)

## Dependencies
- STORY-001 (project scaffolded)
- STORY-002 (type definitions including SpecialEffect enum, Direction enum)
- STORY-003 (utility functions like `randomInt` from `src/utils/math.ts`)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
