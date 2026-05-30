# STORY-010 — Title Screen & Fullscreen Entry

**Status:** Ready

---

## Requirement IDs
- FR-001 (title screen with game title and fullscreen button)
- FR-002 (fullscreen button requests fullscreen mode)
- FR-003 (upon fullscreen, 3D game scene loads and replaces title screen)
- FR-004 (if fullscreen not supported, game proceeds anyway)
- IR-008 (Browser Fullscreen API)

## Acceptance Criteria IDs
- AC-001 (title screen with title and fullscreen button visible)
- AC-002 (tap fullscreen button → fullscreen + 3D game loads)

## Business Context
The title screen is the first thing users see. It must be clean, minimal, and provide a frictionless one-tap entry into the game. The fullscreen API provides an immersive experience, with graceful fallback for browsers that don't support it (especially iOS Safari).

## Technical Context
Per architecture Sections 10 and 15, the title screen is an HTML/Tailwind overlay. The `useFullscreen` hook wraps the Browser Fullscreen API with webkit prefix support. On iOS Safari, a CSS-based fallback is used since `requestFullscreen` is not supported on non-video elements.

## Scope
1. Create `src/hooks/useFullscreen.ts`:
   - `useFullscreen()` returns `{ isFullscreen, enterFullscreen, exitFullscreen, isSupported }`
   - Detects fullscreen support via `document.fullscreenEnabled` or `document.webkitFullscreenEnabled`
   - Listens for `fullscreenchange` and `webkitfullscreenchange` events
   - `enterFullscreen()`: calls `requestFullscreen()` with webkit fallback; catches errors gracefully
   - `exitFullscreen()`: calls `document.exitFullscreen()` with webkit fallback
   - On mount, checks if already in fullscreen (e.g., refresh while in fullscreen)

2. Create `src/components/ui/TitleScreen.tsx`:
   - Renders a full-viewport centered layout
   - Game title "ZINKY ZOOGLE" as an `<h1>` with stylish Tailwind typography
   - "PLAY FULLSCREEN" button (`<button>` with min 48x48px touch target)
   - On button tap:
     1. Call `enterFullscreen()` from `useFullscreen` hook
     2. Set `isFullscreen: true` in store
     3. Set `showTitleScreen: false` in store
     4. Dispatch `initGame()` on the store
   - If fullscreen fails or is unsupported, still proceed to game (FR-004 fallback)
   - Background: dark gradient or simple color (e.g., deep blue/purple)
   - Subtle CSS animation on the title (optional pulse/glow)

3. Create/update `src/App.tsx`:
   - Conditionally renders `<TitleScreen />` when `showTitleScreen === true`
   - Otherwise renders the game container (placeholder `<div>` for now — 3D scene added in later stories)
   - Imports `useGameStore` for `showTitleScreen` state

4. Update `index.html`:
   - Add Apple mobile web app meta tags
   - Set viewport meta with `maximum-scale=1.0, user-scalable=no`
   - Set `theme-color` and `title`

## Out of Scope
- 3D game scene (STORY-011 onward)
- Game over screen
- HUD overlays

## Files Likely Affected
- `src/hooks/useFullscreen.ts` (create)
- `src/components/ui/TitleScreen.tsx` (create)
- `src/App.tsx` (create/update)
- `src/main.tsx` (ensure it renders `<App />`)
- `index.html` (update meta tags)
- `src/components/ui/TitleScreen.test.tsx` (create)

## Implementation Notes
- The title screen is a regular React DOM component styled with Tailwind
- `enterFullscreen` must be called as a direct result of user gesture (button click/pointerdown) — browsers reject programmatic fullscreen requests outside user gestures
- iOS Safari: `webkitRequestFullscreen` may not exist on `documentElement`; handle this gracefully
- The CSS fallback for iOS: apply `position: fixed; inset: 0; z-index: 9999` to the game container after the button tap
- The transition from title to game is simply toggling `showTitleScreen` to false; React will unmount the title screen and mount the game container
- Add `touch-action: manipulation` to the button to prevent double-tap zoom on mobile
- Ensure no scroll bars: `overflow: hidden` on body/html

## Test Requirements
- [x] TitleScreen renders with game title text visible
- [x] TitleScreen renders a button with accessible text
- [x] Button click triggers store updates: `showTitleScreen → false`, `initGame()` called
- [x] `useFullscreen`: `isSupported` is correctly detected
- [x] `useFullscreen`: `enterFullscreen` handles errors without crashing
- [x] App renders TitleScreen when `showTitleScreen === true`
- [x] App renders game container when `showTitleScreen === false`
- [x] Button touch target is at least 48x48px

## Edge Cases
- User taps button rapidly (should not trigger multiple fullscreen requests)
- Browser already in fullscreen when page loads (detect via `document.fullscreenElement`)
- iOS Safari: fullscreen API not available on `<html>` element
- Desktop browser: fullscreen works normally
- User denies fullscreen permission dialog

## Dependencies
- STORY-001 (project scaffolded with React + Tailwind)
- STORY-008 (initGame function available)
- STORY-009 (Zustand store with game slice and UI slice)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
