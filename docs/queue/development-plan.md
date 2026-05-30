# Development Plan — Zinky Zoogle 3D Card Game

**Created:** 2025-05-30  
**Scrum Master:** SM Agent  
**Total Stories:** 21 | **Total Points:** 97  
**Waves/Sprints:** 6

---

## Sprint Overview

| Wave | Name | Stories | Points | Primary Goal |
|------|------|---------|--------|--------------|
| 1 | Foundation | 001, 002, 003, 004 | 13 | Scaffold project, define types, build core engine primitives |
| 2 | Engine & State | 005, 006, 007, 008, 009 | 19 | Complete game engine, build Zustand store |
| 3 | 3D Scene & Entry | 010, 011, 012 | 18 | Title screen, 3D canvas, interactive cards |
| 4 | Animation & Loop | 013, 014, 015, 016 | 23 | Animations, game loop, HUD |
| 5 | Assembly & VFX | 017, 018, 019 | 11 | Scene assembly, VFX, game over |
| 6 | Performance & Testing | 020, 021 | 13 | Mobile optimization, integration tests |
| **Total** | | **21** | **97** | |

---

## Wave 1: Foundation

### Stories

| Order | Story | Title | Points |
|-------|-------|-------|--------|
| 1 | STORY-001 | Project Scaffolding & Configuration | 3 |
| 2 | STORY-002 | Data Model & Type Definitions | 2 |
| 3 | STORY-003 | Deck Manager & Utility Functions | 5 |
| 4 | STORY-004 | Turn Manager & Player Operations | 3 |

### Goals
- Establish a fully configured React + Vite + TypeScript project with all required dependencies
- Define the canonical data model (enums, interfaces, constants) used throughout the project
- Implement and unit-test the deck manager (create, shuffle, draw, deal)
- Implement and unit-test the turn manager (advance turn, next active player, player elimination)

### Deliverables
1. Working Vite + React + TypeScript project (`npm run dev`, `npm run build`, `npm test` all succeed)
2. All production + dev dependencies installed
3. Full folder structure per architecture Section 5
4. Complete type definitions in `src/types/`
5. `src/engine/deck.ts` — deck creation, shuffle, draw, deal
6. `src/engine/cards.ts` — card validation functions
7. `src/engine/turn.ts` — turn advancement
8. `src/engine/player.ts` — player operations (eliminate, lose life)
9. `src/utils/` — ID generator, math helpers, delay utility
10. Unit tests for all engine modules (15+ test cases)

### Exit Criteria
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces output in `dist/`
- [ ] `npm test` passes all unit tests (green)
- [ ] `npm run lint` has zero fatal errors
- [ ] `npx tsc --noEmit` passes with no type errors
- [ ] `createDeck()` returns exactly 53 cards
- [ ] `shuffleDeck()` produces randomized output
- [ ] `drawCard()` handles empty deck gracefully
- [ ] `getNextActivePlayerIndex()` correctly skips eliminated players
- [ ] All types compile and barrel exports resolve

---

## Wave 2: Engine Completion & State Entry

### Stories

| Order | Story | Title | Points |
|-------|-------|-------|--------|
| 5 | STORY-005 | Special Card Effects | 3 |
| 6 | STORY-006 | Bot AI Decision Tree | 3 |
| 7 | STORY-007 | Win Condition & Deadlock Resolution | 2 |
| 8 | STORY-008 | Full Orchestration (initGame, resetGame) | 3 |
| 9 | STORY-009 | Zustand Store Implementation | 8 |

### Goals
- Complete all pure game logic: special card effects, bot AI, win conditions
- Create the top-level game orchestration (init, reset)
- Build the Zustand store connecting engine to React
- Validate the entire engine with comprehensive unit tests

### Deliverables
1. `src/engine/special-cards.ts` — all 5 special card effects
2. `src/engine/bot-ai.ts` — complete bot decision tree
3. `src/engine/win-condition.ts` — win check + deadlock resolver
4. `src/engine/game.ts` — `initGame()` and `resetGame()`
5. Finalized `src/engine/index.ts` barrel export
6. `src/store/game-slice.ts` — game state + all actions
7. `src/store/ui-slice.ts` — UI state + actions
8. `src/store/animation-slice.ts` — animation queue state
9. `src/store/selectors.ts` — memoized selectors
10. `src/store/index.ts` — merged Zustand store with immer
11. Unit tests for all new modules (30+ additional test cases)
12. Integration-level store tests (playCard, passTurn, resetGame)

### Exit Criteria
- [ ] All engine modules pass unit tests
- [ ] `applySpecialEffect()` returns correct results for all 5 effects
- [ ] `decideBotPlay()` handles all 4 decision branches
- [ ] `checkWinCondition()` identifies single alive player
- [ ] `isDeadlock()` detects when all alive players are stuck
- [ ] `initGame()` produces valid initial state (4 players, 5 lives, 3 cards, 41 remaining deck)
- [ ] Zustand store `initGame()` populates all state correctly
- [ ] Zustand store `playCard()` removes card, updates pile, handles effects
- [ ] Zustand store `resetGame()` produces clean slate
- [ ] All selectors return correct derived values

---

## Wave 3: 3D Scene & Entry

### Stories

| Order | Story | Title | Points |
|-------|-------|-------|--------|
| 10 | STORY-010 | Title Screen & Fullscreen Entry | 5 |
| 11 | STORY-011 | 3D Scene Foundation | 5 |
| 12 | STORY-012 | 3D Card Model, Hand Rendering & Interaction | 8 |

### Goals
- Implement the zero-friction entry experience (title → fullscreen → game)
- Build the R3F Canvas with camera, lighting, and procedural table
- Create interactive 3D cards: face-up for human, face-down for bots, tap-to-play

### Deliverables
1. `src/hooks/useFullscreen.ts` — Fullscreen API hook with webkit + iOS fallback
2. `src/components/ui/TitleScreen.tsx` — landing page with Play Fullscreen button
3. Updated `src/App.tsx` — title/game conditional rendering
4. `src/components/three/GameScene.tsx` — root 3D scene with lighting
5. `src/components/three/Table3D.tsx` — procedural green felt table
6. `src/components/three/Card3D.tsx` — procedural card mesh (body, text, stripe)
7. `src/components/three/CardHand.tsx` — fan layout for 1-3 cards
8. `src/components/three/PlayerSlot3D.tsx` — positioned hand per player
9. `src/hooks/useCardInteraction.ts` — tap handler + validation
10. Updated `index.html` with mobile meta tags

### Exit Criteria
- [ ] Opening the URL shows a clean title screen with game title
- [ ] Tapping the button enters fullscreen (or CSS fallback on iOS)
- [ ] After entry, 3D scene loads: table, camera, lighting visible
- [ ] Human player sees 3 face-up cards at the bottom of the screen
- [ ] Bot players show 3 face-down cards at their positions
- [ ] Tapping a valid card dispatches `playCard` on the store
- [ ] Invalid cards are visually disabled (reduced opacity, no interaction)
- [ ] Touch targets are ≥44x44px effective size
- [ ] Scene renders at ≥30 FPS with table + cards

---

## Wave 4: Animation & Loop

### Stories

| Order | Story | Title | Points |
|-------|-------|-------|--------|
| 13 | STORY-013 | Life Tokens & Middle Pile 3D Rendering | 5 |
| 14 | STORY-014 | Card Play Animation & Draw Animation | 5 |
| 15 | STORY-015 | Bot Turn Hook & Game Loop Orchestration | 8 |
| 16 | STORY-016 | HUD Overlay | 5 |

### Goals
- Make the full game loop playable end-to-end
- Add all visual indicators (life tokens, middle pile, deck counter, direction)
- Animate card plays and draws
- Automate bot turns with visible delay

### Deliverables
1. `src/components/three/LifeTokens.tsx` — 3D heart/gem tokens per player
2. `src/components/three/MiddlePile3D.tsx` — stacked cards + value display
3. `src/components/three/DeckPile3D.tsx` — visual deck representation
4. `src/components/three/CardAnimation.tsx` — fly-to-pile animation
5. `src/components/three/CardDrawAnimation.tsx` — deck-to-hand animation
6. `src/hooks/useBotTurn.ts` — timed bot decision hook
7. `src/hooks/useGameLoop.ts` — turn orchestration hook
8. `src/components/ui/HUD.tsx` — overlay container
9. `src/components/ui/TurnIndicator.tsx` — turn messages
10. `src/components/ui/PlayerInfo.tsx` — name + lives overlay
11. `src/components/ui/DeckCounter.tsx` — remaining cards
12. `src/components/ui/DirectionIndicator.tsx` — CW/CCW arrow
13. `src/components/ui/MiddlePileValue.tsx` — current pile value
14. `src/components/ui/SpectatorBanner.tsx` — elimination message

### Exit Criteria
- [ ] Life tokens display correctly (bright for alive, dim for lost)
- [ ] Middle pile shows stacked cards and current value
- [ ] Card play animation flies card from hand to center (~400ms)
- [ ] Card draw animation flies card from deck to hand (~300ms)
- [ ] Bots play automatically after ~1500ms delay
- [ ] Full game loop runs: human → bot → bot → bot → human...
- [ ] Player elimination works (status changes, skipped in turn order)
- [ ] Win condition detected when 1 player remains
- [ ] Deadlock resolved by most lives + lowest index tie-breaker
- [ ] HUD shows correct turn messages, player info, deck count, direction
- [ ] Spectator banner appears when human is eliminated

---

## Wave 5: Assembly & VFX

### Stories

| Order | Story | Title | Points |
|-------|-------|-------|--------|
| 17 | STORY-017 | Full Game Scene Assembly | 3 |
| 18 | STORY-018 | Special Card Visual Effects (VFX) | 5 |
| 19 | STORY-019 | Game Over Screen & Play Again | 3 |

### Goals
- Assemble all 3D components into the final scene layout
- Add dramatic VFX for all special cards and elimination
- Implement the game over / victory screen with Play Again

### Deliverables
1. Finalized `src/components/three/GameScene.tsx` — all components wired
2. `src/components/ErrorBoundary.tsx` — WebGL error fallback
3. `src/components/three/vfx/BombVFX.tsx` — particle explosion
4. `src/components/three/vfx/NuclearVFX.tsx` — radiation ring
5. `src/components/three/vfx/ReverseVFX.tsx` — spinning arrows
6. `src/components/three/vfx/SkipVFX.tsx` — dash trail
7. `src/components/three/vfx/RandomVFX.tsx` — number scramble
8. `src/components/three/vfx/EliminationVFX.tsx` — shatter/fade
9. `src/components/ui/GameOverScreen.tsx` — victory/defeat + Play Again
10. Updated `src/App.tsx` — game over overlay
11. Updated `src/hooks/useGameLoop.ts` — game over detection

### Exit Criteria
- [ ] Full 3D scene renders with table, 4 player slots, middle pile, deck, cards, tokens
- [ ] All 6 VFX trigger correctly on their respective special cards/elimination
- [ ] VFX auto-unmount after duration (no memory leaks)
- [ ] Only one VFX active at a time
- [ ] VFX don't drop FPS below 30
- [ ] Game over screen shows correct winner (victory or defeat message)
- [ ] Play Again button fully resets game and starts new round
- [ ] ErrorBoundary catches WebGL failures with a clean fallback message
- [ ] No React console warnings

---

## Wave 6: Performance & Testing

### Stories

| Order | Story | Title | Points |
|-------|-------|-------|--------|
| 20 | STORY-020 | Mobile Optimization, Performance Tuning & iOS Fallback | 5 |
| 21 | STORY-021 | Integration Testing & End-to-End Game Validation | 8 |

### Goals
- Meet all non-functional requirements (FPS, load time, touch latency, memory)
- Handle iOS Safari fullscreen gracefully
- Validate the complete game with comprehensive integration tests

### Deliverables
1. Performance-optimized R3F components (memo, shared geometry/materials)
2. iOS Safari fullscreen CSS fallback in `useFullscreen`
3. Hardened global CSS (touch-action, overscroll-behavior, user-select)
4. Verified build output < 500KB gzipped
5. `src/test/setup.ts` — test infrastructure
6. `src/test/helpers.ts` — mock factories
7. `src/test/integration/full-game-simulation.test.ts` — 100 automated games
8. `src/test/integration/special-card-chains.test.ts` — effect chains
9. `src/test/integration/deadlock-resolution.test.ts` — deadlock scenarios
10. `src/test/integration/store-reset.test.ts` — clean reset validation
11. `src/test/integration/elimination-flow.test.ts` — elimination flow
12. Component tests for TitleScreen, GameOverScreen, HUD, SpectatorBanner
13. Coverage report: ≥80% for engine + store

### Exit Criteria
- [ ] ≥30 FPS sustained during gameplay on mid-range device profile
- [ ] ≤200ms touch-to-animation latency
- [ ] ≤5s from page load to interactive title screen
- [ ] ≤150MB memory usage after 20 turns
- [ ] JS bundle < 500KB gzipped
- [ ] iOS Safari: CSS fullscreen fallback works, game proceeds
- [ ] Chrome Android: native fullscreen works
- [ ] No browser gestures interfere (pinch-zoom, pull-to-refresh prevented)
- [ ] 100 automated game simulations complete without errors
- [ ] Every game has exactly 1 winner
- [ ] Special card chains produce correct turn order
- [ ] Deadlock resolution is deterministic (most lives, lowest index)
- [ ] Store reset produces clean initial state
- [ ] All component tests pass
- [ ] Coverage: ≥80% lines/branches/functions for engine + store

---

## Risk Register

| Wave | Risk | Impact | Likelihood | Mitigation |
|------|------|--------|------------|------------|
| 1 | Dependency version conflicts | Medium | Low | Pin versions per architecture doc; use `npm install` with exact versions |
| 1 | Windows path issues in configs | Low | Medium | Use forward slashes; test config files on Windows |
| 2 | Special card chain edge cases | Medium | Medium | Write exhaustive unit tests for all effect combinations |
| 2 | Zustand immer complexity with nested state | Medium | Medium | Keep slices focused; test each action independently |
| 2 | Game loop infinite re-render | High | Medium | Use refs for phase tracking; avoid useEffect loops |
| 3 | R3F performance on first render | Medium | Medium | Cap DPR, disable AA; profile early |
| 3 | iOS Safari fullscreen API limitation | Medium | High | CSS fallback implemented in STORY-020; graceful degradation in STORY-010 |
| 3 | Touch event conflicts with browser gestures | Medium | Medium | `touch-action: none` on canvas; prevent defaults |
| 4 | Game loop re-entrancy / infinite loops | High | Medium | Use phase refs; check gameStatus before processing |
| 4 | Animation timing conflicts with state updates | Medium | Medium | Animation queue ensures sequential processing |
| 5 | VFX particle memory leaks | Medium | Low | Dispose geometry/material on unmount; cap particle counts |
| 5 | VFX drops FPS below 30 | Medium | Medium | Low particle counts (50-100); use Points not meshes |
| 6 | Performance on low-end devices | High | Medium | Profile early; reduce geometry; shared materials; frameloop optimization |
| 6 | flaky integration tests due to randomness | Low | Medium | Mock `Math.random` for deterministic tests |
| All | Scope creep | High | High | Stick to MVP scope defined in PRD; defer enhancements |

---

## Definition of Done (Per Story)

Every story must satisfy ALL of the following before being marked as **Done**:

1. **Code Complete:** All files specified in the story scope are created and functional
2. **Unit Tests Written:** All test requirements from the story are implemented and passing
3. **Tests Pass Locally:** `npm test` exits with code 0
4. **Build Succeeds:** `npm run build` completes without errors
5. **Type Safety:** `npx tsc --noEmit` passes with no type errors
6. **Lint Clean:** `npm run lint` has zero fatal errors
7. **Dev Notes Created:** `docs/dev-notes/dev-notes-STORY-xxx.md` documents implementation decisions
8. **Scrum Master Review:** Completion review created and passes (`docs/queue/completion-review-STORY-xxx.md`)
9. **QA Review:** QA review passes (bugs fixed, acceptance criteria verified)
10. **Story Closed:** Story status updated to Done

---

## Flow Gates (Between Stories)

Before moving from one story to the next, the following gates must pass:

### Gate: Between Stories in Same Wave
- [ ] Previous story's tests all pass (green)
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Previous story's completion review exists

### Gate: Between Waves
All stories in the current wave must be **Done** (all Definition of Done criteria met and QA passed). Additionally:

- [ ] **Wave 1 → 2:** All engine primitives tested; types compile; project scaffolding verified
- [ ] **Wave 2 → 3:** Full game engine works; Zustand store can run a simulated game programmatically
- [ ] **Wave 3 → 4:** Title screen transitions to 3D scene; cards render and respond to taps
- [ ] **Wave 4 → 5:** Full game loop plays end-to-end; animations work; HUD shows information
- [ ] **Wave 5 → 6:** All visual elements complete; VFX work; game over/replay works
- [ ] **Wave 6 → MVP Complete:** All NFRs met; 100 game simulations pass; coverage targets met

---

## Recommended Implementation Order

### Detailed Sequence with Rationale

| Step | Story | Rationale |
|------|-------|-----------|
| 1 | **STORY-001** | Zero dependencies. Everything else needs the project scaffolded first. Install deps, configure tools, create folder structure. |
| 2 | **STORY-002** | Depends only on 001. Every other module imports types from `src/types/`. Must exist before any logic code. |
| 3 | **STORY-003** | Depends on 001 + 002. Deck manager is the most foundational engine module — used by game init, dealing, drawing. Also includes utility functions (`randomInt`) needed by special cards. |
| 4 | **STORY-004** | Depends on 001 + 002. Turn management is parallel to 003 but listed after for sequential implementation. Uses types only (no engine deps beyond types). |
| 5 | **STORY-005** | Depends on 003 (needs `randomInt` from utils). Special card effects are pure functions, small scope, quick to complete. |
| 6 | **STORY-006** | Depends on 003 (needs `isCardPlayable`). Bot AI is a pure decision tree, straightforward implementation. |
| 7 | **STORY-007** | Depends on 003 (needs `hasPlayableCard`). Win condition is the simplest engine module. |
| 8 | **STORY-008** | Depends on 003 + 004. Ties deck, dealing, and players together into `initGame()`. |
| 9 | **STORY-009** | Depends on ALL engine modules (003-008). The Zustand store connects engine to React. Must come after all engine modules are done and tested. **Largest single story (8 pts).** |
| 10 | **STORY-010** | Depends on 009. Title screen and fullscreen entry need the store to trigger `initGame()`. First visual deliverable. |
| 11 | **STORY-011** | Depends on 009 + 010. 3D Canvas needs the store and App.tsx structure from 010. Establishes the 3D rendering foundation. |
| 12 | **STORY-012** | Depends on 009 + 011. Cards render inside the 3D scene, need Canvas + types + store. **Most complex 3D story (8 pts).** |
| 13 | **STORY-013** | Depends on 009 + 011 + 012. Life tokens and middle pile reuse Card3D. Adds remaining 3D elements. |
| 14 | **STORY-014** | Depends on 009 + 012 + 013. Card animations need card positions from hands, and pile positions from middle pile. |
| 15 | **STORY-015** | Depends on most prior stories. Game loop is the "brain" that connects engine, store, animation, and card interaction. **Most complex hook (8 pts).** |
| 16 | **STORY-016** | Depends on 009 + 015. HUD overlays read turn messages set by the game loop. Can start in parallel with 015 (static structure), finalized after. |
| 17 | **STORY-017** | Depends on 011-014. Assembles all 3D components into the final scene. Error boundary added here. |
| 18 | **STORY-018** | Depends on 009 + 014 + 017. VFX components plug into the assembled scene and animation queue. |
| 19 | **STORY-019** | Depends on 009 + 015 + 016. Game over screen is a UI overlay that appears when the game loop detects a winner. |
| 20 | **STORY-020** | Depends on ALL visual stories. Performance audit, iOS fallback polish, cross-browser hardening. |
| 21 | **STORY-021** | Depends on EVERYTHING. Final validation with 100+ automated game simulations and comprehensive testing. |

### Key Dependency Chains (Critical Path)

```
001 → 002 → 003 → 008 → 009 → 010 → 011 → 012 → 014 → 015 → 019 → 020 → 021
```

This is the **critical path**: the longest sequence of dependencies. Any delay on the critical path delays the entire project.

### Parallelization Opportunities

Within each wave, these stories can be developed in parallel (if working with multiple developers):
- **Wave 2:** Stories 005, 006, 007 can all be developed in parallel (independent of each other)
- **Wave 4:** Stories 013 and 014 could overlap (pile/tokens then animations)
- **Wave 5:** Stories 018 and 019 can be developed in parallel (VFX is independent of game over screen)

---

*Last updated: 2025-05-30*
