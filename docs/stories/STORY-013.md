# STORY-013 — Life Tokens & Middle Pile 3D Rendering

**Status:** Done

---

## Requirement IDs
- FR-005 (middle pile updates after each play)
- FR-042 (Bomb resets pile value)
- FR-043 (Nuclear clears all pile cards)
- FR-074 (middle pile area displays played cards stacked in 3D)
- FR-075 (life tokens rendered visually for each player)
- FR-083 (deck counter shows remaining cards)
- NFR-001 (>=30 FPS on mid-range mobile)
- NFR-010 (all assets procedural)

## Acceptance Criteria IDs
- AC-003 (each player shows 5 life tokens)
- AC-005 (middle pile updates in 3D after play)
- AC-010 (Bomb resets middle pile value)
- AC-011 (Nuclear clears all middle pile cards)

## Business Context
Life tokens provide a clear visual indicator of each player's survival status. The middle pile is the central game element that shows the current card value players must beat. Together, they make the game state readable at a glance in 3D space.

## Technical Context
Per architecture Section 9, life tokens are low-poly heart/gem meshes (~60 tris each, up to 20 total across all players). The middle pile is a stack of Card3D objects with slight Y offsets. A `<Text>` component displays the current pile value.

## Scope
1. Create `src/components/three/LifeTokens.tsx`:
   - Props: `count: number`, `position: [number, number, number]`, `maxLives?: number` (default 5)
   - Renders up to 5 small 3D token meshes (hearts or spheres)
   - Active lives: bright red/pink color (`#e74c3c`)
   - Lost lives: dark gray/transparent (`#333` with opacity 0.3)
   - Geometry: Low-poly sphere or simple heart shape (~60 tris each)
     - Option: Use a `<sphereGeometry args={[0.08, 8, 6]} />` for a simple gem look
   - Layout: Horizontal row of tokens, spaced 0.2 units apart
   - Use `React.memo` for performance
   - Animate when count decreases: the lost token fades/scales down (optional, can be done via framer-motion-3d)

2. Create `src/components/three/MiddlePile3D.tsx`:
   - Renders the stack of played cards in the center of the table
   - Position: [0, 0, 0] (center of table, slight elevation)
   - Reads `middlePile` array from store
   - For each card in pile: renders `<Card3D faceUp position={[0, y_offset, 0]} />`
     - Y offset increases by 0.03 per card (stacking visual)
   - Only shows the top 5-8 cards visually (performance: don't render 53 stacked cards)
   - Displays current pile value using `<Text>` from Drei above the stack:
     - When `lastValue` is not null: shows the number
     - When `lastValue` is null (after Bomb/Nuclear): shows empty or "—"
   - When pile is empty: shows an empty zone (subtle circle outline on table surface, optional)

3. Create `src/components/three/DeckPile3D.tsx` (optional visual):
   - Visual representation of the remaining draw pile
   - Position: slightly offset from middle pile (e.g., [1.5, 0, 0])
   - Stack thickness proportional to remaining card count (clamped for visual)
   - Face-down cards, dark colored
   - Low detail: simple box representing the deck height
   - Reads `deck.length` from store

4. Update `src/components/three/PlayerSlot3D.tsx`:
   - Add `<LifeTokens>` for each player
   - Position life tokens below/to the side of the card hand

5. Update `src/components/three/GameScene.tsx`:
   - Add `<MiddlePile3D />` at center
   - Add `<DeckPile3D />` offset from center

## Out of Scope
- Card play animations (STORY-014)
- VFX for special cards (STORY-018)
- HUD text overlays showing pile value (STORY-016)
- Elimination animation (STORY-018)

## Files Likely Affected
- `src/components/three/LifeTokens.tsx` (create)
- `src/components/three/MiddlePile3D.tsx` (update from placeholder)
- `src/components/three/DeckPile3D.tsx` (create)
- `src/components/three/PlayerSlot3D.tsx` (update — add LifeTokens)
- `src/components/three/GameScene.tsx` (update — add MiddlePile3D and DeckPile3D)

## Implementation Notes
- Life tokens use shared geometry and material instances (`useMemo`) across all instances for memory efficiency
- Max 20 life tokens in scene (4 players x 5 lives). Use instanced meshes if performance is a concern
- Middle pile rendering: cap at 5 visible stacked cards for performance; show a count indicator for more
- The `<Text>` component from Drei for pile value: position it at `[0, 0.5, 0]` (above the card stack), use a large font size for readability
- Deck pile: simple `<RoundedBox>` with height proportional to `Math.min(deck.length, 30) * 0.025` — caps visual height
- Color coding: lost life tokens should be clearly visually distinct (not just color — also opacity or shape)

## Test Requirements
- [x] LifeTokens renders correct number of active tokens (5 full lives = 5 bright tokens)
- [x] LifeTokens with 3 lives: 3 bright, 2 dim/gray tokens
- [x] LifeTokens with 0 lives: all dim/gray tokens
- [x] MiddlePile3D shows stacked cards when pile has cards
- [x] MiddlePile3D shows value text when lastValue is set
- [x] MiddlePile3D shows empty/blank when lastValue is null (after Bomb/Nuclear)
- [x] MiddlePile3D shows nothing when pile is empty (no cards, no value)
- [x] MiddlePile3D handles large piles (10+ cards) without rendering all of them
- [x] DeckPile3D shows visual proportional to remaining cards
- [x] DeckPile3D shows empty/minimal when deck is depleted
- [x] PlayerSlot3D includes life tokens at correct position

## Edge Cases
- Middle pile with 40+ cards (performance: only render top few)
- Middle pile value after Random card (shows the rolled number)
- Life tokens when player has exactly 0 lives (all gray, player is eliminated)
- Deck visualization when deck has 0 cards (show empty or hide)
- Middle pile after Nuclear (pile array empty, lastValue null — clean center view)

## Dependencies
- STORY-009 (Zustand store — reading middlePile, deck, player lives)
- STORY-011 (3D scene foundation)
- STORY-012 (Card3D component reused in middle pile)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed
- [x] QA review passed
- [x] Story closed
