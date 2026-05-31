# QA Review
Story ID: STORY-014 — Card Play Animation & Draw Animation  
Status: PASS

## Summary
STORY-014 implements card play animations (hand → middle pile) and card draw animations (deck → hand) using framer-motion-3d with a queue-based sequential processing system. The implementation introduces two new animation components (`CardAnimation`, `CardDrawAnimation`), a `useAnimationQueue` hook for sequential playback, and integration points in `useCardInteraction` and `GameScene`. All acceptance criteria are satisfied, all 272 tests pass across 22 test files, TypeScript compiles cleanly, and the production build succeeds.

## Acceptance Criteria Check

### AC-006: Tap valid card → card animates from hand to middle pile, draws replacement
- **PASS** — `useCardInteraction` enqueues a `card-play` animation (from player hand position to `[0, 0.1, 0]`) followed by a `card-draw` animation (from deck `[1.5, 0.3, 0]` to hand position) when a draw occurs. The hand-size comparison correctly detects whether a draw happened, avoiding the edge case where `deck.length > 0` would fail with exactly 1 card remaining. The `GameScene` renders `CardAnimation` and `CardDrawAnimation` components conditionally based on the current animation type from `useAnimationQueue`.

### AC-017: Bot card animations visible from bot hand to pile
- **PASS (with scope caveat)** — The animation infrastructure fully supports bot animations:
  - `CardAnimation` accepts `fromPosition` for any player slot
  - `CardDrawAnimation` animates to any `toPosition`
  - `faceUp={playerIndex === 0}` correctly renders bot cards face-down during flight
  - `GameScene` resolves player positions via `payload.playerIndex`
  - Bot-specific animation enqueueing is explicitly deferred to STORY-015 (useBotTurn hook), which will call `enqueueAnimation` with bot positions. This is documented in dev notes and does not constitute a deficiency for STORY-014's scope.

### FR-034: Play card → draw replacement from deck
- **PASS** — `handleCardTap` calls `playCard` then `drawCard`, then enqueues corresponding animations for visual playback.

### FR-076: Card play animations with smooth 3D transitions
- **PASS** — `CardAnimation` uses `framer-motion-3d`'s `motion('group')` to tween position from `fromPosition` to `toPosition` with ease-out easing over 400ms. `CardDrawAnimation` uses the same pattern at 300ms.

### NFR-003: Touch response ≤200ms from tap to animation start
- **PASS** — All operations between tap and animation are synchronous: guard checks, store dispatches, and animation enqueueing. The `useEffect` in `useAnimationQueue` triggers on the next React render cycle (microtask), well within 200ms.

## Test Commands Run

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ No errors |
| `npm test -- --run` | ✅ 272 tests passed (22 test files) |
| `npm run build` | ✅ Production build successful (1028 modules transformed) |

## Test Results

### New Test Files (21 test cases)
1. **`src/hooks/useAnimationQueue.test.ts`** (10 tests):
   - Empty queue → null currentAnimation, isAnimating false
   - Single animation: pickup, isAnimating=true, dequeue, isAnimating=false
   - Sequential: two animations (play then draw), three animations
   - Edge cases: idempotent onComplete, clearAnimationQueue resets state

2. **`src/components/three/CardAnimation.test.tsx`** (11 tests):
   - Renders with number and special cards
   - Renders face-down for bot players
   - Correct from/to positions in motion.group
   - Default 400ms duration (0.4s), custom duration support
   - onComplete callback fires
   - Card3D disabled during animation
   - CardDrawAnimation: renders, deck origin [1.5,0.3,0], 300ms default, onComplete

### Existing Tests
- All 251 pre-existing tests continue to pass — no regressions.

## Manual Review

### CardAnimation (`src/components/three/CardAnimation.tsx`, 64 lines)
- Uses `motion('group')` with type assertion for framer-motion-3d compatibility — acceptable workaround.
- `memo()` optimization applied.
- `disabled={true}` on Card3D prevents tap events during flight — good defensive UX.
- Rotation `[-Math.PI/2, 0, 0]` lays card flat on table — matches pile orientation.
- Duration prop defaults to `CARD_ANIMATION_DURATION_MS` (400ms) with override support.

### CardDrawAnimation (`src/components/three/CardDrawAnimation.tsx`, 69 lines)
- Hard-coded `DECK_FROM_POSITION` = `[1.5, 0.3, 0]` — matches `DeckPile3D` position.
- Default 300ms duration — faster than play animation per spec.
- Same quality patterns: memo, disabled Card3D, table-flat rotation.

### useAnimationQueue (`src/hooks/useAnimationQueue.ts`, 84 lines)
- Local `useState<AnimationAction | null>` avoids excessive re-renders from store mutations.
- `processingRef` prevents double-processing in React strict mode / fast re-renders.
- Sequential processing: on complete, slices queue and sets next animation.
- Sets `isAnimating: true` when queue has items, `false` when drained.
- `onAnimationComplete` reads fresh state via `getState()` — correct for stale closure prevention.
- Integration with `clearAnimationQueue` store action for game-reset scenarios.

### useCardInteraction (`src/hooks/useCardInteraction.ts`, 141 lines)
- Four guards before dispatch: isHumanTurn, isAnimating, playableCardIds, playerIndex match.
- Hand-size comparison for draw detection: robust against deck-exhaustion edge case.
- Player positions hardcoded per architecture Section 9.
- Properly sets `setAnimating(true)` after enqueueing animations.

### GameScene (`src/components/three/GameScene.tsx`, 103 lines)
- Imports and uses `useAnimationQueue` for animation layer rendering.
- `resolvePlayedCard` looks up card in `middlePile` (card already moved there by store action).
- `resolveDrawnCard` looks up card in player's hand (card already added by store action).
- `FALLBACK_CARD` prevents crashes when card data cannot be resolved — good defensive coding.
- Properly routes `onAnimationComplete` from hook to animation components.

## Edge Cases Checked

| Edge Case | Status | Evidence |
|-----------|--------|----------|
| Animation interrupted by game reset | ✅ Handled | `clearAnimationQueue` tested — resets queue and isAnimating flag |
| Card validated pre-animation (no reject case) | ✅ N/A | Guards in `handleCardTap` validate before dispatch |
| Deck draw animation when deck is empty | ✅ Handled | Hand-size comparison: no draw = no animation enqueued |
| Multiple cards animated in sequence | ✅ Handled | Queue processes one at a time; tested with 2 and 3 animations |
| Rapid bot plays preventing overlap | ✅ Handled | Sequential queue + `isAnimating` guard blocks double-tap |
| onAnimationComplete called when queue empty | ✅ Handled | Test confirms no crash; slice(1) on empty array is safe |
| Custom duration override | ✅ Handled | Both components accept optional `duration` prop; tested |
| Bot face-down rendering during flight | ✅ Handled | `faceUp={playerIndex === 0}` in GameScene; tested for `faceUp=false` |

## Bugs Found
None.

## Regression Risk
**Low.** Changes are additive:
- 2 new components (CardAnimation, CardDrawAnimation) — no existing code modified
- 1 new hook (useAnimationQueue) — no existing code modified
- GameScene.tsx modified — added animation layer rendering, all existing rendering preserved
- useCardInteraction.ts modified — added animation enqueueing after existing dispatch logic
- All 251 pre-existing tests pass unchanged
- Build output has only pre-existing three.js vendor chunk size warning

## Final Verdict

**PASS**

All acceptance criteria (AC-006, AC-017) are satisfied. All functional requirements (FR-034, FR-076) and the non-functional requirement (NFR-003) are met. The 21 new test cases provide thorough coverage of animation queue processing, component positioning, timing, callbacks, and edge cases. The production build is clean with no TypeScript errors. Code quality is high with proper TypeScript typing, React.memo optimization, defensive coding (fallback cards, processingRef, null checks), and clean architecture (separation between components, hooks, and store). Bot animation enqueueing is correctly scoped to STORY-015 and is well-documented.

---

**Reviewed by:** QA Engineer  
**Review Date:** 2026-05-31  
**Story Status:** READY_TO_CLOSE
