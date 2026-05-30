# STORY-014 — Card Play Animation & Draw Animation

**Status:** Ready

---

## Requirement IDs
- FR-034 (play card → draw replacement from deck)
- FR-076 (card play animations: move from hand to middle pile with smooth 3D transitions)
- NFR-003 (touch response <=200ms from tap to animation start)

## Acceptance Criteria IDs
- AC-006 (tap valid card → card animates from hand to middle pile, draws replacement)
- AC-017 (bot card animations visible from bot hand to pile)

## Business Context
Smooth card animations are essential for the immersive 3D experience. When a card is played, it should visibly fly from the player's hand to the center pile. When a card is drawn, it should appear from the deck position. This creates a natural, engaging gameplay feel.

## Technical Context
Per architecture Section 9 and the component hierarchy, `CardAnimation` wraps a Card3D with `framer-motion-3d` for declarative animation. The animation queue in the store manages sequencing. Animation duration is ~400ms per architecture constants.

## Scope
1. Create `src/components/three/CardAnimation.tsx`:
   - Wraps a `<Card3D>` with animation capabilities
   - Props: `card: Card`, `fromPosition: [number, number, number]`, `toPosition: [number, number, number]`, `faceUp: boolean`, `onComplete: () => void`
   - Uses `framer-motion-3d` `<motion.mesh>` or `<AnimatePresence>` for:
     - Position tween from `fromPosition` to `toPosition`
     - Duration: `CARD_ANIMATION_DURATION_MS` (400ms)
     - Easing: ease-out or spring for natural feel
   - Fires `onComplete` callback when animation finishes
   - Handles cleanup: unmounts the animated card mesh after completion

2. Create `src/components/three/CardDrawAnimation.tsx`:
   - Similar to CardAnimation but animates from deck position to hand position
   - Props: `card: Card`, `toPosition: [number, number, number]`, `onComplete: () => void`
   - Starts from deck pile position (approximately [1.5, 0.5, 0])
   - Animates to the target hand slot
   - Card is face-down during flight, flips to face-up when arriving at human hand
   - Duration: ~300ms (faster than play animation)

3. Create animation orchestration logic (integrate with store animation queue):
   - When `playCard` is dispatched:
     1. Record the card's current position (hand slot position)
     2. Set target position (middle pile: [0, 0.1, 0])
     3. Store the animation action in `animationQueue`
     4. Set `isAnimating: true`
   - When animation completes:
     1. Remove card from queue
     2. If queue is empty, set `isAnimating: false`
   - For bot plays: same animation flow but card comes from bot position

4. Integrate with `useCardInteraction` hook:
   - After `playCard` dispatch, enqueue the card-play animation before drawing
   - After draw, enqueue the card-draw animation
   - Ensure animations are sequenced (draw animation starts after play animation finishes)

## Out of Scope
- VFX particle effects (STORY-018)
- Elimination animation (STORY-018)
- Sound effects (out of MVP scope)

## Files Likely Affected
- `src/components/three/CardAnimation.tsx` (create)
- `src/components/three/CardDrawAnimation.tsx` (create)
- `src/components/three/GameScene.tsx` (update — render animation components)
- `src/hooks/useCardInteraction.ts` (update — add animation queueing)
- `src/store/animation-slice.ts` (may need action updates)

## Implementation Notes
- Use `framer-motion-3d` `<motion.group>` to animate position: `animate={{ position: toPosition }}` with `transition={{ duration: 0.4, ease: 'easeOut' }}`
- The `onAnimationComplete` handler fires when the tween finishes
- During animation, the animated card is a "ghost" — separate from the actual hand rendering. The store already removed it from the hand; the animation component shows it flying.
- Position tracking: player hand positions are known per slot (human: [0, 0.1, 3.5], bot 2: [-3, 0.1, 0], etc.)
- Card draw animation: the card "appears" at the deck pile and flies to the hand. Since the store already added the card to the hand, the animation is purely visual.
- For bot plays, the card starts face-down at the bot position and flips to face-up as it reaches the middle pile.
- Consider using `<AnimatePresence>` for smooth mount/unmount transitions

## Test Requirements
- [x] Card play animation starts from correct hand position
- [x] Card play animation ends at middle pile position [0, 0.1, 0]
- [x] Card draw animation starts from deck position
- [x] Card draw animation ends at correct hand slot position
- [x] Animation duration is approximately 400ms (play) and 300ms (draw)
- [x] `onComplete` callback fires when animation ends
- [x] `isAnimating` is true during animation, false after completion
- [x] Animations are sequential: draw starts after play finishes
- [x] Multiple rapid card plays don't overlap animations
- [x] Bot card animation visible (not skipped)

## Edge Cases
- Animation interrupted by game reset (clear all active animations)
- Card animated to pile but game logic rejects it (shouldn't happen — validation is pre-animation)
- Deck draw animation when deck is empty (no draw happens, no animation needed)
- Multiple cards animated in sequence (queue management)
- Rapid bot plays (ensure animation queue doesn't overflow)

## Dependencies
- STORY-009 (Zustand store with animation slice)
- STORY-012 (Card3D component, player hand positions)
- STORY-013 (Middle pile and deck positions known)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
