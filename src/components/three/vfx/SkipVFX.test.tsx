// src/components/three/vfx/SkipVFX.test.tsx — Tests for SkipVFX component (STORY-018)
//
// Tests the dash trail / speed lines effect:
// 1. Renders without crashing
// 2. Calls onComplete after duration (400ms)
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
import { SkipVFX } from './SkipVFX';

/** Skip VFX duration (quick dash). */
const SKIP_DURATION_MS = 400;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SkipVFX — renders without crashing', () => {
  it('renders a group with speed line meshes', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <SkipVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );
    expect(container).toBeTruthy();
  });

  it('does NOT call onComplete immediately on mount', () => {
    const onComplete = vi.fn();
    render(<SkipVFX position={[0, 0.5, 0]} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('SkipVFX — auto-unmount after duration', () => {
  it('calls onComplete after 400ms', () => {
    const onComplete = vi.fn();
    render(<SkipVFX position={[0, 0.5, 0]} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(SKIP_DURATION_MS);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('SkipVFX — cleanup on unmount', () => {
  it('clears timeout on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <SkipVFX position={[0, 0.5, 0]} onComplete={onComplete} />,
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(SKIP_DURATION_MS);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
