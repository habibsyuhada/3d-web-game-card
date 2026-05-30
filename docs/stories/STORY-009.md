# STORY-009 — Zustand Store Implementation (Game Slice, UI Slice, Animation Slice, Selectors)

**Status:** Ready

---

## Requirement IDs
- FR-010 through FR-054 (all game state mutations flow through the store)
- FR-090 (Play Again resets state)
- NFR-011 (Zustand, clear serializable state shape)
- NFR-012 (game logic separated from rendering)
- IR-004 (Zustand for state management)

## Acceptance Criteria IDs
- AC-003 (initial game state with 4 players, 3 cards, 5 lives)
- AC-006 (card play updates middle pile and draws replacement)
- AC-007 (life loss and turn pass when no valid cards)
- AC-015 (victory/defeat state when 1 player remains)
- AC-016 (Play Again resets all state)

## Business Context
The Zustand store is the single source of truth for all game state, UI state, and animation state. It connects the pure game engine to React rendering. Every user interaction and bot action dispatches store actions, which in turn drive re-renders.

## Technical Context
Per architecture Section 7, the store is a single `useGameStore` hook composed of three slices merged together using immer middleware. Selectors provide memoized access to derived state.

## Scope
1. Create `src/store/game-slice.ts`:
   - State: `players`, `currentPlayerIndex`, `direction`, `deck`, `middlePile`, `lastValue`, `gameStatus`, `winner`
   - Actions:
     - `initGame()` — Calls engine `initGame()`, sets all game slice state from result
     - `resetGame()` — Calls engine `resetGame()`, resets all game + UI + animation state
     - `playCard(playerIndex: number, cardId: string): TurnResult` — Finds card in hand, removes from hand, adds to middlePile, applies special effect if applicable, updates lastValue/direction, returns TurnResult
     - `passTurn(playerIndex: number): TurnResult` — Decrements player life, checks elimination, returns TurnResult
     - `drawCard(playerIndex: number): Card | null` — Draws from deck, adds to player hand
     - `advanceTurn()` — Calls engine `getNextActivePlayerIndex`, updates `currentPlayerIndex`
     - `applySpecialEffect(effect: SpecialEffect)` — Calls engine `applySpecialEffect`, updates state from result
     - `eliminatePlayer(playerIndex: number)` — Marks player as Eliminated
     - `checkAndSetWinner()` — Calls engine `checkWinCondition`, sets winner and gameStatus if found
     - `resolveDeadlock()` — Calls engine `isDeadlock` and `resolveDeadlock`, sets winner if deadlock

2. Create `src/store/ui-slice.ts`:
   - State: `isFullscreen`, `showTitleScreen`, `turnMessage`, `showGameOver`, `showMessage`, `messageQueue`
   - Actions:
     - `setFullscreen(value: boolean)`
     - `setShowTitleScreen(value: boolean)`
     - `setTurnMessage(msg: string)`
     - `setShowGameOver(value: boolean)`
     - `pushMessage(msg: string)` — Adds to message queue
     - `clearMessages()` — Clears queue and active message

3. Create `src/store/animation-slice.ts`:
   - State: `isAnimating`, `animationQueue`, `activeVFX`, `vfxPosition`
   - Actions:
     - `enqueueAnimation(action: AnimationAction)`
     - `clearAnimationQueue()`
     - `setAnimating(value: boolean)`
     - `setActiveVFX(effect: SpecialEffect | null, position?: [number, number, number])`

4. Create `src/store/index.ts`:
   - Combines all three slices with `create()` and `immer` middleware
   - Exports `useGameStore` hook
   - Exports `GameStore` type

5. Create `src/store/selectors.ts`:
   - `useCurrentPlayer()` — `store.players[store.currentPlayerIndex]`
   - `useHumanPlayer()` — Find player with `type === PlayerType.Human`
   - `useIsHumanTurn()` — Boolean: current player is human
   - `usePlayableCards(playerIndex: number)` — Filter hand by `isCardPlayable`
   - `useAlivePlayers()` — Players with status Alive
   - `useDeckCount()` — `store.deck.length`
   - `useMiddlePileTopCard()` — Last card in middlePile

## Out of Scope
- Hook implementations that use the store (separate stories)
- Any React components
- 3D rendering integration

## Files Likely Affected
- `src/store/game-slice.ts` (create)
- `src/store/ui-slice.ts` (create)
- `src/store/animation-slice.ts` (create)
- `src/store/index.ts` (create)
- `src/store/selectors.ts` (create)
- `src/store/game-slice.test.ts` (create)
- `src/store/selectors.test.ts` (create)

## Implementation Notes
- Use `immer` middleware: `create<GameStore>()(immer((set, get) => ({...})))` 
- Each slice is created as a function `(set, get) => ({ state, actions })` and spread into the merged store
- `playCard()` is the most complex action: it must modify player hand, middlePile, lastValue, and potentially direction
- Use `set()` with immer draft syntax: `set((state) => { state.players[0].hand = ... })`
- `resetGame()` must reset ALL slices, not just game slice — clears animations, clears messages, shows title screen
- Selectors use Zustand's `useGameStore(selector)` pattern for granular subscription
- The `playCard` action should call engine functions but perform mutations via immer `set()`

## Test Requirements
- [x] `initGame()` populates store with correct initial state
- [x] `playCard()` for human: removes card from hand, adds to middlePile, updates lastValue
- [x] `playCard()` for bot: same as above
- [x] `playCard()` with special card: updates direction/value/pile per effect
- [x] `playCard()` then `drawCard()`: player hand returns to 3 cards (if deck has cards)
- [x] `passTurn()`: player life decreases by 1
- [x] `passTurn()` with 1 life: player is eliminated
- [x] `advanceTurn()`: currentPlayerIndex moves to next alive player
- [x] `checkAndSetWinner()`: sets winner and gameStatus when 1 alive
- [x] `resolveDeadlock()`: correctly identifies deadlock and sets winner
- [x] `resetGame()`: all state returns to initial values
- [x] Selectors: each returns correct derived value

## Edge Cases
- `playCard()` with invalid cardId (card not in hand) — should throw or be ignored defensively
- `drawCard()` when deck is empty — returns null, player hand stays < 3
- `advanceTurn()` when only 1 player alive (should not be called — game should be over)
- `setActiveVFX` with null clears the VFX state
- Store reset during animation queue processing

## Dependencies
- STORY-001 (project scaffolded with Zustand installed)
- STORY-002 (type definitions)
- STORY-003 through STORY-008 (all engine modules)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
