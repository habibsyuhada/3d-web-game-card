# STORY-008 — Game Engine: Full Orchestration (initGame, resetGame, orchestrateTurn)

**Status:** CLOSED

---

## Requirement IDs
- FR-010 (initialize 4 players: 1 human, 3 bots)
- FR-011 (each starts with 5 lives and 3 cards dealt)
- FR-013 (deck shuffled randomly at game start)
- FR-014 (Player 1 / human always takes first turn)
- FR-015 (turn direction defaults to clockwise)
- FR-090 (New Game / Play Again resets all state)
- FR-091 (handle edge cases)

## Acceptance Criteria IDs
- AC-003 (4 players at table, 3 cards each, 5 lives each)
- AC-016 (Play Again resets all state and starts new round)

## Business Context
This story creates the highest-level game orchestration functions that tie together deck creation, dealing, player initialization, and game reset. These functions produce the initial state consumed by the Zustand store.

## Technical Context
Per architecture Section 8.7 and Appendix B, `initGame()` creates a complete initial `GameState`. `resetGame()` produces a clean slate. The actual per-turn orchestration is handled by the store actions + hooks, but the engine provides the foundational setup.

## Scope
1. Create `src/engine/game.ts`:
   - `initGame(): GameState`
     - Calls `createDeck()` then `shuffleDeck()`
     - Calls `dealCards(shuffledDeck, TOTAL_PLAYERS, HAND_SIZE)`
     - Creates 4 players:
       - Player 1: `{ id: 1, name: 'You', type: PlayerType.Human, hand: hands[0], lives: INITIAL_LIVES, status: PlayerStatus.Alive }`
       - Player 2: `{ id: 2, name: 'Bot 2', type: PlayerType.Bot, hand: hands[1], lives: INITIAL_LIVES, status: PlayerStatus.Alive }`
       - Player 3: `{ id: 3, name: 'Bot 3', type: PlayerType.Bot, hand: hands[2], lives: INITIAL_LIVES, status: PlayerStatus.Alive }`
       - Player 4: `{ id: 4, name: 'Bot 4', type: PlayerType.Bot, hand: hands[3], lives: INITIAL_LIVES, status: PlayerStatus.Alive }`
     - Returns full `GameState`:
       ```typescript
       {
         players,
         currentPlayerIndex: 0,
         direction: Direction.Clockwise,
         deck: remainingDeck,
         middlePile: [],
         lastValue: null,
         gameStatus: GameStatus.Playing,
         winner: null,
       }
       ```
   - `resetGame(): GameState`
     - Simply calls `initGame()` and returns fresh state (same result as initGame — clean slate)

2. Finalize `src/engine/index.ts` — barrel export of all engine modules:
   - deck, cards, turn, special-cards, bot-ai, player, win-condition, game

## Out of Scope
- Per-turn resolution orchestration (handled by store actions + hooks)
- Animation queue population (handled in store)
- Any React or 3D code

## Files Likely Affected
- `src/engine/game.ts` (create)
- `src/engine/index.ts` (finalize — all exports)
- `src/engine/game.test.ts` (create)

## Implementation Notes
- `initGame()` is the single entry point for creating a fresh game state
- All randomness (shuffle, card dealing) is contained within this function
- The function is deterministic given the same random seed (for testing, can mock `Math.random`)
- `resetGame()` is intentionally identical to `initGame()` — no residual state should persist
- Player names are hardcoded: "You", "Bot 2", "Bot 3", "Bot 4" per architecture open question #6

## Test Requirements
- [x] `initGame()` returns 4 players
- [x] Player 1 is type Human, players 2-4 are type Bot
- [x] All players start with `lives: 5` and `status: Alive`
- [x] All players have exactly 3 cards in hand
- [x] `deck` has exactly 41 cards remaining (53 total - 12 dealt)
- [x] `middlePile` is empty, `lastValue` is null
- [x] `currentPlayerIndex` is 0 (human starts)
- [x] `direction` is `Direction.Clockwise`
- [x] `gameStatus` is `GameStatus.Playing`
- [x] `winner` is null
- [x] All 53 cards are accounted for (12 in hands + 41 in deck, all unique IDs)
- [x] `resetGame()` returns state identical in structure to `initGame()`
- [x] Multiple `initGame()` calls produce different deals (shuffled differently)

## Edge Cases
- Extremely unlikely but possible: a player is dealt all special cards
- Verify that all player hands contain valid Card objects with correct types
- Deck remaining after dealing should not contain duplicates

## Dependencies
- STORY-001 (project scaffolded)
- STORY-002 (type definitions)
- STORY-003 (deck creation, shuffle, dealing)
- STORY-004 (player operations — not directly needed but aligned)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed
- [x] QA review passed
- [x] Story closed
