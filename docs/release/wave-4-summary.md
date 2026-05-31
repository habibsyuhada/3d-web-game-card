# Wave 4 Closing Report: Animation & Game Loop

**Wave:** Wave 4 — Animation & Game Loop  
**Project:** Zinky Zoogle 3D Web Card Game  
**Start Date:** 2026-05-31  
**End Date:** 2026-05-31  
**Status:** **COMPLETE**  
**Total Stories:** 4 / 4  
**Total Points:** 23 / 23  

---

## 1. Wave Goal Recap

> **Goal:** Card animations, life tokens, middle pile visuals, game loop orchestration, and HUD overlays.  
> **Exit Criteria:** Full turn loop works end-to-end: human plays → animation → bot plays → animation → life loss → elimination → win detection.

Wave 4 brought the Zinky Zoogle card game from a static 3D scene with interactive cards into a fully playable game with animated card movements, automated bot opponents, turn orchestration, and a rich HUD overlay in four progressive layers:

1. **Life Tokens & Middle Pile 3D Rendering (STORY-013)** — Procedural 3D life token gem meshes (5 red spheres per player, dimmed when lost), a middle pile stack rendering up to 5 played cards with a Y-offset stack pattern and pile value text, and a deck pile with height proportional to remaining cards. All integrated into `PlayerSlot3D` and `GameScene` with React.memo, useMemo shared geometry, and granular Zustand selectors.

2. **Card Play Animation & Draw Animation (STORY-014)** — `framer-motion-3d` powered `CardAnimation` (hand → pile, 400ms easeOut) and `CardDrawAnimation` (deck → hand, 300ms). `useAnimationQueue` hook processes animations sequentially with `isAnimating` flag. `useCardInteraction` updated to enqueue animations after dispatch. `GameScene` renders animations conditionally from the queue.

3. **Bot Turn Hook & Game Loop Orchestration (STORY-015)** — `useBotTurn` hook with 1500ms visible delay, `decideBotPlay()` integration, animation enqueueing, post-action flow (elimination → winner → deadlock), and ref-guard patterns preventing re-entrancy. `useGameLoop` hook orchestrates turn flow: skips eliminated players, sets human turn messages, processes post-animation flow. `TurnIndicator` overlay component with blue glow for human turns, pulsing gray for bot thinking. `App.tsx` restructured with `GameContainer` component.

4. **HUD Overlay (STORY-016)** — Composite HTML overlay (`absolute inset-0 pointer-events-none z-10`) with 6 child components: `PlayerInfo` (4 instances, name + lives + active glow + eliminated state), `DeckCounter` (count + empty warning), `DirectionIndicator` (↻/↺ arrows), `MiddlePileValue` (large centered number), `SpectatorBanner` (conditional elimination notice). TurnIndicator from STORY-015 wrapped inside the HUD container.

**Exit criteria achieved:** User taps a card → card flies to pile → next player's turn → bots play automatically with visible delay → card animations for all plays and draws → lives decrement with token visual changes → player elimination at 0 lives → winner detection → HUD shows all game information throughout. All 344 tests pass. Build and lint are clean.

---

## 2. Stories Delivered

| # | Story ID | Title | Points | Complexity | SM Review | QA Review | Defects | Status | Close Date |
|---|----------|-------|--------|------------|-----------|-----------|---------|--------|------------|
| 1 | STORY-013 | Life Tokens & Middle Pile 3D Rendering | 5 | Medium | APPROVED | PASS | 0 | **CLOSED** | 2026-05-31 |
| 2 | STORY-014 | Card Play Animation & Draw Animation | 5 | Medium-High | APPROVED | PASS | 0 | **CLOSED** | 2026-05-31 |
| 3 | STORY-015 | Bot Turn Hook & Game Loop Orchestration | 8 | High | APPROVED | PASS | 0 | **CLOSED** | 2026-05-31 |
| 4 | STORY-016 | HUD Overlay | 5 | Medium | APPROVED | PASS | 0 | **CLOSED** | 2026-05-31 |
| | **TOTAL** | | **23** | | | | **0** | **4/4 CLOSED** | |

---

## 3. Total Wave Metrics

| Metric | Value |
|--------|-------|
| **Stories Delivered** | 4 / 4 (100%) |
| **Story Points Earned** | 23 / 23 (100%) |
| **Total Tests (end of wave)** | 344 (all passing, 0 failures) |
| **New Tests (Wave 4)** | 115 (20 + 23 + 26 + 46) |
| **Test Files (end of wave)** | 30 |
| **New Test Files (Wave 4)** | 13 |
| **3D Components (new)** | 4 (see table below) |
| **Animation Components** | 2 (CardAnimation, CardDrawAnimation) |
| **React Hooks (new)** | 3 (`useAnimationQueue`, `useBotTurn`, `useGameLoop`) |
| **UI Components (new)** | 7 (TurnIndicator, HUD, PlayerInfo, DeckCounter, DirectionIndicator, MiddlePileValue, SpectatorBanner) |
| **QA Defects Found** | 0 across all 4 stories |
| **QA Regressions** | 0 |
| **Build Failures** | 0 |
| **Lint Violations** | 0 |

### 3D Components Delivered

| # | Component | Story | Description |
|---|-----------|-------|-------------|
| 1 | `LifeTokens` | STORY-013 | Row of sphere gem meshes (5 per player), bright red active / dim gray lost |
| 2 | `MiddlePile3D` | STORY-013 | Central played-card stack (up to 5 cards, Y-offset stacking, pile value text) |
| 3 | `DeckPile3D` | STORY-013 | Visual draw pile with height proportional to remaining cards |
| 4 | `CardAnimation` | STORY-014 | framer-motion-3d card fly-to-pile (400ms easeOut) |
| 5 | `CardDrawAnimation` | STORY-014 | framer-motion-3d card draw from deck (300ms) |

### Hooks Delivered

| # | Hook | Story | Description |
|---|------|-------|-------------|
| 1 | `useAnimationQueue` | STORY-014 | Sequential animation processor with `isAnimating` flag and stale-closure prevention |
| 2 | `useBotTurn` | STORY-015 | Bot decision hook with 1500ms delay, `decideBotPlay()`, ref-guard re-entrancy prevention |
| 3 | `useGameLoop` | STORY-015 | Turn orchestration hook — eliminated skip, human messages, post-action flow |

### UI Components Delivered

| # | Component | Story | Description |
|---|-----------|-------|-------------|
| 1 | `TurnIndicator` | STORY-015 | Turn message overlay — blue glow (human), pulsing gray (bot), ARIA accessible |
| 2 | `HUD` | STORY-016 | HUD container — absolute overlay, empty-state guard, composes all children |
| 3 | `PlayerInfo` | STORY-016 | Per-player label — name, lives (♥ X/5), active glow, eliminated state |
| 4 | `DeckCounter` | STORY-016 | Deck count display — card emoji + count, orange warning at 0 |
| 5 | `DirectionIndicator` | STORY-016 | Direction arrow — ↻/↺, cyan/amber, ARIA label |
| 6 | `MiddlePileValue` | STORY-016 | Pile value — large yellow number or em-dash when empty |
| 7 | `SpectatorBanner` | STORY-016 | Spectator alert — conditional on human elimination, role="alert" |

---

## 4. Wave Acceptance Criteria (All Stories)

| Story | AC ID | Criterion | Status |
|-------|-------|-----------|--------|
| STORY-013 | AC-003 | Life tokens visible per player (5 gems) | **PASS** |
| STORY-013 | AC-009 | Middle pile shows played cards | **PASS** |
| STORY-013 | AC-010 | Deck pile shows remaining cards | **PASS** |
| STORY-013 | AC-021 | >= 30 FPS maintained with 3D elements | **PASS** |
| STORY-014 | AC-011 | Card animation from hand to pile on play | **PASS** |
| STORY-014 | AC-012 | Card draw animation from deck to hand | **PASS** |
| STORY-015 | AC-007 | No valid cards → lose 1 life, turn passes | **PASS** |
| STORY-015 | AC-013 | Lives reach 0 → eliminated | **PASS** |
| STORY-015 | AC-014 | Spectator mode after elimination | **PASS** |
| STORY-015 | AC-015 | Victory when 1 player remains | **PASS** |
| STORY-015 | AC-017 | Bot plays with 1-2 second delay | **PASS** |
| STORY-015 | AC-018 | Bot plays smallest valid number card | **PASS** |
| STORY-015 | AC-019 | Bot plays special when no valid numbers | **PASS** |
| STORY-015 | AC-023 | Deadlock resolves correctly | **PASS** |
| STORY-016 | AC-002 | 3D game scene loads with HUD | **PASS** |
| STORY-016 | AC-003 | Player positions visible with life tokens and names | **PASS** |
| STORY-016 | AC-008 | Direction indicator changes after Reverse | **PASS** |
| STORY-016 | AC-014 | Spectator banner when eliminated | **PASS** |
| STORY-016 | AC-015 | Whose turn always visible | **PASS** |
| STORY-016 | AC-022 | Portrait mode, touch targets adequate | **PASS** |

**Total Wave 4 Acceptance Criteria: 20/20 VERIFIED**

---

## 5. Test Coverage Growth

| After Story | Wave | Test Files | Total Tests | New Tests Added |
|-------------|------|-----------|-------------|-----------------|
| STORY-012 | W3 | 17 | 229 | — |
| STORY-013 | W4 | 19 | 249 | 20 (life tokens + piles) |
| STORY-014 | W4 | 22 | 272 | 23 (animations + queue) |
| STORY-015 | W4 | 24 | 298 | 26 (bot turn + game loop) |
| STORY-016 | W4 | 30 | 344 | 46 (HUD + 6 components) |

**Wave 4 Test Growth:** 229 → 344 tests (+115 tests across 13 new test files)

### Wave 4 Test Files

| # | Test File | Story | Tests | Coverage Focus |
|---|-----------|-------|-------|---------------|
| 1 | `LifeTokens.test.tsx` | STORY-013 | 7 | Token rendering, active/lost states, max lives |
| 2 | `MiddlePile3D.test.tsx` | STORY-013 | 7 | Card stacking, pile value, empty state |
| 3 | `DeckPile3D.test.tsx` | STORY-013 | 6 | Height proportion, empty marker, card count |
| 4 | `CardAnimation.test.tsx` | STORY-014 | 8 | Fly-to-pile, duration, face states, disabled |
| 5 | `CardDrawAnimation.test.tsx` | STORY-014 | 6 | Draw path, duration, disabled state |
| 6 | `useAnimationQueue.test.ts` | STORY-014 | 9 | Sequential processing, isAnimating, stale closure |
| 7 | `useBotTurn.test.ts` | STORY-015 | 15 | Thinking message, play/draw, delay, guards, elimination |
| 8 | `useGameLoop.test.ts` | STORY-015 | 11 | Eliminated skip, human message, post-action, infinite loop guard |
| 9 | `HUD.test.tsx` | STORY-016 | 11 | Render guard, children, spectator, pointer-events |
| 10 | `PlayerInfo.test.tsx` | STORY-016 | 10 | Name, lives, active, eliminated, positions |
| 11 | `DeckCounter.test.tsx` | STORY-016 | 5 | Count, warning, reactivity |
| 12 | `DirectionIndicator.test.tsx` | STORY-016 | 6 | Arrows, labels, direction change, aria-label |
| 13 | `MiddlePileValue.test.tsx` | STORY-016 | 8 | Numeric/empty, reactivity, aria, colors |
| 14 | `SpectatorBanner.test.tsx` | STORY-016 | 6 | Hidden/visible, message, role=alert |

---

## 6. Engineering Contributions

### Animation Queue Architecture (STORY-014)

Sequential animation processing through `useAnimationQueue` ensures card fly-to-pile and draw animations play one at a time without overlap. The hook uses local `useState` to avoid excessive re-renders, `processingRef` to prevent double-processing in React strict mode, and `getState()` from the Zustand store to avoid stale closure issues. The `isAnimating` flag gates bot turns and game loop processing.

### Bot Turn Ref-Guard Pattern (STORY-015)

Complex stateful bot decision-making required three ref-guard patterns for correctness:

| Ref | Purpose |
|-----|---------|
| `pendingPlayRef` | Prevents duplicate play dispatches during animation |
| `prevAnimatingRef` | Detects animation completion transitions |
| `timerActiveRef` | Prevents duplicate timeouts in strict mode |

This pattern ensures bots make decisions exactly once per turn, even with React 19 strict mode double-mounting and concurrent animation state changes.

### Game Loop Orchestration (STORY-015)

The `useGameLoop` hook serves as the central turn coordinator, connecting the Zustand store's turn management to the React rendering cycle. Key architectural decisions:
- Bot turns are no-ops in `useGameLoop` (handled exclusively by `useBotTurn`)
- `humanMessageSetRef` prevents repeated message setting
- Post-action flow runs only on animation transition (true → false)
- Processing stops when `gameStatus === 'finished'`

### HUD Overlay Architecture (STORY-016)

The HUD uses a layered HTML overlay approach: `pointer-events-none` on the container allows all 3D canvas interactions to pass through, while individual components read game state from Zustand selectors independently. Position mapping via `getPositionClasses()` switch statement handles 4 player slots (bottom/left/top/right) with Tailwind utility classes.

---

## 7. Build & Performance Status

### Production Build

```
$ npm run build
> tsc -b && vite build

✓ Modules transformed
dist/index.html                     — HTML entry
dist/assets/index-*.css             — Styles
dist/assets/index-*.js              — App bundle
dist/assets/three-vendor-*.js       — Three.js split (~1MB, ~304KB gzip)
✓ built successfully
```

| Check | Status |
|-------|--------|
| TypeScript compilation (`tsc -b`) | PASS — zero errors |
| Vite production build | PASS |
| ESLint | PASS — 0 errors, 0 warnings |

### Test Suite

```
$ npm test
Test Files  30 passed (30)
     Tests  344 passed (344)
```

| Check | Status |
|-------|--------|
| All tests pass | PASS — 344/344 |
| Zero failures | PASS |
| Zero regressions | PASS |

**Build & Performance: ALL PASS**

---

## 8. Risk Register

| # | Risk | Source | Severity | Status |
|---|------|--------|----------|--------|
| 1 | `framer-motion-3d` deprecated on npm | STORY-001 (carried) | Low | Accepted |
| 2 | `esbuild` <= 0.24.2 moderate vulnerability | STORY-001 (carried) | Low | Accepted |
| 3 | `three-mesh-bvh` deprecation warning | STORY-001 (carried) | Info | Accepted |
| 4 | Vitest jsdom cold start ~4.5s | STORY-001 (carried) | Info | Accepted |
| 5 | Three-vendor chunk ~1MB (304KB gzip) | STORY-011 | Low | Accepted — manual chunking possible |
| 6 | sRGBEncoding/LinearEncoding warnings | STORY-011 | Info | Third-party version mismatch, non-blocking |
| 7 | R3F pointer events untestable in jsdom | STORY-012 | Low | Composition verified; manual testing recommended |
| 8 | 320px HUD overlap risk | STORY-016 | Low | Accepted — deferred to STORY-020 |
| 9 | TurnIndicator fixed vs HUD absolute stacking | STORY-016 | Info | Revisitable in STORY-019 |
| 10 | No direction-change animation | STORY-016 | Info | Optional, CSS transition present |

**Risk Assessment:** All risks are Low or Info severity. No High or Critical risks. No blocking risks.

---

## 9. Wave Completion Sign-Off

### Exit Criteria Verification

| Exit Criterion | Status | Evidence |
|----------------|--------|---------|
| Human plays card → animation | PASS | CardAnimation flies card hand→pile (STORY-014) |
| Bot plays automatically | PASS | useBotTurn with 1500ms delay + decideBotPlay (STORY-015) |
| Bot animation visible | PASS | GameScene renders CardAnimation from queue (STORY-014) |
| Life loss on pass | PASS | useBotTurn/useGameLoop → handlePostAction (STORY-015) |
| Life tokens update | PASS | LifeTokens react to player.lives (STORY-013) |
| Elimination at 0 lives | PASS | handlePostAction → eliminatePlayer (STORY-015) |
| Winner detection | PASS | checkAndSetWinner in post-action flow (STORY-015) |
| Turn flow human→bot→bot→bot→human | PASS | useGameLoop advanceTurn with eliminated skip (STORY-015) |
| HUD shows turn messages | PASS | TurnIndicator inside HUD (STORY-016) |
| HUD shows player info | PASS | 4× PlayerInfo with names and lives (STORY-016) |
| HUD shows deck count | PASS | DeckCounter with reactive count (STORY-016) |
| HUD shows direction | PASS | DirectionIndicator ↻/↺ (STORY-016) |
| HUD shows pile value | PASS | MiddlePileValue centered number (STORY-016) |
| Card draw animation | PASS | CardDrawAnimation deck→hand (STORY-014) |
| Middle pile rendering | PASS | MiddlePile3D with stacked cards (STORY-013) |
| Build clean | PASS | tsc + vite build succeed |
| Lint clean | PASS | ESLint 0 errors, 0 warnings |
| Tests pass | PASS | 344/344 |
| All ACs satisfied | PASS | 20/20 acceptance criteria verified |

### Team Sign-Off

| Role | Date | Wave 4 Decision |
|------|------|----------------|
| Developer | 2026-05-31 | All 4 stories implemented and documented |
| Scrum Master | 2026-05-31 | **APPROVED** — 4/4 stories passed all gates |
| QA Engineer | 2026-05-31 | **PASSED** — 4/4 stories, 0 defects total |
| Scrum Master (Wave Close) | 2026-05-31 | **WAVE 4 COMPLETE** |

---

## 10. Next Wave Preview — Wave 5: Assembly & VFX

> **Goal:** Full scene assembly, special card visual effects, and game over screen.  
> **Exit Criteria:** Complete game visually cohesive; all special cards trigger VFX; game ends with victory/defeat screen and Play Again works.  
> **Total Points:** 11 | **Stories:** 3

| # | Story ID | Title | Points | Complexity | Dependencies |
|---|----------|-------|--------|------------|--------------|
| 1 | STORY-017 | Full Game Scene Assembly | 3 | Medium | STORY-011, 012, 013, 014 |
| 2 | STORY-018 | Special Card Visual Effects (VFX) | 5 | Medium-High | STORY-009, 014, 017 |
| 3 | STORY-019 | Game Over Screen & Play Again | 3 | Medium | STORY-009, 015, 016 |

**Wave 5 Implementation Order:** 017 → 018 → 019  
(Assemble scene first, then add VFX into it, then game over screen which needs game loop.)

**Key Deliverables for Wave 5:**
- Full assembled game scene with all 3D components in final positions
- VFX for special cards (Skip, Reverse, Swap, Peek, Random)
- Elimination animation/effects
- Game over screen (victory/defeat)
- Play Again functionality

---

## Wave 4: Animation & Game Loop — Final Status

```
+================================================================+
|         WAVE 4: ANIMATION & GAME LOOP                            |
|                                                                  |
|   Stories:         4 / 4   (100%)           ████████████         |
|   Points:         23 / 23  (100%)           ████████████         |
|   Tests:          344 (all passing)         ████████████         |
|   3D Components:  5 (tokens, piles, anims)  ████████████         |
|   Hooks:          3 (queue, bot, loop)      ████████████         |
|   UI Components:  7 (HUD + 6 children)      ████████████         |
|   Defects:        0                         ████████████         |
|   Build:          PASS                      ████████████         |
|   Lint:           CLEAN                     ████████████         |
|                                                                  |
|                    STATUS: COMPLETE                              |
+================================================================+
```

---

*Wave 4 closed on 2026-05-31 by Scrum Master.*  
*The game loop is now fully playable. Users can play cards, see animations, compete against bots, and view all game information via the HUD. Wave 5 begins the assembly and visual effects layer.*
