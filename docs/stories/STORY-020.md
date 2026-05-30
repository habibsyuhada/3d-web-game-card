# STORY-020 — Mobile Optimization, Performance Tuning & iOS Fullscreen Fallback

**Status:** Ready

---

## Requirement IDs
- FR-004 (if fullscreen not supported, game proceeds anyway)
- NFR-001 (>=30 FPS on mid-range mobile: Snapdragon 665, 2GB RAM)
- NFR-002 (<=5 seconds to interactive title screen on 4G)
- NFR-003 (<=200ms touch response)
- NFR-004 (latest 2 versions of Chrome, Safari, Firefox, Samsung Internet)
- NFR-005 (adapt to mobile widths 320-428px)
- NFR-006 (portrait orientation)
- NFR-007 (<=150MB memory)
- NFR-010 (all assets procedural — no external files)
- IR-008 (Browser Fullscreen API)
- IR-009 (touch events with pointer event fallback)

## Acceptance Criteria IDs
- AC-002 (fullscreen button works, game loads even if fullscreen unsupported)
- AC-021 (>=30 FPS during gameplay on mid-range device)
- AC-022 (portrait mode, all UI elements visible, touch targets >=44x44px)
- AC-004 (touch response <=200ms)

## Business Context
This is the polish and optimization story. The game must run smoothly on mid-range mobile devices and handle cross-browser inconsistencies gracefully. iOS Safari fullscreen limitations must be handled with a CSS-based fallback. Performance optimizations ensure the 30 FPS target is met.

## Technical Context
Per architecture Section 15 (Fullscreen API), Section 18 (Performance), and Section 14 (Error Handling), several strategies are employed: DPR capping, antialiasing disabled, geometry optimization, memory management, and iOS-specific fallbacks. The fullscreen hook already exists (STORY-010) but needs iOS-specific handling.

## Scope
1. **Performance Audit & Optimization:**
   - Review and optimize all R3F components:
     - Ensure `React.memo` on Card3D, LifeTokens, PlayerSlot3D, MiddlePile3D
     - Verify Zustand selectors are granular (no component subscribes to entire store)
     - Check for unnecessary re-renders using React DevTools profiler
   - Canvas configuration confirmation:
     - `dpr={[1, 1.5]}` — cap pixel ratio
     - `gl={{ antialias: false }}` — disable anti-aliasing
     - `gl={{ powerPreference: 'high-performance' }}` — request high-performance GPU
   - Geometry optimization:
     - Reuse `BufferGeometry` instances via `useMemo` for shared card mesh, token mesh
     - Shared materials via `useMemo` at scene level
     - Verify triangle count stays under ~5,000 total
   - Memory management:
     - Dispose of VFX geometries and materials on unmount
     - No texture loading (all procedural — verified)
     - Check total memory usage stays under 150MB (Chrome DevTools Memory tab)
   - Frame loop optimization:
     - Use `frameloop="always"` only when animations are active
     - Consider `frameloop="demand"` when game is idle (waiting for human input)
     - Verify no `useFrame` callbacks running expensive computations

2. **Build Optimization:**
   - Configure Vite `manualChunks` (verify from STORY-001):
     ```
     'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
     'app-vendor': ['react', 'react-dom', 'zustand']
     ```
   - Target: total JS bundle < 500KB gzipped
   - Run `npm run build` and check output file sizes
   - Enable tree-shaking (ESM imports throughout)

3. **iOS Safari Fullscreen Fallback:**
   - Update `src/hooks/useFullscreen.ts`:
     - Detect iOS via `navigator.userAgent` or feature detection
     - On iOS: fullscreen button triggers CSS-based fullscreen:
       - Add class `css-fullscreen` to game container: `position: fixed; inset: 0; z-index: 9999; width: 100vw; height: 100vh`
       - Attempt to hide status bar via `window.scrollTo(0, 1)`
     - Add iOS meta tags to index.html (verify from STORY-001):
       - `<meta name="apple-mobile-web-app-capable" content="yes">`
       - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
     - Handle `navigator.standalone` detection for "Add to Home Screen" mode

4. **Touch & Gesture Handling:**
   - Ensure `touch-action: none` on Canvas element (prevents pinch-zoom, pull-to-refresh)
   - Ensure `overscroll-behavior: none` on `body` and `html` elements
   - Verify `preventDefault()` on canvas pointerdown events
   - Test tap latency: `pointerdown` → animation start < 200ms
   - Prevent double-tap zoom: `touch-action: manipulation` on interactive buttons
   - Prevent text selection: `user-select: none` on game container

5. **Cross-Browser Testing Checklist:**
   - Chrome Android: fullscreen API works, WebGL renders, touch events work
   - Safari iOS: CSS fullscreen fallback, WebGL renders, touch events work
   - Firefox Android: fullscreen API works, WebGL renders, touch events work
   - Samsung Internet: fullscreen API works, WebGL renders, touch events work
   - All browsers: `requestFullscreen` with webkit prefix handled

6. **Global CSS Hardening:**
   - Update `src/styles/index.css`:
     ```css
     body, html {
       margin: 0;
       padding: 0;
       overflow: hidden;
       overscroll-behavior: none;
       touch-action: none;
       user-select: none;
       -webkit-user-select: none;
       background: #1a1a2e;
     }
     ```
   - Add CSS for fullscreen fallback class
   - Ensure font loading is system fonts only (no web fonts to load)

## Out of Scope
- Adding new features
- Landscape orientation support
- PWA / service worker
- Analytics or telemetry

## Files Likely Affected
- `src/hooks/useFullscreen.ts` (update — iOS fallback)
- `src/styles/index.css` (update — global styles)
- `index.html` (verify meta tags)
- `vite.config.ts` (verify build config)
- `src/components/three/GameScene.tsx` (performance audit)
- `src/components/three/Card3D.tsx` (performance audit)
- `src/App.tsx` (add global styles, touch handling)
- Various R3F components (add `React.memo`, optimize)

## Implementation Notes
- Use Chrome DevTools Performance tab to profile a full game session
- Use React DevTools Profiler to check for unnecessary re-renders
- Use `performance.mark()` / `performance.measure()` to measure touch-to-animation latency
- `frameloop="demand"` requires calling `invalidate()` on the Canvas when state changes that need re-rendering
- iOS detection: `/iPad|iPhone|iPod/.test(navigator.userAgent)` (note: iPad may report as Mac in newer versions)
- `navigator.standalone` is `true` when user launches from Home Screen on iOS — in this case, fullscreen is already active
- Bundle size check: `npm run build && ls -la dist/assets/` then gzip sizes
- Test on real devices when possible; Chrome DevTools device emulation for initial testing

## Test Requirements
- [x] Chrome DevTools Performance: >=30 FPS sustained during 10-turn gameplay sequence
- [x] Touch latency: pointerdown to animation start < 200ms
- [x] Build output: total JS < 500KB gzipped
- [x] iOS Safari: CSS fullscreen fallback activates when tap on button
- [x] iOS Safari: game proceeds to playing state even without native fullscreen
- [x] Chrome Android: native fullscreen API works
- [x] All browsers: no browser gestures interfere with game (no pinch-zoom, no pull-to-refresh)
- [x] Memory: heap snapshot < 150MB after 20 turns
- [x] Portrait orientation: all HUD elements visible at 320px width
- [x] All touch targets are >= 44x44px effective size
- [x] React profiler: no unnecessary re-renders on game state changes
- [x] WebGL context lost handled gracefully (fallback message shown)

## Edge Cases
- Old Android browser with no WebGL support (should show "WebGL not supported" message)
- iPad running iPadOS 13+ (user agent reports as Mac — use `maxTouchPoints` for detection)
- User scrolls up during gameplay (should be prevented by overscroll-behavior: none)
- Orientation change mid-game (R3F Canvas auto-resizes; portrait optimized layout still works)
- Very low memory device (2GB RAM): ensure Three.js garbage collection handles texture disposal
- Samsung Internet: verify `webkitRequestFullscreen` is handled
- Rapid orientation changes (debounce any resize handlers)

## Dependencies
- STORY-010 (useFullscreen hook exists — this story enhances it)
- STORY-017 (Full game scene assembled — needs performance audit)
- STORY-018 (VFX — performance impact of particles)
- STORY-019 (Game over — full game flow testable)
- All prior stories (full feature set required for testing)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
