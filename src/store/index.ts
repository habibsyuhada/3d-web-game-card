// src/store/index.ts — Zustand store definition (useGameStore hook)
// Combines GameSlice, UISlice, and AnimationSlice into a single store
// using immer middleware for clean mutable-style updates.

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createGameSlice } from './game-slice';
import type { GameSlice } from './game-slice';
import { createUISlice } from './ui-slice';
import type { UISlice } from './ui-slice';
import { createAnimationSlice } from './animation-slice';
import type { AnimationSlice } from './animation-slice';

/**
 * The combined store type — intersection of all three slices.
 * Used as the generic type parameter for `create<GameStore>()`.
 */
export type GameStore = GameSlice & UISlice & AnimationSlice;

/**
 * Single Zustand store hook for the entire game.
 * Uses immer middleware so actions can mutate draft state directly.
 *
 * Usage:
 * ```tsx
 * const players = useGameStore((s) => s.players);
 * const initGame = useGameStore((s) => s.initGame);
 * const { currentPlayerIndex, direction } = useGameStore(
 *   (s) => ({ currentPlayerIndex: s.currentPlayerIndex, direction: s.direction })
 * );
 * ```
 */
export const useGameStore = create<GameStore>()(
  immer((...a) => ({
    ...createGameSlice(...a),
    ...createUISlice(...a),
    ...createAnimationSlice(...a),
  })),
);

// Re-export slice interfaces for external use (typing selectors, etc.)
export type { GameSlice } from './game-slice';
export type { UISlice } from './ui-slice';
export type { AnimationSlice } from './animation-slice';
