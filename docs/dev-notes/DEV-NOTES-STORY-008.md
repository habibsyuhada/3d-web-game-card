# Dev Notes
Story ID: STORY-008

## Story Context Reviewed
- docs/stories/STORY-008.md — Game Engine: Full Orchestration (initGame, resetGame)
- docs/prd/prd.md (via story references to FR-010, FR-011, FR-013, FR-014, FR-015, FR-090, FR-091)
- docs/architecture/architecture.md (via story references to Section 8.7 and Appendix B)
- Existing engine modules: deck, cards, turn, player, special-cards, bot-ai, win-condition
- Type definitions: Player, PlayerType, PlayerStatus, Direction, GameStatus, GameState, TOTAL_PLAYERS, INITIAL_LIVES, HAND_SIZE

## Files Changed
1. **src/engine/game.ts** (created) — `initGame()` and `resetGame()` orchestration functions
2. **src/engine/index.ts** (edited) — Added barrel export for `initGame` and `resetGame` from `./game`
3. **src/engine/game.test.ts** (created) — 16 test cases covering all required scenarios

## Implementation Summary

### `initGame(): GameState`
- Creates a fresh 53-card deck via `createDeck()` and shuffles it with `shuffleDeck()`
- Deals 3 cards round-robin to 4 players via `dealCards()` (12 dealt, 41 remaining)
- Constructs 4 players: Player 1 = Human ("You"), Players 2-4 = Bots ("Bot 2", "Bot 3", "Bot 4")
- All players start with `lives: INITIAL_LIVES` (5) and `status: PlayerStatus.Alive`
- Returns a complete `GameState` with `currentPlayerIndex: 0`, `direction: Direction.Clockwise`, empty `middlePile`, `lastValue: null`, `gameStatus: GameStatus.Playing`, and `winner: null`

### `resetGame(): GameState`
- Simply delegates to `initGame()` — produces a completely fresh state with no residual data

### Barrel Export (`src/engine/index.ts`)
- Finalized with all 8 engine modules: deck, cards, turn, player, special-cards, bot-ai, win-condition, game

## Tests Added or Updated
**src/engine/game.test.ts** — 16 test cases across 2 describe blocks:

### `initGame` (14 tests):
1. Returns exactly 4 players
2. Player 1 is Human, players 2-4 are Bot
3. Player names are "You", "Bot 2", "Bot 3", "Bot 4"
4. Player IDs are 1, 2, 3, 4
5. All players start with lives = 5 and status = Alive
6. All players have exactly 3 cards each
7. Deck has exactly 41 cards remaining (53 - 12)
8. middlePile is empty and lastValue is null
9. currentPlayerIndex is 0 (human starts)
10. direction is Direction.Clockwise
11. gameStatus is GameStatus.Playing
12. winner is null
13. All 53 cards accounted for (12 hands + 41 deck, all unique IDs)
14. Every hand card is a valid Card object (has id, type, value/effect fields with correct constraints)
15. Multiple initGame() calls produce different deals (statistical shuffling test)

### `resetGame` (2 tests):
1. Returns state identical in structure to initGame()
2. Produces a new independent state (different card deal)

## Test Commands Run
- `npm test` — vitest run
- `npm run build` — tsc -b && vite build
- `npm run lint` — eslint .

## Test Results
- **Tests:** 132 passed, 0 failed across 10 test files (17.74s)
- **Build:** Succeeded (13.27s)
- **Lint:** Passed (no errors or warnings)

## Commit Notes
Suggested commit message:
```
feat(engine): add game orchestration — initGame and resetGame (STORY-008)

- Create src/engine/game.ts with initGame() and resetGame()
- initGame: builds/shuffles deck, deals 3 cards to 4 players, returns full GameState
- resetGame: delegates to initGame for a clean slate
- Finalize src/engine/index.ts barrel with all 8 engine modules
- Add 16 comprehensive tests in src/engine/game.test.ts
- All 132 tests pass, build succeeds, lint clean
```

## Risks / Limitations
- `resetGame()` is intentionally identical to `initGame()` — per architecture, no residual state should persist; if future requirements need partial resets (e.g., preserving player settings), a separate function would be needed
- Shuffling uses `Math.random()` via `randomInt()` utility — not cryptographically secure, but sufficient for game purposes
- No per-turn orchestration here — that is handled by the Zustand store actions and hooks (out of scope)

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
