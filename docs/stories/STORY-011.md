# STORY-011 — 3D Scene Foundation (Canvas, Camera, Lighting, Table)

**Status:** Ready

---

## Requirement IDs
- FR-070 (3D table/arena as main play surface)
- FR-071 (4 player positions around the table)
- FR-078 (all 3D assets procedurally generated via code)
- FR-079 (camera positioned for clear view of hand and middle pile)
- NFR-001 (>=30 FPS on mid-range mobile)
- NFR-005 (adapt to mobile widths 320-428px)
- NFR-006 (portrait orientation)
- NFR-007 (<=150MB memory)
- NFR-010 (all assets code-generated)
- IR-002 (React Three Fiber)
- IR-003 (Drei helpers)

## Acceptance Criteria IDs
- AC-003 (3D table visible with player positions)
- AC-021 (>=30 FPS maintained)
- AC-022 (portrait mode, elements visible)

## Business Context
This story establishes the 3D rendering foundation — the R3F Canvas, camera, lighting rig, and procedural table. Every subsequent 3D component (cards, tokens, player slots) will be placed within this scene.

## Technical Context
Per architecture Section 9, the camera is a PerspectiveCamera at position [0, 8, 6] looking at [0, 0, 0] with FOV 50. The lighting plan includes ambient, two directionals (key + fill), and a spot light on the pile. The table is a procedural rounded plane/box with a green felt material.

## Scope
1. Create `src/components/three/GameScene.tsx`:
   - Root 3D scene component rendered inside `<Canvas>`
   - Sets up lighting:
     - `ambientLight` intensity 0.4
     - `directionalLight` (key) at [5, 10, 5], intensity 0.8
     - `directionalLight` (fill) at [-3, 5, -3], intensity 0.3
     - `spotLight` at [0, 6, 0], intensity 0.5, targeting [0, 0, 0]
   - Renders `<Table3D />` at the center
   - Placeholder positions for 4 player slots (empty groups with comments)
   - Placeholder for middle pile area

2. Create `src/components/three/Table3D.tsx`:
   - Procedural table mesh using Drei's `RoundedBox` or a custom `PlaneGeometry` with rounded corners
   - Dimensions: approximately 8 x 6 units (landscape-ish on table surface, viewed from above)
   - Material: `MeshStandardMaterial` with a green felt color (e.g., `#2d5a27` or `#1a472a`)
   - Subtle wood-colored rim/edge (thin extruded border, optional)
   - Positioned at [0, -0.1, 0] (slightly below table plane to prevent z-fighting)
   - Receives shadows (if performance allows)

3. Update `src/App.tsx` (game container section):
   - When `showTitleScreen === false`, render:
     ```tsx
     <Canvas
       dpr={[1, 1.5]}
       gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
       camera={{ position: [0, 8, 6], fov: 50, near: 0.1, far: 100 }}
       style={{ touchAction: 'none' }}
     >
       <GameScene />
     </Canvas>
     ```

4. Create simple placeholder components (empty or minimal) for future integration:
   - `src/components/three/MiddlePile3D.tsx` (placeholder)
   - `src/components/three/PlayerSlot3D.tsx` (placeholder with position)

## Out of Scope
- Card rendering (STORY-012)
- Life tokens (STORY-013)
- Player hand layout (STORY-012)
- HUD overlays (STORY-016)
- Card animations (STORY-014)
- VFX (STORY-018)

## Files Likely Affected
- `src/components/three/GameScene.tsx` (create)
- `src/components/three/Table3D.tsx` (create)
- `src/components/three/MiddlePile3D.tsx` (create placeholder)
- `src/components/three/PlayerSlot3D.tsx` (create placeholder)
- `src/App.tsx` (update — add Canvas + GameScene)

## Implementation Notes
- Canvas `dpr={[1, 1.5]}` caps pixel ratio for mobile performance (prevents rendering at 3x on high-DPI screens)
- `touchAction: 'none'` prevents browser touch gestures from interfering with 3D interactions
- Camera at [0, 8, 6] with `lookAt={[0, 0, 0]}` can be set using `<PerspectiveCamera makeDefault>` from Drei, or via camera prop on Canvas + a `<primitive object={camera} />` with lookAt
- Table geometry should use low segments (RoundedBox segments: 2) to keep triangle count ~200
- Green felt material: `roughness: 0.8, metalness: 0.1` for a matte fabric look
- Avoid adding OrbitControls — camera is fixed for the card game perspective
- Consider using `<Environment preset="warehouse" />` from Drei for subtle reflections (optional, evaluate performance)

## Test Requirements
- [x] Canvas renders without errors
- [x] Table3D visible as a green surface in the center of the scene
- [x] Camera angle shows the table from an elevated perspective
- [x] Lighting produces visible illumination (no pitch-black scene)
- [x] Canvas fills the full viewport (100vw x 100vh)
- [x] Touch events on canvas do not cause page scroll or pinch-zoom
- [x] Scene renders at >=30 FPS with just the table (no heavy objects)

## Edge Cases
- WebGL not available in browser (show fallback message — add ErrorBoundary)
- Very narrow screens (320px) — table should still be visible; camera FOV handles this
- Canvas resizing when orientation changes (R3F handles this automatically via `<Canvas>`)
- `alpha: false` on WebGL context — canvas background is solid color, not transparent

## Dependencies
- STORY-001 (project scaffolded with R3F + Drei)
- STORY-009 (Zustand store — game state needed for later integration)
- STORY-010 (TitleScreen exists; App.tsx already conditionally renders)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
