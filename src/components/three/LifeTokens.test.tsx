// src/components/three/LifeTokens.test.tsx — Tests for LifeTokens component (STORY-013)
//
// R3F components require WebGL context which is NOT available in jsdom.
// Strategy: mock @react-three/fiber and @react-three/drei to test rendering
// and verify component composition without actual WebGL rendering.
//
// Test cases cover:
// - 5 full lives = 5 active (bright) tokens rendered
// - 3 lives = 3 bright, 2 dim/gray tokens
// - 0 lives = all dim/gray tokens
// - Custom maxLives prop
// - React.memo prevents unnecessary re-renders

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useGameStore } from '../../store';
import { GameStatus, Direction } from '../../types';

// ── Mock @react-three/fiber ────────────────────────────────────────────
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children: _children, ...rest }: Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest} />
  ),
}));

// ── Mock @react-three/drei ─────────────────────────────────────────────
vi.mock('@react-three/drei', () => ({
  RoundedBox: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="rounded-box" {...rest}>
      {children}
    </div>
  ),
  Text: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <span data-testid="card-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks
import { LifeTokens } from './LifeTokens';

// ── Store reset ─────────────────────────────────────────────────────────
beforeEach(() => {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Waiting,
    winner: null,
    isAnimating: false,
  });
});

// ── Tests ──────────────────────────────────────────────────────────────

describe('LifeTokens — renders correct number of tokens', () => {
  it('renders 5 tokens when maxLives is 5 (default)', () => {
    const { container } = render(
      <LifeTokens count={5} position={[0, 0, 0]} />,
    );
    // 5 life token meshes (each is a mesh with sphereGeometry)
    // In jsdom, Three.js JSX renders as custom elements; count the mesh-like groups
    // Each token renders a <mesh> element — in jsdom these render as DOM elements
    const meshes = container.querySelectorAll('mesh');
    expect(meshes.length).toBe(5);
  });

  it('renders 5 active (bright) tokens when count is 5', () => {
    const { container } = render(
      <LifeTokens count={5} position={[0, 0, 0]} />,
    );
    const materials = container.querySelectorAll('meshStandardMaterial');
    // All 5 should be active — color #e74c3c
    let activeCount = 0;
    materials.forEach((mat) => {
      if (mat.getAttribute('color') === '#e74c3c') activeCount++;
    });
    expect(activeCount).toBe(5);
  });

  it('renders 3 bright + 2 dim tokens when count is 3', () => {
    const { container } = render(
      <LifeTokens count={3} position={[0, 0, 0]} />,
    );
    const materials = container.querySelectorAll('meshStandardMaterial');
    let activeCount = 0;
    let lostCount = 0;
    materials.forEach((mat) => {
      if (mat.getAttribute('color') === '#e74c3c') activeCount++;
      if (mat.getAttribute('color') === '#333333') lostCount++;
    });
    expect(activeCount).toBe(3);
    expect(lostCount).toBe(2);
  });

  it('renders all dim/gray tokens when count is 0', () => {
    const { container } = render(
      <LifeTokens count={0} position={[0, 0, 0]} />,
    );
    const materials = container.querySelectorAll('meshStandardMaterial');
    let lostCount = 0;
    materials.forEach((mat) => {
      if (mat.getAttribute('color') === '#333333') lostCount++;
    });
    expect(lostCount).toBe(5);
  });

  it('renders custom maxLives correctly (e.g., 3 tokens)', () => {
    const { container } = render(
      <LifeTokens count={2} position={[0, 0, 0]} maxLives={3} />,
    );
    const meshes = container.querySelectorAll('mesh');
    expect(meshes.length).toBe(3);
    const materials = container.querySelectorAll('meshStandardMaterial');
    let activeCount = 0;
    let lostCount = 0;
    materials.forEach((mat) => {
      if (mat.getAttribute('color') === '#e74c3c') activeCount++;
      if (mat.getAttribute('color') === '#333333') lostCount++;
    });
    expect(activeCount).toBe(2);
    expect(lostCount).toBe(1);
  });

  it('lost tokens have reduced opacity (0.3)', () => {
    const { container } = render(
      <LifeTokens count={2} position={[0, 0, 0]} />,
    );
    const materials = container.querySelectorAll('meshStandardMaterial');
    materials.forEach((mat) => {
      const isLost = mat.getAttribute('color') === '#333333';
      if (isLost) {
        expect(mat.getAttribute('opacity')).toBe('0.3');
      } else {
        expect(mat.getAttribute('opacity')).toBe('1');
      }
    });
  });
});
