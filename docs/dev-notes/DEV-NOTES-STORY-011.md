# Dev Notes
Story ID: STORY-011

## Story Context Reviewed
- `docs/queue/dev-queue.md` — Wave 3 in progress, STORY-011 queued
- `docs/stories/STORY-011.md` — 3D Scene Foundation requirements
- `docs/architecture/architecture.md` — Section 9 3D Scene Graph, camera/lighting/positions
- `docs/prd/prd.md` (implicitly via story file)
- `src/App.tsx` — Prior placeholder structure

## Files Changed
- `src/components/three/GameScene.tsx` — **Created.** Root 3D scene: lighting rig, table, middle pile placeholder, 4 player slot placeholders at cardinal positions.
- `src/components/three/Table3D.tsx` — **Created.** Procedural table mesh using Drei `RoundedBox` (8x0.1x6 units, green felt `#1a472a`, roughness 0.8, metalness 0.1).
- `src/components/three/MiddlePile3D.tsx` — **Created.** Empty group placeholder at table center for STORY-013.
- `src/components/three/PlayerSlot3D.tsx` — **Created.** Placeholder with position/rotation props and small circle marker (gold for human, gray for bots) for STORY-012.
- `src/components/three/GameScene.test.tsx` — **Created.** 15 test cases covering App integration, Canvas rendering, and all scene components.
- `src/App.tsx` — **Modified.** Replaced "Game Scene Loading..." placeholder with R3F `<Canvas>` wrapper containing `<GameScene />`. Canvas configured per architecture: `dpr=[1,1.5]`, no AA, `powerPreference=high-performance`, camera at `[0,8,6]` FOV 50.
- `src/components/ui/TitleScreen.test.tsx` — **Modified.** Added `vi.mock` for `@react-three/fiber` and `@react-three/drei` so App renders cleanly in jsdom. Updated "game container" test to check for `data-testid="r3f-canvas"` instead of removed "Game Scene Loading..." text.
- `src/vite-env.d.ts` — **Modified.** Added R3F JSX type bridge for React 19 types compatibility. R3F v8 uses `declare global { namespace JSX { ... } }` but `@types/react@19` moved JSX to `React.JSX`; the bridge augments `react/jsx-runtime` and `react/jsx-dev-runtime` to merge `ThreeElements` into their `IntrinsicElements` interfaces.
- `src/components/three/.gitkeep` — **Removed** (directory now populated with real files).

## Implementation Summary

### 3D Scene Architecture
The R3F scene is structured per architecture Section 9:

```
<Canvas dpr={[1,1.5]} gl={{...}} camera={{pos:[0,8,6], fov:50}}>
└── <GameScene>
    ├── <ambientLight intensity={0.4} />
    ├── <directionalLight position={[5,10,5]} intensity={0.8} />       (key)
    ├── <directionalLight position={[-3,5,-3]} intensity={0.3} />      (fill)
    ├── <spotLight position={[0,6,0]} intensity={0.5} angle={0.6} />   (pile)
    ├── <Table3D />           — RoundedBox 8x0.1x6, green felt
    ├── <MiddlePile3D />      — empty group placeholder (STORY-013)
    └── <PlayerSlot3D />      — ×4 at cardinal positions
        P0: [0, 0, 3.5]       Human (bottom, face-up in STORY-012)
        P1: [-3, 0, 0]        Bot 2 (left)
        P2: [0, 0, -3.5]      Bot 3 (top)
        P3: [3, 0, 0]         Bot 4 (right)
```

### Notable Technical Decisions

1. **R3F + React 19 types bridge** — R3F v8's global `JSX.IntrinsicElements` extension does not propagate to TypeScript when using `@types/react@19` (which moved JSX to `React.JSX`). Rather than downgrading `@types/react` or upgrading R3F, added a minimal type bridge in `vite-env.d.ts` that augments `react/jsx-runtime` and `react/jsx-dev-runtime` with `ThreeElements`. This is a zero-runtime-cost type-only augmentation.

2. **No `target-position` on spotLight** — Omitted `target-position` prop on `<spotLight>` to avoid TypeScript prop-compatibility friction. THREE.SpotLight's default target is already at `[0,0,0]` which matches the scene layout.

3. **`circleGeometry` rotation** — Player slot marker circles use `rotation={[-Math.PI/2, 0, 0]}` to lay flat on the table (XZ plane), not stand upright.

4. **Canvas wrapper div** — `App` wraps `<Canvas>` in a `<div data-testid="game-container" className="w-screen h-screen touch-none">` for both testability and the `touch-none` directive that prevents browser touch gestures from interfering with 3D interactions.

5. **Test mocks** — `@react-three/fiber` `Canvas` is mocked as a simple `<div data-testid="r3f-canvas" />` (children not rendered) and `@react-three/drei` `RoundedBox` is mocked as a div. This lets all 15 scene tests run in jsdom without a real WebGL context.

## Tests Added or Updated
**New test file:** `src/components/three/GameScene.test.tsx` — 15 tests
| # | Test Case |
|---|-----------|
| 1 | App renders game container when `showTitleScreen=false` |
| 2 | App renders Canvas wrapper (mocked) inside game container |
| 3 | Game container has `touch-none` class |
| 4 | Game container fills viewport (`w-screen h-screen`) |
| 5 | App does NOT render TitleScreen when `showTitleScreen=false` |
| 6 | App renders TitleScreen when `showTitleScreen=true` (regression guard) |
| 7 | GameScene renders without crashing |
| 8 | GameScene renders Table3D (RoundedBox via mock) |
| 9 | Table3D renders RoundedBox mock |
| 10 | MiddlePile3D renders without crashing |
| 11-14 | PlayerSlot3D renders for each player index (0-3) |
| 15 | PlayerSlot3D uses default rotation when prop omitted |

**Updated:** `src/components/ui/TitleScreen.test.tsx` — 1 test updated, added global R3F mocks (affects existing App integration test).

## Test Commands Run
- `npm test -- --run` — Full suite
- `npm run lint` — ESLint
- `npm run build` — tsc compilation + Vite production build

## Test Results
- **Tests:** ✅ 202 passed / 14 files (up from 187 / 13 — net +15 tests)
- **Lint:** ✅ Clean (no errors, no warnings)
- **Build:** ✅ Succeeds (`tsc -b` clean + Vite bundle built)
- **Build warnings (non-blocking):**
  - R3F v8 uses deprecated `sRGBEncoding`/`LinearEncoding` symbols from Three.js r152+ (Vite rollup warning, not a build failure)
  - `three-vendor` chunk exceeds 600KB pre-gzip (939KB raw / 260KB gzip); to be addressed in STORY-020 (performance tuning)

## Commit Notes
Suggested commit message:
```
feat(scene): establish 3D scene foundation (STORY-011)

- Add R3F Canvas with performance-tuned config (dpr capped, no AA)
- Add GameScene with lighting rig (ambient + 2 directional + spot)
- Add Table3D (Drei RoundedBox, green felt, low-poly)
- Add MiddlePile3D placeholder (STORY-013)
- Add PlayerSlot3D placeholder with cardinal positions (STORY-012)
- Replace App placeholder with Canvas + GameScene
- Add R3F↔React19 JSX type bridge for Three.js element typings
- Add 15 scene tests (mocked R3F for jsdom)
```

## Risks / Limitations
- **R3F v8 + Three.js 0.164 deprecation warnings** — R3F v8 uses `sRGBEncoding`/`LinearEncoding` removed in Three.js r152+. These warnings do not block the build but will surface in the browser console. Upgrading R3F to v9 (or replacing the deprecated imports) is recommended before production release.
- **No WebGL integration tests** — Scene tests run fully mocked. Real-device visual verification (portrait layout, lighting quality, touch targets) is deferred to manual QA in later waves.
- **`three-vendor` chunk size** — 939KB pre-gzip (260KB after). STORY-020 should investigate manual chunking (e.g., splitting drei from three core) to reduce initial load time.
- **`target-position` not set on spotLight** — Relying on Three.js default. If a future story requires an explicit non-origin target, a `<primitive object={spotLight.target} />` pattern will be needed.

## Ready for Scrum Master Review?
Status: **READY_FOR_SM_REVIEW**
