# STORY-002 — Data Model & Type Definitions

**Status:** CLOSED ✅

---

## Requirement IDs
- FR-001 through FR-092 (all requirements reference data types)
- NFR-009 (TypeScript for type safety)
- NFR-011 (serializable state shape)
- FR-010 through FR-022 (player, card, deck data structures)
- FR-050 through FR-053 (player status states)

## Acceptance Criteria IDs
- AC-003 (player state structure: 4 players, 3 cards, 5 lives)
- AC-004 (card playability based on pile value)
- AC-020 (deck depletion tracking)

## Business Context
All game logic, state management, and rendering depend on a shared, well-typed data model. This story defines the canonical types that every other module imports.

## Technical Context
Per architecture Section 6 (Data Model), the project uses TypeScript enums and interfaces to model cards, players, game state, and turn results. All types live in `src/types/` and are re-exported from `src/types/index.ts`.

## Scope
1. Create `src/types/card.ts`:
   - `CardType` enum (`Number`, `Special`)
   - `SpecialEffect` enum (`Reverse`, `Skip`, `Bomb`, `Nuclear`, `Random`)
   - `Card` interface (id, type, value, effect)
   - `NumberCard` interface (extends Card, constrains type and value)
   - `SpecialCard` interface (extends Card, constrains type and effect)
2. Create `src/types/player.ts`:
   - `PlayerType` enum (`Human`, `Bot`)
   - `PlayerStatus` enum (`Alive`, `Eliminated`, `Spectator`)
   - `Player` interface (id, name, type, hand, lives, status)
3. Create `src/types/game.ts`:
   - `GameStatus` enum (`Waiting`, `Playing`, `Finished`)
   - `Direction` enum (`Clockwise = 1`, `CounterClockwise = -1`)
   - `GameState` interface (all fields per PRD Section 11)
   - `BotDecision` interface (action, cardId?, reason)
   - `TurnResult` interface (playerId, action, card, livesLost, eliminated, specialEffectApplied, randomValue?)
   - `AnimationAction` interface (type, payload, duration)
4. Create `src/types/constants.ts`:
   - `TOTAL_PLAYERS = 4`
   - `INITIAL_LIVES = 5`
   - `HAND_SIZE = 3`
   - `NUMBER_CARD_MIN = 1`
   - `NUMBER_CARD_MAX = 13`
   - `NUMBER_COPIES_PER_VALUE = 3`
   - `SPECIAL_CARD_QUANTITIES` record (Reverse: 3, Skip: 3, Bomb: 3, Nuclear: 2, Random: 3)
   - `BOT_TURN_DELAY_MS = 1500`
   - `CARD_ANIMATION_DURATION_MS = 400`
   - `VFX_DURATION_MS = 800`
   - `SPECIAL_DISPLAY_NAMES` record mapping SpecialEffect to human-readable strings
5. Create `src/types/index.ts`:
   - Barrel re-export of all types, enums, interfaces, and constants

## Out of Scope
- Any runtime logic or functions (that's engine stories)
- Any component or rendering code
- Zustand store types (those are in the store story)

## Files Likely Affected
- `src/types/card.ts` (create)
- `src/types/player.ts` (create)
- `src/types/game.ts` (create)
- `src/types/constants.ts` (create)
- `src/types/index.ts` (create)

## Implementation Notes
- Use string enum values for readability in debugging (e.g., `CardType.Number = 'number'`)
- Enum values must match exactly what's specified in the architecture document Section 6
- `Direction` enum uses numeric values (1, -1) to enable arithmetic for turn calculation
- `AnimationAction` type field is a union: `'card-play' | 'card-draw' | 'life-loss' | 'elimination' | 'vfx'`
- The `GameState` interface should NOT include UI state (isFullscreen, showTitleScreen); those belong to the store type
- All types must be purely serializable (no functions, no class instances, no Date objects)

## Test Requirements
- [x] All types compile without errors (`npx tsc --noEmit`)
- [x] Constants sum correctly: 13 values * 3 copies = 39 number cards; 3+3+3+2+3 = 14 special cards; total 53
- [x] Import from `src/types/index.ts` resolves all exports

## Edge Cases
- `Number | null` type for `lastValue` and `Card.value` requires careful handling in downstream code
- `Direction` as numeric enum enables `(currentIndex + direction + count) % count` pattern
- `BotDecision.cardId` is optional (undefined when action is 'pass')

## Dependencies
- STORY-001 (project must be scaffolded)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed
- [x] QA review passed
- [x] Story closed
