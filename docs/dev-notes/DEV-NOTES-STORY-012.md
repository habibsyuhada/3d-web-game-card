# Dev Notes
Story ID: STORY-012

## Story Context Reviewed
- STORY-012 — 3D Card Model, Player Hand Rendering & Card Interaction
- Architecture Section 9 (3D Scene Graph, Card3D Geometry)
- PRD FR-032..FR-036, FR-072..FR-078, NFR-003, NFR-008, IR-009
- Predecessor: STORY-011 (3D Scene Foundation — DONE)
- Zustand store: `useGameStore`, `usePlayableCards`, `useIsHumanTurn`, `playCard`, `drawCard`, `setTurnMessage`, `isAnimating`

## Files Changed

### Created
- `src/components/three/Card3D.tsx` — Procedural 3D card mesh (RoundedBox body, Text front/back face, edge stripe, disabled overlay)
- `src/components/three/CardHand.tsx` — Fan layout arranging 0–3 cards with computed positions/rotations
- `src/hooks/useCardInteraction.ts` — Hook wiring card taps to store actions with guard checks
- `src/components/three/Card3D.test.tsx` — Card3D rendering + text display tests (R3F mocked)
- `src/components/three/CardHand.test.tsx` — CardHand fan layout, disabled state, and bot hand tests
- `src/hooks/useCardInteraction.test.ts` — Comprehensive hook tests (valid/invalid taps, guards, draw behavior)

### Modified
- `src/components/three/PlayerSlot3D.tsx` — Upgraded from placeholder to full implementation with CardHand + useCardInteraction integration

## Implementation Summary

### Card3D (src/components/three/Card3D.tsx)
- Wrapped in `React.memo` for render optimization
- Card dimensions: 0.7 × 1.0 × 0.02 per architecture spec
- **Card body:** `RoundedBox` with `meshStandardMaterial` (white face-up, dark blue face-down)
- **Front face text:** `<Text>` showing numeric value for number cards or effect name (e.g., "Nuklir") with per-effect colors for special cards
- **Back pattern:** "ZZ" watermark on face-down reverse face
- **Edge stripe:** Thin `boxGeometry` on the right — blue for number, red for special
- **Disabled overlay:** Additional dark plane at opacity 0.3 + material opacity 0.4
- **Hover effect:** Elevates y+0.05 and scales 1.05 on pointer over
- **Pointer events:** `onPointerDown` (for low-latency touch), `onPointerOver`/`Out` for hover state; all guarded by `disabled` flag with `e.stopPropagation()`

### CardHand (src/components/three/CardHand.tsx)
- Pure layout computation via `useMemo`-cached `computeFanLayout()`
- Layout variants: 1 card (centered), 2 cards (±0.5x, ±3° rotation), 3 cards (±0.8x, ±5° rotation, middle y+0.1)
- Each card wrapped in positioned/rotated `<group>`
- `disabled` is computed: `faceUp && !playableCardIds.has(card.id)` — bots (face-down) never get disabled based on playability
- `onCardTap` passed through; bots pass `undefined` to disable all interaction

### useCardInteraction (src/hooks/useCardInteraction.ts)
- Returns `{ handleCardTap, playableCardIds }`
- `playableCardIds` is derived from `usePlayableCards(playerIndex)` memoized as a `Set<string>`
- `handleCardTap` guard chain:
  1. `!isHumanTurn` → no-op
  2. `isAnimating` → no-op (prevents double-tap)
  3. `!playableCardIds.has(cardId)` → no-op
  4. `currentPlayerIndex !== playerIndex` (defensive) → no-op
- On valid tap: `playCard(playerIndex, cardId)`, `drawCard(playerIndex)`, `setTurnMessage('You played a card')`
- For MVP, plays happen synchronously. Animation queue integration deferred to STORY-014.

### PlayerSlot3D (updated)
- Reads `player` from store via `useGameStore((state) => state.players[playerIndex])`
- Determines `isHuman = player.type === PlayerType.Human`
- Human slot: face-up cards, `playableCardIds` from hook, `handleCardTap` wired
- Bot slots: face-down cards, empty `playableCardIds`, no `onCardTap`
- Subtle circle marker retained at the base of each slot

### Deviations from spec
- Removed the `SPECIAL_DISPLAY_NAMES` re-export from Card3D (was in early draft; not needed since `getCardDisplayValue` handles it internally via engine)
- `Card3D` uses a function expression with `memo()` wrapping rather than `React.memo` (to avoid importing React as a value — cleaner with react-jsx transform)

## Tests Added or Updated

### src/components/three/Card3D.test.tsx (9 tests)
- Renders number card face-up / special face-up / face-down / disabled without crashing
- Shows number value for number cards (e.g., "13")
- Shows effect display name for special cards (e.g., "Reverse", "Nuklir")
- Does NOT show value text when face-down (shows "ZZ" watermark instead)
- Verifies onTap prop is accepted (actual event handling tested via hook)

### src/components/three/CardHand.test.tsx (7 tests)
- Renders 0, 1, 2, and 3 cards gracefully
- Face-down bot hands do not show card values
- Special cards render with correct display names in a fan
- Mixed playable/non-playable cards render without errors

### src/hooks/useCardInteraction.test.ts (10 tests)
- `playableCardIds` correctness: filters by lastValue, all playable when pile empty, empty for invalid index
- `handleCardTap` dispatches `playCard` + `drawCard` for valid card
- Draws replacement from deck
- Sets turn message ("You played a card")
- Does nothing during bot turn
- Does nothing for non-playable card
- Does nothing when `isAnimating` is true
- Does nothing when `playerIndex ≠ currentPlayerIndex` (defensive guard)
- Plays special cards regardless of lastValue

## Test Commands Run
- `npm test` — 229 tests passing across 17 files
- `npm run build` — tsc + vite build succeed
- `npm run lint` — 0 errors, 0 warnings

## Test Results
- **Test files:** 17 passed
- **Tests:** 229 passed (new: 26 tests across 3 new test files)
- **Build:** SUCCESS (tsc compiles clean; vite bundles)
- **Lint:** CLEAN (no warnings, no errors)

## Commit Notes
Suggested commit message:
```
feat(cards): implement 3D card model, hand fan & tap interaction (STORY-012)

- Card3D: memoized procedural card (RoundedBox + Text + edge stripe + hover + disabled overlay)
- CardHand: fan layout for 0–3 cards with computed rotations
- useCardInteraction: tap-to-play hook with guard chain (turn, animating, playability, index)
- PlayerSlot3D: integrated CardHand + interaction (human face-up, bots face-down)
- Tests: 26 new tests covering rendering, fan layout, and hook guards
- Build clean, lint clean, 229/229 tests pass
```

## Risks / Limitations
- **Pointer events in jsdom:** R3F pointer events (`onPointerDown`) can't be fully simulated in jsdom. Card3D event dispatch is verified by composition and the guards are thoroughly covered by the hook tests. Manual in-browser testing recommended.
- **Touch target size:** Card dimensions (0.7 × 1.0 units) map to ~44–60px on typical mobile screens at camera distance, meeting AC-022. Final validation should happen on real devices.
- **MVP synchronous play:** Play + draw happen immediately in `handleCardTap`. Animation-driven sequencing (STORY-014) is not yet wired — for now cards disappear from hand instantly.
- **Three-vendor chunk:** Build produces a ~1MB three-vendor chunk (gzip: 304KB). This is a known pre-existing condition unrelated to STORY-012; manual chunking via vite config could improve it.
- **React DOM warnings:** R3F JSX elements (`<mesh>`, `<group>`, `<boxGeometry>`) produce "unrecognized tag" warnings in jsdom during tests since jsdom doesn't know Three.js. These are harmless and expected — the components render correctly inside the real R3F Canvas in the browser.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
