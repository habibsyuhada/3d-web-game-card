// src/components/three/vfx/ReverseVFX.test.tsx — Tests for ReverseVFX component (STORY-018)
//
// Tests the spinning arrows effect:
// 1. Renders without crashing
// 2. Calls onComplete after duration (600ms)
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
import { ReverseVFX } from './ReverseVFX';

/** Reverse VFX duration. */
const REVERSE_DURATION_MS = 600;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ReverseVFX — renders without crashing', () => {
  it('renders a group with arrow meshes', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <ReverseVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );
    expect(container).toBeTruthy();
  });

  it('does NOT call onComplete immediately on mount', () => {
    const onComplete = vi.fn();
    render(<ReverseVFX position={[0, 0.5, 0]} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('ReverseVFX — auto-unmount after duration', () => {
  it('calls onComplete after 600ms', () => {
    const onComplete = vi.fn();
    render(<ReverseVFX position={[0, 0.5, 0]} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(REVERSE_DURATION_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('ReverseVFX — cleanup on unmount', () => {
  it('clears timeout on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <ReverseVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(REVERSE_DURATION_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
