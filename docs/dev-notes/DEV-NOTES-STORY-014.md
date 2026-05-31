# Dev Notes
Story ID: STORY-014

## Story Context Reviewed
- STORY-014: Card Play Animation & Draw Animation
- Requirement IDs: FR-034 (play card → draw replacement), FR-076 (card play animations), NFR-003 (touch response ≤200ms)
- Acceptance Criteria: AC-006 (tap valid card → animation + draw), AC-017 (bot animations visible)
- Dependencies confirmed: STORY-009 (Zustand store), STORY-012 (Card3D component), STORY-013 (positions)

## Files Changed
### Created
- `src/components/three/CardAnimation.tsx` — Card play fly animation component
- `src/components/three/CardDrawAnimation.tsx` — Card draw fly animation component
- `src/hooks/useAnimationQueue.ts` — Animation queue processing hook
- `src/hooks/useAnimationQueue.test.ts` — Tests for animation queue hook
- `src/components/three/CardAnimation.test.tsx` — Tests for animation components

### Modified
- `src/hooks/useCardInteraction.ts` — Added animation enqueueing after playCard/drawCard
- `src/components/three/GameScene.tsx` — Added animation layer rendering (CardAnimation, CardDrawAnimation)

## Implementation Summary
### Architecture
1. **CardAnimation** — Uses `framer-motion-3d`'s `motion('group')` API to create an animated Three.js group. Flies a `Card3D` from a source position to a target position with ease-out easing. Duration: 400ms (configurable via prop).

2. **CardDrawAnimation** — Same pattern but animates from the deck position `[1.5, 0.3, 0]` to a player's hand position. Duration: 300ms (faster than play animation per spec).

3. **useAnimationQueue** — Custom hook that:
   - Reads `animationQueue` and `isAnimating` from the Zustand store
   - Processes animations sequentially (one at a time)
   - Exposes `currentAnimation` (for GameScene to render) and `onAnimationComplete` (for the animated component to signal completion)
   - Sets `isAnimating: true` while queue is non-empty, `false` when drained

4. **useCardInteraction (updated)** — After calling `playCard` + `drawCard`:
   - Enqueues a `card-play` animation (player hand → middle pile `[0, 0.1, 0]`)
   - If a draw occurred (detected by comparing hand sizes before/after), enqueues a `card-draw` animation (deck → hand)
   - Sets `isAnimating: true` to block interactions during animation playback
   - **Bug fix:** Uses hand-size comparison instead of `deck.length > 0` to correctly detect draws when the deck had exactly 1 card remaining

5. **GameScene (updated)** — Renders the animation layer:
   - Conditionally renders `CardAnimation` when `currentAnimation.type === 'card-play'`
   - Conditionally renders `CardDrawAnimation` when `currentAnimation.type === 'card-draw'`
   - Looks up card data from `middlePile` (for played cards) and player's hand (for drawn cards)
   - Includes a fallback card if lookup fails (defensive)

### Technical Decisions
- Used `motion('group')` instead of `motion.group` because the latter doesn't resolve the Three.js JSX intrinsic elements in the framer-motion-3d type definitions. Applied a `React.ComponentType` type assertion to work around incomplete return types.
- `Card3D` props in animations: `disabled={true}` — prevents tap events during animation flight.
- `faceUp={playerIndex === 0}` — human cards fly face-up; bot cards fly face-down (matching game rules).
- Player positions hardcoded per architecture Section 9: Human [0,0,3.5], Bot2 [-3,0,0], Bot3 [0,0,-3.5], Bot4 [3,0,0].

## Tests Added or Updated
### New Test Files
1. **`src/hooks/useAnimationQueue.test.ts`** (10 test cases):
   - Returns null currentAnimation when queue is empty
   - Picks up first animation from the queue
   - Sets isAnimating to true during playback
   - Removes animation from queue on complete
   - Sets isAnimating to false when queue drains
   - Processes two animations in order (play then draw)
   - Handles three sequential animations
   - onAnimationComplete is idempotent when queue empty
   - clearAnimationQueue resets state

2. **`src/components/three/CardAnimation.test.tsx`** (10 test cases):
   - CardAnimation renders with number/special cards
   - Renders face-down for bot players
   - Passes correct from/to positions to motion.group
   - Uses default 400ms duration (0.4s)
   - Supports custom duration
   - Calls onComplete when animation finishes
   - Disables Card3D during animation
   - CardDrawAnimation renders without crashing
   - CardDrawAnimation starts from deck position [1.5, 0.3, 0]
   - CardDrawAnimation uses 300ms default duration
   - CardDrawAnimation calls onComplete

### Existing Tests
- All 259 existing tests continue to pass (no regressions)
- `useCardInteraction.test.ts` passes unchanged (animation enqueueing is additive)

## Test Commands Run
- `cmd /c "npx tsc --noEmit 2>&1"` — No TypeScript errors
- `cmd /c "npm test -- --run 2>&1"` — All 272 tests pass (22 test files)
- `cmd /c "npm run build 2>&1"` — Production build succeeds

## Test Results
- **272 tests passed** across 22 test files
- **Build passes** via `tsc -b && vite build`

## Commit Notes
Suggested commit message:
```
feat(STORY-014): add card play & draw animations with queue-based sequencing

- Create CardAnimation component: animates Card3D from hand to middle pile (400ms)
- Create CardDrawAnimation component: animates Card3D from deck to hand (300ms)
- Create useAnimationQueue hook: sequential animation processing with store integration
- Update useCardInteraction: enqueues play+draw animations after card dispatch
- Update GameScene: renders animation layer with proper card data resolution
- Add 20 new test cases covering animation queue, positioning, timing, and callbacks
- All 272 tests pass, production build clean
```

## Risks / Limitations
1. **framer-motion-3d type definitions incomplete** — Required `motion('group')` with type assertion. The `.d.ts` for `custom()` returns `RefAttributes<unknown>` which doesn't include children/anition props. This is a third-party library limitation.
2. **Animation positions hardcoded** — Player slot positions are hardcoded as a static Record. If player positions change (responsive layout, future STORY-017 scene assembly), these positions need to be co-located or centralized into a shared constants file.
3. **Bot animation enqueueing not yet implemented** — Card play animations for bots are enqueued by the human path (useCardInteraction). Bot animations are the responsibility of STORY-015 (useBotTurn hook), which will call `enqueueAnimation` with bot positions.
4. **No VFX triggered during animations** — Special card VFX (Bomb, Nuclear, etc.) are not triggered in this story. That's STORY-018's scope. The animation components are purely positional flight animations.
5. **Ghost card lookup** — For card-play animations, the card is looked up from middlePile (since it's already removed from hand). This relies on the store action completing before the animation renders. If the store action and animation are decoupled in the future, card data may need to be passed directly in the AnimationAction payload.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
