# STORY-015 — Bot Turn Hook & Game Loop Orchestration

**Status:** Closed

---

## Requirement IDs
- FR-030 (check if current player is alive at start of turn)
- FR-031 (check if current player has valid playable card)
- FR-060 (bots play automatically)
- FR-065 (bot plays have visible 1-2 second delay)
- FR-037 (turn advances to next active player)
- FR-050 through FR-054 (elimination, win condition)
- FR-091 (edge cases: empty deck, special card chains)
- FR-092 (deadlock resolution)

## Acceptance Criteria IDs
- AC-007 (no valid cards → lose 1 life, turn passes)
- AC-013 (lives reach 0 → eliminated)
- AC-014 (spectator mode after elimination)
- AC-015 (victory when 1 player remains)
- AC-017 (bot plays with 1-2 second delay)
- AC-018 (bot plays smallest valid number card)
- AC-019 (bot plays special when no valid numbers)
- AC-023 (deadlock resolves correctly)

## Business Context
The game loop orchestrates the entire turn flow. Bots must play automatically with a visible delay. The game must handle all turn transitions, check for eliminations, and detect win conditions after every action. This is the "brain" that connects the game engine to the React rendering cycle.

## Technical Context
Per architecture Section 8.7 and Appendix B, two hooks manage the game loop: `useBotTurn` handles bot decision timing, and `useGameLoop` orchestrates the turn flow (alive checks, win/deadlock detection, turn advancement).

## Scope
1. Create `src/hooks/useBotTurn.ts`:
   - Subscribes to `currentPlayerIndex` and current player type
   - When it's a bot's turn AND the bot is alive:
     1. Set turn message: "Bot X is thinking..."
     2. Set a timeout of `BOT_TURN_DELAY_MS` (1500ms)
     3. After timeout: call `decideBotPlay(botHand, lastValue)` from engine
     4. If decision is 'play': dispatch `store.playCard(playerIndex, decision.cardId)`
     5. If decision is 'pass': dispatch `store.passTurn(playerIndex)`
   - If bot is not alive: skip (handled by game loop)
   - Cleanup: clear timeout on unmount or when turn changes
   - Must check `isAnimating` — wait for animations to finish before bot takes action
   - Must check `gameStatus !== 'finished'` — don't play if game is over

2. Create `src/hooks/useGameLoop.ts`:
   - Main orchestration hook, runs on every turn change (`currentPlayerIndex`)
   - Turn resolution flow (per Appendix B):
     1. Check: is current player alive?
        - NO → `store.advanceTurn()`, re-trigger loop
     2. Check: is it the human's turn?
        - YES → Set turn message "Your turn! Play a card", wait for tap
        - NO → useBotTurn handles it
     3. After any `playCard()` or `passTurn()` dispatch:
        a. Handle special effect (via store action)
        b. Enqueue animations (via store)
        c. Handle life loss display
        d. Check elimination (if lives === 0)
        e. Check win condition → `store.checkAndSetWinner()`
        f. Check deadlock → `store.resolveDeadlock()`
        g. Handle skip effect (advance turn extra if Skip was played)
        h. `store.advanceTurn()`
   - Updates turn message throughout: "Your turn!", "Bot X played Card Y", "Bot X lost a life!", etc.
   - Reacts to `gameStatus` changes — stops loop when finished
   - Handles the skip effect: if `skipNext` is true from a special card effect, advance turn an extra time

3. Integrate hooks in `src/App.tsx` or a new `GameContainer.tsx`:
   - Call `useGameLoop()` inside the game container
   - Call `useBotTurn()` alongside

4. Create `src/components/ui/TurnIndicator.tsx`:
   - Reads `turnMessage` from store
   - Displays current message as a centered overlay at the top of the screen
   - Styles: semi-transparent dark background, white text, Tailwind
   - Shows different styles for human turn (highlighted/bright) vs bot turn (neutral)
   - Hides when game is finished

## Out of Scope
- Card animations (STORY-014)
- VFX effects (STORY-018)
- Game over screen (STORY-019)
- Title screen (STORY-010)

## Files Likely Affected
- `src/hooks/useBotTurn.ts` (create)
- `src/hooks/useGameLoop.ts` (create)
- `src/components/ui/TurnIndicator.tsx` (create)
- `src/App.tsx` (update — integrate hooks)
- `src/hooks/useBotTurn.test.ts` (create)
- `src/hooks/useGameLoop.test.ts` (create)

## Implementation Notes
- `useBotTurn` uses `useEffect` with `currentPlayerIndex` as dependency. The timeout is cleaned up via the return function.
- `useGameLoop` should use `useEffect` but be careful not to create infinite re-render loops. Use refs or derived state to track "has this turn been processed?"
- The skip effect: after a Skip card is played, `applySpecialEffect` returns `skipNext: true`. The game loop calls `advanceTurn()` one extra time, effectively skipping one player.
- After `passTurn()`, check if the player's lives are 0 and call `eliminatePlayer()` if so.
- Turn message updates should be batched or debounced to prevent rapid flashes (e.g., "Bot plays 5" → immediately "Bot loses a life" → "Your turn!")
- Consider using a `useRef` to track the current "phase" of the turn loop (waiting, processing, animating, advancing)
- When the game ends, all hooks should stop processing (check `gameStatus` before any action)
- Bot delay includes animation time — the 1500ms is from decision to visible card play

## Test Requirements
- [x] Bot turn: `decideBotPlay` is called after delay
- [x] Bot turn: bot plays correct card based on decision
- [x] Bot turn: bot passes (loses life) when no valid cards
- [x] Bot turn: timeout is cleaned up on turn change
- [x] Game loop: skips eliminated players
- [x] Game loop: advances turn after card play
- [x] Game loop: advances turn after life loss
- [x] Game loop: handles skip effect (extra advance)
- [x] Game loop: detects win condition after each action
- [x] Game loop: detects deadlock and resolves
- [x] Game loop: stops when game is finished
- [x] Turn message updates correctly for each state
- [x] Full simulated game (4 bots playing against each other) reaches completion with a winner

## Edge Cases
- All 3 bots eliminated, human is playing alone — game should end with human winning
- Skip card followed by another Skip — two players skipped in sequence
- Reverse card changes direction mid-turn-chain
- Bot has 0 cards (deck depleted earlier) — bot passes, loses life
- Multiple simultaneous eliminations (two players drop to 0 in same round)
- Game loop re-entrancy: useEffect fires again while processing
- Rapid animation completion triggering next turn before UI updates

## Dependencies
- STORY-004 (turn manager functions)
- STORY-005 (special card effects — skip, reverse results)
- STORY-006 (bot AI decision function)
- STORY-007 (win condition checking)
- STORY-008 (game orchestration context)
- STORY-009 (Zustand store with all actions)
- STORY-012 (card interaction hook)
- STORY-014 (animation queue integration)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed
- [x] QA review passed
- [x] Story closed
