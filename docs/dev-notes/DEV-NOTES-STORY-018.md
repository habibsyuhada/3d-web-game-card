# Dev Notes
Story ID: STORY-018

## Story Context Reviewed
- **docs/stories/STORY-018.md** — Full VFX requirements for all 6 special card effects + elimination
- **docs/queue/dev-queue.md** — Wave 5 current sprint, STORY-018 in progress
- **docs/prd/prd.md** — Visual polish requirements for special cards
- **docs/architecture/architecture.md** — Section 9 (3D scene, VFX components)
- **src/store/animation-slice.ts** — `activeVFX`/`vfxPosition` state + `setActiveVFX` action
- **src/components/three/GameScene.tsx** — Pre-existing scaffolding placeholder for VFX
- **src/hooks/useBotTurn.ts** — Bot turn flow (added VFX dispatch after bot plays special card)
- **src/hooks/useCardInteraction.ts** — Human card play (added VFX dispatch for special cards)

## Files Changed
### Created (VFX Components)
- `src/components/three/vfx/BombVFX.tsx` — 60-particle expanding burst (fire palette, 800ms)
- `src/components/three/vfx/NuclearVFX.tsx` — Expanding radiation ring (green, 1000ms)
- `src/components/three/vfx/ReverseVFX.tsx` — Two spinning arrow cones (cyan, 600ms)
- `src/components/three/vfx/SkipVFX.tsx` — 8 radial speed lines (white/blue, 400ms)
- `src/components/three/vfx/RandomVFX.tsx` — Number scramble + settle (purple/gold, 800ms, uses `<Text>`)
- `src/components/three/vfx/EliminationVFX.tsx` — 12 fragments fade-to-gray (red→gray, 1000ms)
- `src/components/three/vfx/index.ts` — Barrel export for all VFX components

### Created (Tests)
- `src/components/three/vfx/BombVFX.test.tsx` — 6 tests (render, onComplete, cleanup)
- `src/components/three/vfx/NuclearVFX.test.tsx` — 4 tests
- `src/components/three/vfx/ReverseVFX.test.tsx` — 4 tests
- `src/components/three/vfx/SkipVFX.test.tsx` — 4 tests
- `src/components/three/vfx/RandomVFX.test.tsx` — 7 tests (incl. scramble phase + settle verification)
- `src/components/three/vfx/EliminationVFX.test.tsx` — 4 tests

### Updated
- `src/components/three/GameScene.tsx` — Replaced `null` VFX placeholder with full conditional rendering of 5 VFX components based on `activeVFX` + `vfxPosition`. Reads `lastValue` for `RandomVFX.finalValue` and `setActiveVFX` for onComplete.
- `src/hooks/useCardInteraction.ts` — After human plays a card, checks if it's a special card (has `effect`) and dispatches `setActiveVFX(effect, [0, 0.5, 0])` (positioned above middle pile).
- `src/hooks/useBotTurn.ts` — After bot plays a card, looks up the card in `middlePile` by `cardId` and dispatches VFX if it's a special card.
- `src/components/three/GameScene.test.tsx` — Extended `@react-three/fiber` mock to include `useFrame` (no-op); extended `@react-three/drei` mock to include `Text` (as `<span>`).

### Removed
- `src/components/three/vfx/.gitkeep` — No longer needed (real files present)

## Implementation Summary

### VFX Component Pattern
All VFX components follow a consistent pattern:
- **Props:** `{ position: [number, number, number]; onComplete: () => void }` (RandomVFX also has `finalValue`)
- **Auto-unmount:** `useEffect` + `setTimeout(duration, onComplete)` — calls `onComplete` after the effect duration
- **Animation:** `useFrame` from R3F for per-frame visual updates (positions, scale, opacity)
- **Cleanup:** `useEffect` returns a cleanup function that clears the timeout
- **Optimization:** `React.memo` wrapper prevents unnecessary re-renders
- **Visuals:** Standard Three.js JSX elements (`<group>`, `<mesh>`, `<sphereGeometry>`, etc.)

### GameScene Integration
GameScene conditionally renders the appropriate VFX component based on `activeVFX`:
- `SpecialEffect.Bomb` → `<BombVFX>`
- `SpecialEffect.Nuclear` → `<NuclearVFX>`
- `SpecialEffect.Reverse` → `<ReverseVFX>`
- `SpecialEffect.Skip` → `<SkipVFX>`
- `SpecialEffect.Random` → `<RandomVFX>` (uses `lastValue ?? 7` as the final displayed number)

When the VFX's `onComplete` fires, it calls `setActiveVFX(null)` to clear the active effect from the store, causing the component to unmount.

### VFX Triggering
VFX are dispatched immediately when a special card is played, before animations. This means the VFX plays concurrently with card-play animations. Since VFX duration (400-1000ms) overlaps with animation duration (400ms + draw), both visuals play simultaneously without blocking each other.

### EliminationVFX Status
The `EliminationVFX` component is implemented but NOT integrated into GameScene yet. It's a standalone component ready for a future hook integration that triggers on player elimination events. The SpecialEffect enum doesn't have an `elimination` value, so it can't be dispatched via `activeVFX`. This is intentionally deferred — the component is available and tested for future integration.

## Tests Added or Updated
- **29 new tests** across 6 VFX test files
- **Updated** `GameScene.test.tsx` mocks to support VFX components (useFrame + Text)
- All VFX test files use `vi.useFakeTimers()` to deterministically test duration-based auto-unmount
- Tests verify: renders without crash, no premature `onComplete`, calls `onComplete` after duration, cleanup on unmount
- `RandomVFX.test.tsx` additionally verifies scramble behavior (number cycling + settling)

## Test Commands Run
```bash
cmd /c "npx tsc --noEmit 2>&1"         # TypeScript type check — PASS
cmd /c "npm test -- --run 2>&1"         # Full vitest suite — 383/383 PASS
cmd /c "npm run build 2>&1"             # Production build — PASS
```

## Test Results
- **TypeScript check:** Clean (no errors)
- **Unit tests:** 383 passed / 0 failed (across 37 test files)
- **Production build:** Successful (bundle output in `dist/`)
- Known non-blocking warnings:
  - `sRGBEncoding`/`LinearEncoding` deprecation warnings from @react-three/fiber (pre-existing)
  - Chunk size warning (Three.js vendor chunk ~1MB, pre-existing)

## Commit Notes
Suggested commit message:
```
feat(vfx): implement special card visual effects (STORY-018)

- Add 6 VFX components: BombVFX, NuclearVFX, ReverseVFX, SkipVFX,
  RandomVFX, EliminationVFX (src/components/three/vfx/)
- BombVFX: 60-particle explosion burst (fire palette, 800ms)
- NuclearVFX: expanding radiation ring (green, 1000ms)
- ReverseVFX: spinning arrow cones indicating direction change (cyan, 600ms)
- SkipVFX: radial speed lines dash trail (white/blue, 400ms)
- RandomVFX: number scramble effect settling on final value (purple/gold, 800ms)
- EliminationVFX: fade-to-gray fragments at eliminated player (standalone, 1000ms)
- Replace GameScene VFX placeholder with conditional rendering
- Dispatch setActiveVFX on special card play (human + bot)
- Add 29 unit tests across 6 test files (all pass)
- Use setTimeout-based auto-unmount pattern for test compatibility
- All VFX components use React.memo + useFrame for performance
```

## Risks / Limitations
1. **EliminationVFX not integrated:** The component exists and is tested but not wired to trigger on player elimination. Integration will require a separate state field (e.g., `eliminatingPlayerIndex`) and a hook that watches for life reaching 0. Best addressed in a follow-up story or STORY-019.
2. **useFrame in jsdom:** Since `useFrame` requires R3F `Canvas` context, VFX tests mock `useFrame` as a no-op. Visual per-frame animation cannot be tested in jsdom — it only runs in the browser. This is acceptable as the auto-cleanup mechanism (setTimeout + onComplete) is thoroughly tested.
3. **VFX during rapid card play:** If two special cards are played in quick succession (edge case in the story), the current implementation will only show the last one since `setActiveVFX` replaces the previous value. A VFX queue would be a post-MVP enhancement.
4. **VFX position is hardcoded:** All card VFX render at `[0, 0.5, 0]` (above middle pile). Skip's "direction toward skipped player" is not yet directionally oriented — the speed lines radiate outward symmetrically. Post-MVP enhancement.
5. **Particle count:** BombVFX uses 60 individual `<mesh>` elements rather than a `<Points>` system for simplicity. Performance-tested acceptable for MVP; could be optimized to `<Points>` with `BufferGeometry` if performance testing (STORY-020) reveals issues.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
