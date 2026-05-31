# Dev Notes
Story ID: STORY-015

## Story Context Reviewed
- STORY-015 — Bot Turn Hook & Game Loop Orchestration
- Dependencies: STORY-004 (turn manager), STORY-005 (special cards), STORY-006 (bot AI), STORY-007 (win condition), STORY-009 (Zustand store), STORY-012 (card interaction), STORY-014 (animation queue)
- FR-030, FR-031, FR-037, FR-050-054, FR-060, FR-065, FR-091, FR-092
- Acceptance Criteria: AC-007, AC-013, AC-014, AC-015, AC-017, AC-018, AC-019, AC-023

## Files Changed
- `src/hooks/useBotTurn.ts` (create) — Bot turn decision hook with visible delay
- `src/hooks/useGameLoop.ts` (create) — Game loop orchestration hook
- `src/components/ui/TurnIndicator.tsx` (create) — Turn message overlay component
- `src/App.tsx` (update) — Integrated hooks and TurnIndicator via GameContainer
- `src/hooks/useBotTurn.test.ts` (create) — 15 tests for bot turn hook
- `src/hooks/useGameLoop.test.ts` (create) — 11 tests for game loop hook

## Implementation Summary

### useBotTurn hook
- Subscribes to `currentPlayerIndex`, `gameStatus`, `isAnimating`
- Uses refs (`pendingPlayRef`, `prevAnimatingRef`, `timerActiveRef`) to prevent re-entrancy
- On bot's turn: sets "thinking..." message, waits BOT_TURN_DELAY_MS (1500ms), calls `decideBotPlay`
- If 'play': dispatches `playCard` + `drawCard`, enqueues card-play and card-draw animations, sets `isAnimating=true`, marks `pendingPlayRef`
- After bot play animations complete: runs post-action checks (elimination, winner, deadlock), then `advanceTurn()`
- If 'pass': dispatches `passTurn`, runs post-action checks, immediately `advanceTurn()`
- Properly cleans up timeout on unmount or turn change
- Guards against game finished, bot eliminated, and active animations

### useGameLoop hook
- Subscribes to `currentPlayerIndex`, `gameStatus`, `isAnimating`
- Uses refs (`prevAnimatingRef`, `humanMessageSetRef`) to prevent re-entrancy and infinite loops
- Skips eliminated players via `advanceTurn()`
- Sets "Your turn! Play a card" message for human player
- After human card play animations complete: runs post-action checks + `advanceTurn()`
- Does NOT process bot turns (handled by `useBotTurn`)
- Stops processing when game is finished

### TurnIndicator component
- Reads `turnMessage` and `gameStatus` from store
- Positioned top-center with fixed positioning and z-50
- Blue accent border/glow for human turns, pulsing gray for bot thinking, neutral dark for other messages
- Hidden when game is finished or message is empty
- Includes ARIA attributes for accessibility

### App.tsx update
- Extracted `GameContainer` component that calls `useGameLoop()` and `useBotTurn()` and renders `TurnIndicator`
- Hooks only active when game scene is showing (not on title screen)

### Post-action helper (shared)
- Both hooks share `handlePostAction(playerIndex)` which:
  1. Checks if player lives === 0 → `eliminatePlayer()`
  2. Calls `checkAndSetWinner()`
  3. Calls `resolveDeadlock()` (only if game still Playing)

### Infinite loop prevention
- Hooks are partitioned by player type: useBotTurn handles bots, useGameLoop handles human + skip logic
- `pendingPlayRef` prevents useBotTurn from re-triggering after its own animations complete vs detecting others
- `humanMessageSetRef` prevents useGameLoop from repeatedly setting the same message
- `prevAnimatingRef` detects animation completion transitions (true→false) reliably

## Tests Added or Updated
- `src/hooks/useBotTurn.test.ts` — 15 tests:
  - Sets "thinking..." message immediately
  - Plays smallest valid card after delay
  - Calls drawCard after playing
  - Enqueues card-play animation
  - Passes when no valid cards
  - Passes when hand is empty
  - Advances turn after pass
  - Cleans up timeout on turn change
  - Does nothing when game finished
  - Does nothing when bot eliminated
  - Waits for isAnimating to finish
  - Eliminates player at 0 lives
  - Sets winner when one player remains
  - Does not act for human player
  - Plays special when no valid numbers
  
- `src/hooks/useGameLoop.test.ts` — 11 tests:
  - Sets "Your turn!" message
  - Skips eliminated players
  - Skips multiple consecutive eliminated players
  - Does not process when finished
  - Does not advance while animating
  - Handles animation completion (post-action + advanceTurn)
  - Checks elimination at 0 lives
  - Detects winner after elimination
  - Does not process bot turns
  - Does not create infinite loops
  - Initial render with isAnimating=false

## Test Commands Run
- `npx vitest run src/hooks/useBotTurn.test.ts src/hooks/useGameLoop.test.ts` — 26/26 passed
- `npx vitest run` — 298/298 passed (full suite)
- `npx tsc --noEmit` — clean (no type errors)
- `npm run build` — successful (only pre-existing three.js vendor warnings)

## Test Results
- All 26 new tests pass
- All 298 tests pass (0 failures, including all 272 pre-existing tests)
- TypeScript compilation clean
- Production build successful

## Commit Notes
Suggested commit message:
```
feat: add bot turn hook and game loop orchestration (STORY-015)

- useBotTurn: bot decision-making with 1500ms visible delay,
  animation-synced turn advancement, pass/play handling
- useGameLoop: eliminated player skipping, human turn messages,
  post-action flow (elimination, winner, deadlock, advance)
- TurnIndicator: overlay showing turn messages with styled accents
- App.tsx: integrated via GameContainer when game is active
- 26 new tests covering bot decisions, turn flow, edge cases
- Full suite: 298/298 tests passing, build clean
```

## Risks / Limitations
- `act()` wrapper warnings in test output are cosmetic (React 18 strict mode + Zustand setState in effects) and do not indicate failures
- Skip effect handling relies on the store's `playCard` action pre-advancing `currentPlayerIndex` (per existing implementation), not on explicit skip detection in the hooks
- No VFX triggered for special card effects in this story (out of scope, handled by STORY-018)
- Animation for life-loss is not enqueued (MVP: turn advances immediately after pass)
- Both hooks run as effects dependent on the same state; if Zustand batching causes unexpected ordering, the ref-guards prevent double-processing
- Deadlock detection runs after every action, which is slightly conservative but ensures correctness

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
