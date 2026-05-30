# QA Review

**Story ID:** STORY-011
**Title:** 3D Scene Foundation (Canvas, Camera, Lighting, Table)
**Status:** PASS
**Review Date:** 2026-05-31
**QA Engineer:** Automated QA

---

## 1. Summary

STORY-011 establishes the R3F Canvas, camera, 4-light lighting rig, procedural green-felt table, and placeholder components for the middle pile and 4 player slots. The implementation includes 4 new source files, 3 modified files, a JSX type bridge for R3F v8 + React 19 compatibility, and 15 new tests. All build, test, and lint commands pass cleanly.

---

## 2. Test Commands Run

| # | Command | Expected | Actual | Result |
|---|---------|----------|--------|--------|
| 1 | `npm test -- --run` | 202 tests passing | 202 passed / 14 files (32.98s) | ✅ PASS |
| 2 | `npm run build` | Must succeed | tsc -b + vite build success (26.62s) | ✅ PASS |
| 3 | `npm run lint` | Must pass | Clean — no errors, no warnings | ✅ PASS |
| 4 | `node ./node_modules/typescript/bin/tsc -b --noEmit` | Zero errors | Zero errors (no output) | ✅ PASS |

### Build Warnings (Non-blocking, documented by Developer)
- R3F v8 uses deprecated `sRGBEncoding`/`LinearEncoding` from Three.js r152+ — Vite rollup warning, not a failure.
- `three-vendor` chunk 939KB (260KB gzip) exceeds 600KB warning limit — to be addressed in STORY-020.

---

## 3. Scene Hierarchy Review

**File:** `src/components/three/GameScene.tsx` (40 lines)

### Lighting Rig (4 lights)

| # | Light | Position | Intensity | Extras | Status |
|---|-------|----------|-----------|--------|--------|
| 1 | `ambientLight` | — | 0.4 | — | ✅ Exact match |
| 2 | `directionalLight` (key) | `[5, 10, 5]` | 0.8 | — | ✅ Exact match |
| 3 | `directionalLight` (fill) | `[-3, 5, -3]` | 0.3 | — | ✅ Exact match |
| 4 | `spotLight` | `[0, 6, 0]` | 0.5 | angle 0.6, penumbra 0.3 | ✅ Match |

**Note:** `spotLight` does not set an explicit `target` — relies on Three.js default target `[0,0,0]`, which is the scene center. This is documented and correct for the current layout.

### Scene Composition

| Element | Status | Details |
|---------|--------|---------|
| `<Table3D />` at center | ✅ | Line 28 |
| `<MiddlePile3D />` (placeholder) | ✅ | Line 31 |
| 4x `<PlayerSlot3D />` at cardinal positions | ✅ | Lines 34–37 |

### Player Slot Positions & Rotations

| Player | Position | Expected | Rotation | Expected | Status |
|--------|----------|----------|----------|----------|--------|
| P0 (Human) | `[0, 0, 3.5]` | ✅ | `[0, 0, 0]` | ✅ | ✅ PASS |
| P1 (Bot) | `[-3, 0, 0]` | ✅ | `[0, π/2, 0]` | ✅ | ✅ PASS |
| P2 (Bot) | `[0, 0, -3.5]` | ✅ | `[0, π, 0]` | ✅ | ✅ PASS |
| P3 (Bot) | `[3, 0, 0]` | ✅ | `[0, -π/2, 0]` | ✅ | ✅ PASS |

**Scene Hierarchy Score: 10/10 — PASS**

---

## 4. Table3D Quality Check

**File:** `src/components/three/Table3D.tsx` (23 lines)

| # | Specification | Expected | Actual | Status |
|---|---------------|----------|--------|--------|
| 1 | Geometry | `RoundedBox` from Drei | `RoundedBox` from `@react-three/drei` | ✅ |
| 2 | Width | ~8 units | 8 (`args={[8, 0.1, 6]}`) | ✅ |
| 3 | Depth | ~6 units | 6 | ✅ |
| 4 | Height | ~0.1 units | 0.1 | ✅ |
| 5 | Color (green felt) | `#1a472a` or similar | `#1a472a` | ✅ |
| 6 | Roughness | ~0.8 | 0.8 | ✅ |
| 7 | Metalness | ~0.1 | 0.1 | ✅ |
| 8 | Y Position (sub-surface) | Below 0 | `[0, -0.1, 0]` (top face at y=0) | ✅ |
| 9 | Radius | Reasonable | 0.05 | ✅ |
| 10 | Smoothness (low-poly) | 2 (low segments) | 2 | ✅ |

**Table3D Quality Score: 10/10 — PASS**

---

## 5. App Canvas Integration

**File:** `src/App.tsx` (58 lines)

| # | Configuration | Expected | Actual | Status |
|---|---------------|----------|--------|--------|
| 1 | Canvas source | `@react-three/fiber` | `import { Canvas } from '@react-three/fiber'` | ✅ |
| 2 | `dpr` | `[1, 1.5]` | `[1, 1.5]` | ✅ |
| 3 | `gl.antialias` | `false` | `false` | ✅ |
| 4 | `gl.powerPreference` | `'high-performance'` | `'high-performance'` | ✅ |
| 5 | `gl.alpha` | `false` | `false` | ✅ |
| 6 | `camera.position` | `[0, 8, 6]` | `[0, 8, 6]` | ✅ |
| 7 | `camera.fov` | 50 | 50 | ✅ |
| 8 | `camera.near` | 0.1 | 0.1 | ✅ |
| 9 | `camera.far` | 100 | 100 | ✅ |
| 10 | `style.touchAction` | `'none'` | `'none'` | ✅ |
| 11 | Renders `<GameScene />` | Yes | Yes (line 52) | ✅ |
| 12 | Wrapper div | `data-testid`, viewport classes | `data-testid="game-container"`, `w-screen h-screen touch-none` | ✅ |

**Canvas Config Score: 12/12 — PASS**

---

## 6. JSX Bridge Verification

**File:** `src/vite-env.d.ts` (26 lines)

| # | Requirement | Actual | Status |
|---|-------------|--------|--------|
| 1 | Augments `react/jsx-runtime` | `declare module 'react/jsx-runtime'` with `IntrinsicElements extends ThreeElements` | ✅ |
| 2 | Augments `react/jsx-dev-runtime` | `declare module 'react/jsx-dev-runtime'` with `IntrinsicElements extends ThreeElements` | ✅ |
| 3 | Comments explain rationale | Lines 3–9 explain R3F v8 vs `@types/react@19` incompatibility | ✅ |
| 4 | No runtime code | `import type` + `declare module` only — pure type declarations | ✅ |
| 5 | TypeScript compiles cleanly | `tsc -b --noEmit` zero errors | ✅ |
| 6 | ESLint suppression comments | `@typescript-eslint/no-empty-object-type` suppression on lines 16, 23 | ✅ |

**JSX Bridge Score: 6/6 — PASS**

---

## 7. Test Coverage Review

**File:** `src/components/three/GameScene.test.tsx` (183 lines)

| # | Requirement | Actual | Status |
|---|-------------|--------|--------|
| 1 | Test count | 15 tests (story requires ≥5) | ✅ 3x minimum |
| 2 | Mocks R3F Canvas | `vi.mock('@react-three/fiber')` — Canvas mocked as `<div data-testid="r3f-canvas" />` | ✅ |
| 3 | Mocks Drei RoundedBox | `vi.mock('@react-three/drei')` — RoundedBox mocked as div | ✅ |
| 4 | Canvas rendering tests | Tests #1–2 verify Canvas rendering and game container | ✅ |
| 5 | GameScene composition tests | Tests #7–8 verify scene renders and Table3D present | ✅ |
| 6 | App integration tests | Tests #1–6 verify App → Canvas → GameScene integration | ✅ |
| 7 | PlayerSlot tests | Tests #11–15 cover all 4 player indices + default rotation | ✅ |
| 8 | Regression guard | Test #6 verifies TitleScreen still renders when `showTitleScreen=true` | ✅ |
| 9 | Store isolation | `beforeEach(resetStore)` resets store state before each test | ✅ |
| 10 | WebGL limitations documented | File header (lines 3–5) documents jsdom mock strategy | ✅ |

**Test Coverage Score: 10/10 — PASS**

---

## 8. Performance Sanity

| # | Criteria | Assessment | Status |
|---|----------|------------|--------|
| 1 | Triangle count | RoundedBox (smoothness=2, ~200 tris) + 4 circle geometries (16 segments × ~16 tris = ~64) = **~264 total** — well under 1000 | ✅ |
| 2 | DPR capped | `[1, 1.5]` prevents 3x rendering on high-DPI screens | ✅ |
| 3 | Antialias disabled | Mobile screens provide natural AA via subpixel layout | ✅ |
| 4 | Power preference | `'high-performance'` requests discrete GPU where available | ✅ |
| 5 | Alpha disabled | Opaque background avoids compositing overhead | ✅ |
| 6 | No heavy post-processing | No `<Effects>`, `<Bloom>`, or `<SSAO>` present | ✅ |
| 7 | No OrbitControls | Correctly omitted per implementation notes | ✅ |
| 8 | Lightweight materials | `meshStandardMaterial` (table) + `meshBasicMaterial` (markers) — no expensive shaders | ✅ |

**Performance Score: 8/8 — PASS**

---

## 9. Acceptance Criteria Validation

| AC ID | Criterion | Assessment | Status |
|-------|-----------|------------|--------|
| AC-003 | 3D table visible with player positions | **PASS (structural)** — `Table3D` with green felt `#1a472a` at scene center, 4 `PlayerSlot3D` instances at cardinal positions (P0 bottom, P1 left, P2 top, P3 right). Code structure verified; visual confirmation deferred to device testing. | ✅ |
| AC-021 | ≥30 FPS maintained | **PASS (structural)** — Scene totals ~264 triangles with only 4 lights and no post-processing. Canvas config is optimized for mobile (DPR 1.5 cap, no AA, high-performance GPU hint). This is trivially achievable on any WebGL-capable device. Real FPS measurement deferred to device testing. | ✅ |
| AC-022 | Portrait mode, elements visible | **PASS (structural)** — Canvas fills entire viewport via `w-screen h-screen` wrapper. Camera at `[0, 8, 6]` with FOV 50 provides elevated portrait-angle view. `touchAction: 'none'` prevents gesture interference. Portrait layout verification deferred to device testing. | ✅ |

**AC Validation Score: 3/3 structural PASS**

---

## 10. Deviations Assessment

| # | Deviation | Severity | Assessment |
|---|-----------|----------|------------|
| 1 | `spotLight` does not set explicit `target` — relies on Three.js default `[0,0,0]` | Low | Documented in dev notes. Correct for current scene layout. If future stories need non-origin target, a `<primitive>` pattern will be needed. **Acceptable.** |
| 2 | No `ErrorBoundary` for WebGL fallback | Low | Listed as edge case in story (line 102) but not in scope items 1–4. Not a blocking omission. Recommend adding to a future story. **Acceptable.** |
| 3 | No wood-colored rim/edge on table | None | Story scope says "optional" (line 47 of STORY-011.md). Not required. **N/A.** |
| 4 | `Environment preset="warehouse"` not used | None | Story scope says "optional, evaluate performance" (line 90 of STORY-011.md). Not required. **N/A.** |

**Deviations Assessment: All acceptable, no blocking deviations**

---

## 11. Bugs Found

**None.**

No blocking or non-blocking defects were identified during this review.

---

## 12. Regression Risk

| Area | Risk | Assessment |
|------|------|------------|
| App.tsx changes | Medium — Root component modified to add Canvas | Mitigated by 6 App-level integration tests including TitleScreen regression guard |
| Store integration | Low — App reads `showTitleScreen` from Zustand store | `beforeEach(resetStore)` ensures test isolation |
| New R3F dependency | Low — R3F + Drei packages already installed (STORY-001) | No new package installations in this story |
| JSX type bridge | Low — Type-only augmentation, zero runtime cost | Verified by clean `tsc -b` compilation |
| TitleScreen tests | Low — `TitleScreen.test.tsx` updated with R3F mocks | Regression guard test (#6) confirms TitleScreen still works |

**Overall Regression Risk: LOW**

---

## 13. Final Verdict

### Recommendation: **QA PASS**

All acceptance criteria are structurally satisfied. All 4 build/test commands pass cleanly. Scene hierarchy matches architecture specification exactly. Table3D matches all quality specifications. Canvas configuration is optimal for mobile performance. The JSX type bridge is a sound engineering solution. Tests are thorough (15 tests, 3x the minimum requirement) with proper mocking and isolation.

No defects found. No blocking deviations. Regression risk is low.

---

## Overall QA Score

| Category | Score | Weight | Result |
|----------|-------|--------|--------|
| Test Execution (202/202) | 4/4 | Critical | ✅ PASS |
| Build (tsc + vite + lint) | 3/3 | Critical | ✅ PASS |
| Scene Hierarchy (4/4 lights + composition) | 10/10 | Critical | ✅ PASS |
| Table3D Quality (10/10 specs) | 10/10 | Critical | ✅ PASS |
| Canvas Config (12/12 params) | 12/12 | Critical | ✅ PASS |
| JSX Bridge (6/6 checks) | 6/6 | High | ✅ PASS |
| Test Coverage (10/10 criteria) | 10/10 | Critical | ✅ PASS |
| Performance (8/8 criteria) | 8/8 | High | ✅ PASS |
| AC Validation (3/3 structural) | 3/3 | Critical | ✅ PASS |
| **Total** | **66/66** | — | **PASS** |

### Final Decision: ✅ QA PASS

Story STORY-011 is approved for closure. Visual device-level verification (portrait layout, lighting quality, touch behavior, FPS measurement on target mobile devices) is recommended as a supplementary step in a future QA wave but is not blocking.
