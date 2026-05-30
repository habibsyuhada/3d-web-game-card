# Dev Notes

Story ID: STORY-009

## Story Context Reviewed

- STORY-009 specification (all acceptance criteria)
- Architecture document Section 7 (State Management Design)
- Architecture document Section 5 (Folder Structure)
- All 8 engine module signatures (initGame, resetGame, createDeck, shuffleDeck,
  drawCard, dealCards, isCardPlayable, hasPlayableCard, getCardDisplayValue,
  getNextActivePlayerIndex, getAlivePlayerCount, advanceTurn, eliminatePlayer,
  canPlayerAct, loseLife, applySpecialEffect, decideBotPlay, checkWinCondition,
  resolveDeadlock, isDeadlock)
- Type definitions: `Card`, `Player`, `GameState`, `GameStatus`, `Direction`,
  `SpecialEffect`, `CardType`, `PlayerType`, `PlayerStatus`, `AnimationAction`

## Files Changed

### Implementation (5 files)
1. `src/store/ui-slice.ts` — **CREATED** (UISlice interface + createUISlice)
2. `src/store/animation-slice.ts` — **CREATED** (AnimationSlice interface + createAnimationSlice)
3. `src/store/game-slice.ts` — **CREATED** (GameSlice interface + createGameSlice, most complex)
4. `src/store/index.ts` — **REPLACED** (was empty placeholder, now combines three slices with immer middleware and exports `useGameStore` + `GameStore` type)
5. `src/store/selectors.ts` — **CREATED** (7 memoized selector hooks)

### Tests (2 files)
6. `src/store/game-slice.test.ts` — **CREATED** (31 tests covering all game actions)
7. `src/store/selectors.test.ts` — **CREATED** (14 tests covering all selectors)

## Implementation Summary

### Game Slice (`src/store/game-slice.ts`)
The backbone of the game. Contains:

**State:** `players`, `currentPlayerIndex`, `direction`, `deck`, `middlePile`,
`lastValue`, `gameStatus`, `winner` (as `string | null` for serialization).

**Actions:**
- `initGame()`: Calls `Engine.initGame()`, spreads result into state via immer `set()`.
- `resetGame()`: Calls `Engine.resetGame()` and resets ALL slices (game, UI, animation)
  in a single atomic `set()` call — title screen re-shown, game over cleared, animations cleared.
- `playCard(playerIndex, cardId)`: Most complex action.
  1. Defensive checks: player exists, is alive, card in hand, card is playable.
  2. Pre-computes all derived values outside `set()` (avoids using immer proxies in engine functions).
  3. For number cards: removes from hand, pushes to middlePile, sets `lastValue = card.value`.
  4. For special cards: calls `Engine.applySpecialEffect()` and applies the `SpecialEffectResult`:
     - **Reverse**: flips `direction`, keeps `lastValue`.
     - **Skip**: pre-computes skip target via `getNextActivePlayerIndex`, sets `currentPlayerIndex`.
     - **Bomb**: sets `lastValue = null`.
     - **Nuclear**: sets `lastValue = null` AND clears `middlePile = []` (card not added).
     - **Random**: sets `lastValue` to random 1–13.
- `passTurn(playerIndex)`: Calls `Engine.loseLife()`, updates player lives/status in state.
- `drawCard(playerIndex)`: Calls `Engine.drawCard()`, pushes to hand if deck not empty (FR-023 defense).
- `advanceTurn()`: Calls `Engine.getNextActivePlayerIndex`, updates `currentPlayerIndex`.
- `applySpecialEffect(effect)`: Standalone special effect application.
- `eliminatePlayer(playerIndex)`: Sets lives=0, status=Eliminated.
- `checkAndSetWinner()`: Calls `Engine.checkWinCondition`, sets `winner` name + `gameStatus=Finished`.
- `resolveDeadlock()`: Calls `Engine.isDeadlock` + `Engine.resolveDeadlock`.

**Key design decisions:**
- `winner` is stored as `string | null` (player name) rather than `Player | null` per story spec,
  improving serializability. Engine functions that expect `GameState.winner: Player | null` receive
  `null` via the `toGameState()` helper (engine never reads the `winner` field).
- Skip handling is inside `playCard` (pre-advances `currentPlayerIndex`), letting the hook layer
  call `advanceTurn()` normally after — the net effect is a skip of one player.
- Nuclear played card is NOT added to middlePile (pile is cleared including the Nuclear card itself).

### UI Slice (`src/store/ui-slice.ts`)
Manages fullscreen flag, title screen toggle, turn messages, game-over overlay,
and a message queue with auto-promotion (first in queue becomes the active message when empty).

### Animation Slice (`src/store/animation-slice.ts`)
Manages `isAnimating` flag, `animationQueue` (ordered `AnimationAction[]` descriptors),
`activeVFX` (current `SpecialEffect | null`), and `vfxPosition` (3D world-space position).

### Store Index (`src/store/index.ts`)
Combines slices using `create<GameStore>()(immer((...a) => ({...game, ...ui, ...animation})))`.
Exports `useGameStore` hook and `GameStore` type. Re-exports slice types.

### Selectors (`src/store/selectors.ts`)
7 hook-based selectors using Zustand's `useGameStore(selector)` pattern for granular subscriptions:
- `useCurrentPlayer()` — `players[currentPlayerIndex]`
- `useHumanPlayer()` — find by `PlayerType.Human`, returns `null` if absent
- `useIsHumanTurn()` — boolean, current player is human (null-safe)
- `usePlayableCards(playerIndex)` — hand filtered by `isCardPlayable(card, lastValue)`
- `useAlivePlayers()` — players with status `Alive`
- `useDeckCount()` — `deck.length`
- `useMiddlePileTopCard()` — last card in `middlePile`, or `null`

## Tests Added or Updated

### `src/store/game-slice.test.ts` — 31 tests
| Area | Tests |
|------|-------|
| `initGame()` | population, player types |
| `playCard()` | number card, bot, invalid card, unplayable card, Reverse, Skip, Bomb, Nuclear, Random, playCard+drawCard roundtrip, eliminated player defense |
| `passTurn()` | life decrease, elimination, other players unaffected |
| `drawCard()` | normal draw, empty deck defense |
| `advanceTurn()` | clockwise, wrap-around, skip eliminated, counter-clockwise |
| `checkAndSetWinner()` | single alive → winner, multiple alive → no winner |
| `resolveDeadlock()` | all stuck → winner by lives, not stuck → no-op |
| `eliminatePlayer()` | lives=0, status=Eliminated |
| `applySpecialEffect()` | Reverse, Bomb, Nuclear |
| `resetGame()` | game + UI + animation slices all reset |

### `src/store/selectors.test.ts` — 14 tests
| Selector | Tests |
|----------|-------|
| `useCurrentPlayer` | returns correct player, updates on index change |
| `useHumanPlayer` | finds human, returns null when absent |
| `useIsHumanTurn` | true for human, false for bot |
| `usePlayableCards` | filters correctly, null lastValue → all playable, invalid index → empty |
| `useAlivePlayers` | filters eliminated |
| `useDeckCount` | correct count, updates on change |
| `useMiddlePileTopCard` | returns last card, null when empty |

## Test Commands Run

```powershell
npx vitest run                  # Full suite: 177 passed (45 store + 132 existing engine)
npx tsc -b                      # TypeScript build: clean
npx eslint src/store/           # Lint store files: clean
npx vite build                  # Production build: successful
```

## Test Results

- **Test files:** 12 passed, 12 total (0 failed)
- **Tests:** 177 passed, 177 total (0 failed)
- **No regressions** in existing engine tests.

## Commit Notes

**Suggested commit message:**
```
feat(store): implement Zustand store with game, UI, animation slices + selectors (STORY-009)

Implements the full Zustand store as the single source of truth for game state.

Slices:
- game-slice: initGame, resetGame, playCard, passTurn, drawCard, advanceTurn,
  applySpecialEffect, eliminatePlayer, checkAndSetWinner, resolveDeadlock
- ui-slice: fullscreen, title screen, turn messages, game over, message queue
- animation-slice: animation queue, active VFX, VFX position

Selectors:
- useCurrentPlayer, useHumanPlayer, useIsHumanTurn, usePlayableCards,
  useAlivePlayers, useDeckCount, useMiddlePileTopCard

Key design choices:
- winner stored as player name string (serializable) rather than Player object
- Skip handled inside playCard via pre-advance of currentPlayerIndex
- Nuclear clears middlePile including the played card itself
- resetGame() atomically resets all three slices in a single set() call

Tests: 45 new tests (31 game-slice + 14 selectors), all passing.
Full suite: 177/177 passing, no regressions.
```

## Risks / Limitations

- **`winner` type divergence:** Story spec says `string | null`, architecture says `Player | null`.
  Implemented as `string | null` per the story spec (better serializability).
  The `toGameState()` helper bridges this with engine functions.
- **Skip handled inside `playCard`:** The story spec's "Handle Skip flag" directive was interpreted
  as pre-advancing `currentPlayerIndex` inside playCard. Hook layer still calls `advanceTurn()`
  normally, yielding a net skip of one player. If future stories prefer hook-driven skip handling,
  this can be migrated.
- **`applySpecialEffect` standalone action:** Exposed as a separate store action per spec,
  in addition to being called inside `playCard`. This might create redundancy if hooks always
  call `playCard` directly; kept for flexibility as the architecture prescribes.
- **No `devtools` middleware:** Not added per spec ("no devtools in production"). Can be
  conditionally added in dev if needed via `process.env.NODE_ENV` check.

## Ready for Scrum Master Review?

Status: READY_FOR_SM_REVIEW

All acceptance criteria met:
- [x] Store combines 3 slices with immer middleware
- [x] initGame() populates correct initial state
- [x] playCard() handles all card types including all 5 special effects
- [x] passTurn() handles life loss and elimination
- [x] drawCard() handles empty deck gracefully
- [x] advanceTurn() navigates correctly across eliminations and directions
- [x] checkAndSetWinner() and resolveDeadlock() detect end conditions
- [x] resetGame() resets all 3 slices atomically
- [x] 7 memoized selectors implemented
- [x] 45 new tests, all passing. Full suite 177/177.
- [x] TypeScript build clean
- [x] ESLint clean
- [x] Vite production build succeeds
