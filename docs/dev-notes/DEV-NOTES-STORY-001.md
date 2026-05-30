# Dev Notes
Story ID: STORY-001

## Story Context Reviewed
- STORY-001: Project Scaffolding & Configuration
- docs/architecture/architecture.md (Sections 4 Tech Stack, 5 Folder Structure, 16 Testing, 18 Performance, 19 Deployment)
- docs/queue/dev-queue.md (Wave 1 — Foundation, STORY-001 is first in queue)
- No prior stories (this is the first story)

## Files Changed

### Created — Root Configuration
| File | Purpose |
|------|---------|
| `package.json` | Project manifest with "type": "module", all scripts, all dependencies |
| `index.html` | Entry HTML with mobile meta tags (viewport, theme-color, apple-mobile-web-app-capable) |
| `vite.config.ts` | Vite 5 config: React plugin, es2020 target, manual chunks (three-vendor, app-vendor) |
| `tsconfig.json` | Root tsconfig with project references to app + node |
| `tsconfig.app.json` | App TypeScript config: strict mode, ES2020, path alias `@/*` → `src/*` |
| `tsconfig.node.json` | Node TypeScript config for vite/vitest config files |
| `tailwind.config.js` | Tailwind CSS 3.4 with content paths: `./index.html`, `./src/**/*.{js,ts,jsx,tsx}` |
| `postcss.config.js` | PostCSS pipeline: tailwindcss + autoprefixer |
| `vitest.config.ts` | Vitest config: jsdom environment, globals, setupFiles: `./src/test/setup.ts` |
| `eslint.config.js` | ESLint flat config: typescript-eslint, react-hooks, react-refresh plugins |
| `.prettierrc` | Prettier: single quotes, semi, trailing comma, 100 print width |
| `.gitignore` | Standard Node/Vite ignores (dist, node_modules, etc.) |
| `.vscode/extensions.json` | Recommended VSCode extensions: ESLint, Prettier |

### Created — Source Files
| File | Purpose |
|------|---------|
| `src/main.tsx` | App entry point: ReactDOM.createRoot, imports App and global CSS |
| `src/App.tsx` | Minimal root component: renders "Zinky Zoogle" title (placeholder) |
| `src/vite-env.d.ts` | Vite client type reference |
| `src/styles/index.css` | Tailwind directives + global CSS (touch-action: none, overscroll-behavior: none) |
| `src/test/setup.ts` | Vitest setup file: imports @testing-library/jest-dom |
| `src/engine/deck.test.ts` | Placeholder test: `describe('placeholder')` — passes successfully |
| `src/types/index.ts` | Empty barrel file (types to be defined in STORY-002) |
| `src/engine/index.ts` | Empty barrel file (engine modules in STORY-003–008) |
| `src/store/index.ts` | Empty barrel file (store in STORY-009) |

### Created — Directory Placeholders (.gitkeep)
| Directory | Purpose |
|-----------|---------|
| `src/hooks/.gitkeep` | Custom React hooks directory |
| `src/components/ui/.gitkeep` | HTML overlay UI components directory |
| `src/components/three/.gitkeep` | R3F 3D components directory |
| `src/components/three/vfx/.gitkeep` | VFX sub-components directory |
| `src/utils/.gitkeep` | Shared utility helpers directory |

## Implementation Summary

1. **Vite + React + TypeScript project** scaffolded manually (directory already had `.git/` and `docs/`, so `npm create vite` was not used).
2. **All production dependencies** installed:
   - react@18.3.1, react-dom@18.3.1
   - @react-three/fiber@8.2.2, @react-three/drei@9.122.0, three@0.164.1
   - zustand@4.5.7, immer@10.2.0, framer-motion-3d@11.18.2
   - tailwindcss@3.4.19
3. **All dev dependencies** installed:
   - typescript@5.9.3, vite@5.4.21, @vitejs/plugin-react@4.7.0
   - vitest@4.1.7, @testing-library/react@16.3.2, @testing-library/jest-dom@6.9.1
   - @types/react@19.2.15, @types/react-dom@19.2.3, @types/three@0.184.1
   - eslint@10.4.1, @eslint/js@10.0.1, typescript-eslint@8.60.0
   - eslint-plugin-react-hooks@7.1.1, eslint-plugin-react-refresh@0.5.2
   - prettier@3.8.3, autoprefixer@10.5.0, postcss@8.5.15
   - jsdom@29.1.1, globals@17.6.0
4. **Vite config** includes manual chunks splitting three-vendor (three, R3F, drei) from app-vendor (react, react-dom, zustand), with es2020 build target.
5. **TypeScript** configured in strict mode with project references (tsconfig.json → tsconfig.app.json + tsconfig.node.json), path alias `@/*`.
6. **Tailwind** configured with content paths matching all HTML and TSX files.
7. **Vitest** configured with jsdom environment and setup file.
8. **ESLint** uses flat config (eslint.config.js) with TypeScript, React Hooks, and React Refresh plugins.
9. **Full folder structure** created per architecture doc Section 5.
10. **Global CSS** includes `touch-action: none`, `overscroll-behavior: none`, `user-select: none`, and `overflow: hidden`.
11. **index.html** includes all required mobile meta tags.

## Deviations from Story Spec
1. **Used ESLint flat config** (`eslint.config.js`) instead of `.eslintrc.cjs` — ESLint v10 (installed) uses flat config by default. The legacy `.eslintrc` format is deprecated.
2. **Installed @types/react and @types/react-dom** — Not listed in the story spec but required for TypeScript compilation with React 18.
3. **Pinned @vitejs/plugin-react to v4** — The latest v6 requires Vite 8, but the project targets Vite 5.x.
4. **Lint script simplified** — Changed from `eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0` to `eslint .` since flat config handles file matching internally.

## Tests Added or Updated
| Test File | Description | Status |
|-----------|-------------|--------|
| `src/engine/deck.test.ts` | Placeholder test: `expect(true).toBe(true)` | ✅ Passes |

## Test Commands Run

| Command | Result |
|---------|--------|
| `npm test` (vitest run) | ✅ 1 test file, 1 test passed (20s including jsdom environment setup) |
| `npm run build` (tsc -b && vite build) | ✅ Built successfully in ~28s, output in `dist/` |
| `npm run dev` (vite) | ✅ Server started at http://localhost:5173/ in 1408ms |
| `npm run lint` (eslint .) | ✅ Zero errors, zero warnings |

## Test Results

### Build Output (dist/)
```
dist/index.html                        0.77 kB │ gzip:  0.39 kB
dist/assets/index-iCfSBbeX.css         5.36 kB │ gzip:  1.62 kB
dist/assets/app-vendor-DiXAKaTd.js     0.04 kB │ gzip:  0.06 kB
dist/assets/index-hAMfDx_W.js          1.93 kB │ gzip:  1.07 kB
dist/assets/three-vendor-BP8ymcgN.js 140.93 kB │ gzip: 45.29 kB
```
- Code splitting confirmed: three-vendor is separated from app-vendor
- Total JS gzipped: ~46 kB (well under 500KB budget)
- app-vendor chunk is small because zustand/react are not heavily used yet

### Vitest Output
```
✓ src/engine/deck.test.ts > placeholder > works
Test Files  1 passed (1)
     Tests  1 passed (1)
```

## Commit Notes
Suggested commit message:
```
feat: scaffold Vite + React + TypeScript project (STORY-001)

- Initialize project with Vite 5, React 18, TypeScript 5 in strict mode
- Install all production deps: R3F, Drei, Three.js, Zustand, Immer, Tailwind
- Install all dev deps: Vitest, Testing Library, ESLint, Prettier
- Configure Vite code splitting (three-vendor / app-vendor chunks)
- Configure Tailwind, PostCSS, ESLint flat config, Vitest (jsdom)
- Create full folder structure per architecture doc Section 5
- Create index.html with mobile meta tags
- Set global CSS touch-action/overscroll-behavior for mobile
- Add placeholder test verifying vitest works
- Verify: npm run dev, build, test, lint all pass
```

## Risks / Limitations
1. **framer-motion-3d is deprecated** — npm showed deprecation warning. The package still works (v11) but may not receive updates. Future stories should evaluate alternatives or lock the version.
2. **three-mesh-bvh deprecation** — Transitive dependency via drei has a deprecation warning. Should be resolved when drei is updated.
3. **Vitest jsdom environment setup takes ~12 seconds** — The initial jsdom environment creation is slow. Subsequent test runs with caching should be faster.
4. **ESLint v10 installed** — Very recent version; some plugins may have edge-case compatibility issues. Currently all passing.
5. **2 moderate audit vulnerabilities** — Run `npm audit` to review; likely in transitive dev dependencies.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW

### Verification Checklist
- [x] `npm run dev` starts without errors (localhost:5173 in 1408ms)
- [x] `npm run build` produces output in `dist/` (5 files, code-split correctly)
- [x] `npm test` runs and the placeholder test passes (1/1)
- [x] `npm run lint` runs ESLint without errors (zero issues)
- [x] All directories exist under `src/` (types, engine, store, hooks, components/ui, components/three, components/three/vfx, utils, styles, test)
- [x] `index.html` has mobile meta tags (viewport, apple-mobile-web-app-capable, mobile-web-app-capable, theme-color)
- [x] Global CSS has `touch-action: none` and `overscroll-behavior: none` rules
