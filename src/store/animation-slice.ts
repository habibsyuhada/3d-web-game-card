// src/store/animation-slice.ts — Animation queue + VFX state slice
// Uses immer middleware for clean mutation syntax.

import type { StateCreator } from 'zustand';
import type { AnimationAction, SpecialEffect } from '../types';
import type { GameStore } from './index';

/**
 * Animation slice manages the animation queue and VFX state.
 * The hook layer reads this state to drive framer-motion-3d and VFX components.
 * Actions enqueue animation descriptors; the 3D renderer consumes them in order.
 */
export interface AnimationSlice {
  /** Whether any animation is currently playing. */
  isAnimating: boolean;
  /** Ordered queue of animation descriptors to play sequentially. */
  animationQueue: AnimationAction[];
  /** Currently active VFX effect, or null if no VFX is playing. */
  activeVFX: SpecialEffect | null;
  /** 3D world-space position for the active VFX, or null. */
  vfxPosition: [number, number, number] | null;

  /** Appends an animation action to the queue. */
  enqueueAnimation: (action: AnimationAction) => void;
  /** Empties the animation queue and clears animating flag. */
  clearAnimationQueue: () => void;
  /** Sets the isAnimating flag. */
  setAnimating: (value: boolean) => void;
  /**
   * Sets or clears the active VFX effect and optional position.
   * @param effect - The VFX effect to display, or null to clear.
   * @param position - 3D world-space position for the effect.
   */
  setActiveVFX: (
    effect: SpecialEffect | null,
    position?: [number, number, number],
  ) => void;
}

/**
 * Creates the Animation slice for the Zustand store.
 * @param set - Zustand set function (wrapped by immer)
 * @returns Initial state + action implementations
 */
export const createAnimationSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  AnimationSlice
> = (set) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  isAnimating: false,
  animationQueue: [],
  activeVFX: null,
  vfxPosition: null,

  // ── Actions ──────────────────────────────────────────────────────────────

  enqueueAnimation: (action: AnimationAction) =>
    set((draft) => {
      draft.animationQueue.push(action);
    }),

  clearAnimationQueue: () =>
    set((draft) => {
      draft.animationQueue = [];
      draft.isAnimating = false;
    }),

  setAnimating: (value: boolean) =>
    set((draft) => {
      draft.isAnimating = value;
    }),

  setActiveVFX: (
    effect: SpecialEffect | null,
    position?: [number, number, number],
  ) =>
    set((draft) => {
      draft.activeVFX = effect;
      draft.vfxPosition = position ?? null;
    }),
});
