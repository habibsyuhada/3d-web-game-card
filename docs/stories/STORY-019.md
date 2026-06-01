# STORY-019 — Game Over Screen & Play Again

**Status:** Done

---

## Requirement IDs
- FR-052 (game continues until 1 player remains)
- FR-053 (last alive player declared winner)
- FR-054 (victory/defeat screen with "Play Again" option)
- FR-081 ("Play Again" button on game-over screen)
- FR-090 ("New Game" / "Play Again" resets all state and restarts)

## Acceptance Criteria IDs
- AC-015 (victory/defeat screen appears with "Play Again" button when 1 player remains)
- AC-016 (tap "Play Again" → game resets all state and starts new round)

## Business Context
The game over screen is the final player-facing moment. A clear victory or defeat message with an immediate replay option keeps the player engaged and provides a satisfying conclusion to the game session.

## Technical Context
Per architecture Section 10, `GameOverScreen` is an HTML overlay component rendered over the Canvas when `showGameOver` or `gameStatus === 'finished'`. It displays the winner name, a victory/defeat message, and a "Play Again" button that dispatches `store.resetGame()`.

## Scope
1. Create `src/components/ui/GameOverScreen.tsx`:
   - Conditional rendering: shown when `gameStatus === 'finished'` (from store)
   - Full-viewport overlay (semi-transparent dark background)
   - Content:
     - **Victory message** (when human player is winner):
       - "🏆 You Win!" in large, bold text
       - Celebratory styling (gold/yellow accents)
     - **Defeat message** (when a bot is winner):
       - "💀 Bot X Wins" in text
       - Darker styling (red/gray accents)
     - **Winner details:** Show the winner's name and remaining lives
     - **"Play Again" button:**
       - Large, clearly visible, min 48x48px touch target
       - On tap: dispatches `store.resetGame()`
       - `resetGame()` resets all state: game, UI, animations
       - After reset: `showTitleScreen` can be false (jump straight to game) or true (show title again)
       - Recommended: jump straight to a new game (set `showTitleScreen: false` in resetGame)
   - Position: centered vertically and horizontally
   - Z-index above HUD elements
   - Animation: fade-in or slide-up on appearance (CSS transition)

2. Ensure `store.resetGame()` is wired correctly:
   - Clears all game state to initial values (via `engine.resetGame()`)
   - Clears UI state: `showGameOver: false`, `turnMessage: ''`, `showMessage: null`
   - Clears animation state: `isAnimating: false`, queue empty, `activeVFX: null`
   - Re-initializes deck, players, and cards
   - Sets `gameStatus: 'playing'`
   - Sets `showTitleScreen: false` so game starts immediately

3. Wire `GameOverScreen` into `src/App.tsx`:
   - Render `<GameOverScreen />` inside the game container overlay
   - Only when `gameStatus === 'finished'`

4. Handle the game-over transition in `useGameLoop`:
   - When `checkAndSetWinner()` sets a winner:
     - Set `store.setShowGameOver(true)`
     - Set turn message to empty
     - If human wins: celebration message
     - If human loses: "You were eliminated" (already handled by SpectatorBanner)
   - Stop all bot turn scheduling
   - Allow existing animations to finish before showing the modal (optional: small delay)

## Out of Scope
- Sound effects on victory/defeat (out of MVP scope)
- Stats tracking (games played, win rate)
- Share result functionality
- Animated confetti (post-MVP)

## Files Likely Affected
- `src/components/ui/GameOverScreen.tsx` (create)
- `src/App.tsx` (update — add GameOverScreen to overlay)
- `src/hooks/useGameLoop.ts` (update — set showGameOver after winner detected)
- `src/store/game-slice.ts` (ensure resetGame properly re-initializes)
- `src/components/ui/GameOverScreen.test.tsx` (create)

## Implementation Notes
- "Play Again" button: Tailwind classes like `bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg`
- Victory message: Large heading, `text-4xl`, gold color `text-yellow-400`
- Defeat message: Large heading, `text-4xl`, red color `text-red-500`
- The emoji usage (🏆, 💀) is for the overlay text — these are standard Unicode, not file assets
- `resetGame` should call `initGame` from the engine to get fresh state, then use immer `set()` to replace everything
- Small delay before showing game over (500ms) to let the last animation finish — use `setTimeout` in the hook
- The game over screen blocks all pointer events below it (it has `pointer-events-auto`)
- Consider adding a brief "Game Over" heading before the winner details for clarity

## Test Requirements
- [x] GameOverScreen renders when `gameStatus === 'finished'`
- [x] GameOverScreen does NOT render when game is playing or waiting
- [x] Victory message shown when human player is winner
- [x] Defeat message shown when bot is winner
- [x] Winner name displayed correctly
- [x] "Play Again" button is visible and tappable
- [x] Tapping "Play Again" dispatches `resetGame()`
- [x] After reset: gameStatus is 'playing', all state reinitialized
- [x] After reset: a new game starts with fresh deck and players
- [x] GameOverScreen blocks interaction with elements behind it
- [x] GameOverScreen is readable on 320px screen width
- [x] Game over modal appears after any in-flight animations complete

## Edge Cases
- Game ends via deadlock resolution (not elimination) — should still show game over correctly
- Human is eliminated early, spectating, then game ends — game over shows the bot winner
- "Play Again" tapped multiple times rapidly (should not trigger multiple resets)
- Game over triggered while a VFX is playing (VFX should be cleaned up)
- Game over during a bot turn (bot stops mid-thinking)

## Dependencies
- STORY-009 (Zustand store — resetGame action, gameStatus, winner, showGameOver)
- STORY-015 (Game loop — detects win condition and sets showGameOver)
- STORY-016 (SpectatorBanner — works together with elimination flow)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
