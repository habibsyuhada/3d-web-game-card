# Dev Notes
Story ID: STORY-004 — Game Engine: Turn Manager & Player Operations

## Story Context Reviewed
- STORIES-004.md (requirements, test cases, scope, edge cases, dependencies STORY-001/002)
- architecture.md Section 8.3 (Turn Manager) and 8.4 (Player Operations — described in Section 8 scope)
- Existing types: `Player`, `PlayerStatus`, `Direction`, `GameState`, `GameStatus` from `src/types/`
- Pre-existing engine modules reviewed: `deck.ts`, `cards.ts` and their tests

## Files Changed
**Created:**
- `src/engine/turn.ts` — `getNextActivePlayerIndex`, `getAlivePlayerCount`, `advanceTurn`
- `src/engine/player.ts` — `eliminatePlayer`, `canPlayerAct`, `loseLife`
- `src/engine/turn.test.ts` — 10 tests covering turn advancement, alive counting, edge cases
- `src/engine/player.test.ts` — 14 tests covering elimination, life loss, defensive guards

**Modified:**
- `src/engine/index.ts` — added barrel exports for new turn.ts and player.ts functions

## Implementation Summary
Implemented three small pure-function modules for turn management and player state:

1. **`turn.ts`** — Uses the `(next + direction + count) % count` do-while pattern from the architecture to skip dead/spectator players. `advanceTurn` returns an immutable GameState (shallow copy via object spread) so existing players/deck references are preserved. Only `currentPlayerIndex` is updated.

2. **`player.ts`** — `eliminatePlayer` returns a new Player with `lives: 0` and `status: Eliminated`. `loseLife` decrements by 1, sets Eliminated on reaching 0, and returns `{player, eliminated}`. Both honor immutability. Defensive guards:
   - `loseLife` on an already-eliminated/spectator player returns the player unchanged with `eliminated: true` (no crash, no lives going negative via `Math.max(0, …)`).
   - `canPlayerAct` is the simple `=== Alive` guard, preserved for readability.

3. **`index.ts`** — appended turn and player exports alongside deck/cards exports, preserving the public API pattern established in STORY-003.

## Tests Added or Updated
**`src/engine/turn.test.ts` (10 tests):**
- Clockwise sequence 0→1→2→3→0 (4 assertions)
- Counter-clockwise sequence 0→3→2→1→0 (4 assertions)
- Skipping eliminated player 2 in clockwise (1→3)
- Two eliminated players: wraps correctly between remaining 2
- Only 2 alive: alternates regardless of direction
- `getAlivePlayerCount`: all alive → 4
- `getAlivePlayerCount`: 1 eliminated → 3
- `getAlivePlayerCount`: spectator not counted as alive
- `advanceTurn`: returns new object, updated index, preserves other fields
- `advanceTurn` with counter-clockwise / skipping eliminated

**`src/engine/player.test.ts` (14 tests):**
- `eliminatePlayer` sets status + lives correctly, preserves other fields, returns new ref
- `canPlayerAct` true for alive, false for eliminated/spectator
- `loseLife` decrements 5→4, 4→3 (eliminated: false)
- `loseLife` 1→0 returns eliminated: true
- `loseLife` immutability check
- Defensive: `loseLife` on already-eliminated (no crash)
- Defensive: `loseLife` on spectator (no crash)
- `loseLife` preserves id/name/type/hand

Test helper `createTestPlayer(id, overrides?)` used in both files with defaults matching real `Player` interface (`id: number` per `src/types/player.ts`).

Note: Test IDs use numeric `id: number` rather than the string IDs suggested in the story helper, because the actual `Player` interface declares `id: number`. The story's `id: `p${id}` helper was incompatible with the real type.

## Test Commands Run
- `npm test` — Ran full vitest suite.
- `npm run build` — Ran `tsc -b && vite build`.
- `npm run lint` — Ran `eslint .`.

## Test Results
- **Baseline (before this story):** 4 test files, 50 tests passing.
- **After STORY-004:** 6 test files, **74 tests passing**.
- **New tests added:** 24 (exceeds the 12 required — additional immutability/preservation checks added for robustness).
- **Test duration:** ~12s.
- **Build:** succeeded — 31 modules, ~141KB gzip total, no TS errors.
- **Lint:** clean (no errors or warnings).

## Commit Notes
Suggested commit message:
```
feat(engine): add turn manager and player operations (STORY-004)

- turn.ts: getNextActivePlayerIndex, getAlivePlayerCount, advanceTurn
  with do-while wrap pattern skipping eliminated/spectator players
- player.ts: eliminatePlayer, canPlayerAct, loseLife (all immutable)
- 24 new tests covering turn sequences, eliminations, life loss,
  defensive guards, and immutability
- Barrel exports added to engine/index.ts
- 74 tests pass, build + lint clean
```

## Risks / Limitations
- `getNextActivePlayerIndex` will loop infinitely if all players are non-alive. The architecture and story explicitly require the caller to guarantee at least one alive player exists. No additional guard added to match the spec.
- Defensive `loseLife` on an already-eliminated player returns the player unchanged — it signals "already eliminated" via `eliminated: true` rather than throwing. This matches the story's defensive edge case requirement.
- Player IDs in tests are numeric to match the actual `Player.id: number` interface, diverging slightly from the story helper suggestion (which used string IDs).
- `advanceTurn` does a shallow copy; nested references (players, deck) are preserved from the input state. The zustand + immer middleware in later stories handles deep mutations.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
