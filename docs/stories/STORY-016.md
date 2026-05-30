# STORY-016 — HUD Overlay (Turn Indicator, Player Info, Deck Counter, Direction, Middle Pile Value)

**Status:** Ready

---

## Requirement IDs
- FR-080 (turn indicator overlay: whose turn + instructions)
- FR-082 (player names and life counts as 2D overlays above each player position)
- FR-083 (deck counter: remaining cards)
- FR-084 (spectator message when human is eliminated)
- NFR-005 (adapt to mobile widths 320-428px)
- NFR-008 (card values readable, valid/invalid distinguishable by color + visual state)

## Acceptance Criteria IDs
- AC-002 (3D game scene loads with HUD)
- AC-003 (player positions visible with life tokens and names)
- AC-008 (direction indicator changes after Reverse)
- AC-014 (spectator banner when eliminated)
- AC-015 (whose turn always visible)
- AC-022 (portrait mode, touch targets adequate)

## Business Context
The HUD (Heads-Up Display) provides all the textual/numerical information players need during gameplay. It overlays the 3D scene with critical game information: whose turn it is, player names and lives, the current pile value, deck count, and turn direction.

## Technical Context
Per architecture Section 10, the HUD is an HTML overlay div positioned over the Canvas with `position: absolute; inset: 0; pointer-events: none`. Individual elements are positioned using Tailwind utility classes. All reads come from the Zustand store via selectors.

## Scope
1. Create `src/components/ui/HUD.tsx`:
   - Container component that renders all HUD elements
   - Positioned as `absolute inset-0 pointer-events-none` over the Canvas
   - Contains all child overlay components

2. Create `src/components/ui/TurnIndicator.tsx`:
   - Reads `turnMessage` from store (already created in STORY-015, but ensure proper styling here)
   - Shows "Your turn! Play a card" (human turn)
   - Shows "Bot X is thinking..." (bot turn)
   - Shows "Bot X played [card]" (after bot action)
   - Shows "Bot X lost a life!" (after pass)
   - Styling: top-center, semi-transparent dark bg, white text, rounded, `text-sm` or `text-base`
   - Different background color for human turn (blue/teal accent) vs bot turn (gray)
   - Transitions: fade in/out with CSS transitions

3. Create `src/components/ui/PlayerInfo.tsx`:
   - One instance per player (4 total), positioned at each player slot
   - Props: `player: Player`
   - Displays:
     - Player name ("You", "Bot 2", "Bot 3", "Bot 4")
     - Lives remaining: "♥ 3/5" or heart icons
     - Status indicator: alive (normal), eliminated (greyed + strikethrough or "Eliminated" label)
   - Positioning: CSS absolute positioned near each 3D player slot
     - Human (bottom): centered bottom, above cards
     - Bot 3 (top): centered top
     - Bot 2 (left): left side, vertically centered
     - Bot 4 (right): right side, vertically centered
   - Styling: small text, dark pill background, white text
   - Highlights active player (whose turn it is) with a border or glow

4. Create `src/components/ui/DeckCounter.tsx`:
   - Reads `useDeckCount()` from store
   - Displays: "Deck: 41" or card icon + count
   - Position: top-right or bottom-right corner
   - Updates in real-time as cards are drawn
   - Shows "Deck: 0" with warning color when empty

5. Create `src/components/ui/DirectionIndicator.tsx`:
   - Reads `direction` from store
   - Displays clockwise (↻) or counter-clockwise (↺) arrow/symbol
   - Position: near the deck counter or center-top
   - Visual distinction: different colors or arrow directions
   - Updates immediately when Reverse is played
   - Small animated rotation when direction changes (optional CSS transition)

6. Create `src/components/ui/MiddlePileValue.tsx`:
   - Reads `lastValue` from store
   - Displays current pile value as a number (e.g., "8")
   - When null: shows "—" or "Empty"
   - Position: Center of screen (over the 3D middle pile)
   - Large, bold text for easy reading
   - After Random card: briefly shows "🎲 7!" with animation (optional)

7. Create `src/components/ui/SpectatorBanner.tsx`:
   - Conditional: only shown when human player is eliminated
   - Reads `players[0].status` (human player)
   - Displays: "You are now spectating" banner
   - Styling: top-center, semi-transparent dark red background, white text
   - Persistent while human is in spectator mode

## Out of Scope
- Game over screen (STORY-019)
- Title screen (STORY-010)
- 3D elements (separate stories)
- Card animations (STORY-014)

## Files Likely Affected
- `src/components/ui/HUD.tsx` (create)
- `src/components/ui/TurnIndicator.tsx` (create/update if exists from turn message)
- `src/components/ui/PlayerInfo.tsx` (create)
- `src/components/ui/DeckCounter.tsx` (create)
- `src/components/ui/DirectionIndicator.tsx` (create)
- `src/components/ui/MiddlePileValue.tsx` (create)
- `src/components/ui/SpectatorBanner.tsx` (create)
- `src/App.tsx` (update — add HUD overlay div)

## Implementation Notes
- The HUD layer uses `pointer-events-none` on the container so 3D card taps pass through
- Individual HUD elements that need interaction (none in this story, but future-proofing) can override with `pointer-events-auto`
- Use `z-index: 10` for HUD elements above the Canvas
- Player info positioning: use fixed percentage positions or calculate based on viewport
  - Human: `bottom-4 left-1/2 -translate-x-1/2`
  - Bot 3 (top): `top-4 left-1/2 -translate-x-1/2`
  - Bot 2 (left): `left-2 top-1/2 -translate-y-1/2`
  - Bot 4 (right): `right-2 top-1/2 -translate-y-1/2`
- All text must be legible on 320px screens — use `text-xs` minimum, `text-sm` for primary info
- Dark semi-transparent backgrounds ensure readability over any 3D scene colors
- Heart icon for lives: use ♥ character or a simple SVG

## Test Requirements
- [x] HUD renders without blocking card interactions
- [x] TurnIndicator shows correct message for human turn
- [x] TurnIndicator shows correct message for bot turn
- [x] PlayerInfo shows all 4 players with names and lives
- [x] PlayerInfo highlights the active player
- [x] PlayerInfo shows "Eliminated" for eliminated players
- [x] DeckCounter shows correct remaining card count
- [x] DeckCounter updates when cards are drawn
- [x] DirectionIndicator shows correct direction symbol
- [x] DirectionIndicator updates after Reverse
- [x] MiddlePileValue shows current value when set
- [x] MiddlePileValue shows "—" or blank when null
- [x] SpectatorBanner appears when human is eliminated
- [x] SpectatorBanner hidden when human is alive
- [x] HUD is readable at 320px width

## Edge Cases
- All overlays visible simultaneously on a small screen (320px) — may overlap
- Turn message changes rapidly during bot turns (don't flash excessively)
- Player info for eliminated player should not be confusing (clear visual distinction)
- HUD over bright 3D scene areas (ensure text contrast with dark bg)
- Direction indicator when direction hasn't changed yet (default clockwise)

## Dependencies
- STORY-009 (Zustand store with selectors)
- STORY-010 (App.tsx structure for overlay)
- STORY-011 (Canvas component exists)
- STORY-015 (Turn messages set by game loop)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
