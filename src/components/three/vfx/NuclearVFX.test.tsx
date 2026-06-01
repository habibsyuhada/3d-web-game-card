// src/components/three/vfx/NuclearVFX.test.tsx — Tests for NuclearVFX component (STORY-018)
//
// Tests the expanding radiation ring effect:
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
import { NuclearVFX } from './NuclearVFX';

/** Nuclear VFX duration (slightly longer for drama). */
const NUCLEAR_DURATION_MS = 1000;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NuclearVFX — renders without crashing', () => {
  it('renders a group with ring meshes', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <NuclearVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );
    expect(container).toBeTruthy();
  });

  it('does NOT call onComplete immediately on mount', () => {
    const onComplete = vi.fn();
    render(<NuclearVFX position={[0, 0.5, 0]} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('NuclearVFX — auto-unmount after duration', () => {
  it('calls onComplete after 1000ms', () => {
    const onComplete = vi.fn();
    render(<NuclearVFX position={[0, 0.5, 0]} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(NUCLEAR_DURATION_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('NuclearVFX — cleanup on unmount', () => {
  it('clears timeout on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <NuclearVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(NUCLEAR_DURATION_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
