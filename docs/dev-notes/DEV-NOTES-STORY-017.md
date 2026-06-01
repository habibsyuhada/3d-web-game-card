# Dev Notes
Story ID: STORY-017

## Story Context Reviewed
- `docs/queue/dev-queue.md` — Wave 5, STORY-017 is current sprint (In Progress)
- `docs/stories/STORY-017.md` — Full Game Scene Assembly requirements
- `docs/prd/prd.md` — Not re-read (no PRD-specific changes needed for this story)
- `docs/architecture/architecture.md` — Confirmed GameScene is root R3F composition component
- `src/store/animation-slice.ts` — Confirmed `activeVFX` and `vfxPosition` already exist in the animation slice

## Files Changed

### Created
1. **`src/components/ErrorBoundary.tsx`** — React class component that catches rendering errors (especially WebGL context errors) from its child tree. Displays a user-friendly fallback with "3D rendering error. Please refresh the page." message and a Refresh button. Logs errors to `console.error` with `[ErrorBoundary]` prefix.

2. **`src/components/ErrorBoundary.test.tsx`** — 7 test cases covering:
   - Renders children normally when no error
   - Shows fallback UI (heading + message + error details) when child throws
   - Renders Refresh button in fallback UI
   - Calls `console.error` with `[ErrorBoundary]` prefix on catch
   - Refresh button triggers `window.location.reload()`
   - Does not show fallback when children render successfully
   - Handles null/empty error message gracefully

### Modified
3. **`src/components/three/GameScene.tsx`** — Added VFX scaffolding:
   - `const activeVFX = useGameStore((state) => state.activeVFX)` — reads active VFX effect from animation slice
   - `const vfxPosition = useGameStore((state) => state.vfxPosition)` — reads VFX position from animation slice
   - Added JSX placeholder: `{activeVFX !== null && vfxPosition !== null && null}` to consume variables (satisfies `noUnusedLocals`)
   - Added comment markers for STORY-018 VFX component rendering
   - Both variables are referenced in a no-op JSX expression so TypeScript's strict `noUnusedLocals` check passes

4. **`src/App.tsx`** — Wrapped `<Canvas>` in `<ErrorBoundary>`:
   - Added import: `import { ErrorBoundary } from './components/ErrorBoundary'`
   - Canvas is now wrapped: `<ErrorBoundary><Canvas ...>...</Canvas></ErrorBoundary>`
   - Added STORY-017 comment to file header

5. **`src/components/three/GameScene.test.tsx`** — Added STORY-017 integration tests:
   - Verifies App renders Canvas inside ErrorBoundary without crashing
   - Verifies GameScene reads `activeVFX` state without crashing
   - Verifies GameScene renders when `activeVFX` is null
   - Verifies GameScene renders with all 5 SpecialEffect values (`reverse`, `skip`, `bomb`, `nuclear`, `random`) without crashing

## Implementation Summary
STORY-017 is primarily an integration/assembly story. Most of the GameScene composition was already done in prior waves (STORY-011 through STORY-014). The main new deliverables are:

1. **ErrorBoundary** — A defensive wrapper that prevents the entire app from crashing if the R3F Canvas encounters WebGL errors (context lost, shader compilation failure, GPU driver issues). The class component uses `getDerivedStateFromError` and `componentDidCatch` lifecycle methods to catch errors and display a clean fallback UI.

2. **App.tsx integration** — The `<Canvas>` element is now wrapped in `<ErrorBoundary>`, ensuring any rendering error shows the fallback UI instead of a white screen.

3. **VFX scaffolding in GameScene** — Two new store selectors (`activeVFX`, `vfxPosition`) are read in the component. These will be consumed by the VFX components (BombVFX, NuclearVFX, ReverseVFX, SkipVFX, RandomVFX) that will be implemented in STORY-018. The variables are referenced in a no-op JSX expression `{activeVFX !== null && vfxPosition !== null && null}` to satisfy TypeScript's `noUnusedLocals` strict check while keeping the code clean and ready for STORY-018.

## Tests Added or Updated
- **New file:** `src/components/ErrorBoundary.test.tsx` (7 tests)
- **Updated file:** `src/components/three/GameScene.test.tsx` (4 new tests)
- **Total new tests:** 11
- **Total tests across all files:** 355 (all passing)

## Test Commands Run
```
cmd /c "npx tsc -p tsconfig.app.json --noEmit 2>&1"    → PASS (no errors)
cmd /c "npm test -- --run 2>&1"                         → PASS (355/355 tests, 31 files)
cmd /c "npm run build 2>&1"                             → PASS (built in 14.45s)
```

## Test Results
- TypeScript compilation: **PASS** (zero errors)
- Vitest unit tests: **PASS** (355 passed, 0 failed, 31 files)
- Production build: **PASS** (output in `dist/`)
- Pre-existing warnings: `sRGBEncoding`/`LinearEncoding` from @react-three/fiber (not related to this story), large vendor chunk (three.js ~1MB, expected)

## Commit Notes
Suggested commit message:
```
feat(scene): add ErrorBoundary and VFX scaffolding (STORY-017)

- Create ErrorBoundary class component that catches WebGL/R3F errors
  and displays a user-friendly fallback with refresh button
- Wrap Canvas in ErrorBoundary in App.tsx GameContainer
- Add activeVFX and vfxPosition store selectors to GameScene
  (VFX components to be implemented in STORY-018)
- Add 7 ErrorBoundary tests and 4 new GameScene integration tests
- All 355 tests passing; build succeeds
```

## Risks / Limitations
1. **ErrorBoundary scope** — The ErrorBoundary only catches errors thrown during React rendering (render phase, lifecycle methods, constructors). It does NOT catch errors in event handlers, setTimeout/setInterval callbacks, or SSR. This is standard React error boundary behavior and matches the story requirements.
2. **VFX scaffolding is inert** — The `activeVFX` and `vfxPosition` variables are read but not yet used to render actual VFX components. This is intentional (STORY-018). The no-op JSX expression `{activeVFX !== null && vfxPosition !== null && null}` ensures TypeScript doesn't flag them as unused.
3. **No actual VFX rendering** — STORY-017 deliberately leaves VFX rendering to STORY-018. The placeholder comment in GameScene.tsx marks where VFX components will be inserted.
4. **ErrorBoundary does not retry** — The fallback UI only offers a full page refresh. A more sophisticated approach could attempt to remount the Canvas subtree. This is acceptable for MVP.
5. **Build warnings** — The `sRGBEncoding`/`LinearEncoding` warnings from @react-three/fiber are pre-existing library compatibility issues and are not introduced by this story.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
