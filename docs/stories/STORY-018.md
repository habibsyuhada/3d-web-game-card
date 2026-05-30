# STORY-018 — Special Card Visual Effects (VFX)

**Status:** Ready

---

## Requirement IDs
- FR-040 through FR-044 (special card effects trigger visuals)
- FR-050 (elimination animation when lives reach 0)
- FR-077 (VFX particles for each special card effect: explosion, radiation, shuffle, arrow, dash)
- FR-084 (spectator message and elimination visual)
- NFR-001 (>=30 FPS — VFX must not tank performance)
- NFR-007 (<=150MB memory — VFX particles must be lightweight)

## Acceptance Criteria IDs
- AC-008 (Reverse: visual indication of direction change)
- AC-010 (Bomb: explosion VFX + pile value resets)
- AC-011 (Nuclear: radiation/nuclear VFX + pile clears)
- AC-012 (Random: random/dice VFX + value displayed)
- AC-013 (Elimination animation when lives reach 0)

## Business Context
Special card VFX provide the dramatic, impactful moments that make the game engaging. An explosion for Bomb, a radiation wave for Nuclear, spinning arrows for Reverse, a dash trail for Skip, a dice/shuffle effect for Random, and a shatter/fade for elimination. These are conditional, short-lived visual flourishes.

## Technical Context
Per architecture Section 9, VFX components are conditionally rendered in the 3D scene based on `activeVFX` state from the animation slice. They use Three.js `Points` geometry (not individual meshes) for particle efficiency. Duration is `VFX_DURATION_MS` (800ms). Components auto-unmount after their duration.

## Scope
1. Create `src/components/three/vfx/BombVFX.tsx`:
   - Triggered when a Bomb card is played
   - Effect: Particle burst / explosion from the middle pile position
   - Implementation: `<Points>` with many small particles expanding outward from center
   - Colors: orange, red, yellow (fire palette)
   - Particles have velocity vectors pointing outward, fade opacity over time
   - Duration: ~800ms, then auto-cleanup
   - Position: [0, 0.5, 0] (above middle pile)
   - Use `useFrame` to animate particle positions each frame

2. Create `src/components/three/vfx/NuclearVFX.tsx`:
   - Triggered when Nuclear card is played
   - Effect: Expanding radiation ring/wave from center
   - Implementation: Expanding ring geometry (torus or circle outline) that grows and fades
   - Colors: bright green (#00ff00) with yellow highlights
   - Ring expands outward, pulses once, then fades
   - Duration: ~1000ms (slightly longer for dramatic effect)
   - Particles: small green dots arranged in a ring pattern expanding outward

3. Create `src/components/three/vfx/ReverseVFX.tsx`:
   - Triggered when Reverse card is played
   - Effect: Spinning arrows or a circular arrow indicator
   - Implementation: Two arrow shapes rotating 180° around the center
   - Colors: blue/cyan
   - Arrows spin clockwise or counter-clockwise based on new direction
   - Duration: ~600ms

4. Create `src/components/three/vfx/SkipVFX.tsx`:
   - Triggered when Skip card is played
   - Effect: Dash trail / speed lines pointing toward the skipped player
   - Implementation: Animated lines/streaks from current position toward next player
   - Colors: white/light blue
   - Quick dash animation (~400ms) that fades out
   - Direction: from current player slot toward the skipped player

5. Create `src/components/three/vfx/RandomVFX.tsx`:
   - Triggered when Random card is played
   - Effect: Dice shuffle / number scramble animation
   - Implementation: Rapidly cycling numbers (1-13) displayed as `<Text>` from Drei, then settling on the final value
   - Colors: purple/gold
   - Number scrambles (changes every ~50ms), then locks on final randomValue
   - Duration: ~800ms total (scramble + reveal)

6. Create `src/components/three/vfx/EliminationVFX.tsx`:
   - Triggered when a player is eliminated (lives reach 0)
   - Effect: Shatter/crumble animation on the player's slot
   - Implementation: Player's cards and tokens break into fragments (particles) that scatter
   - Alternative simpler approach: All elements at the player position fade to gray/transparent with a scale-down effect
   - Colors: red fading to gray
   - Duration: ~1000ms
   - Position: the eliminated player's slot position

7. Update `src/components/three/GameScene.tsx`:
   - Conditionally render VFX components based on `activeVFX` from store
   - Pass `vfxPosition` to the active VFX component
   - After VFX duration, dispatch `setActiveVFX(null)` to unmount

## Out of Scope
- Sound effects (out of MVP scope)
- Screen shake (could be post-MVP)
- Persistent particle cleanup optimization beyond basic disposal

## Files Likely Affected
- `src/components/three/vfx/BombVFX.tsx` (create)
- `src/components/three/vfx/NuclearVFX.tsx` (create)
- `src/components/three/vfx/ReverseVFX.tsx` (create)
- `src/components/three/vfx/SkipVFX.tsx` (create)
- `src/components/three/vfx/RandomVFX.tsx` (create)
- `src/components/three/vfx/EliminationVFX.tsx` (create)
- `src/components/three/GameScene.tsx` (update — add VFX rendering)
- `src/store/game-slice.ts` or `animation-slice.ts` (ensure VFX is dispatched after special cards)

## Implementation Notes
- All VFX components share a common pattern: mount → animate → dispatch `setActiveVFX(null)` to unmount
- Use `useFrame((state, delta) => {...})` for per-frame animation in R3F
- For particle effects, use `<Points>` with a `BufferGeometry` that holds position attributes
- Keep particle counts low (50-100 particles max for explosion, 30 for ring)
- Dispose of geometries and materials on unmount to prevent memory leaks
- `RandomVFX` uses `<Text>` from Drei, not particles — it's a text-based effect
- `EliminationVFX` can be simpler — just scale down + fade out the player's 3D elements, no particles needed for MVP
- Position VFX at the middle pile [0, 0.5, 0] for card effects, at player slot for elimination
- `vfxPosition` in store can be a generic [x,y,z] tuple passed to the VFX component

## Test Requirements
- [x] BombVFX renders particle explosion at correct position
- [x] BombVFX auto-unmounts after duration
- [x] NuclearVFX renders expanding ring
- [x] NuclearVFX auto-unmounts after duration
- [x] ReverseVFX renders spinning arrows
- [x] SkipVFX renders dash trail
- [x] RandomVFX cycles numbers then settles on value
- [x] EliminationVFX renders at correct player position
- [x] Only one VFX active at a time
- [x] VFX does not drop FPS below 30
- [x] VFX correctly unmounts and cleans up geometry
- [x] `activeVFX` in store is set to null after VFX completes

## Edge Cases
- Two special cards played in quick succession (rapid Skip + Reverse) — VFX queue should handle
- VFX during spectator mode (bots playing special cards — VFX still shows)
- VFX during game over transition (should be suppressed once game finishes)
- WebGL context lost during VFX (particles may not clean up — handle gracefully)
- Very low-end device: VFX may lag — acceptable as long as game logic isn't blocked

## Dependencies
- STORY-009 (Zustand store with animation slice — activeVFX state)
- STORY-014 (animation queue management pattern)
- STORY-017 (GameScene assembly — VFX rendering integration)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
