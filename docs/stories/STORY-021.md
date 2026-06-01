# STORY-021 — Integration Testing & End-to-End Game Validation

**Status:** Closed ✅

---

## Requirement IDs
- FR-001 through FR-092 (all functional requirements)
- NFR-001 through NFR-012 (all non-functional requirements)
- G-001 (fully playable single-player vs 3 AI bots)
- G-003 (smooth performance on mid-range mobile)
- G-004 (zero-friction entry experience)
- G-005 (clear, intuitive touch-based interaction)

## Acceptance Criteria IDs
- AC-001 through AC-023 (all acceptance criteria)

## Business Context
This story validates the complete game from end to end. Automated tests simulate full game playthroughs, verify all acceptance criteria are met, and catch regressions. This is the quality gate before the game is considered MVP-complete.

## Technical Context
Per architecture Section 16 (Testing Strategy), 4 layers of testing are defined: unit tests (engine), integration tests (store + engine), component tests (UI), and visual/manual tests (3D rendering). This story focuses on integration tests and component tests that verify cross-module behavior.

## Scope
1. **Integration Tests (vitest + Zustand store):**
   - `src/test/integration/full-game-simulation.test.ts`:
     - Simulate an entire game from `initGame()` to `gameStatus === 'finished'`
     - All 4 players (including human) auto-play using `decideBotPlay` (even human uses bot logic for testing)
     - Verify: game ends with exactly 1 winner, all other players eliminated or deadlocked
     - Run 100 iterations with different random seeds — verify no crashes, always reaches terminal state
   - `src/test/integration/special-card-chains.test.ts`:
     - Test Reverse → Skip → Reverse chain: verify turn order is correct
     - Test Bomb → Random: verify pile value resets then gets new random value
     - Test Nuclear → play number card: verify pile is empty, any card playable
     - Test multiple Skips in sequence: verify correct players are skipped
   - `src/test/integration/deadlock-resolution.test.ts`:
     - Exhaust the deck, create a state where all alive players have no valid cards
     - Verify `resolveDeadlock` picks the player with most lives
     - Verify tie-breaker by lowest index
   - `src/test/integration/store-reset.test.ts`:
     - Start a game, play several turns, then call `resetGame()`
     - Verify state is identical to a fresh `initGame()`
     - Verify no residual state (animation queue, messages, VFX)
   - `src/test/integration/elimination-flow.test.ts`:
     - Create a scenario where a player loses all lives
     - Verify: player status changes to Eliminated, player is skipped in turn order
     - Verify: win condition checked after each elimination
     - Verify: game continues with remaining players

2. **Component Tests (@testing-library/react):**
   - `src/components/ui/TitleScreen.test.tsx`:
     - Renders title text and fullscreen button
     - Button click triggers fullscreen request and game initialization
   - `src/components/ui/GameOverScreen.test.tsx`:
     - Renders correct winner message (victory vs defeat)
     - "Play Again" button triggers `resetGame`
     - Not rendered when game is in progress
   - `src/components/ui/HUD.test.tsx` (or individual component tests):
     - TurnIndicator shows correct messages
     - PlayerInfo shows all players with correct lives
     - DeckCounter shows correct count
   - `src/components/ui/SpectatorBanner.test.tsx`:
     - Appears when human player is eliminated
     - Hidden when human player is alive

3. **Test Setup:**
   - `src/test/setup.ts`:
     - Mock WebGL context for jsdom (R3F components can't render WebGL in jsdom)
     - Mock `requestFullscreen` API
     - Configure `@testing-library/jest-dom` matchers
   - `src/test/helpers.ts`:
     - Helper: `createMockGameState(overrides)` — creates a full GameState with overrides
     - Helper: `createMockPlayer(overrides)` — creates a Player with overrides
     - Helper: `playFullGame(store)` — runs automated game until finished
     - Helper: `simulateBotTurn(store, playerIndex)` — runs bot decision + dispatch

4. **Test Configuration:**
   - Verify `vitest.config.ts` is configured:
     ```typescript
     {
       test: {
         globals: true,
         environment: 'jsdom',
         setupFiles: './src/test/setup.ts',
         include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
         coverage: {
           provider: 'v8',
           include: ['src/engine/**', 'src/store/**'],
           thresholds: { lines: 80, branches: 80, functions: 80 }
         }
       }
     }
     ```

## Out of Scope
- Manual/visual testing on real devices (documented in testing checklist, not automated)
- Performance profiling (covered in STORY-020)
- Browser compatibility testing (covered in STORY-020 cross-browser checklist)
- End-to-end browser automation (Cypress/Playwright) — deferred to post-MVP

## Files Likely Affected
- `src/test/setup.ts` (create/update)
- `src/test/helpers.ts` (create)
- `src/test/integration/full-game-simulation.test.ts` (create)
- `src/test/integration/special-card-chains.test.ts` (create)
- `src/test/integration/deadlock-resolution.test.ts` (create)
- `src/test/integration/store-reset.test.ts` (create)
- `src/test/integration/elimination-flow.test.ts` (create)
- `src/components/ui/TitleScreen.test.tsx` (create/update)
- `src/components/ui/GameOverScreen.test.tsx` (create)
- `src/components/ui/HUD.test.tsx` (create)
- `vitest.config.ts` (update — coverage config)

## Implementation Notes
- For 3D components (R3F), mock them with simple DOM elements in tests — R3F doesn't render in jsdom
- `createMockGameState` helper should return a valid GameState matching the store shape
- The 100-iteration game simulation test should run fast (< 5 seconds) — it's pure logic, no rendering
- Use `vitest` concurrent test mode (`describe.concurrent`) for multiple game simulation runs
- Mock `Math.random` in tests that need deterministic results (e.g., specific card deals)
- Component tests use `@testing-library/react` `render()` with a Zustand store provider
- For testing Zustand with components, use `renderHook` or wrap in a test store
- Coverage target: 80% lines/branches/functions for `src/engine/` and `src/store/`

## Test Requirements
- [x] Full game simulation: 100 automated games complete without errors
- [x] Full game simulation: every game has exactly 1 winner
- [x] Special card chains: Reverse+Skip+Reverse produces correct turn order
- [x] Special card chains: Bomb then Random sets new pile value correctly
- [x] Special card chains: Nuclear clears pile, next player can play any card
- [x] Multiple Skips: correct players skipped in sequence
- [x] Deadlock: resolved by most lives, tie-breaker by lowest index
- [x] Store reset: state after resetGame() matches fresh initGame()
- [x] Elimination flow: player eliminated, skipped, game continues
- [x] Elimination flow: game ends when only 1 player alive
- [x] TitleScreen: renders title + button
- [x] GameOverScreen: renders correct message, Play Again works
- [x] TurnIndicator: shows correct messages for all turn states
- [x] SpectatorBanner: visible when eliminated, hidden when alive
- [x] All tests pass: `npm test` exit code 0
- [x] Coverage: `src/engine/` >= 80%, `src/store/` >= 80%

## Edge Cases
- Game simulation where all bots get dealt only high-value cards (tests deadlock)
- Game where human wins (victory path)
- Game where human is eliminated first, then watches bots (spectator path)
- Very long game (many turns due to low-value deck usage)
- Special cards dealt to all players initially (unusual but possible)
- Store reset during active animation (all state should clear)

## Dependencies
- ALL previous stories (001-020) — this is the final validation story
- STORY-003 through STORY-008 (engine functions for test helpers)
- STORY-009 (Zustand store for integration tests)
- STORY-010 through STORY-019 (components for component tests)
- STORY-020 (performance optimizations in place)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
