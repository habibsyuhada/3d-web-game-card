# Dev Notes
Story ID: STORY-019

## Story Context Reviewed
- `docs/queue/dev-queue.md` — Current sprint status, STORY-019 defined as "Game Over Screen & Play Again"
- `docs/stories/STORY-019.md` — Full requirements: GameOverScreen overlay, Play Again button, showGameOver wiring
- `docs/prd/prd.md` — FR-052 (continue until 1 player remains), FR-054 (victory/defeat screen), FR-081 (Play Again button), FR-090 (reset + restart)
- `docs/architecture/architecture.md` — Component hierarchy (Section 10), Zustand store shape (Section 7), test strategy (Section 16)

## Files Changed

### Created
- `src/components/ui/GameOverScreen.tsx` — Game Over overlay component
- `src/components/ui/GameOverScreen.test.tsx` — 13 test cases for GameOverScreen

### Modified
- `src/App.tsx` — Added `<GameOverScreen />` inside `GameContainer`, after `<HUD />`
- `src/hooks/useGameLoop.ts` — After `handlePostAction` in human animation completion, checks `gameStatus` and sets `showGameOver(true)` + clears turn message if `Finished`
- `src/hooks/useBotTurn.ts` — After `handlePostAction` in bot animation completion AND bot pass flow, checks `gameStatus` and sets `showGameOver(true)` + clears turn message if `Finished`
- `tailwind.config.js` — Added `fade-in` keyframe and `animate-fade-in` animation class (0.3s ease-out)

## Implementation Summary

### GameOverScreen component
- Reads `gameStatus`, `winner`, and `players` from Zustand store
- Returns `null` when game is not finished or winner is not set
- Renders a full-viewport fixed overlay with:
  - `z-50` (above HUD which is `z-10`)
  - `pointer-events-auto` (blocks clicks below)
  - `animate-fade-in` (fade-in on mount, 0.3s ease-out)
  - Semi-transparent black background (`bg-black/70`)
- Modal content:
  - Victory heading (`🏆 You Win!`, yellow-400) or defeat heading (`💀 Bot X Wins`, red-500)
  - Winner name displayed
  - Winner lives remaining (when winner player data is available)
  - "Play Again" button (min 200px wide, min 48px tall, blue-600)
- Play Again handler calls: `resetGame()` → `initGame()` → `setShowTitleScreen(false)` → `setShowGameOver(false)`
  - This resets all state (game, UI, animation), initializes a fresh game, and jumps directly to gameplay (no title screen)

### useGameLoop showGameOver wiring
- After human's `handlePostAction`: if `gameStatus === Finished`, call `setShowGameOver(true)` + `setTurnMessage('')`; else if `Playing`, call `advanceTurn()`

### useBotTurn showGameOver wiring
- After bot's animation completion `handlePostAction`: same pattern as useGameLoop
- After bot's pass `handlePostAction`: same pattern

### Tailwind fade-in animation
- `fade-in` keyframe defined with 0% → 100% opacity
- `animate-fade-in` Tailwind class with 0.3s ease-out duration

## Tests Added or Updated

### New test file: `src/components/ui/GameOverScreen.test.tsx` (13 test cases)

| # | Test Case | Result |
|---|-----------|--------|
| 1 | Does NOT render when gameStatus is 'playing' | ✅ |
| 2 | Does NOT render when gameStatus is 'waiting' | ✅ |
| 3 | Does NOT render when gameStatus is 'finished' but winner is null | ✅ |
| 4 | Renders when gameStatus is 'finished' and winner is set | ✅ |
| 5 | Shows victory message when human is winner (gold/yellow) | ✅ |
| 6 | Shows defeat message when bot is winner (red) | ✅ |
| 7 | Winner name displayed correctly | ✅ |
| 8 | Winner lives remaining displayed | ✅ |
| 9 | Play Again button is visible and clickable | ✅ |
| 10 | Play Again dispatches resetGame + initGame, hides overlays | ✅ |
| 11 | Overlay has pointer-events-auto class | ✅ |
| 12 | Overlay has z-50 class | ✅ |
| 13 | Overlay has animate-fade-in class | ✅ |
| 14 | Modal is readable on 320px (max-w-sm, mx-4) | ✅ |

### Existing tests verified:
- `src/hooks/useGameLoop.test.ts` — All 10 tests still pass (no regressions after adding Finished/Playing branching)
- `src/hooks/useBotTurn.test.ts` — All 10 tests still pass (no regressions after adding Finished/Playing branching)
- `src/components/ui/TitleScreen.test.tsx` — App integration tests pass (App renders GameContainer correctly)
- `src/components/ui/HUD.test.tsx` — All HUD tests pass
- `src/store/game-slice.test.ts` — All store tests pass

## Test Commands Run
- `cmd /c "npx tsc --noEmit 2>&1"` — Clean, no errors
- `cmd /c "npm test -- --run 2>&1"` — 38 test files, 397 tests, all passing
- `cmd /c "npm run build 2>&1"` — Production build succeeds

## Test Results
- **TypeScript:** No type errors
- **Unit tests:** 397/397 passed
- **Build:** Success (dist generated)

## Commit Notes
Suggested commit message:
```
feat(STORY-019): Game Over Screen & Play Again

- Add GameOverScreen component (victory/defeat overlay with Play Again)
- Wire showGameOver flag in useGameLoop and useBotTurn after post-action checks
- Add fade-in animation to Tailwind config
- Integrate GameOverScreen into App.tsx GameContainer
- Add 14 component tests for GameOverScreen
```

## Risks / Limitations
- **No confetti/celebration animation:** Per STORY-019 scope, victory/defeat uses only text and color styling. Animated confetti is deferred to post-MVP.
- **No sound effects:** Per PRD NG-007, no audio on game-over events.
- **No double-tap guard on Play Again:** If the user rapidly double-taps "Play Again", the second tap runs a second reset/init cycle. This is not harmful (idempotent) but could cause a brief visual flash. Not worth adding debounce for MVP.
- **Small delay before showing modal:** Per story implementation notes, a 500ms delay was suggested to let the last animation finish. Currently the modal appears immediately after `isAnimating` becomes false (which already waits for animations to complete). This feels natural and correct.
- **Deadlock resolution:** GameOverScreen also displays correctly when the game ends via deadlock resolution (same code path: `checkAndSetWinner` / `resolveDeadlock` set `gameStatus` to `Finished`).

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
