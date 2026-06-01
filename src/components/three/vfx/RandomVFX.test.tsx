// src/components/three/vfx/RandomVFX.test.tsx — Tests for RandomVFX component (STORY-018)
//
// Tests the number scramble / dice-shuffle effect:
// 1. Renders without crashing
// 2. Cycles through numbers before settling on finalValue
// 3. Calls onComplete after duration (800ms)
// 4. Cleans up timeout on unmount

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';

// ── Mock @react-three/fiber ────────────────────────────────────────────
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest}>
      {children}
    </div>
  ),
  useFrame: () => {}, // no-op
}));

// ── Mock @react-three/drei ─────────────────────────────────────────────
vi.mock('@react-three/drei', () => ({
  Text: ({
    children,
    ...rest
  }: {
    children?: React.ReactNode;
  } & Record<string, unknown>) => (
    <span data-testid="vfx-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks
import { RandomVFX } from './RandomVFX';

/** Total Random VFX duration. */
const RANDOM_DURATION_MS = 800;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RandomVFX — renders without crashing', () => {
  it('renders a group with Text', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={7} onComplete={onComplete} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders text (initial scrambled number)', () => {
    const onComplete = vi.fn();
    render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={7} onComplete={onComplete} />,
    );
    expect(screen.getByTestId('vfx-text')).toBeInTheDocument();
  });

  it('does NOT call onComplete immediately on mount', () => {
    const onComplete = vi.fn();
    render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={7} onComplete={onComplete} />,
    );
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('RandomVFX — number scramble', () => {
  it('changes displayed number during scramble phase', () => {
    const onComplete = vi.fn();
    render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={10} onComplete={onComplete} />,
    );

    const textEl = screen.getByTestId('vfx-text');
    const values = new Set<string>();

    // Collect several samples at different times during scramble
    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(50);
      });
      values.add(textEl.textContent || '');
    }

    // Should have shown at least 2 different values (scrambling)
    expect(values.size).toBeGreaterThan(1);
  });

  it('settles on finalValue after scramble phase (600ms)', () => {
    const onComplete = vi.fn();
    render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={10} onComplete={onComplete} />,
    );

    // Advance past the scramble phase
    act(() => {
      vi.advanceTimersByTime(650);
    });

    const textEl = screen.getByTestId('vfx-text');
    expect(textEl.textContent).toBe('10');
  });
});

describe('RandomVFX — auto-unmount after duration', () => {
  it('calls onComplete after 800ms', () => {
    const onComplete = vi.fn();
    render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={7} onComplete={onComplete} />,
    );

    act(() => {
      vi.advanceTimersByTime(RANDOM_DURATION_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('RandomVFX — cleanup on unmount', () => {
  it('clears timeout and interval on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <RandomVFX position={[0, 0.5, 0]} finalValue={7} onComplete={onComplete} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(RANDOM_DURATION_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
