// src/components/ui/TitleScreen.test.tsx — Tests for TitleScreen component, useFullscreen hook, and App integration
//
// Test cases:
// 1. TitleScreen renders with text "ZINKY ZOOGLE" visible
// 2. TitleScreen renders button with accessible text "PLAY FULLSCREEN"
// 3. Button click triggers store updates: showTitleScreen → false
// 4. Button click calls initGame() — store.players.length > 0 after click
// 5. useFullscreen: isSupported detected correctly (boolean)
// 6. useFullscreen: enterFullscreen does not crash (returns Promise<void>)
// 7. App renders TitleScreen when showTitleScreen === true
// 8. App renders game container when showTitleScreen === false

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { TitleScreen } from './TitleScreen';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useGameStore } from '../../store';
import App from '../../App';
import { GameStatus } from '../../types';

// ── Mock R3F Canvas (WebGL not available in jsdom) ────────────────────────
// Canvas is mocked as a simple div; children are NOT rendered because they
// contain Three.js JSX elements that require the R3F WebGL reconciler.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children: _children, ...rest }: Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest} />
  ),
}));

// ── Mock Drei RoundedBox (used by Table3D inside GameScene) ───────────────
vi.mock('@react-three/drei', () => ({
  RoundedBox: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="rounded-box" {...rest}>
      {children}
    </div>
  ),
}));

// ── Mock fullscreen APIs (not available in jsdom) ──────────────────────────

/**
 * Sets up consistent fullscreen API mocks for jsdom before each test.
 * All mocks are safe — they resolve immediately and don't throw.
 */
function setupFullscreenMocks() {
  // Reset to a baseline: no fullscreen, API not enabled
  Object.defineProperty(document, 'fullscreenEnabled', {
    value: false,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    writable: true,
    configurable: true,
  });

  // Provide requestFullscreen on documentElement (mock resolves cleanly)
  (document.documentElement as unknown as Record<string, unknown>).requestFullscreen =
    vi.fn().mockResolvedValue(undefined);

  // Provide exitFullscreen on document
  document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
}

// ── Store reset helper ──────────────────────────────────────────────────────

/**
 * Resets the Zustand store to a clean baseline before each test,
 * preventing state leakage between tests.
 */
function resetStore() {
  useGameStore.setState({
    showTitleScreen: true,
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

// ── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  setupFullscreenMocks();
  resetStore();
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe('TitleScreen', () => {
  it('renders with game title "ZINKY ZOOGLE" visible', () => {
    render(<TitleScreen />);
    const title = screen.getByText('ZINKY ZOOGLE');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H1');
  });

  it('renders a button with accessible text "PLAY FULLSCREEN"', () => {
    render(<TitleScreen />);
    const button = screen.getByRole('button', { name: /play fullscreen/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('button click triggers store update: showTitleScreen → false', async () => {
    render(<TitleScreen />);
    const button = screen.getByRole('button', { name: /play fullscreen/i });

    await act(async () => {
      fireEvent.click(button);
    });

    const state = useGameStore.getState();
    expect(state.showTitleScreen).toBe(false);
  });

  it('button click calls initGame() — store.players.length > 0', async () => {
    render(<TitleScreen />);
    const button = screen.getByRole('button', { name: /play fullscreen/i });

    await act(async () => {
      fireEvent.click(button);
    });

    const state = useGameStore.getState();
    expect(state.players.length).toBeGreaterThan(0);
    expect(state.gameStatus).not.toBe(GameStatus.Waiting);
  });
});

describe('useFullscreen', () => {
  it('isSupported is detected as a boolean', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(typeof result.current.isSupported).toBe('boolean');
  });

  it('enterFullscreen does not crash and returns a resolved Promise', async () => {
    const { result } = renderHook(() => useFullscreen());

    // Should not throw, should resolve cleanly
    await expect(result.current.enterFullscreen()).resolves.toBeUndefined();
  });

  it('exitFullscreen does not crash and returns a resolved Promise', async () => {
    const { result } = renderHook(() => useFullscreen());

    // Should not throw, should resolve cleanly
    await expect(result.current.exitFullscreen()).resolves.toBeUndefined();
  });

  it('isFullscreen starts as false when not in fullscreen', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });
});

describe('App integration', () => {
  it('renders TitleScreen when showTitleScreen === true', () => {
    // Default state: showTitleScreen is true
    useGameStore.setState({ showTitleScreen: true });

    render(<App />);

    expect(screen.getByText('ZINKY ZOOGLE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play fullscreen/i })).toBeInTheDocument();
  });

  it('renders game container with Canvas when showTitleScreen === false', () => {
    useGameStore.setState({ showTitleScreen: false });

    render(<App />);

    // TitleScreen should not be visible
    expect(screen.queryByText('ZINKY ZOOGLE')).not.toBeInTheDocument();
    // Game container should render with Canvas (mocked as div)
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
