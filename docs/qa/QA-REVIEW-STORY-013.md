# QA Review

**Story ID:** STORY-013 — Life Tokens & Middle Pile 3D Rendering  
**Status:** PASS  
**QA Engineer:** QA Agent  
**Date:** 2026-05-31

---

## Summary

STORY-013 delivers three core 3D rendering components for the Zinky Zoogle card game: `LifeTokens`, `MiddlePile3D`, and `DeckPile3D`. These integrate into `PlayerSlot3D` and `GameScene` to provide visual feedback for player lives, the played-card pile, and the draw deck. All acceptance criteria are satisfied, all 20 new tests pass (249/249 full suite), TypeScript compiles cleanly, and the production build succeeds.

---

## Acceptance Criteria Check

| AC ID | Description | Status | Evidence |
|-------|-------------|--------|----------|
| AC-003 | Each player shows 5 life tokens | PASS | `LifeTokens.tsx` renders `maxLives=INITIAL_LIVES=5` spheres. Verified at `PlayerSlot3D` integration line 53–57. Test: "renders 5 tokens when maxLives is 5 (default)" passes. |
| AC-005 | Middle pile updates in 3D after play | PASS | `MiddlePile3D.tsx` subscribes to `state.middlePile`, renders top 5 cards with Y offsets (0.03/card). Test: "renders stacked Card3D components for played cards" passes. |
| AC-010 | Bomb resets middle pile value | PASS | `valueText` logic: `lastValue !== null ? String(lastValue) : middlePile.length > 0 ? '\u2014' : ''`. After Bomb `lastValue` is null, pile may have cards → shows "—". Test: "shows '—' when lastValue is null but pile has cards (after Bomb)" passes. |
| AC-011 | Nuclear clears all middle pile cards | PASS | After Nuclear: `middlePile=[]`, `lastValue=null` → only ring outline marker renders. Test: "shows no value text when pile is empty and lastValue is null (after Nuclear)" passes. |

---

## Test Commands Run

| Command | Result |
|---------|--------|
| `npm test -- --run` | 249/249 passed (20 test files) |
| `npm test -- --run src/components/three/LifeTokens.test.tsx` | 6/6 passed |
| `npm test -- --run src/components/three/MiddlePile3D.test.tsx` | 9/9 passed |
| `npm test -- --run src/components/three/DeckPile3D.test.tsx` | 5/5 passed |
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | Built successfully in 15.67s |

---

## Test Results

### LifeTokens (6 tests)
| Test | Result |
|------|--------|
| renders 5 tokens when maxLives is 5 (default) | PASS |
| renders 5 active (bright) tokens when count is 5 | PASS |
| renders 3 bright + 2 dim tokens when count is 3 | PASS |
| renders all dim/gray tokens when count is 0 | PASS |
| renders custom maxLives correctly (e.g., 3 tokens) | PASS |
| lost tokens have reduced opacity (0.3) | PASS |

### MiddlePile3D (9 tests)
| Test | Result |
|------|--------|
| renders without crashing when pile is empty | PASS |
| shows no cards and no value text when pile is empty | PASS |
| renders stacked Card3D components for played cards | PASS |
| shows value text when lastValue is set | PASS |
| shows "—" when lastValue is null but pile has cards (after Bomb) | PASS |
| shows no value text when pile is empty and lastValue is null (after Nuclear) | PASS |
| only renders top 5 cards when pile has 10+ cards | PASS |
| shows correct value text even with a large pile | PASS |
| shows Random card rolled value | PASS |

### DeckPile3D (5 tests)
| Test | Result |
|------|--------|
| renders a RoundedBox when deck has cards | PASS |
| RoundedBox height is proportional to deck count | PASS |
| caps visual height at 30 cards | PASS |
| renders a minimal RoundedBox when deck is empty | PASS |
| empty deck has minimal height (0.01) | PASS |

---

## Manual Review

### Code Quality

| Criterion | Status | Notes |
|-----------|--------|-------|
| TypeScript strictness | PASS | Clean `tsc --noEmit` — zero type errors |
| React.memo on leaf components | PASS | LifeTokens, MiddlePile3D, DeckPile3D all wrapped |
| Shared geometry/materials (useMemo) | PASS | LifeTokens uses `useMemo` for shared sphere geometry |
| Individual store selectors | PASS | `useDeckCount()`, `state.middlePile`, `state.lastValue` — granular to minimize re-renders |
| Constants extracted | PASS | `TOKEN_SPACING`, `CARD_STACK_OFFSET`, `MAX_VISIBLE_CARDS`, `MAX_VISUAL_CARDS`, `EMPTY_DECK_HEIGHT`, `CARD_THICKNESS` |
| JSDoc/file comments | PASS | All files have comprehensive header documentation |
| Dead code | PASS | No orphaned logic or unused imports |
| Build | PASS | Production build succeeds with no errors |

### Integration Check

| Integration Point | Status | Notes |
|-------------------|--------|-------|
| PlayerSlot3D → LifeTokens | PASS | `count={player.lives}`, `position={[0, 0.02, -0.7]}`, `maxLives={INITIAL_LIVES}` |
| GameScene → MiddlePile3D | PASS | Rendered after `<Table3D />` at scene center |
| GameScene → DeckPile3D | PASS | Rendered after `<MiddlePile3D />` offset at `[1.5, 0.02, 0]` |
| Store → MiddlePile3D | PASS | Uses `useGameStore((s) => s.middlePile)` and `useGameStore((s) => s.lastValue)` |
| Store → DeckPile3D | PASS | Uses `useDeckCount()` from `../../store/selectors` |

---

## Edge Cases Checked

| Edge Case | Status | Evidence |
|-----------|--------|----------|
| Middle pile with 40+ cards | PASS | `MAX_VISIBLE_CARDS=5` with `slice(-5)`. Test "only renders top 5 cards when pile has 10+ cards" passes. |
| Middle pile value after Random card | PASS | `String(lastValue)` — shows rolled number. Test "shows Random card rolled value" passes. |
| Life tokens at 0 lives (eliminated) | PASS | All tokens render with `active: false` → color `#333333`, opacity `0.3`, `transparent: true`. Test "renders all dim/gray tokens when count is 0" passes. |
| Deck at 0 cards | PASS | `EMPTY_DECK_HEIGHT=0.01`, gray color `#4a4a4a`, opacity `0.3`. Test "empty deck has minimal height (0.01)" passes. |
| Middle pile after Nuclear | PASS | Empty `middlePile` + null `lastValue` → renders only ring outline, no cards, no value text. Test "shows no value text when pile is empty and lastValue is null" passes. |
| Life tokens with custom maxLives | PASS | Test "renders custom maxLives correctly (e.g., 3 tokens)" validates prop override. |
| Deck with 45 cards (height cap) | PASS | `Math.min(45, 30) * 0.025 = 0.75`. Test "caps visual height at 30 cards" passes. |

---

## Bugs Found

None.

---

## Regression Risk

| Risk Area | Assessment |
|-----------|------------|
| Existing CardHand/PlayerSlot interaction | LOW — LifeTokens added as a sibling, no existing DOM or prop logic modified |
| Existing GameScene rendering | LOW — MiddlePile3D/DeckPile3D added as new children, no existing children altered |
| Performance (NFR-001: ≥30 FPS) | LOW — Life tokens: max 20 spheres × 60 tris = 1,200 tris total. Middle pile: capped at 5 cards. Deck: 1 RoundedBox. All lightweight. |
| Store selector pattern | NONE — New selectors added; existing selectors unchanged |
| Memory leaks | NONE — React.memo prevents unnecessary re-renders, useMemo for geometry, no manual subscriptions or event listeners requiring cleanup |

---

## Minor Observations (Non-blocking)

1. **DeckPile3D.tsx line 28 — JSDoc formatting:** The second line of the JSDoc block uses `//` instead of ` * `. This is a cosmetic-only issue and doesn't affect functionality or documentation tooling.

2. **Uncommitted changes:** STORY-013 source and test files exist in the working tree but are not yet committed to git. This is a release management concern, not a code quality issue.

3. **No Suspense boundary in GameScene:** The `<Text>` component from `@react-three/drei` loads a font asynchronously. This is typically handled by a `<Suspense>` boundary at the `<Canvas>` level. If the parent scene lacks a Suspense boundary, the text will briefly flash. This falls under NFR territory and was not flagged as an issue during build/test — it may be handled at a higher level (e.g., the Canvas wrapper in the app root).

4. **Build warning — chunk size:** The `three-vendor` chunk at 1,058 kB exceeds the 600 kB Vite warning threshold. This is pre-existing (Three.js is inherently large) and not introduced by STORY-013.

---

## Final Verdict

**PASS**

All acceptance criteria (AC-003, AC-005, AC-010, AC-011) are satisfied. All 20 new tests pass. The full test suite (249 tests) passes. TypeScript compiles with zero errors. The production build succeeds. Edge cases are handled. Code quality is high with proper React.memo usage, useMemo for shared geometry, granular Zustand selectors, and comprehensive documentation. No bugs, regressions, or performance issues found. STORY-013 is ready to be closed.
