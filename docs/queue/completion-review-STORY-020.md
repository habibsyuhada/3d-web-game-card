# Scrum Master Completion Review

**Story ID:** STORY-020
**Story Title:** Mobile Optimization, Performance Tuning & iOS Fullscreen Fallback
**Status:** REWORK_REQUIRED

---

## Summary

STORY-020 implements iOS Safari CSS fullscreen fallback, global CSS hardening for mobile, component render optimizations via `React.memo`, and Vite build chunk splitting. The implementation touches the correct files and addresses most scope items, but the build is **broken** due to a TypeScript error, and several new lint errors were introduced including a concerning React anti-pattern (accessing a ref value during render).

---

## Definition of Done Check

| Criteria | Status |
|---|---|
| Story context reviewed by Developer | ✅ (dev notes present) |
| Code implemented | ✅ (changes present in expected files) |
| Tests written | ✅ (20 new tests in useFullscreen.test.ts) |
| Tests pass locally | ✅ (417 passed, 39 files) |
| Dev notes created | ✅ (DEV-NOTES-STORY-020.md exists) |
| Scrum Master completion review passed | ❌ **REWORK REQUIRED** |
| QA review passed | ⬜ Pending |
| Story closed | ⬜ Pending |

---

## Test Results

- **Framework:** Vitest v4.1.7
- **Test Files:** 39 passed (39)
- **Tests:** 417 passed (417)
- **Duration:** 60.39s
- **Notes:** All tests pass including 20 new useFullscreen tests covering iOS detection, CSS fullscreen class toggling, native API paths, and fallback behavior. Stderr logs contain expected ErrorBoundary test errors and jsdom `scrollTo()` not-implemented warnings — these are benign.

**Result: PASS ✅**

---

## Build Results

- **Command:** `npm run build` (runs `tsc -b && vite build`)
- **Result: FAIL ❌**

**Error:**
```
src/hooks/useFullscreen.test.ts(16,7): error TS6133: 'originalNavigator' is declared but its value is never read.
```

This TypeScript error causes `tsc -b` to fail, blocking the production build entirely. The variable `originalNavigator` on line 16 of `useFullscreen.test.ts` is declared but never used. This is a trivial fix (remove the unused variable or reference it in the cleanup function).

---

## Lint Results

- **Command:** `npx eslint .`
- **Result: FAIL ❌**
- **Total:** 24 problems (22 errors, 2 warnings)

### New issues introduced by STORY-020:

| File | Line | Severity | Rule | Description |
|---|---|---|---|---|
| `useFullscreen.ts` | 124 | **error** | `react-hooks/refs` | `cssFullscreenRef.current` accessed during render — react refs should not be read during render as they don't trigger re-renders |
| `useFullscreen.ts` | 171 | **error** | `react-hooks/refs` | Return value `isFullscreen` is derived from ref access during render |
| `useFullscreen.test.ts` | 16 | warning | `@typescript-eslint/no-unused-vars` | `originalNavigator` assigned but never used |
| `useFullscreen.test.ts` | 244, 271, 294, 319, 333, 345 | error (×6) | `@typescript-eslint/no-explicit-any` | Multiple `any` type assertions in test casts |

### Pre-existing issues (not introduced by STORY-020):

- `GameScene.test.tsx` — 2 `no-explicit-any` errors (pre-existing)
- `BombVFX.tsx`, `EliminationVFX.tsx`, `NuclearVFX.tsx`, `ReverseVFX.tsx`, `SkipVFX.tsx` — 12 `no-explicit-any` errors (pre-existing from STORY-018)
- `useCardInteraction.ts` — 1 `react-hooks/exhaustive-deps` warning (pre-existing)

---

## Scope Checklist

### 1. Performance Audit & Optimization

| Item | Status | Notes |
|---|---|---|
| `React.memo` on Card3D | ✅ | `Card3D = memo(function Card3D(...))` |
| `React.memo` on LifeTokens | ✅ | `LifeTokens = memo(function LifeTokens(...))` |
| `React.memo` on PlayerSlot3D | ✅ | `PlayerSlot3D = memo(function PlayerSlot3D(...))` (STORY-020) |
| `React.memo` on MiddlePile3D | ✅ | `MiddlePile3D = memo(function MiddlePile3D(...))` |
| `React.memo` on CardHand, Table3D | ✅ | Additional components memoized in STORY-020 |
| `React.memo` on all VFX components | ✅ | All 6 VFX components memoized |
| `React.memo` on DeckPile3D, CardDrawAnimation, CardAnimation | ✅ | All three memoized |
| Granular Zustand selectors | ⬜ Not verified | No evidence of selector audit in dev notes |
| Canvas `dpr={[1, 1.5]}` | ✅ | Confirmed in App.tsx line 39 |
| Canvas `antialias: false` | ✅ | Confirmed in App.tsx line 41 |
| Canvas `powerPreference: 'high-performance'` | ✅ | Confirmed in App.tsx line 42 |
| Reuse BufferGeometry via `useMemo` | ⬜ Not verified | No evidence in dev notes |
| Memory management / dispose on unmount | ⬜ Not verified | No evidence in dev notes |
| `frameloop` optimization (demand when idle) | ⬜ Not implemented | No `frameloop` prop found on Canvas |

### 2. Build Optimization

| Item | Status | Notes |
|---|---|---|
| Vite `manualChunks` for three-vendor | ✅ | `['three', '@react-three/fiber', '@react-three/drei']` |
| Vite `manualChunks` for app-vendor | ✅ | `['react', 'react-dom', 'zustand']` |
| Build succeeds | ❌ **FAIL** | TypeScript error blocks build |
| Total JS < 500KB gzipped | ⬜ Cannot verify | Build fails; dev notes report 304KB gzipped (three-vendor) + 9KB (app) ≈ 313KB total |
| ESM imports / tree-shaking | ✅ | ESM throughout per project config |

### 3. iOS Safari Fullscreen Fallback

| Item | Status | Notes |
|---|---|---|
| `detectIOS()` function | ✅ | Handles iPhone, iPad, iPod, MacIntel with maxTouchPoints |
| CSS fullscreen class on iOS | ✅ | `.css-fullscreen-active` applied to `document.body` |
| `scrollTo(0, 1)` to hide status bar | ✅ | Implemented in `enterFullscreen()` |
| CSS rule for `.css-fullscreen-active` | ✅ | `position: fixed; inset: 0; z-index: 9999` in index.css |
| iOS meta tags in index.html | ✅ | `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` present |
| `navigator.standalone` detection | ❌ Not implemented | No evidence of Add-to-Home-Screen detection |
| Ref access during render (anti-pattern) | ❌ **BUG** | `isFullscreen` computed from `cssFullscreenRef.current` during render; won't trigger re-render when CSS fullscreen state changes |

### 4. Touch & Gesture Handling

| Item | Status | Notes |
|---|---|---|
| `touch-action: none` on body/html | ✅ | In index.css |
| `overscroll-behavior: none` on body/html | ✅ | In index.css |
| `user-select: none` on body/html | ✅ | In index.css |
| `touch-action: manipulation` on buttons | ✅ | In index.css |
| `-webkit-tap-highlight-color: transparent` on buttons | ✅ | In index.css |
| Prevent text selection on game container | ✅ | Inherited from body styles |

### 5. Cross-Browser Testing Checklist

| Item | Status | Notes |
|---|---|---|
| webkit prefix handling | ✅ | `webkitRequestFullscreen`, `webkitExitFullscreen`, `webkitfullscreenchange` |
| Fallback when fullscreen unsupported | ✅ | Try-catch with graceful degradation per FR-004 |
| Cross-browser real-device testing | ⬜ Not verified | Cannot verify in CI; tests simulate via mocks |

### 6. Global CSS Hardening

| Item | Status | Notes |
|---|---|---|
| `body, html` reset styles | ✅ | margin:0, padding:0, overflow:hidden, background:#1a1a2e |
| CSS fullscreen fallback class | ✅ | `.css-fullscreen-active` with !important |
| Font loading (system fonts only) | ✅ | No web font imports detected |

---

## Acceptance Criteria Verification

| AC ID | Criterion | Status | Notes |
|---|---|---|---|
| AC-002 | Fullscreen button works; game loads even if fullscreen unsupported | ✅ Partial | iOS fallback implemented; graceful try-catch on native API |
| AC-021 | ≥30 FPS during gameplay on mid-range device | ⬜ Cannot verify | Requires real-device profiling; React.memo optimizations in place |
| AC-022 | Portrait mode, all UI visible, touch targets ≥44×44px | ⬜ Cannot verify | Tailwind responsive classes used; no explicit touch-target audit |
| AC-004 | Touch response ≤200ms | ⬜ Cannot verify | Requires real-device measurement |

---

## Missing Items

1. **Build is broken** (CRITICAL) — `npm run build` fails due to unused `originalNavigator` variable in test file. This blocks deployment.
2. **React anti-pattern in useFullscreen.ts** (HIGH) — `cssFullscreenRef.current` is read during render. This means when CSS fullscreen is toggled on iOS, the `isFullscreen` return value will be stale until some other state change triggers a re-render. Fix: use `useState` instead of `useRef` for CSS fullscreen tracking, or compute `isFullscreen` via `useSyncExternalStore` or a callback.
3. **`navigator.standalone` detection** (MEDIUM) — Scope item 3 explicitly requires handling "Add to Home Screen" mode. Not implemented.
4. **`frameloop="demand"` optimization** (LOW) — Scope item 1 mentions considering demand-based frame loop. Not implemented.
5. **Zustand selector audit** (LOW) — No evidence of granular selector review.
6. **`no-explicit-any` in test file** (LOW) — 6 instances of `any` in useFullscreen.test.ts cast assertions. Can be fixed with proper typing or `// eslint-disable-next-line` if unavoidable.

---

## Required Rework

### Must Fix (Blocking):

1. **Remove unused `originalNavigator`** in `src/hooks/useFullscreen.test.ts` line 16. Either delete the declaration or use it in `restoreNavigator()`.
2. **Fix react-hooks/refs violation** in `src/hooks/useFullscreen.ts`:
   - Replace `useRef<boolean>` for `cssFullscreenRef` with `useState<boolean>`, OR
   - Move `cssFullscreenRef.current` access out of the render path (e.g., use `useSyncExternalStore` or a custom subscriber pattern).
   - The current implementation means `isFullscreen` will return stale values after CSS fullscreen toggle on iOS.

### Should Fix (Non-blocking but expected):

3. Add `navigator.standalone` detection for iOS "Add to Home Screen" mode per scope item 3.
4. Address `no-explicit-any` lint errors in `useFullscreen.test.ts` (use proper type assertions or add eslint-disable comments with justification).

### Nice to Have:

5. Consider `frameloop="demand"` for idle game state.
6. Document Zustand selector audit findings in dev notes.

---

## Final Decision

**REWORK REQUIRED**

The story demonstrates good progress — iOS fallback implementation, CSS hardening, component memoization, and build chunking are all correctly structured. The test suite is comprehensive (20 new tests, all passing). However, the story **cannot be forwarded to QA** due to:

1. **Production build failure** — The TypeScript compiler error blocks `npm run build`, making deployment impossible.
2. **React anti-pattern lint error** — The `react-hooks/refs` violation in `useFullscreen.ts` is not just a lint issue but a functional correctness concern: `isFullscreen` will not update reactively when CSS fullscreen is toggled on iOS.

Both issues are minor and quick to fix. Once resolved, the story should be re-submitted for Scrum Master review before forwarding to QA.

---

## Rework Re-Review

**Review Date:** 2026-06-01
**Reviewer:** Scrum Master
**Trigger:** Developer completed rework per required fixes in original review.

### Verification Runs

| Check | Command | Result |
|---|---|---|
| Tests | `npx vitest run` | **PASS** — 39 files, 424 tests, 0 failures (89.37s) |
| Build | `npm run build` | **PASS** — `tsc -b` succeeds, `vite build` outputs dist/ in 26.71s |
| Lint | `npx eslint src/hooks/useFullscreen.ts src/hooks/useFullscreen.test.ts` | **PASS** — 0 errors, 0 warnings |

### Rework Item Verification

| # | Required Fix | Status | Evidence |
|---|---|---|---|
| 1 (BLOCKING) | Remove unused `originalNavigator` (TS6133) | **FIXED** | Line 16 of test file now declares only `originalUserAgent`. `tsc -b` succeeds; build passes. |
| 2 (BLOCKING) | Replace `useRef(false)` with `useState(false)` for CSS fullscreen state | **FIXED** | `useFullscreen.ts` line 130: `const [isCssFullscreen, setIsCssFullscreen] = useState(false)`. `useRef` import removed (line 16 imports `useState, useCallback, useSyncExternalStore` only). New reactivity tests (lines 393-431) confirm `isFullscreen` updates reactively on enter/exit. |
| 3 (SHOULD-FIX) | Add `detectStandalone()` for iOS PWA detection | **FIXED** | `detectStandalone()` exported at line 57-60 of `useFullscreen.ts`. `isStandalone` added to `UseFullscreenReturn` interface. `TitleScreen.tsx` consumes `isStandalone` — skips fullscreen call in standalone mode (line 28), conditionally renders "PLAY" vs "PLAY FULLSCREEN" (line 57). 5 new tests cover this. |
| 4 (SHOULD-FIX) | Fix 6 `no-explicit-any` lint errors | **FIXED** | All 6 instances replaced with `as unknown as Record<string, unknown>` typed assertions (confimed at test lines 257, 284, 307, 332, 346, 358). ESLint reports 0 errors on the file. |
| 5 | Add new tests for rework items | **DONE** | 7 new tests added (424 total, up from 417): 3 for `detectStandalone`, 2 for `isStandalone` in hook, 2 for CSS fullscreen state reactivity via useState. |
| 6 | Update dev notes with rework section | **DONE** | `DEV-NOTES-STORY-020.md` now contains comprehensive rework section (lines 115-193) documenting all fixes, files changed, test additions, and verification results. |

### Code Quality Assessment

- **useFullscreen.ts (188 lines):** Clean, well-documented. Uses `useState` for CSS fullscreen state (triggers re-renders on toggle). Uses `useSyncExternalStore` for native fullscreen events (no useEffect/setState anti-pattern). All type assertions use double-cast pattern instead of `any`.
- **useFullscreen.test.ts (431 lines):** Comprehensive coverage. No unused variables. No `any` type assertions. New tests validate reactivity (enter/exit → isFullscreen updates) and standalone detection.
- **TitleScreen.tsx (62 lines):** Correctly integrates `isStandalone` — skips fullscreen API call in PWA mode, renders accurate button label.
- **No regressions:** All 424 pre-existing + new tests pass. Build succeeds with no TypeScript errors.

### Updated Definition of Done

| Criteria | Status |
|---|---|
| Story context reviewed by Developer | **Done** |
| Code implemented | **Done** |
| Tests written | **Done** (424 total, 27 tests in useFullscreen.test.ts) |
| Tests pass locally | **Done** (39 files, 424 passed, 0 failures) |
| Build succeeds | **Done** (tsc -b + vite build) |
| Lint clean on changed files | **Done** (0 errors) |
| Dev notes created & updated | **Done** |
| Scrum Master completion review passed | **PASS** |
| QA review passed | Pending |
| Story closed | Pending |

### Updated Status

**FORWARD_TO_QA**

All blocking issues from the initial review have been resolved. Both SHOULD-FIX items also addressed. 7 new tests directly validate the rework fixes (state reactivity, standalone detection). Build and lint are clean. The story is ready for QA review.
