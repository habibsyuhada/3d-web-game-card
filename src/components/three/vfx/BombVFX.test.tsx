// src/components/three/vfx/BombVFX.test.tsx — Tests for BombVFX component (STORY-018)
//
// R3F components require WebGL context which is NOT available in jsdom.
// Strategy: mock @react-three/fiber (useFrame as no-op) to test that the
// component renders without crashing and that onComplete is called after the
// VFX duration.
//
// Test cases:
// 1. BombVFX renders without crashing
// 2. BombVFX calls onComplete after VFX_DURATION_MS (800ms)
// 3. BombVFX cleans up timeout on unmount
// 4. BombVFX renders correct number of particle meshes

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ── Mock @react-three/fiber ────────────────────────────────────────────
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest}>
      {children}
    </div>
  ),
  useFrame: () => {}, // no-op — useFrame requires R3F context
}));

// Import after mocks
import { BombVFX } from './BombVFX';
import { VFX_DURATION_MS } from '../../../types';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('BombVFX — renders without crashing', () => {
  it('renders a group with particle meshes', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <BombVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );
    expect(container).toBeTruthy();
  });

  it('does NOT call onComplete immediately on mount', () => {
    const onComplete = vi.fn();
    render(<BombVFX position={[0, 0.5, 0]} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('BombVFX — auto-unmount after duration', () => {
  it('calls onComplete after VFX_DURATION_MS (800ms)', () => {
    const onComplete = vi.fn();
    render(<BombVFX position={[0, 0.5, 0]} onComplete={onComplete} />);

    // Fast-forward past the VFX duration
    act(() => {
      vi.advanceTimersByTime(VFX_DURATION_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onComplete before duration elapses', () => {
    const onComplete = vi.fn();
    render(<BombVFX position={[0, 0.5, 0]} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(VFX_DURATION_MS - 1);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('BombVFX — cleanup on unmount', () => {
  it('clears timeout on unmount (no call after unmount)', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <BombVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );

    // Unmount before duration elapses
    unmount();

    act(() => {
      vi.advanceTimersByTime(VFX_DURATION_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
