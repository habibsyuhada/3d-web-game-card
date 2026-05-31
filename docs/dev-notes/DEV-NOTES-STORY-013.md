# DEV-NOTES-STORY-013 — Life Tokens & Middle Pile 3D Rendering

**Developer:** Dev Agent  
**Date:** 2026-05-31  
**Story Points:** 5  
**Status:** Complete  

---

## Summary

Implemented three new 3D components for the Zinky Zoogle card game:
1. **LifeTokens** — row of sphere gem meshes representing player lives
2. **MiddlePile3D** — stacked played cards with pile value text display
3. **DeckPile3D** — visual draw pile indicator

Integrated all into **PlayerSlot3D** and **GameScene**.

---

## Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `src/components/three/LifeTokens.tsx` | Create | Life token gem meshes (sphere [0.08, 8, 6]) |
| `src/components/three/DeckPile3D.tsx` | Create | Draw pile RoundedBox visualization |
| `src/components/three/MiddlePile3D.tsx` | Replace | Full implementation replacing placeholder |
| `src/components/three/PlayerSlot3D.tsx` | Update | Added LifeTokens integration |
| `src/components/three/GameScene.tsx` | Update | Added DeckPile3D import and render |
| `src/components/three/LifeTokens.test.tsx` | Create | 4 unit tests |
| `src/components/three/MiddlePile3D.test.tsx` | Create | 5 unit tests |
| `src/components/three/DeckPile3D.test.tsx` | Create | 3 unit tests |

---

## Key Design Decisions

1. **Shared geometry in LifeTokens** — All tokens reuse the same `<sphereGeometry>` JSX created once in `useMemo`, reducing GPU memory allocation per re-render.

2. **Performance cap on MiddlePile3D** — Only the top 5 cards are rendered (`pile.slice(-5)`). This prevents rendering 53 stacked cards which would tank FPS. The `<Text>` above shows the actual `lastValue`.

3. **Deck height capping** — `Math.min(deckCount, 30) * 0.025` ensures the visual deck doesn't grow taller than reasonable even with 41 remaining cards.

4. **LifeTokens rotation** — Group is rotated `[-Math.PI/2, 0, 0]` to lay flat on the table surface alongside the card hand.

5. **Empty pile marker** — A subtle white ring (`ringGeometry`) marks the middle pile position when empty, providing spatial orientation.

6. **DeckPile3D empty state** — Shows a minimal flat marker (0.01 height, 30% opacity) when deck is depleted.

---

## Edge Cases Handled

- **Middle pile with 40+ cards** — capped at 5 visible cards
- **Middle pile value after Bomb** — `lastValue` is not null (Bomb sets new value), shows number
- **Middle pile value after Nuclear** — `lastValue` null, pile empty, shows nothing
- **Life tokens at 0 lives** — all gray/dim tokens, player eliminated
- **Deck at 0 cards** — minimal flat marker rendered
- **Large piles** — only top 5 cards rendered for performance

---

## Test Coverage

- **LifeTokens:** 4 tests (5 lives all bright, 3 lives mixed, 0 lives all dim, custom maxLives)
- **MiddlePile3D:** 5 tests (with cards, empty pile, null lastValue, large pile cap, value text)
- **DeckPile3D:** 3 tests (full deck, empty deck, proportional height)

**Total new tests:** 12  
**All tests passing:** 249/249 (20 test files)

---

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | ✅ Pass |
| `npm run lint` | ✅ Pass |
| `npm test` | ✅ 249/249 Pass |
| `npm run build` | ✅ Pass |

---

## Deviations from Story Spec

- None significant. All scope items implemented as specified.
