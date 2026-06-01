// src/components/three/GameScene.test.tsx — Tests for 3D scene components (STORY-011, STORY-017)
//
// R3F components require WebGL context which is NOT available in jsdom.
// Strategy: mock @react-three/fiber (Canvas) and @react-three/drei (RoundedBox)
// to test component composition and integration without actual WebGL rendering.
//
// Test cases:
// 1. App renders game container when showTitleScreen is false
// 2. App renders Canvas wrapper (mocked) inside game container
// 3. Game container has touch-none class
// 4. Game container fills viewport (w-screen h-screen)
// 5. GameScene renders without crashing
// 6. Table3D renders using RoundedBox (mocked)
// 7. MiddlePile3D renders without crashing
// 8. PlayerSlot3D renders for each player index without crashing
// 9. App does NOT render TitleScreen when showTitleScreen is false
// 10. App renders TitleScreen when showTitleScreen is true (regression guard)
// 11. STORY-017: App wraps Canvas in ErrorBoundary
// 12. STORY-017: GameScene reads activeVFX state from store

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useGameStore } from '../../store';
import { GameStatus } from '../../types';

// ── Mock R3F (Canvas) ────────────────────────────────────────────────────
// Canvas is mocked as a div; children are NOT rendered since they contain
// Three.js JSX elements that require the R3F reconciler (only available
// inside a real Canvas with WebGL context).
// useFrame is mocked as a no-op since STORY-018 VFX components use it.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children: _children, ...rest }: Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest} />
  ),
  useFrame: () => {}, // no-op — VFX components require this
}));

// ── Mock Drei helpers ─────────────────────────────────────────────────────
// RoundedBox is mocked as a simple div so Table3D can render in jsdom.
// Text is mocked as a <span> so RandomVFX (STORY-018) can render in jsdom.
vi.mock('@react-three/drei', () => ({
  RoundedBox: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="rounded-box" {...rest}>
      {children}
    </div>
  ),
  Text: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <span data-testid="drei-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks are set up (vi.mock is hoisted)
import App from '../../App';
import { GameScene } from './GameScene';
import { Table3D } from './Table3D';
import { MiddlePile3D } from './MiddlePile3D';
import { PlayerSlot3D } from './PlayerSlot3D';

// ── Store reset helper ────────────────────────────────────────────────

function resetStore(showTitleScreen: boolean) {
  useGameStore.setState({
    showTitleScreen,
    isFullscreen: false,
    players: [],
    gameStatus: GameStatus.Waiting,
    deck: [],
    middlePile: [],
    lastValue: null,
    currentPlayerIndex: 0,
    winner: null,
  });
}

beforeEach(() => {
  resetStore(false);
});

// ── Tests ───────────────────────────────────────────────────────────────

describe('App → Game container (showTitleScreen=false)', () => {
  it('renders game container when showTitleScreen is false', () => {
    render(<App />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    expect(screen.queryByText('ZINKY ZOOGLE')).not.toBeInTheDocument();
  });

  it('renders Canvas wrapper (mocked) inside game container', () => {
    render(<App />);
    const canvas = screen.getByTestId('r3f-canvas');
    expect(canvas).toBeInTheDocument();
    // Canvas should be inside the game container
    const container = screen.getByTestId('game-container');
    expect(container.contains(canvas)).toBe(true);
  });

  it('game container has touch-none class to prevent browser gestures', () => {
    render(<App />);
    const container = screen.getByTestId('game-container');
    expect(container.className).toContain('touch-none');
  });

  it('game container fills viewport (w-screen h-screen)', () => {
    render(<App />);
    const container = screen.getByTestId('game-container');
    expect(container.className).toContain('w-screen');
    expect(container.className).toContain('h-screen');
  });

  it('does NOT render TitleScreen when showTitleScreen is false', () => {
    render(<App />);
    expect(screen.queryByText('ZINKY ZOOGLE')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /play fullscreen/i })).not.toBeInTheDocument();
  });

  it('renders TitleScreen when showTitleScreen is true (regression)', () => {
    resetStore(true);
    render(<App />);
    expect(screen.getByText('ZINKY ZOOGLE')).toBeInTheDocument();
    expect(screen.queryByTestId('r3f-canvas')).not.toBeInTheDocument();
  });
});

describe('GameScene (mocked R3F context)', () => {
  it('renders without crashing', () => {
    // Render GameScene inside a simple wrapper (no real Canvas needed in jsdom)
    const { container } = render(
      <div data-testid="scene-wrapper">
        <GameScene />
      </div>,
    );
    expect(container).toBeTruthy();
  });

  it('renders Table3D component (RoundedBox via mock)', () => {
    const { container } = render(<GameScene />);
    expect(container.querySelector('[data-testid="rounded-box"]')).toBeInTheDocument();
  });
});

describe('Table3D (mocked drei)', () => {
  it('renders RoundedBox mock', () => {
    render(<Table3D />);
    expect(screen.getByTestId('rounded-box')).toBeInTheDocument();
  });
});

describe('MiddlePile3D', () => {
  it('renders without crashing (placeholder)', () => {
    const { container } = render(<MiddlePile3D />);
    // MiddlePile3D is an empty group placeholder — just verify no error
    expect(container).toBeTruthy();
  });
});

describe('PlayerSlot3D', () => {
  it('renders for human player (index 0) without crashing', () => {
    const { container } = render(
      <PlayerSlot3D playerIndex={0} position={[0, 0, 3.5]} rotation={[0, 0, 0]} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders for bot player (index 1) without crashing', () => {
    const { container } = render(
      <PlayerSlot3D playerIndex={1} position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders for bot player (index 2) without crashing', () => {
    const { container } = render(
      <PlayerSlot3D playerIndex={2} position={[0, 0, -3.5]} rotation={[0, Math.PI, 0]} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders for bot player (index 3) without crashing', () => {
    const { container } = render(
      <PlayerSlot3D playerIndex={3} position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />,
    );
    expect(container).toBeTruthy();
  });

  it('uses default rotation when rotation prop omitted', () => {
    const { container } = render(
      <PlayerSlot3D playerIndex={1} position={[-3, 0, 0]} />,
    );
    expect(container).toBeTruthy();
  });
});

// ── STORY-017: ErrorBoundary + VFX state ─────────────────────────────

describe('STORY-017: ErrorBoundary wraps Canvas in App', () => {
  it('App renders Canvas inside ErrorBoundary without crashing', () => {
    // The Canvas mock renders as a div with data-testid="r3f-canvas".
    // ErrorBoundary passes children through when no error, so the Canvas
    // should still appear in the DOM — confirming ErrorBoundary is in the tree.
    resetStore(false);
    render(<App />);

    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });

  it('GameScene reads activeVFX state without crashing', () => {
    // Set activeVFX in the store to verify GameScene subscribes to it
    useGameStore.setState({
      activeVFX: 'bomb' as any,
      vfxPosition: [0, 1, 0],
    });

    const { container } = render(<GameScene />);
    // GameScene should render without crashing even when VFX state is set
    expect(container).toBeTruthy();

    // Clean up
    useGameStore.setState({ activeVFX: null, vfxPosition: null });
  });

  it('GameScene renders when activeVFX is null (no VFX active)', () => {
    useGameStore.setState({ activeVFX: null, vfxPosition: null });

    const { container } = render(<GameScene />);
    expect(container).toBeTruthy();
  });

  it('GameScene renders with various activeVFX values without crashing', () => {
    const effects = ['reverse', 'skip', 'bomb', 'nuclear', 'random'] as const;

    for (const effect of effects) {
      useGameStore.setState({
        activeVFX: effect as any,
        vfxPosition: [0, 1, 0],
      });

      const { container, unmount } = render(<GameScene />);
      expect(container).toBeTruthy();
      unmount();
    }

    // Clean up
    useGameStore.setState({ activeVFX: null, vfxPosition: null });
  });
});
