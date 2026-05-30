# STORY-012 — 3D Card Model, Player Hand Rendering & Card Interaction

**Status:** CLOSED

---

## Requirement IDs
- FR-032 (empty pile: all cards valid/interactive)
- FR-033 (pile has value: cards >= value are interactive)
- FR-034 (play card → draw replacement)
- FR-036 (invalid cards visually disabled: grayed out / locked)
- FR-072 (human cards: 3D face-up, interactive via touch)
- FR-073 (bot cards: 3D face-down)
- FR-078 (all assets procedural)
- NFR-003 (touch response <=200ms)
- NFR-008 (valid/invalid distinguishable by color + visual state, not color alone)
- IR-009 (touch/pointer events)

## Acceptance Criteria IDs
- AC-003 (human has 3 face-up cards, bots have face-down)
- AC-004 (all cards valid when pile is empty)
- AC-005 (cards < pile value are disabled, >= pile value interactive)
- AC-006 (tap valid card → animates to pile, draws replacement)
- AC-022 (touch targets >= 44x44px effective size)

## Business Context
Cards are the primary interactive element. Players must clearly see their hand, distinguish valid from invalid cards, and tap to play. Bot cards must be face-down to maintain game integrity. The card model is procedural, ensuring instant load and no external assets.

## Technical Context
Per architecture Section 9 (Card3D Geometry), each card is composed of: a RoundedBox body (0.7 x 1.0 x 0.02), front face text, back face pattern, and a colored edge stripe. CardHand arranges cards in a fan layout. `onPointerDown` handles both touch and mouse input.

## Scope
1. Create `src/components/three/Card3D.tsx`:
   - Props: `card: Card`, `faceUp: boolean`, `disabled: boolean`, `onTap?: (cardId: string) => void`
   - Procedural mesh composition:
     - **Card body:** `<RoundedBox args={[0.7, 1.0, 0.02]} radius={0.03} smoothness={2}>` with `MeshStandardMaterial`
       - Face-up: white/cream front face
       - Face-down: dark blue/purple with procedural pattern (e.g., crossed lines via geometry or simple color)
     - **Card value text:** `<Text>` from Drei on the front face showing value (1-13) or special card name
       - Number cards: black text, centered
       - Special cards: colored text (e.g., red for Bomb, green for Reverse)
     - **Edge stripe:** Thin `<mesh>` on the side, blue for number, red for special
   - Disabled state: `opacity: 0.4`, grayscale filter or darker material, lock icon or visual indicator
   - Interactive state: `onPointerDown` fires `onTap(card.id)`, cursor changes (if applicable)
   - Hover effect: slight scale up (1.05) or elevation (y + 0.05) on pointer hover
   - Use `React.memo` to prevent unnecessary re-renders

2. Create `src/components/three/CardHand.tsx`:
   - Props: `cards: Card[]`, `faceUp: boolean`, `playableCardIds: Set<string>`, `onCardTap?: (cardId: string) => void`
   - Arranges cards in a fan/spread layout:
     - 3 cards spaced evenly with slight rotation
     - Cards fan out from a central anchor point
     - Each card positioned with offset: card 0 at x=-0.8, card 1 at x=0, card 2 at x=0.8
     - Slight rotation: card 0 at -5deg, card 1 at 0deg, card 2 at +5deg
     - Vertical offset for arc: middle card slightly higher (y+0.1)
   - Passes `disabled={!playableCardIds.has(card.id)}` to each Card3D
   - Handles 0, 1, 2, or 3 cards gracefully (adjusts spread)

3. Create `src/hooks/useCardInteraction.ts`:
   - Returns `{ handleCardTap: (cardId: string) => void, isPlayable: (cardId: string) => boolean }`
   - `handleCardTap`:
     1. Check if it's human's turn (`useIsHumanTurn`)
     2. Check if card is playable (`usePlayableCards`)
     3. Check if not currently animating (`isAnimating` from animation slice)
     4. Dispatch `store.playCard(playerIndex, cardId)`
     5. Enqueue card-play animation
     6. Dispatch `store.drawCard(playerIndex)` after animation
     7. Update turn message
   - `isPlayable`: reads from `usePlayableCards` selector

4. Update `src/components/three/PlayerSlot3D.tsx`:
   - Full implementation with position and card hand
   - Props: `playerIndex: number`, `position: [number, number, number]`, `rotation: [number, number, number]`
   - Reads player data from store
   - Renders `<CardHand>` with appropriate `faceUp` (true for human, false for bots)
   - Human slot (index 0): position [0, 0, 3.5], no rotation, face-up cards, interactive
   - Bot slots: positions per architecture diagram, rotated to face center, face-down cards

## Out of Scope
- Card fly-to-pile animation (STORY-014)
- Life tokens (STORY-013)
- Middle pile rendering (STORY-013)
- Bot turn automation (STORY-015)
- HUD overlays (STORY-016)

## Files Likely Affected
- `src/components/three/Card3D.tsx` (create)
- `src/components/three/CardHand.tsx` (create)
- `src/components/three/PlayerSlot3D.tsx` (update from placeholder)
- `src/hooks/useCardInteraction.ts` (create)
- `src/components/three/Card3D.test.tsx` (create)
- `src/hooks/useCardInteraction.test.ts` (create)

## Implementation Notes
- Card dimensions 0.7 x 1.0 translate to approximately 44x60px on a typical mobile screen at the camera distance — meets minimum touch target
- `onPointerDown` is preferred over `onClick` for lower latency on touch devices (NFR-003: <=200ms)
- Disabled cards should NOT respond to pointer events (`pointerEvents: disabled ? 'none' : 'auto'`)
- Card value text uses Drei's `<Text>` component with a system font (no external font file)
- Special card visuals: use the effect name as text, with distinct colors per type
- `CardHand` fan layout uses simple math (no physics/spring animations for card positioning)
- `useCardInteraction` must prevent double-taps: disable interaction while `isAnimating` is true

## Test Requirements
- [x] Card3D renders with correct front/back face based on `faceUp` prop
- [x] Card3D shows correct value text for number cards
- [x] Card3D shows correct special name for special cards
- [x] Card3D disabled state: reduced opacity, no pointer interaction
- [x] Card3D `onTap` fires with card ID on pointer down
- [x] CardHand renders correct number of cards with fan layout
- [x] CardHand handles 0 cards (empty hand) gracefully
- [x] CardHand handles 1, 2, 3 cards with appropriate spacing
- [x] CardHand passes correct `disabled` state based on playable cards
- [x] `useCardInteraction.handleCardTap` dispatches `playCard` for valid card
- [x] `useCardInteraction.handleCardTap` does nothing for invalid/disabled card
- [x] `useCardInteraction.handleCardTap` does nothing during animation
- [x] PlayerSlot3D renders at correct position for human and bot players

## Edge Cases
- Card value 1 (lowest) and 13 (highest) display correctly
- Special card with no value shows effect name instead of number
- Rapid tapping on valid card (should ignore second tap while animating)
- Player has fewer than 3 cards (deck depleted) — hand shows only available cards
- All cards in hand are disabled (visual feedback: all grayed out)

## Dependencies
- STORY-002 (Card type definitions)
- STORY-003 (card validation functions)
- STORY-009 (Zustand store with selectors)
- STORY-011 (3D scene, Canvas, GameScene exist)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed (76/76)
- [x] QA review passed (104/104, 0 defects)
- [x] Story closed (2026-05-31)
