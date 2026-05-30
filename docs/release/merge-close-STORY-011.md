# Merge and Close Notes

**Story ID:** STORY-011
**Title:** 3D Scene Foundation (Canvas, Camera, Lighting, Table)
**Wave:** Wave 3 — 3D Scene & Entry (2nd of 3 stories)
**Status:** CLOSED
**Close Date:** 2026-05-31

---

## 1. Story Summary

STORY-011 establishes the 3D rendering foundation for the Zinky Zoogle card game — the R3F Canvas, a performance-tuned camera, a 4-light lighting rig, a procedural green-felt table, and placeholder components for the middle pile and 4 player slots. Every subsequent 3D component (cards, tokens, player hands) will be placed within this scene graph.

The Developer also contributed a critical **R3F v8 ↔ React 19 JSX type bridge** in `vite-env.d.ts` that resolves a real-world type-system incompatibility between R3F v8's global `JSX.IntrinsicElements` augmentation and `@types/react@19`'s move to `React.JSX`. This is a zero-runtime-cost, type-only solution that unblocks all future 3D development.

---

## 2. Gate Summary

| Gate | Reviewer | Date | Result | Score |
|------|----------|------|--------|-------|
| Dev Complete | Developer | 2026-05-31 | READY_FOR_SM_REVIEW | — |
| SM Completion Review | Scrum Master | 2026-05-31 | FORWARD_TO_QA | All scope verified |
| QA Review | QA Engineer | 2026-05-31 | **PASS** | **66/66** (perfect) |

**Defects found:** 0
**Blocking deviations:** 0
**Regression risk:** LOW

---

## 3. Files Delivered

### 3.1 Created (5 files)

| # | File | Description |
|---|------|-------------|
| 1 | `src/components/three/GameScene.tsx` | Root 3D scene: lighting rig (4 lights), `<Table3D />`, `<MiddlePile3D />`, 4x `<PlayerSlot3D />` at cardinal positions |
| 2 | `src/components/three/Table3D.tsx` | Procedural table — Drei `RoundedBox` (8×0.1×6), green felt `#1a472a`, roughness 0.8, metalness 0.1, ~200 triangles |
| 3 | `src/components/three/MiddlePile3D.tsx` | Empty `<group>` placeholder at table center for STORY-013 |
| 4 | `src/components/three/PlayerSlot3D.tsx` | Placeholder with position/rotation props, circle markers (gold=human, gray=bot) |
| 5 | `src/components/three/GameScene.test.tsx` | 15 new tests: smoke, composition, App integration, all player slots |

### 3.2 Modified (3 files)

| # | File | Change |
|---|------|--------|
| 1 | `src/App.tsx` | Replaced placeholder with R3F `<Canvas>` + `<GameScene />`; Canvas configured with full performance profile |
| 2 | `src/components/ui/TitleScreen.test.tsx` | Added `vi.mock` for `@react-three/fiber` and `@react-three/drei`; updated game container assertion |
| 3 | `src/vite-env.d.ts` | Added R3F v8 ↔ React 19 JSX type bridge (augments `react/jsx-runtime` and `react/jsx-dev-runtime` with `ThreeElements`) |

### 3.3 Removed (1 file)

| # | File | Reason |
|---|------|--------|
| 1 | `src/components/three/.gitkeep` | Directory now populated with real components |

---

## 4. Scene Architecture

Per architecture Section 9, the 3D scene graph is structured as:

```
<Canvas dpr={[1,1.5]} gl={{...}} camera={{pos:[0,8,6], fov:50}}>
└── <GameScene>
    ├── <ambientLight intensity={0.4} />
    ├── <directionalLight position={[5,10,5]} intensity={0.8} />       (key)
    ├── <directionalLight position={[-3,5,-3]} intensity={0.3} />      (fill)
    ├── <spotLight position={[0,6,0]} intensity={0.5} angle={0.6} />   (pile)
    ├── <Table3D />           — RoundedBox 8×0.1×6, green felt #1a472a
    ├── <MiddlePile3D />      — empty group placeholder → STORY-013
    └── <PlayerSlot3D /> × 4 — cardinal positions
        P0: [0, 0, 3.5]  rot [0, 0, 0]     Human (bottom, face-up)
        P1: [-3, 0, 0]   rot [0, π/2, 0]   Bot 2 (left)
        P2: [0, 0, -3.5] rot [0, π, 0]     Bot 3 (top)
        P3: [3, 0, 0]    rot [0, -π/2, 0]  Bot 4 (right)
```

### Lighting Rig (4/4 verified)

| Light | Type | Position | Intensity | Role |
|-------|------|----------|-----------|------|
| 1 | `ambientLight` | — | 0.4 | Base fill |
| 2 | `directionalLight` | `[5, 10, 5]` | 0.8 | Key light |
| 3 | `directionalLight` | `[-3, 5, -3]` | 0.3 | Fill light |
| 4 | `spotLight` | `[0, 6, 0]` | 0.5 | Pile highlight |

---

## 5. Canvas Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `dpr` | `[1, 1.5]` | Caps pixel ratio for mobile (prevents 3x rendering on high-DPI) |
| `gl.antialias` | `false` | Mobile screens provide natural AA via subpixel layout |
| `gl.powerPreference` | `'high-performance'` | Requests discrete GPU where available |
| `gl.alpha` | `false` | Opaque background avoids compositing overhead |
| `camera.position` | `[0, 8, 6]` | Elevated perspective over the table |
| `camera.fov` | `50` | Balanced field of view for portrait |
| `camera.near` | `0.1` | Near clipping plane |
| `camera.far` | `100` | Far clipping plane |
| `style.touchAction` | `'none'` | Prevents browser touch gestures from interfering with 3D |

---

## 6. JSX Bridge Technical Contribution

**File:** `src/vite-env.d.ts` (26 lines)

### Problem
R3F v8 augments the global `JSX.IntrinsicElements` namespace to add Three.js element types (mesh, ambientLight, etc.). However, `@types/react@19` moved the JSX namespace from global `JSX` to `React.JSX`. This means R3F's augmentation is invisible to TypeScript when using React 19 types, resulting in `TS2339` errors on every Three.js JSX element.

### Solution
A minimal, zero-runtime-cost type bridge that augments `react/jsx-runtime` and `react/jsx-dev-runtime` modules to merge `ThreeElements` from `@react-three/fiber` into their `IntrinsicElements` interfaces:

```typescript
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
```

### Impact
- Unblocks all current and future 3D component development
- Zero runtime cost (type-only, erased at compile time)
- Clean `tsc -b` compilation with zero errors
- No need to downgrade `@types/react` or upgrade R3F

---

## 7. Test Coverage

| Metric | Value |
|--------|-------|
| New tests added | 15 |
| Total project tests | 202 (up from 187) |
| Test files | 14 |
| Test duration | ~33s |
| All passing | ✅ Yes |

### Test Breakdown

| Area | Count |
|------|-------|
| App → Game container integration | 6 |
| GameScene scene composition | 2 |
| Table3D rendering (mocked) | 1 |
| MiddlePile3D placeholder | 1 |
| PlayerSlot3D (4 positions + default rotation) | 5 |
| **Total** | **15** |

### Testing Strategy
- R3F `Canvas` mocked as `<div data-testid="r3f-canvas" />` (children not rendered) for jsdom compatibility
- Drei `RoundedBox` mocked as a div
- `beforeEach(resetStore)` ensures test isolation
- Regression guard: TitleScreen still renders when `showTitleScreen=true`

---

## 8. Acceptance Criteria

| AC ID | Criterion | Status |
|-------|-----------|--------|
| AC-003 | 3D table visible with player positions | ✅ PASS (structural) |
| AC-021 | ≥30 FPS maintained | ✅ PASS (structural — ~264 triangles, 4 lights, no post-processing) |
| AC-022 | Portrait mode, elements visible | ✅ PASS (structural — full viewport, FOV 50, touch-none) |

---

## 9. Story Points

**7 story points** — Medium-High complexity

Rationale: 3D scene setup with R3F Canvas, multi-light rig, procedural geometry, JSX type bridging, and comprehensive test mocking strategy.

---

## 10. Next Stories Unlocked

| Story ID | Title | Points | Dependencies Met? |
|----------|-------|--------|-------------------|
| STORY-012 | 3D Card Model, Player Hand Rendering & Card Interaction | 8 | ✅ STORY-011 now complete |

STORY-012 can now proceed. It will render interactive 3D cards within the `<PlayerSlot3D>` positions established in this story.

---

## 11. Build Results

| Command | Result |
|---------|--------|
| `npm test -- --run` | ✅ 202/202 pass |
| `npm run lint` | ✅ Clean (0 errors, 0 warnings) |
| `npm run build` | ✅ Success (tsc + vite) |
| `npx tsc -b --noEmit` | ✅ Zero errors |

### Non-Blocking Warnings (acknowledged)
1. R3F v8 deprecated `sRGBEncoding`/`LinearEncoding` from Three.js r152+ — Vite rollup warning, not a failure
2. `three-vendor` chunk 939KB (260KB gzip) — to be addressed in STORY-020

---

## 12. Recommended Commit Message

```
feat(3d): add 3D scene foundation with Canvas, lighting rig, and procedural table (STORY-011)

- Create GameScene with 4-light rig (ambient + key/fill directionals + spot)
- Create Table3D using Drei RoundedBox with green felt material (#1a472a)
  8x6 units, roughness 0.8, metalness 0.1, ~200 triangles
- Create PlayerSlot3D placeholders at 4 cardinal positions with rotations
- Create MiddlePile3D placeholder for STORY-013
- Update App.tsx with R3F Canvas config:
  dpr [1, 1.5], no antialias, powerPreference high-performance,
  camera at [0, 8, 6] with FOV 50, touchAction none
- Add R3F v8 ↔ React 19 JSX type bridge in vite-env.d.ts
  (resolves TS2339 errors for ThreeElements augmentation)
- Mock R3F Canvas in jsdom tests using <div> placeholder strategy
- Add 15 unit tests (smoke + composition + integration)
- Project now has 202 passing tests across 14 files

Closes STORY-011
```

---

## 13. Git Instructions

```powershell
git add src/components/three/ src/App.tsx src/vite-env.d.ts src/components/ui/TitleScreen.test.tsx
git add docs/stories/STORY-011.md docs/dev-notes/DEV-NOTES-STORY-011.md
git add docs/queue/completion-review-STORY-011.md docs/qa/QA-REVIEW-STORY-011.md
git add docs/release/merge-close-STORY-011.md docs/queue/dev-queue.md
git commit -m "feat(3d): add 3D scene foundation with Canvas, lighting rig, and procedural table (STORY-011)"
```

---

## 14. Final Checklist

| # | Item | Status |
|---|------|--------|
| 1 | All scope items implemented | ✅ |
| 2 | All tests passing (202/202) | ✅ |
| 3 | Build clean (tsc + vite + lint) | ✅ |
| 4 | SM completion review approved | ✅ |
| 5 | QA review passed (66/66) | ✅ |
| 6 | Acceptance criteria satisfied | ✅ |
| 7 | Dev notes created | ✅ |
| 8 | Release notes created | ✅ |
| 9 | Story file updated to CLOSED | ✅ |
| 10 | Dev queue updated | ✅ |
| 11 | No blocking deviations | ✅ |
| 12 | No defects found | ✅ |

---

## Close Decision

**Status: CLOSED**

STORY-011 has passed all gates with perfect scores. SM review confirmed 100% spec match across all scope items. QA awarded 66/66 with zero defects. The 3D scene foundation is solid and ready to support STORY-012 (3D Card Model & Interaction).

**Signed off by:** Scrum Master
**Date:** 2026-05-31
