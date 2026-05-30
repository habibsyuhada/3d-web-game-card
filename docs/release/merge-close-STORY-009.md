# Merge and Close Notes

**Story ID:** STORY-009  
**Title:** Zustand Store Implementation (Game Slice, UI Slice, Animation Slice, Selectors)  
**Wave:** Wave 2 — Engine Completion & State Management (FINAL STORY)  
**Status:** CLOSED  
**Close Date:** 2026-05-31  
**Story Points:** 8  

---

## Story Summary

STORY-009 is the largest and most critical story of Wave 2, implementing the Zustand store as the single source of truth for all game state, UI state, and animation state. The store connects the pure game engine layer (STORY-001 through STORY-008) to React rendering, completing the data pipeline that will drive all gameplay, UI overlays, and animations in downstream waves.

The implementation delivers 3 composable Zustand slices (game, UI, animation) combined with immer middleware, 20 store actions across all slices, 7 memoized selector hooks, and 45 new tests (31 game-slice + 14 selectors) atop the existing 132 engine tests. The full suite reaches 177/177 passing across 12 files. All 5 acceptance criteria are met. Build, lint, and type-check all pass cleanly.

This story closes Wave 2 and unlocks Wave 3: 3D Scene Foundation.

---

## Gate Summary

| Gate | Reviewer | Score | Status | Document |
|------|----------|-------|--------|----------|
| Dev Complete | Developer | — | READY_FOR_SM_REVIEW | `docs/dev-notes/DEV-NOTES-STORY-009.md` |
| SM Completion Review | Scrum Master | **99/100** | FORWARD_TO_QA | `docs/queue/completion-review-STORY-009.md` |
| QA Review | QA Engineer | **99.6/100** | PASS (0 defects) | `docs/qa/QA-REVIEW-STORY-009.md` |

**All gates passed. Story approved for merge and close.**

---

## Files Delivered

| # | File | Action | Lines | Description |
|---|------|--------|-------|-------------|
| 1 | `src/store/game-slice.ts` | **Created** | 331 | GameSlice interface + createGameSlice (10 actions, most complex file in project) |
| 2 | `src/store/ui-slice.ts` | **Created** | 98 | UISlice interface + createUISlice (6 state fields, 6 actions) |
| 3 | `src/store/animation-slice.ts` | **Created** | 83 | AnimationSlice interface + createAnimationSlice (4 state fields, 4 actions) |
| 4 | `src/store/index.ts` | **Replaced** | 44 | Combines 3 slices with immer middleware, exports `useGameStore` + `GameStore` type |
| 5 | `src/store/selectors.ts` | **Created** | 76 | 7 memoized selector hooks with null-safe guards |
| 6 | `src/store/game-slice.test.ts` | **Created** | — | 31 tests covering all game actions, special card effects, edge cases |
| 7 | `src/store/selectors.test.ts` | **Created** | — | 14 tests covering all selectors, reactivity, null-safety |

**Total: 7 files (5 implementation + 2 test files)**

---

## Store Architecture Documentation

### Game Slice (`src/store/game-slice.ts`)

**State (8 fields):**

| Field | Type | Description |
|-------|------|-------------|
| `players` | `Player[]` | 4 players (1 Human + 3 Bot) with hands, lives, status |
| `currentPlayerIndex` | `number` | Index of the active player |
| `direction` | `Direction` | Clockwise (1) or CounterClockwise (-1) |
| `deck` | `Card[]` | Remaining draw pile |
| `middlePile` | `Card[]` | Played cards pile |
| `lastValue` | `number \| null` | Current target value to match or beat |
| `gameStatus` | `GameStatus` | Playing or Finished |
| `winner` | `string \| null` | Winner's name (serializable) or null |

**Actions (10 actions):**

| # | Action | Description |
|---|--------|-------------|
| 1 | `initGame()` | Calls `Engine.initGame()`, populates all game state via immer `set()` |
| 2 | `resetGame()` | Calls `Engine.resetGame()`, atomically resets ALL 3 slices in single `set()` call |
| 3 | `playCard(playerIndex, cardId)` | Most complex — removes card from hand, adds to pile, handles all 5 special effects (Reverse, Skip, Bomb, Nuclear, Random) |
| 4 | `passTurn(playerIndex)` | Calls `Engine.loseLife()`, handles elimination at lives=0 |
| 5 | `drawCard(playerIndex)` | Calls `Engine.drawCard()`, pushes to hand with empty-deck defense (FR-023) |
| 6 | `advanceTurn()` | Calls `Engine.getNextActivePlayerIndex`, updates currentPlayerIndex |
| 7 | `applySpecialEffect(effect)` | Standalone special effect application |
| 8 | `eliminatePlayer(playerIndex)` | Sets lives=0, status=Eliminated |
| 9 | `checkAndSetWinner()` | Calls `Engine.checkWinCondition`, sets winner name + gameStatus=Finished |
| 10 | `resolveDeadlock()` | Calls `Engine.isDeadlock` + `Engine.resolveDeadlock`, sets winner if deadlocked |

### UI Slice (`src/store/ui-slice.ts`)

**State (6 fields):** `isFullscreen`, `showTitleScreen`, `turnMessage`, `showGameOver`, `showMessage`, `messageQueue`

**Actions (6 actions):** `setFullscreen`, `setShowTitleScreen`, `setTurnMessage`, `setShowGameOver`, `pushMessage` (with auto-promotion), `clearMessages`

### Animation Slice (`src/store/animation-slice.ts`)

**State (4 fields):** `isAnimating`, `animationQueue`, `activeVFX`, `vfxPosition`

**Actions (4 actions):** `enqueueAnimation`, `clearAnimationQueue`, `setAnimating`, `setActiveVFX` (with position)

### Store Composition (`src/store/index.ts`)

- Combines all 3 slices with `create<GameStore>()(immer((...a) => ({...game, ...ui, ...animation})))`
- Exports `useGameStore` hook (single source of truth)
- Exports `GameStore` type (intersection of all slice types)
- No persist middleware (ephemeral state)
- No devtools middleware (per spec)

---

## Selectors Documentation (`src/store/selectors.ts`)

| # | Selector | Return Type | Description | Null-Safe |
|---|----------|-------------|-------------|-----------|
| 1 | `useCurrentPlayer()` | `Player` | `players[currentPlayerIndex]` | — |
| 2 | `useHumanPlayer()` | `Player \| null` | Find player by `PlayerType.Human` | Uses `?? null` |
| 3 | `useIsHumanTurn()` | `boolean` | Current player is human | Guards undefined player |
| 4 | `usePlayableCards(idx)` | `Card[]` | Hand filtered by `isCardPlayable` | Guards invalid index |
| 5 | `useAlivePlayers()` | `Player[]` | Players with status Alive | — |
| 6 | `useDeckCount()` | `number` | `deck.length` | — |
| 7 | `useMiddlePileTopCard()` | `Card \| null` | Last card in middlePile | Checks `pile.length > 0` |

---

## Test Coverage

### New Tests Added

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `src/store/game-slice.test.ts` | 31 | All 10 game actions, 5 special card effects, 11 edge cases, defensive guards |
| `src/store/selectors.test.ts` | 14 | All 7 selectors, reactivity, null-safety, re-renders |
| **Total New** | **45** | |

### Full Project Suite

```
Test Files  12 passed (12)
     Tests  177 passed (177)
  Duration  ~24s
```

| Metric | Value |
|--------|-------|
| Test files | 12 |
| Total tests | 177 |
| New tests (this story) | 45 |
| Prior tests (engine) | 132 |
| Failed tests | 0 |
| Regressions | 0 |

**All 177 tests passing. Zero failures. Zero regressions.**

---

## Acceptance Criteria

| AC ID | Criterion | Status | Evidence |
|-------|-----------|--------|----------|
| AC-003 | Initial state: 4 players, 3 cards each, 5 lives | **PASS** | `initGame` test: players.length=4, hand.length=3, lives=INITIAL_LIVES(5) |
| AC-006 | Card play updates pile + draws replacement | **PASS** | `playCard` test: hand 3→2, pile 0→1, lastValue updated. `playCard+drawCard`: hand returns to 3 |
| AC-007 | Life loss when no valid cards | **PASS** | `passTurn` test: lives decremented, with 1 life: status=Eliminated |
| AC-015 | Victory/defeat state when 1 player remains | **PASS** | `checkAndSetWinner`: winner name set, gameStatus=Finished. `resolveDeadlock`: deadlock resolved |
| AC-016 | Play Again resets all state | **PASS** | `resetGame` test: all 3 slices atomically reset to initial values |

**AC Score: 5/5 (All Pass)**

---

## Story Points

**8 points** — High complexity (largest story of the project so far)

Covers 3 slice implementations, store composition with immer middleware, 7 memoized selectors, 45 tests, and integration with 8 engine modules. The Zustand store is the architectural backbone connecting the pure engine to React rendering.

---

## Wave 2 Summary

STORY-009 is the **final story of Wave 2: Engine Completion & State Management**.

| Metric | Value |
|--------|-------|
| Stories Delivered | 5 / 5 (STORY-005 through STORY-009) |
| Points Earned | 21 / 21 (100%) |
| Total Tests (end of wave) | 177 |
| Engine Pure Functions | ~25 across 8 modules |
| Store Actions | 20 across 3 slices |
| Selectors | 7 memoized hooks |
| QA Defects (Wave 2 total) | 0 |
| Build Failures | 0 |

For the complete Wave 2 closing report, see: `docs/release/wave-2-summary.md`

---

## Next Stories Unlocked — Wave 3: 3D Scene Foundation

| Story ID | Title | Points | Complexity | Dependencies |
|----------|-------|--------|------------|--------------|
| **STORY-010** | Title Screen & Fullscreen Entry | 5 | Medium | STORY-001, 008, 009 |
| **STORY-011** | 3D Scene Foundation (Canvas, Camera, Lighting, Table) | 5 | Medium-High | STORY-001, 009, 010 |
| **STORY-012** | 3D Card Model, Player Hand Rendering & Card Interaction | 8 | High | STORY-002, 003, 009, 011 |

All 3 Wave 3 stories are now unblocked. STORY-010 is the recommended next story, providing the title screen entry point that App.tsx structures around.

---

## Recommended Commit Message

```
feat(store): implement Zustand store with Game/UI/Animation slices (STORY-009)

- Create 3 composable Zustand slices (game, ui, animation) combined with immer middleware
- Implement 10 game actions: initGame, resetGame, playCard (handles all 5 special types),
  passTurn, drawCard, advanceTurn, applySpecialEffect, eliminatePlayer,
  checkAndSetWinner, resolveDeadlock
- Implement 6 UI actions: fullscreen, title screen, turn message, game over, message queue
- Implement 4 animation actions: queue, clear, animate flag, active VFX with position
- Add 7 memoized selectors: currentPlayer, humanPlayer, isHumanTurn,
  playableCards, alivePlayers, deckCount, middlePileTopCard
- Add 45 store tests using @testing-library/react hooks
- All state fully serializable (18 fields, no class instances)
- Project now has 177 passing tests across 12 files
- Closes Wave 2 (Engine Completion & State)

Closes STORY-009
Closes Wave 2
```

---

## Git Instructions

```powershell
# Stage implementation and test files
git add src/store/game-slice.ts src/store/ui-slice.ts src/store/animation-slice.ts
git add src/store/index.ts src/store/selectors.ts
git add src/store/game-slice.test.ts src/store/selectors.test.ts

# Commit with the recommended message
git commit -m "feat(store): implement Zustand store with Game/UI/Animation slices (STORY-009)

- Create 3 composable Zustand slices (game, ui, animation) combined with immer middleware
- Implement 10 game actions: initGame, resetGame, playCard (handles all 5 special types),
  passTurn, drawCard, advanceTurn, applySpecialEffect, eliminatePlayer,
  checkAndSetWinner, resolveDeadlock
- Implement 6 UI actions: fullscreen, title screen, turn message, game over, message queue
- Implement 4 animation actions: queue, clear, animate flag, active VFX with position
- Add 7 memoized selectors: currentPlayer, humanPlayer, isHumanTurn,
  playableCards, alivePlayers, deckCount, middlePileTopCard
- Add 45 store tests using @testing-library/react hooks
- All state fully serializable (18 fields, no class instances)
- Project now has 177 passing tests across 12 files
- Closes Wave 2 (Engine Completion & State)

Closes STORY-009
Closes Wave 2"

# Push to remote
git push origin HEAD
```

---

## Sign-Off

**Status: CLOSED**

STORY-009 has passed all quality gates — Development (READY), Scrum Master Review (99/100, APPROVED), and QA Review (99.6/100, PASS, 0 defects). All scope items are implemented exactly as specified, all 5 acceptance criteria are satisfied, 45 new tests pass with zero regressions across 177 total tests, and the production build is clean. The Zustand store is production-ready and serves as the single source of truth connecting the engine layer to React rendering.

**Closing STORY-009. Closing Wave 2: Engine Completion & State Management.**

---

*Signed off by: Scrum Master — 2026-05-31*
