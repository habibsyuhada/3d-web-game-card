// src/hooks/useAnimationQueue.test.ts — Tests for animation queue hook (STORY-014)
//
// Test cases:
// 1. Returns null currentAnimation when queue is empty
// 2. Picks up the first animation from the queue when enqueued
// 3. Sets isAnimating to true when queue has items
// 4. Advances to next animation when onAnimationComplete fires
// 5. Sets isAnimating to false when queue is drained
// 6. Processes multiple animations sequentially
// 7. Handles rapid enqueue (multiple items queued before processing)

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../store';
import { useAnimationQueue } from './useAnimationQueue';
import { GameStatus, Direction, CARD_ANIMATION_DURATION_MS } from '../types';
import type { AnimationAction } from '../types';

// ── Store reset helper ───────────────────────────────────────────────────

function resetStore() {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Playing,
    winner: null,
    isAnimating: false,
    animationQueue: [],
    activeVFX: null,
    vfxPosition: null,
    turnMessage: '',
    showTitleScreen: false,
    showMessage: '',
    messageQueue: [],
    showGameOver: false,
    isFullscreen: false,
  });
}

// ── Factory helpers ─────────────────────────────────────────────────────

function makePlayAnimation(
  cardId: string,
  playerIndex = 0,
): AnimationAction {
  return {
    type: 'card-play',
    payload: {
      cardId,
      playerIndex,
      fromPosition: [0, 0, 3.5],
      toPosition: [0, 0.1, 0],
    },
    duration: CARD_ANIMATION_DURATION_MS,
  };
}

function makeDrawAnimation(
  cardId: string,
  playerIndex = 0,
): AnimationAction {
  return {
    type: 'card-draw',
    payload: {
      cardId,
      playerIndex,
      fromPosition: [1.5, 0.3, 0],
      toPosition: [0, 0, 3.5],
    },
    duration: 300,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────

beforeEach(() => {
  resetStore();
});

describe('useAnimationQueue — empty queue', () => {
  it('returns null currentAnimation when queue is empty', () => {
    const { result } = renderHook(() => useAnimationQueue());
    expect(result.current.currentAnimation).toBeNull();
  });

  it('isAnimating is false when queue is empty initially', () => {
    renderHook(() => useAnimationQueue());
    expect(useGameStore.getState().isAnimating).toBe(false);
  });
});

describe('useAnimationQueue — single animation processing', () => {
  it('picks up the first animation from the queue when enqueued', () => {
    const { result } = renderHook(() => useAnimationQueue());

    // Initially null
    expect(result.current.currentAnimation).toBeNull();

    // Enqueue an animation via the store action
    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('c1'));
    });

    // After enqueue, the hook should pick it up
    expect(result.current.currentAnimation).not.toBeNull();
    expect(result.current.currentAnimation?.payload.cardId).toBe('c1');
    expect(result.current.currentAnimation?.type).toBe('card-play');
  });

  it('sets isAnimating to true when processing an animation', () => {
    renderHook(() => useAnimationQueue());

    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('c2'));
    });

    expect(useGameStore.getState().isAnimating).toBe(true);
  });

  it('removes animation from queue when onAnimationComplete fires', () => {
    const { result } = renderHook(() => useAnimationQueue());

    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('c3'));
    });

    // Queue should have 1 item
    expect(useGameStore.getState().animationQueue.length).toBe(1);

    // Complete the animation
    act(() => {
      result.current.onAnimationComplete();
    });

    // Queue should be empty
    expect(useGameStore.getState().animationQueue.length).toBe(0);
    expect(result.current.currentAnimation).toBeNull();
  });

  it('sets isAnimating to false when queue is drained', () => {
    const { result } = renderHook(() => useAnimationQueue());

    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('c4'));
    });

    expect(useGameStore.getState().isAnimating).toBe(true);

    act(() => {
      result.current.onAnimationComplete();
    });

    expect(useGameStore.getState().isAnimating).toBe(false);
  });
});

describe('useAnimationQueue — sequential animation processing', () => {
  it('processes two animations in order: play then draw', async () => {
    const { result } = renderHook(() => useAnimationQueue());

    // Enqueue play animation then draw animation
    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('c5', 0));
      useGameStore.getState().enqueueAnimation(makeDrawAnimation('c6', 0));
    });

    // Queue has 2 items; first should be card-play
    expect(useGameStore.getState().animationQueue.length).toBe(2);
    expect(result.current.currentAnimation?.type).toBe('card-play');
    expect(result.current.currentAnimation?.payload.cardId).toBe('c5');

    // Complete the first animation
    act(() => {
      result.current.onAnimationComplete();
    });

    // Now the draw animation should be active
    expect(useGameStore.getState().animationQueue.length).toBe(1);
    expect(result.current.currentAnimation?.type).toBe('card-draw');
    expect(result.current.currentAnimation?.payload.cardId).toBe('c6');
    expect(useGameStore.getState().isAnimating).toBe(true);

    // Complete the second animation
    act(() => {
      result.current.onAnimationComplete();
    });

    // Queue empty, no current animation, isAnimating false
    expect(useGameStore.getState().animationQueue.length).toBe(0);
    expect(result.current.currentAnimation).toBeNull();
    expect(useGameStore.getState().isAnimating).toBe(false);
  });

  it('handles three sequential animations correctly', () => {
    const { result } = renderHook(() => useAnimationQueue());

    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('a1'));
      useGameStore.getState().enqueueAnimation(makePlayAnimation('a2'));
      useGameStore.getState().enqueueAnimation(makePlayAnimation('a3'));
    });

    // First animation active
    expect(result.current.currentAnimation?.payload.cardId).toBe('a1');

    act(() => {
      result.current.onAnimationComplete();
    });

    // Second animation active
    expect(result.current.currentAnimation?.payload.cardId).toBe('a2');

    act(() => {
      result.current.onAnimationComplete();
    });

    // Third animation active
    expect(result.current.currentAnimation?.payload.cardId).toBe('a3');

    act(() => {
      result.current.onAnimationComplete();
    });

    // All done
    expect(result.current.currentAnimation).toBeNull();
    expect(useGameStore.getState().isAnimating).toBe(false);
  });
});

describe('useAnimationQueue — edge cases', () => {
  it('onAnimationComplete is idempotent when queue is empty (defensive)', () => {
    const { result } = renderHook(() => useAnimationQueue());

    // Calling complete with no animation shouldn't crash
    expect(() => {
      act(() => {
        result.current.onAnimationComplete();
      });
    }).not.toThrow();

    expect(result.current.currentAnimation).toBeNull();
    expect(useGameStore.getState().isAnimating).toBe(false);
  });

  it('clearing animation queue mid-processing resets state', () => {
    const { result } = renderHook(() => useAnimationQueue());

    act(() => {
      useGameStore.getState().enqueueAnimation(makePlayAnimation('c7'));
      useGameStore.getState().enqueueAnimation(makeDrawAnimation('c8'));
    });

    expect(result.current.currentAnimation).not.toBeNull();

    // Clear the queue (e.g., on game reset)
    act(() => {
      useGameStore.getState().clearAnimationQueue();
    });

    expect(useGameStore.getState().animationQueue.length).toBe(0);
    expect(useGameStore.getState().isAnimating).toBe(false);
  });
});
