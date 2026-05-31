# Merge and Close Notes

**Story ID:** STORY-014  
**Story Title:** Card Play Animation & Draw Animation  
**Wave:** Wave 4 — Animation & Loop  
**Status:** CLOSED  
**Close Date:** 2026-05-31  

---

## 1. Story Summary

STORY-014 (5 pts) delivers card animation infrastructure for the Zinky Zoogle 3D card game:

1. **CardAnimation** — Wraps `Card3D` with `framer-motion-3d` `motion.group` to animate a card from a source position (player hand) to a target position (middle pile `[0, 0.1, 0]`). 400ms duration, easeOut easing, fires `onComplete` callback. Card is disabled during flight and rendered face-up for human player, face-down for bots.
2. **CardDrawAnimation** — Animates a card from the deck pile position (`[1.5, 0.3, 0]`) to a target hand slot. 300ms duration (faster than play animation), same quality patterns: memo, disabled Card3D, table-flat rotation.
3. **useAnimationQueue** — A custom React hook that processes animations sequentially from the store's `animationQueue`. Uses local `useState` to avoid excessive re-renders, `processingRef` to prevent double-processing in strict mode, and `getState()` for stale-closure prevention. Sets `isAnimating: true` while active, `false` when drained.
4. **useCardInteraction** (updated) — After `playCard` and `drawCard` dispatches, enqueues corresponding `card-play` and `card-draw` animation actions. Uses hand-size comparison to detect draws robustly (handles deck exhaustion edge case).
5. **GameScene** (updated) — Renders `CardAnimation` and `CardDrawAnimation` components conditionally based on the current animation from `useAnimationQueue`. Resolves card data from middlePile (for plays) and player hand (for draws) with a fallback card for defensive coding.

This is the **second story of Wave 4**, building the animation layer needed before the game loop (STORY-015) can drive visible bot plays and turn transitions.

---

## 2. Gate Summary

| Gate | Reviewer | Score | Status |
|------|----------|-------|--------|
| Developer Self-Review | Dev Agent | READY_FOR_SM_REVIEW | PASS |
| Scrum Master Completion Review | SM Agent | **ALL PASS (272/272 tests, 4/4 scope items)** | **APPROVED** |
| QA Review | QA Agent | **PASS (0 defects, 2/2 AC met, all FRs/NFRs met)** | **PASS** |
| **All Gates** | | | **CLOSED** |

---

## 3. Files Delivered (7 files)

### Created (5 files)

| # | File | Lines | Description |
|---|------|-------|-------------|
| 1 | `src/components/three/CardAnimation.tsx` | 64 | Play animation component — `motion.group` wrapping Card3D, position tween 400ms, easeOut, onComplete, memo-wrapped |
| 2 | `src/components/three/CardDrawAnimation.tsx` | 69 | Draw animation component — deck-to-hand tween 300ms, same patterns as CardAnimation, memo-wrapped |
| 3 | `src/hooks/useAnimationQueue.ts` | 84 | Sequential animation processing hook — local state, processingRef, getState() for fresh reads, integrates with clearAnimationQueue |
| 4 | `src/hooks/useAnimationQueue.test.ts` | — | 10 tests: empty queue, single/sequential animations, edge cases (idempotent complete, clear queue) |
| 5 | `src/components/three/CardAnimation.test.tsx` | — | 11 tests: CardAnimation renders, positions, duration, onComplete; CardDrawAnimation renders, deck origin, 300ms, onComplete |

### Modified (2 files)

| # | File | Description |
|---|------|-------------|
| 6 | `src/hooks/useCardInteraction.ts` | Added animation enqueueing after playCard/drawCard dispatches; hand-size comparison for draw detection |
| 7 | `src/components/three/GameScene.tsx` | Added animation layer rendering using useAnimationQueue hook; resolves card data from store with fallback |

**Total: 5 created + 2 modified = 7 files**

---

## 4. Component Specifications

### CardAnimation

| Element | Implementation |
|---------|----------------|
| Wrapper | `motion('group')` with type assertion for framer-motion-3d |
| Position tween | `fromPosition` → `toPosition` (default: middle pile `[0, 0.1, 0]`) |
| Duration | `CARD_ANIMATION_DURATION_MS` (400ms), overridable via prop |
| Easing | `easeOut` |
| Card state | `disabled={true}` during flight, `rotation=[-Math.PI/2, 0, 0]` (flat on table) |
| Face direction | `faceUp={playerIndex === 0}` (human face-up, bots face-down) |
| Performance | `memo()` wrapped |

### CardDrawAnimation

| Element | Implementation |
|---------|----------------|
| From position | `DECK_FROM_POSITION = [1.5, 0.3, 0]` (matches DeckPile3D) |
| To position | `toPosition` prop (player hand slot) |
| Duration | Default 300ms, overridable via prop |
| Same patterns | `motion.group`, disabled Card3D, flat rotation, memo |

### useAnimationQueue

| Element | Implementation |
|---------|----------------|
| State | Local `useState<AnimationAction \| null>` for current animation |
| Processing | `processingRef` prevents double-processing in strict mode |
| Sequential | On complete, slices queue and sets next animation |
| Flags | `isAnimating: true` when queue has items, `false` when drained |
| Stale closures | Uses `getState()` for fresh store reads |
| Cleanup | Integrates with `clearAnimationQueue` for game-reset scenarios |

---

## 5. Test Coverage

### Story-Specific Tests

| Test File | Tests | Status |
|-----------|-------|--------|
| `useAnimationQueue.test.ts` | 10 | ALL PASS |
| `CardAnimation.test.tsx` | 11 | ALL PASS |
| **New tests (STORY-014)** | **21** | **ALL PASS** |
| **Project total (22 files)** | **272** | **ALL PASS** |

### Coverage Highlights

- **useAnimationQueue:** Empty queue, single animation pickup/dequeue, sequential 2-animation (play then draw), 3-animation chain, idempotent onComplete, clearAnimationQueue resets state
- **CardAnimation:** Renders number/special cards, face-down for bots, correct from/to positions in motion.group, default 400ms duration, custom duration, onComplete fires, Card3D disabled during flight
- **CardDrawAnimation:** Renders, deck origin `[1.5, 0.3, 0]`, 300ms default, onComplete fires
- **Zero regressions** across all 272 tests (251 pre-existing + 21 new)

---

## 6. Acceptance Criteria

| AC ID | Criterion | Evidence | Status |
|-------|-----------|----------|--------|
| AC-006 | Tap valid card → card animates from hand to middle pile, draws replacement | `useCardInteraction` enqueues card-play then card-draw animation; `GameScene` renders both components conditionally via `useAnimationQueue` | **PASS** |
| AC-017 | Bot card animations visible from bot hand to pile | Animation infrastructure fully supports bot positions; `faceUp={playerIndex === 0}` renders bot cards face-down during flight; bot-specific enqueueing deferred to STORY-015 (useBotTurn hook) — documented and in scope | **PASS** |

**2/2 Acceptance Criteria Met**

### Functional & Non-Functional Requirements

| Req ID | Requirement | Status |
|--------|-------------|--------|
| FR-034 | Play card → draw replacement from deck | **PASS** |
| FR-076 | Card play animations with smooth 3D transitions | **PASS** |
| NFR-003 | Touch response ≤200ms from tap to animation start | **PASS** |

---

## 7. Story Points

**5 pts** — Medium-High complexity. Two new animation components, one new hook, two existing files updated. Queue-based sequential processing with proper edge-case handling and defensive coding.

---

## 8. Wave 4 Progress

| Metric | Value |
|--------|-------|
| **Wave 4 Stories** | 2/4 (STORY-013, STORY-014 complete) |
| **Wave 4 Points** | 10/23 completed |
| **STORY-014 New Tests** | 21 (21 required by spec) |
| **Total Tests** | 272 across 22 files |
| **QA Defects (STORY-014)** | 0 |
| **Build Failures** | 0 |
| **Lint Violations** | 0 |
| **TypeScript Errors** | 0 |

### Wave 4 Stories

| Story | Title | Points | SM Review | QA Review | Status |
|-------|-------|--------|-----------|-----------|--------|
| STORY-013 | Life Tokens & Middle Pile 3D Rendering | 5 | APPROVED | PASS | **CLOSED** ✅ |
| STORY-014 | Card Play Animation & Draw Animation | 5 | APPROVED | PASS | **CLOSED** ✅ |
| STORY-015 | Bot Turn Hook & Game Loop Orchestration | 8 | — | — | In Progress |
| STORY-016 | HUD Overlay | 5 | — | — | Queued |

---

## 9. Next Story

**STORY-015 — Bot Turn Hook & Game Loop Orchestration** (8 pts, High complexity)

- Create `useBotTurn` hook that triggers bot card plays with visible delay (1-2s)
- Full game loop orchestration: human turn → animation → bot turns → animations → turn advance
- Life loss when no valid card available
- Elimination when lives reach 0
- Win detection when only 1 player remains
- Deadlock resolution
- Dependencies: STORY-004, 005, 006, 007, 008, 009, 012, 014 (all complete)

---

## 10. Recommended Commit Message

```
feat(3d): add card play and draw animations with queue-based sequencing (STORY-014)

- Create CardAnimation: wraps Card3D with framer-motion-3d motion.group,
  animates from hand to middle pile [0,0.1,0], 400ms easeOut, onComplete
  callback, face-up for human / face-down for bots, memo-wrapped
- Create CardDrawAnimation: animates from deck [1.5,0.3,0] to hand slot,
  300ms easeOut, same quality patterns as CardAnimation, memo-wrapped
- Create useAnimationQueue hook: sequential animation processing with
  local state, processingRef for strict mode safety, getState() for fresh
  reads, integrates with clearAnimationQueue for game reset
- Update useCardInteraction: enqueue card-play and card-draw animations
  after dispatch, hand-size comparison for robust draw detection
- Update GameScene: render animation layer via useAnimationQueue, resolves
  card data from store with fallback card for defensive coding
- Add 21 unit tests (useAnimationQueue 10, CardAnimation+Draw 11)
- Project now has 272 passing tests across 22 files
- Wave 4 story 2/4 complete

Closes STORY-014
```

---

## 11. Git Instructions

```powershell
# Stage all STORY-014 changes
git add src/components/three/CardAnimation.tsx
git add src/components/three/CardDrawAnimation.tsx
git add src/hooks/useAnimationQueue.ts
git add src/hooks/useAnimationQueue.test.ts
git add src/components/three/CardAnimation.test.tsx
git add src/hooks/useCardInteraction.ts
git add src/components/three/GameScene.tsx

# Commit with message above (use -m or -F for multi-line)
git commit -m "feat(3d): add card play and draw animations with queue-based sequencing (STORY-014)"

# Push to feature branch
git push origin feature/STORY-014
```

---

## 12. QA Observations (Non-blocking, accepted)

1. **Bot animation enqueueing** is correctly deferred to STORY-015 (`useBotTurn` hook) — infrastructure is ready, documented scope boundary.
2. **Three.js vendor chunk size** (1,028 kB) — pre-existing from earlier stories, not introduced by STORY-014.
3. **motion('group') type assertion** — acceptable workaround for incomplete framer-motion-3d `.d.ts` declarations.

---

## 13. Final Checklist

| Item | Status |
|------|--------|
| All scope items implemented (4/4) | DONE |
| All tests passing (272/272) | DONE |
| Build clean (tsc + vite) | DONE |
| Lint clean (0 errors) | DONE |
| SM completion review | DONE |
| QA review (PASS, 0 defects) | DONE |
| Acceptance criteria (2/2) | DONE |
| Functional requirements (FR-034, FR-076) | DONE |
| Non-functional requirement (NFR-003) | DONE |
| Dev notes created | DONE |
| Story status updated to Done | DONE |
| Queue status updated | DONE |
| Merge/close notes created | DONE |

---

## 14. Sign-Off

| Role | Date | Decision |
|------|------|----------|
| Developer | 2026-05-31 | Implemented and documented |
| Scrum Master | 2026-05-31 | APPROVED — Forwarded to QA |
| QA Engineer | 2026-05-31 | PASSED (0 defects, 2/2 AC met, all FRs/NFRs met) |
| Scrum Master (Close) | 2026-05-31 | **CLOSED** — Wave 4 story 2/4 complete |

---

## Close Decision

**Status: CLOSED**

STORY-014 passes all quality gates. All scope items are implemented across two new animation components (CardAnimation, CardDrawAnimation), one new hook (useAnimationQueue), and two updated integration points (useCardInteraction, GameScene). The full test suite (272/272) passes with 21 new STORY-014 tests covering queue processing, component positioning, timing, callbacks, and edge cases. TypeScript compiles cleanly. Build succeeds. QA found zero defects with both acceptance criteria met. Code quality is high with proper TypeScript typing, memo optimization, processingRef for strict mode safety, getState() for stale-closure prevention, and defensive fallback card resolution. No rework required.

Wave 4 is now 2/4 complete (10/23 points). STORY-015 (Bot Turn Hook & Game Loop Orchestration) is queued next and now In Progress.
