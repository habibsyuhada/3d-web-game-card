// src/components/three/vfx/EliminationVFX.test.tsx — Tests for EliminationVFX (STORY-018)
//
// Tests the fade-to-gray + scale-down player elimination effect:
// 1. Renders without crashing
// 2. Calls onComplete after duration (1000ms)
// 3. Cleans up timeout on unmount

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ── Mock @react-three/fiber ────────────────────────────────────────────
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest}>
      {children}
    </div>
  ),
  useFrame: () => {}, // no-op
}));

// Import after mocks
import { EliminationVFX } from './EliminationVFX';

/** Elimination VFX duration. */
const ELIMINATION_DURATION_MS = 1000;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('EliminationVFX — renders without crashing', () => {
  it('renders a group with fragment meshes at the player position', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <EliminationVFX position={[3, 0, 0]} onComplete={onComplete} />,
    );
    expect(container).toBeTruthy();
  });

  it('does NOT call onComplete immediately on mount', () => {
    const onComplete = vi.fn();
    render(
      <EliminationVFX position={[3, 0, 0]} onComplete={onComplete} />,
    );
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('EliminationVFX — auto-unmount after duration', () => {
  it('calls onComplete after 1000ms', () => {
    const onComplete = vi.fn();
    render(
      <EliminationVFX position={[3, 0, 0]} onComplete={onComplete} />,
    );

    act(() => {
      vi.advanceTimersByTime(ELIMINATION_DURATION_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('EliminationVFX — cleanup on unmount', () => {
  it('clears timeout on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <EliminationVFX position={[3, 0, 0]} onComplete={onComplete} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(ELIMINATION_DURATION_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
