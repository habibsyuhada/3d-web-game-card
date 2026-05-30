# STORY-001 — Project Scaffolding & Configuration

**Status:** CLOSED

---

## Requirement IDs
- FR-001, FR-002 (title screen entry point)
- NFR-009 (TypeScript, ESLint, clear folder structure)
- NFR-010 (all assets procedural via code)
- IR-001 (React + Vite)
- IR-002 through IR-006 (R3F, Drei, Zustand, Tailwind, TypeScript)

## Acceptance Criteria IDs
- AC-001 (title screen visible)
- AC-021 (performance baseline)
- AC-022 (viewport responsiveness)

## Business Context
Every subsequent story depends on a properly scaffolded project with all dependencies installed, toolchain configured, and the folder structure in place. This story establishes the foundation for the entire codebase.

## Technical Context
- Vite 5.x as build tool with React plugin
- TypeScript 5.4+ strict mode
- Tailwind CSS 3.4+ with PostCSS pipeline
- React 18.3+, React Three Fiber 8.x, Drei 9.x, Three.js 0.164+
- Zustand 4.5+ with Immer middleware
- framer-motion-3d 11.x+
- Vitest for unit/integration testing
- ESLint + @typescript-eslint + Prettier
- Folder structure per architecture doc Section 5

## Scope
1. Initialize a Vite + React + TypeScript project (or ensure existing setup matches)
2. Install all production dependencies:
   - `react`, `react-dom`, `@react-three/fiber`, `@react-three/drei`, `three`
   - `zustand`, `immer`, `framer-motion-3d`, `tailwindcss`
3. Install all dev dependencies:
   - `@types/three`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
   - `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
   - `prettier`, `autoprefixer`, `postcss`, `jsdom`
4. Configure `vite.config.ts` with React plugin, code-splitting (manual chunks for three-vendor and app-vendor), `target: 'es2020'`
5. Configure `tsconfig.json` with strict mode, path aliases if desired
6. Configure Tailwind with `content` paths pointing to `src/`
7. Configure `vitest.config.ts` (environment: jsdom, setupFiles)
8. Configure ESLint + Prettier
9. Create the full folder structure per architecture Section 5 (empty placeholder files are acceptable)
10. Create `src/styles/index.css` with Tailwind base directives
11. Create `index.html` with proper meta tags (viewport, mobile web app capable, theme-color, title)
12. Verify `npm run dev` starts the dev server, `npm run build` succeeds, `npm test` runs (with one placeholder test)

## Out of Scope
- Writing any game logic, components, or 3D rendering
- Implementing actual component code beyond empty placeholder files
- Deploying to any host

## Files Likely Affected
- `package.json`
- `vite.config.ts` (create or modify)
- `tsconfig.json` / `tsconfig.app.json`
- `tailwind.config.js` / `tailwind.config.ts`
- `postcss.config.js` / `postcss.config.cjs`
- `vitest.config.ts` (new)
- `eslint.config.js` or `.eslintrc.cjs`
- `.prettierrc`
- `index.html`
- `src/main.tsx` (entry point stub)
- `src/App.tsx` (minimal stub)
- `src/styles/index.css`
- `src/test/setup.ts` (vitest setup)
- `src/types/` (create directory, empty `index.ts`)
- `src/engine/` (create directory, empty `index.ts`)
- `src/store/` (create directory, empty `index.ts`)
- `src/hooks/` (create directory)
- `src/components/ui/` (create directory)
- `src/components/three/` (create directory)
- `src/components/three/vfx/` (create directory)
- `src/utils/` (create directory)

## Implementation Notes
- Use `npm create vite@latest` or ensure existing Vite config matches architecture spec
- The `manualChunks` configuration in Vite separates Three.js vendor code from app code for optimal loading
- Add `"type": "module"` to `package.json` if using ESM
- Ensure `touch-action: none` and `overscroll-behavior: none` are set in global CSS to prevent browser gestures interfering with gameplay
- Create one placeholder test `src/engine/deck.test.ts` with `describe('placeholder', () => { it('works', () => { expect(true).toBe(true) }) })` to verify vitest works

## Test Requirements
- [x] `npm run dev` starts without errors
- [x] `npm run build` produces output in `dist/`
- [x] `npm test` runs and passes the placeholder test
- [x] `npm run lint` runs ESLint without fatal configuration errors

## Edge Cases
- Node version compatibility (ensure Node 18+ is supported)
- Windows vs. macOS path handling in configs
- Tailwind content paths correctly match `.tsx` files in `src/`

## Dependencies
- None (this is the first story)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed
- [x] QA review passed
- [x] Story closed
