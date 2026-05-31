// src/hooks/useAnimationQueue.ts — Animation queue processing hook (STORY-014)
//
// Manages sequential animation playback:
// 1. Reads animationQueue and isAnimating from store
// 2. Processes the first animation in the queue
// 3. When that animation completes, removes it and processes the next
// 4. When queue is empty, sets isAnimating to false
//
// Returns { currentAnimation, onAnimationComplete } for the rendering layer.
// Use in GameScene to conditionally render animation components.

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import type { AnimationAction } from '../types';

interface AnimationQueueResult {
  /** The animation currently being rendered, or null if idle. */
  currentAnimation: AnimationAction | null;
  /** Callback to fire when the current animation finishes. */
  onAnimationComplete: () => void;
}

/**
 * Custom hook that drives the animation queue processing loop.
 *
 * When animations are enqueued (e.g., card play + card draw), this hook
 * ensures they play sequentially — one at a time. Each animation signals
 * completion via `onAnimationComplete`, which dequeues the finished item
 * and starts the next.
 *
 * The hook sets `isAnimating: true` while the queue is non-empty and
 * `isAnimating: false` when the queue drains.
 *
 * @returns `{ currentAnimation, onAnimationComplete }`
 */
export function useAnimationQueue(): AnimationQueueResult {
  const animationQueue = useGameStore((state) => state.animationQueue);
  const isAnimating = useGameStore((state) => state.isAnimating);
  const setAnimating = useGameStore((state) => state.setAnimating);

  // Track the current animation being processed with local state
  // to avoid re-renders from store mutations during processing
  const [currentAnimation, setCurrentAnimation] = useState<AnimationAction | null>(null);

  // Ref to prevent double-processing on React strict mode / fast re-renders
  const processingRef = useRef(false);

  useEffect(() => {
    // If there's something in the queue and we're not already processing
    if (animationQueue.length > 0 && !processingRef.current) {
      processingRef.current = true;
      const next = animationQueue[0];
      setCurrentAnimation(next);
      if (!isAnimating) {
        setAnimating(true);
      }
    }
  }, [animationQueue, isAnimating, setAnimating]);

  const onAnimationComplete = useCallback(() => {
    // Remove the completed animation from the queue
    const state = useGameStore.getState();
    const remaining = state.animationQueue.slice(1);

    useGameStore.setState((prev) => ({
      ...prev,
      animationQueue: remaining,
    }));

    processingRef.current = false;

    if (remaining.length === 0) {
      // Queue empty — we're done animating
      setCurrentAnimation(null);
      setAnimating(false);
    } else {
      // Process next animation in the queue
      processingRef.current = true;
      setCurrentAnimation(remaining[0]);
    }
  }, [setAnimating]);

  return { currentAnimation, onAnimationComplete };
}
