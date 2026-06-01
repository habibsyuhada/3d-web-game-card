# Dev Notes
Story ID: STORY-021 — Integration Testing & End-to-End Game Validation

## Story Context Reviewed
- docs/stories/STORY-021.md (full scope, acceptance criteria, edge cases)
- docs/architecture/architecture.md (Section 16: Testing Strategy, layered test approach)
- docs/prd/prd.md (FR-001 through FR-092, AC-001 through AC-023)
- docs/queue/dev-queue.md (final story of the project)
- Existing codebase: engine modules, store slices, types, 39 existing test files (424 tests)
- Existing component tests: TitleScreen, GameOverScreen, HUD, SpectatorBanner (all reviewed, adequately covering AC)

## Files Changed

### Created (7 new files):
| File | Purpose |
|------|---------|
| `src/test/helpers.ts` | Test helpers: createTestStore, simulateBotTurn, playFullGame, createMockPlayer, createMockCard, createNumberCard, createSpecialCard |
| `src/test/integration/full-game-simulation.test.ts` | Full game simulation tests (5 single + 100 concurrent = 105 tests) |
| `src/test/integration/special-card-chains.test.ts` | Special card chain tests: Reverse→Skip→Reverse, Bomb→Random, Nuclear→number, multiple Skips (7 tests) |
| `src/test/integration/deadlock-resolution.test.ts` | Deadlock detection and resolution tests (11 tests) |
| `src/test/integration/store-reset.test.ts` | Store reset integration tests (5 tests) |
| `src/test/integration/elimination-flow.test.ts` | Elimination flow tests (13 tests) |

### Updated (2 existing files):
| File | Changes |
|------|---------|
| `src/test/setup.ts` | Enhanced with WebGL context mock, Fullscreen API mock, requestAnimationFrame polyfill |
| `vitest.config.ts` | Added coverage configuration: v8 provider, engine + store targets, 80% thresholds |

## Implementation Summary

### Test Helpers (src/test/helpers.ts)
- `createTestStore(overrides?)` — Resets Zustand singleton store with optional state overrides
- `playFullGame(getState?)` — Runs full automated game from initGame() to gameStatus === 'finished' using decideBotPlay for all players
- `simulateBotTurn(getState, playerIndex)` — Executes one bot turn: decide action, dispatch playCard/passTurn, drawCard, checkAndSetWinner, resolveDeadlock, advanceTurn
- `createMockPlayer(overrides?)` — Factory for Player objects
- `createMockCard(overrides?)` — Factory for Card objects
- `createNumberCard(value, id?)` — Factory for NumberCard objects
- `createSpecialCard(effect, id?)` — Factory for SpecialCard objects

### Integration Tests (5 test files, 141 tests)
- **Full Game Simulation** (105 tests): Single game validation (5 tests) + 100 concurrent iterations verifying every game reaches terminal state with a winner
- **Special Card Chains** (7 tests): Reverse→Skip→Reverse direction tracking, Bomb→Random pile value chain, Nuclear clearing pile, multiple Skip sequences, Skip with eliminated players
- **Deadlock Resolution** (11 tests): Deadlock detection (all alive stuck), not-triggered-when-1-alive, empty-hand deadlock, resolution by most lives, tie-breaker by lowest index, ignoring eliminated players, store action integration
- **Store Reset** (5 tests): Clean state after resetGame, play-after-reset works, VFX/animation cleared, messages cleared, multiple resets stable
- **Elimination Flow** (13 tests): Life loss on pass, elimination at 0 lives, canPlayerAct guard, skip eliminated in turn order, wrap-around with eliminations, win condition after elimination, game continues with 2+ alive, full game elimination observation, alive count and checkWinCondition

### Test Setup (src/test/setup.ts)
- WebGL context mock: Provides minimal WebGLRenderingContext implementation for HTMLCanvasElement.getContext()
- Fullscreen API mock: Stubs for document.fullscreenEnabled, fullscreenElement, requestFullscreen, exitFullscreen
- requestAnimationFrame polyfill: setTimeout-based fallback for headless environments
- @testing-library/jest-dom matchers imported

### Coverage Configuration (vitest.config.ts)
- Provider: v8
- Include targets: src/engine/**, src/store/**
- Thresholds: 80% lines, 80% branches, 80% functions
- Installed @vitest/coverage-v8 as dev dependency

### Existing Component Tests Review
Reviewed TitleScreen, GameOverScreen, HUD, SpectatorBanner test files. All adequately cover the acceptance criteria:
- TitleScreen: Renders title + PLAY FULLSCREEN button, button triggers store init + fullscreen request (8 tests)
- GameOverScreen: Renders correct message (victory/defeat), Play Again dispatches reset, pointer events, animation (13 tests)
- HUD: Renders all sub-components, SpectatorBanner visibility, pointer-events-none (10 tests)
- SpectatorBanner: Visible when eliminated, hidden when alive, role="alert" (6 tests)
No additional component tests needed — existing coverage is comprehensive.

## Tests Added or Updated
- **New tests:** 141 integration tests across 5 new test files
- **Existing tests:** 424 tests unchanged (still passing)
- **Total tests:** 565 across 44 test files
- **Test files:** 5 new + 2 updated = 7 files modified/created

## Test Commands Run
1. `npx vitest run src/test/integration/` — Integration tests only (141 passed)
2. `npx vitest run` — Full test suite (565 passed, 44 files, ~58s duration)
3. `npx vitest run --coverage` — Coverage report (see below)
4. `npm run build` — Production build (succeeded, 1046 modules, 14.28s)
5. `npx eslint src/test/helpers.ts src/test/setup.ts src/test/integration/` — Lint check (no errors)

## Test Results

### Test Suite Results
```
Test Files  44 passed (44)
     Tests  565 passed (565)
Start at    09:15:10
Duration    57.46s
```

### Coverage Results (v8 provider)
```
% Coverage report from v8
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   97.86 |    90.56 |   97.89 |   98.38 |
 engine            |   99.09 |    94.44 |     100 |    98.9 |
 store             |   97.07 |    86.53 |   96.82 |   98.08 |
-------------------|---------|----------|---------|---------|

Statements   : 97.86% (275/281)
Branches     : 90.56% (96/106)
Functions    : 97.89% (93/95)
Lines        : 98.38% (244/248)
```

**All thresholds exceeded:**
- Engine: Lines 98.9% (≥80 ✅), Branches 94.44% (≥80 ✅), Functions 100% (≥80 ✅)
- Store: Lines 98.08% (≥80 ✅), Branches 86.53% (≥80 ✅), Functions 96.82% (≥80 ✅)

### Build Results
```
✓ 1046 modules transformed
dist/index.html          0.85 kB │ gzip: 0.40 kB
dist/assets/index-*.css  14.14 kB │ gzip: 3.64 kB
dist/assets/app-*.js      3.59 kB │ gzip: 1.58 kB
dist/assets/index-*.js  104.12 kB │ gzip: 35.52 kB
dist/assets/three-*.js 1058.87 kB │ gzip: 304.28 kB
✓ built in 14.28s
```

### Lint Results
No errors on new/modified files.

## Commit Notes
Suggested commit message:
```
feat(tests): add integration testing & end-to-end game validation (STORY-021)

- Add test helpers: createTestStore, simulateBotTurn, playFullGame, mock factories
- Add 5 integration test suites (141 tests): full-game-simulation,
  special-card-chains, deadlock-resolution, store-reset, elimination-flow
- Add 100 concurrent game simulation iterations for stability validation
- Enhance test setup: WebGL context mock, Fullscreen API mock, rAF polyfill
- Add V8 coverage config: 80% thresholds for engine + store modules
- Install @vitest/coverage-v8 as dev dependency
- Total: 565 tests passing (424 existing + 141 new), 44 files
- Coverage: engine 98.9% lines, store 98.08% lines (all ≥80% thresholds)
- Build passes, ESLint passes, all acceptance criteria validated

Closes: STORY-021 (final story of project)
```

## Risks / Limitations
1. **Deadlock scenarios in full game simulation:** Games can end via deadlock (not just elimination), leaving multiple alive players. Tests account for this by checking `alive >= 1` and winner membership.
2. **Zustand singleton:** Tests use a shared singleton store, requiring careful reset before each test. Concurrent tests in the 100-iteration suite each reset the store independently but may occasionally contend on the singleton.
3. **Coverage-v8 installed as dev dep:** Adds 12 packages to devDependencies but has no runtime impact.
4. **three.js build warnings:** Pre-existing warnings about sRGBEncoding/LinearEncoding from @react-three/fiber are not related to this story.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
