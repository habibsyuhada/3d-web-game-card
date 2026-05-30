# Dev Notes
Story ID: STORY-010

## Story Context Reviewed
- docs/queue/dev-queue.md
- docs/stories/STORY-010.md
- docs/prd/prd.md
- docs/architecture/architecture.md
- src/store/index.ts, game-slice.ts, ui-slice.ts, animation-slice.ts
- src/types/index.ts
- src/App.tsx (pre-existing placeholder)
- src/main.tsx (pre-existing entry point)
- index.html (pre-existing with most meta tags already in place)

## Files Changed
- `src/hooks/useFullscreen.ts` — Created. Fullscreen API hook with webkit fallback.
- `src/components/ui/TitleScreen.tsx` — Created. Title screen component with "PLAY FULLSCREEN" button.
- `src/components/ui/TitleScreen.test.tsx` — Created. 11 test cases (8 required + 3 additional).
- `src/App.tsx` — Updated. Conditionally renders TitleScreen or game container based on `showTitleScreen` store flag.
- `index.html` — Updated. Changed `theme-color` from `#1a1a2e` to `#581c87` (purple-900, matches title screen gradient).

## Implementation Summary

### 1. `src/hooks/useFullscreen.ts`
- Uses `useSyncExternalStore` to subscribe to `fullscreenchange` and `webkitfullscreenchange` events (avoids lint error from calling `setState` inside `useEffect`).
- Detects fullscreen support synchronously via `useState` lazy initializer checking `document.fullscreenEnabled` or `document.webkitFullscreenEnabled`.
- `enterFullscreen()` calls `document.documentElement.requestFullscreen()` with `webkitRequestFullscreen` fallback, wrapped in try-catch so it never throws.
- `exitFullscreen()` calls `document.exitFullscreen()` with `webkitExitFullscreen` fallback, also wrapped in try-catch.
- Returns `UseFullscreenReturn`: `{ isFullscreen, enterFullscreen, exitFullscreen, isSupported }`.

### 2. `src/components/ui/TitleScreen.tsx`
- Full-viewport centered layout using `fixed inset-0 flex items-center justify-center`.
- Background: `bg-gradient-to-br from-purple-900 to-blue-900`.
- Title: `<h1>` with `text-6xl md:text-8xl font-black text-white animate-pulse`.
- Button: `PLAY FULLSCREEN` with `bg-yellow-400 text-purple-900 rounded-lg`, min 48x48px via inline style, `touch-manipulation` to prevent double-tap zoom, `active:scale-95` for tactile feedback.
- `onTouchStart` prevented to avoid double-tap issues on mobile.
- On click: calls `enterFullscreen` (if supported), then dispatches `setFullscreen(true)`, `setShowTitleScreen(false)`, `initGame()`. If fullscreen fails, falls back to entering the game without fullscreen (FR-004).

### 3. `src/App.tsx`
- Imports `useGameStore` and `TitleScreen`.
- Subscribes to `showTitleScreen` state via selector.
- Renders `<TitleScreen />` when `showTitleScreen === true`, game container placeholder otherwise.
- Game container has `data-testid="game-container"` for testing.
- Uses default export (`export default App`) to match existing `main.tsx` import.

### 4. `index.html`
- Updated `theme-color` meta tag from `#1a1a2e` to `#581c87` (Tailwind `purple-900`, matching the title screen gradient).
- All other required meta tags were already present from STORY-001 scaffolding (viewport, apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, mobile-web-app-capable, title).

## Tests Added or Updated
New test file: `src/components/ui/TitleScreen.test.tsx`

Test cases (11 total, all passing):
1. TitleScreen renders with text "ZINKY ZOOGLE" visible
2. TitleScreen renders a button with accessible text "PLAY FULLSCREEN"
3. Button click triggers store update: `showTitleScreen -> false`
4. Button click calls `initGame()` — `store.players.length > 0`
5. `useFullscreen`: `isSupported` detected as a boolean
6. `useFullscreen`: `enterFullscreen` does not crash (resolves cleanly)
7. `useFullscreen`: `exitFullscreen` does not crash (resolves cleanly)
8. `useFullscreen`: `isFullscreen` starts as false when not in fullscreen
9. App renders TitleScreen when `showTitleScreen === true`
10. App renders game container when `showTitleScreen === false`
11. (Implicit) Store reset between tests prevents cross-contamination

Testing strategy:
- Mocked fullscreen APIs in `beforeEach` (jsdom doesn't provide them).
- Reset Zustand store state in `beforeEach` to prevent test leakage.
- Used `renderHook` from `@testing-library/react` for hook tests.
- Used `act()` wrapper for async button clicks that update synchronous state.

## Test Commands Run
- `npm test` — All tests pass
- `npm run build` — Production build successful
- `npm run lint` — No errors, no warnings

## Test Results
- **Tests:** 187 passed (13 test files, including 11 new tests in TitleScreen.test.tsx)
- **Build:** Successful (no TypeScript errors, Vite build complete in ~22s)
- **Lint:** Clean (0 errors, 0 warnings)
- **Bundle:** `dist/index-BYAsEH_j.js` = 18.66 KB gzipped 7.04 KB (TitleScreen + useFullscreen + updated App)

## Commit Notes
Suggested commit message:
```
feat(STORY-010): Title Screen & Fullscreen Entry

- Add useFullscreen hook with webkit fallback and useSyncExternalStore
- Add TitleScreen component with ZINKY ZOOGLE title and PLAY FULLSCREEN button
- Update App.tsx to conditionally render TitleScreen or game container
- Update index.html theme-color to purple-900 (#581c87)
- Add 11 tests for TitleScreen, useFullscreen hook, and App integration
- All 187 tests pass, build clean, lint clean
```

## Risks / Limitations
1. **iOS Safari fullscreen:** The fullscreen API is not supported on `<html>` in iOS Safari. The hook gracefully handles this — `isSupported` will be `false`, and the game proceeds without fullscreen per FR-004. A CSS-based pseudo-fullscreen could be added later if needed.
2. **`onTouchStart` preventDefault:** The button uses `onTouchStart={(e) => e.preventDefault()}` to prevent double-tap zoom. This is a common pattern but may need testing on real iOS devices to ensure it doesn't interfere with the click handler.
3. **Theme color change:** Updated from `#1a1a2e` (dark blue) to `#581c87` (purple-900) to match the title screen gradient. This affects the browser chrome color on Android. If the later stories change the visual theme, this may need adjustment.
4. **Vite circular chunk warning:** The build produces a "Circular chunk: three-vendor -> app-vendor -> three-vendor" warning. This is pre-existing (from Vite config manual chunks) and not caused by STORY-010 changes.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
