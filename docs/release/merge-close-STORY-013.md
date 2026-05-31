# Merge and Close Notes

**Story ID:** STORY-013  
**Story Title:** Life Tokens & Middle Pile 3D Rendering  
**Wave:** Wave 4 — Animation & Loop  
**Status:** CLOSED  
**Close Date:** 2026-05-31  

---

## 1. Story Summary

STORY-013 (5 pts) delivers three new 3D visual components for the Zinky Zoogle card game:

1. **LifeTokens** — A row of low-poly sphere gem meshes representing each player's remaining lives. Active tokens are bright red (`#e74c3c`), lost tokens are dim gray (`#333`, opacity 0.3). Supports custom `maxLives` (default 5).
2. **MiddlePile3D** — The central played-card stack at table center. Renders up to 5 stacked `Card3D` components with Y offsets (0.03 per card) and displays the current pile value via `<Text>` above the stack. Shows a subtle ring marker when empty.
3. **DeckPile3D** — A visual draw pile indicator offset from center. `RoundedBox` height is proportional to remaining cards (capped at 30). Shows a minimal flat marker when depleted.

All three components are integrated into `PlayerSlot3D` (life tokens per player) and `GameScene` (middle pile + deck pile). Performance-conscious design: React.memo, useMemo shared geometry, granular Zustand selectors, and sensible rendering caps.

This is the **first story of Wave 4**, establishing the visual anchors needed before animations (STORY-014), game loop (STORY-015), and HUD (STORY-016).

---

## 2. Gate Summary

| Gate | Reviewer | Score | Status |
|------|----------|-------|--------|
| Developer Self-Review | Dev Agent | READY_FOR_SM_REVIEW | PASS |
| Scrum Master Completion Review | SM Agent | **ALL PASS (20/20 tests, 5/5 scope items)** | **APPROVED** |
| QA Review | QA Agent | **PASS (0 defects, 4/4 AC met)** | **PASS** |
| **All Gates** | | | **CLOSED** |

---

## 3. Files Delivered (8 files)

### Created (6 files)

| # | File | Description |
|---|------|-------------|
| 1 | `src/components/three/LifeTokens.tsx` | Life token gem meshes — up to 5 spheres with active/lost states, shared geometry via useMemo, React.memo wrapped |
| 2 | `src/components/three/MiddlePile3D.tsx` | Middle pile renderer — stacked Card3D (top 5), pile value Text, empty ring marker, React.memo wrapped |
| 3 | `src/components/three/DeckPile3D.tsx` | Deck pile indicator — RoundedBox proportional to deck count (capped at 30), empty flat marker, React.memo wrapped |
| 4 | `src/components/three/LifeTokens.test.tsx` | 6 tests: full lives, partial lives, zero lives, custom maxLives, opacity for lost tokens |
| 5 | `src/components/three/MiddlePile3D.test.tsx` | 9 tests: empty pile, stacked cards, value text, Bomb scenario, Nuclear scenario, large pile cap, Random card value |
| 6 | `src/components/three/DeckPile3D.test.tsx` | 5 tests: deck with cards, proportional height, height cap at 30, empty deck, minimal height |

### Modified (2 files)

| # | File | Description |
|---|------|-------------|
| 7 | `src/components/three/PlayerSlot3D.tsx` | Added `<LifeTokens>` per player with `count={player.lives}`, `maxLives={INITIAL_LIVES}`, positioned at `[0, 0.02, -0.7]` |
| 8 | `src/components/three/GameScene.tsx` | Added `<MiddlePile3D />` at center and `<DeckPile3D />` offset at `[1.5, 0.02, 0]` |

**Total: 6 created + 2 modified = 8 files**

---

## 4. Component Specifications

### LifeTokens

| Element | Implementation |
|---------|----------------|
| Geometry | `sphereGeometry args={[0.08, 8, 6]}` (~60 tris, shared via useMemo) |
| Active color | `#e74c3c` (bright red) |
| Lost color | `#333333` (dark gray), opacity 0.3, transparent |
| Spacing | `TOKEN_SPACING = 0.2` units apart, centered row |
| Custom maxLives | Supported via optional prop (default 5) |
| Performance | React.memo, shared geometry, max 20 spheres total (4 players x 5) |

### MiddlePile3D

| Element | Implementation |
|---------|----------------|
| Position | `[0, 0.02, 0]` (table center) |
| Card source | `state.middlePile` from Zustand store |
| Card rendering | `<Card3D card={card} faceUp={true} disabled={true} />` |
| Stack offset | `CARD_STACK_OFFSET = 0.03` Y per card |
| Visible cap | `MAX_VISIBLE_CARDS = 5`, `slice(-5)` |
| Value text | `<Text>` at `[0, 0.5, 0]`, fontSize 0.4 |
| lastValue set | Shows `String(lastValue)` |
| lastValue null (Bomb) | Shows "—" (em dash) |
| Empty pile | Ring marker (`ringGeometry [0.35, 0.4, 32]`), no cards, no text |

### DeckPile3D

| Element | Implementation |
|---------|----------------|
| Position | `[1.5, 0.02, 0]` (offset from center) |
| Height | `Math.min(deckCount, 30) * 0.025` |
| Color | `#1e3a5f` (dark blue) with card-back watermark |
| Empty state | `EMPTY_DECK_HEIGHT = 0.01`, gray `#4a4a4a`, opacity 0.3 |
| Store selector | `useDeckCount()` from selectors |

---

## 5. Test Coverage

### Story-Specific Tests

| Test File | Tests | Status |
|-----------|-------|--------|
| `LifeTokens.test.tsx` | 6 | ALL PASS |
| `MiddlePile3D.test.tsx` | 9 | ALL PASS |
| `DeckPile3D.test.tsx` | 5 | ALL PASS |
| **New tests (STORY-013)** | **20** | **ALL PASS** |
| **Project total (20 files)** | **249** | **ALL PASS** |

### Coverage Highlights

- **LifeTokens:** Full lives (5 bright), partial (3+2), zero (all dim), custom maxLives, lost token opacity
- **MiddlePile3D:** Stacked cards, value text, empty pile, Bomb (lastValue null), Nuclear (empty + null), large pile cap (10+), Random card value, value text with large pile
- **DeckPile3D:** Proportional height, height cap at 30, empty deck with minimal marker, full deck rendering
- **Zero regressions** across all 249 tests

---

## 6. Acceptance Criteria

| AC ID | Criterion | Evidence | Status |
|-------|-----------|----------|--------|
| AC-003 | Each player shows 5 life tokens | `LifeTokens` renders 5 sphere tokens per player with `maxLives=INITIAL_LIVES`; integrated in PlayerSlot3D | **PASS** |
| AC-005 | Middle pile updates in 3D after play | `MiddlePile3D` subscribes to `state.middlePile`, re-renders on change; top 5 cards with Y offsets | **PASS** |
| AC-010 | Bomb resets middle pile value | After Bomb: `lastValue` handled by store; MiddlePile3D shows correct value or "—" | **PASS** |
| AC-011 | Nuclear clears all middle pile cards | After Nuclear: empty pile → only ring marker, no cards, no text | **PASS** |

**4/4 Acceptance Criteria Met**

---

## 7. Story Points

**5 pts** — Medium complexity. Three new components with test suites, two existing components updated. All performance-conscious (memo, useMemo, rendered-card cap).

---

## 8. Wave 4 Progress

| Metric | Value |
|--------|-------|
| **Wave 4 Stories** | 1/4 (STORY-013 complete) |
| **Wave 4 Points** | 5/23 completed |
| **STORY-013 New Tests** | 20 (12 required by spec, 8 bonus) |
| **Total Tests** | 249 across 20 files |
| **QA Defects (STORY-013)** | 0 |
| **Build Failures** | 0 |
| **Lint Violations** | 0 |

### Wave 4 Stories

| Story | Title | Points | SM Review | QA Review | Status |
|-------|-------|--------|-----------|-----------|--------|
| STORY-013 | Life Tokens & Middle Pile 3D Rendering | 5 | APPROVED | PASS | **CLOSED** |
| STORY-014 | Card Play Animation & Draw Animation | 5 | — | — | In Progress |
| STORY-015 | Bot Turn Hook & Game Loop Orchestration | 8 | — | — | Queued |
| STORY-016 | HUD Overlay | 5 | — | — | Queued |

---

## 9. Next Story

**STORY-014 — Card Play Animation & Draw Animation** (5 pts, Medium-High complexity)

- Card play animation: hand → middle pile with `<motion.group>` position tween (400ms)
- Card draw animation: deck → hand with position tween (300ms)
- Animation queue orchestration integrated with Zustand store
- Bot card animations visible (face-down flight, flip to face-up at pile)
- Dependencies: STORY-009, STORY-012, STORY-013 (all complete)

---

## 10. Recommended Commit Message

```
feat(3d): add life tokens, middle pile, and deck pile 3D rendering (STORY-013)

- Create LifeTokens: row of sphere gem meshes representing player lives,
  active (#e74c3c) / lost (#333 opacity 0.3), shared geometry via useMemo,
  horizontal row with 0.2 unit spacing, custom maxLives support, React.memo
- Create MiddlePile3D: stacked Card3D at table center, top 5 cards visible
  with 0.03 Y offset per card, pile value Text above stack, em dash for
  Bomb reset, ring outline marker when pile empty, React.memo
- Create DeckPile3D: RoundedBox draw pile indicator at [1.5, 0.02, 0],
  height proportional to remaining cards (capped at 30), dark blue with
  card-back watermark, minimal flat marker when depleted, React.memo
- Update PlayerSlot3D with LifeTokens integration per player
- Update GameScene with MiddlePile3D and DeckPile3D at scene center
- Add 20 unit tests (LifeTokens, MiddlePile3D, DeckPile3D)
- Project now has 249 passing tests across 20 files
- Wave 4 story 1/4 complete

Closes STORY-013
```

---

## 11. Git Instructions

```powershell
# Stage all STORY-013 changes
git add src/components/three/LifeTokens.tsx
git add src/components/three/MiddlePile3D.tsx
git add src/components/three/DeckPile3D.tsx
git add src/components/three/PlayerSlot3D.tsx
git add src/components/three/GameScene.tsx
git add src/components/three/LifeTokens.test.tsx
git add src/components/three/MiddlePile3D.test.tsx
git add src/components/three/DeckPile3D.test.tsx

# Commit with message above (use -m or -F for multi-line)
git commit -m "feat(3d): add life tokens, middle pile, and deck pile 3D rendering (STORY-013)"

# Push to feature branch
git push origin feature/STORY-013
```

---

## 12. QA Observations (Non-blocking, accepted)

1. **JSDoc formatting** in DeckPile3D line 28 uses `//` instead of `*` — cosmetic only.
2. **Suspense boundary** for `<Text>` font loading — typically handled at Canvas level.
3. **Three.js chunk size** (1,058 kB) — pre-existing, not introduced by STORY-013.

---

## 13. Final Checklist

| Item | Status |
|------|--------|
| All scope items implemented (5/5) | DONE |
| All tests passing (249/249) | DONE |
| Build clean (tsc + vite) | DONE |
| Lint clean (0 errors) | DONE |
| SM completion review | DONE |
| QA review (PASS, 0 defects) | DONE |
| Acceptance criteria (4/4) | DONE |
| Dev notes created | DONE |
| Story status updated to Done | DONE |
| Queue status updated to Done | DONE |
| Merge/close notes created | DONE |

---

## 14. Sign-Off

| Role | Date | Decision |
|------|------|----------|
| Developer | 2026-05-31 | Implemented and documented |
| Scrum Master | 2026-05-31 | APPROVED — Forwarded to QA |
| QA Engineer | 2026-05-31 | PASSED (0 defects, 4/4 AC met) |
| Scrum Master (Close) | 2026-05-31 | **CLOSED** — Wave 4 story 1/4 complete |

---

## Close Decision

**Status: CLOSED**

STORY-013 passes all quality gates. All scope items are implemented across three new 3D components (LifeTokens, MiddlePile3D, DeckPile3D), all integrated into PlayerSlot3D and GameScene. The full test suite (249/249) passes with 20 new STORY-013 tests covering all required and edge cases. TypeScript compiles cleanly. Build succeeds. QA found zero defects with all 4 acceptance criteria met. Code quality is high with proper React.memo, useMemo, granular Zustand selectors, and performance caps. No rework required.

Wave 4 is now 1/4 complete. STORY-014 (Card Play Animation & Draw Animation) is queued next.
