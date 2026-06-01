# STORY-017 — Full Game Scene Assembly

**Status:** Done

---

## Requirement IDs
- FR-070 through FR-079 (complete 3D scene with all elements)
- FR-071 (4 player positions around the table)
- NFR-001 (>=30 FPS performance)
- NFR-005 (responsive to mobile widths)

## Acceptance Criteria IDs
- AC-003 (4 players at table, 3 cards each, 5 lives, visible positions)
- AC-004 (all cards valid when pile empty)
- AC-005 (valid/invalid card distinction working)
- AC-006 (card tap plays card with animation)
- AC-017 (bot plays visible with animations)
- AC-021 (>=30 FPS during gameplay)

## Business Context
This story integrates all 3D components into a single cohesive game scene. It ensures the table, cards, hands, middle pile, life tokens, and deck all work together in the correct spatial arrangement with proper state bindings.

## Technical Context
Per architecture Section 9 (Scene Hierarchy), `GameScene` is the root R3F component that contains and positions all 3D elements. It reads game state from the Zustand store and passes it down to child components.

## Scope
1. Finalize `src/components/three/GameScene.tsx`:
   - Import and render all 3D child components:
     - Lighting (ambient, key directional, fill directional, spot)
     - `<Table3D />`
     - 4x `<PlayerSlot3D />` at correct positions:
       - Human (index 0): position [0, 0, 3.5], rotation [0, 0, 0] — face-up, interactive
       - Bot 2 (index 1): position [-3, 0, 0], rotated 90° to face center ([0, π/2, 0])
       - Bot 3 (index 2): position [0, 0, -3.5], rotated 180° ([0, π, 0])
       - Bot 4 (index 3): position [3, 0, 0], rotated -90° ([0, -π/2, 0])
     - `<MiddlePile3D />` at [0, 0, 0]
     - `<DeckPile3D />` at offset (e.g., [1.5, 0, -0.5])
   - Render active card animations (CardAnimation, CardDrawAnimation) from animation queue
   - Render active VFX components from store animation slice
   - Use `useFrame` or frame-based updates only where necessary

2. Ensure state flow:
   - `GameScene` reads from `useGameStore` selectors
   - Passes relevant slices to child components:
     - `PlayerSlot3D` receives: player data, playable cards (for human), faceUp flag
     - `MiddlePile3D` receives: middlePile array, lastValue
     - Animation components receive: action payload from queue
   - Human card taps bubble up to `useCardInteraction` hook

3. Add Error Boundary:
   - Wrap `<Canvas>` in a React ErrorBoundary component
   - If R3F throws: show fallback message "3D rendering error. Please refresh the page."
   - Location: `src/components/ErrorBoundary.tsx`

4. Performance verification:
   - Use `React.memo` on all R3F components that don't need frequent re-renders
   - Ensure Zustand selectors are granular (components subscribe to only what they need)
   - Set `frameloop="always"` on Canvas (needed for animations)
   - Verify total triangle count stays under ~5,000

## Out of Scope
- VFX particle effects (STORY-018)
- Game over screen (STORY-019)
- Performance tuning deep-dive (STORY-020)
- HUD overlays (STORY-016 — those are HTML, not 3D)

## Files Likely Affected
- `src/components/three/GameScene.tsx` (finalize)
- `src/components/three/PlayerSlot3D.tsx` (finalize — ensure all props wired)
- `src/components/ErrorBoundary.tsx` (create)
- `src/App.tsx` (update — wrap Canvas in ErrorBoundary, add HUD overlay)

## Implementation Notes
- `GameScene` is purely a composition/layout component — it delegates rendering to children
- Player slot rotations ensure bot cards face toward center (and thus toward the camera at an angle showing card backs)
- The card interaction hook (`useCardInteraction`) is used within the GameScene or App context — ensure it can access the R3F canvas for pointer events
- ErrorBoundary should log the error for debugging but show a clean user-facing message
- Consider adding a loading/initial state while the 3D scene mounts (brief flash is acceptable per NFR-002 ≤5s)
- Use `useStoreApi()` from Zustand for accessing store outside React components if needed by R3F frame callbacks

## Test Requirements
- [x] Full scene renders with all 4 player slots visible
- [x] Human player cards are face-up and interactive
- [x] Bot player cards are face-down
- [x] Middle pile area is visible (empty at game start)
- [x] Life tokens visible for all players (5 each)
- [x] Deck pile visible with initial card count
- [x] Tapping a human card triggers the play action
- [x] Scene renders at >=30 FPS with all elements present
- [x] ErrorBoundary catches rendering errors and shows fallback
- [x] No React console warnings about missing keys, unmounted components

## Edge Cases
- Scene renders before game is initialized (showTitleScreen should prevent this, but defensive)
- All cards played (end-game state) — scene still renders gracefully
- WebGL context lost — Canvas should handle gracefully
- Rapid state changes (multiple turns processing) — no layout jumping or flickering
- Player eliminated — their slot still visible (showing empty hand + 0 life tokens)

## Dependencies
- STORY-011 (3D scene foundation)
- STORY-012 (Card3D, CardHand, PlayerSlot3D, Card interaction)
- STORY-013 (LifeTokens, MiddlePile3D, DeckPile3D)
- STORY-014 (Card animations)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed
- [x] QA review passed
- [x] Story closed
