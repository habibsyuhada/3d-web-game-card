/// <reference types="vite/client" />

// ── R3F JSX type bridge for React 19 types ──────────────────────────────
//
// R3F v8 uses `declare global { namespace JSX { ... } }` to extend the global
// JSX namespace with Three.js element types (ambientLight, mesh, group, etc.).
// However, @types/react v19 moved JSX to `React.JSX`, and with "jsx": "react-jsx"
// TypeScript resolves element types via `react/jsx-runtime` instead of the global
// namespace. We bridge both so R3F JSX elements pass type-checking.
//

import type { ThreeElements } from '@react-three/fiber';

declare module 'react/jsx-runtime' {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Merging R3F element types into runtime JSX namespace
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Merging R3F element types into dev runtime JSX namespace
    interface IntrinsicElements extends ThreeElements {}
  }
}
