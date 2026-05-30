// src/engine/special-cards.ts — Special card effect handlers (STORY-005)

import { SpecialEffect, Direction } from '../types';
import type { GameState } from '../types';
import { randomInt } from '../utils/math';

/**
 * Result of applying a special card effect.
 * The store action reads this result and maps it to state mutations.
 */
export interface SpecialEffectResult {
  /** New value for the middle pile (null = reset). */
  newLastValue: number | null;
  /** Direction after this effect is applied. */
  newDirection: Direction;
  /** Whether the next active player should be skipped. */
  skipNext: boolean;
  /** True only for Nuclear — signals the store to clear the middlePile array. */
  clearMiddlePile: boolean;
  /** Set only for Random — the generated value for VFX display. */
  randomValue?: number;
}

/**
 * Pure function that resolves the effect of a special card.
 * Does NOT mutate state — returns a result object for the caller to apply.
 *
 * @param effect - The special effect to apply
 * @param state  - Current game state (read-only reference)
 * @returns SpecialEffectResult describing what state changes to make
 */
export function applySpecialEffect(
  effect: SpecialEffect,
  state: GameState,
): SpecialEffectResult {
  switch (effect) {
    case SpecialEffect.Reverse:
      return {
        newLastValue: state.lastValue,
        newDirection:
          state.direction === Direction.Clockwise
            ? Direction.CounterClockwise
            : Direction.Clockwise,
        skipNext: false,
        clearMiddlePile: false,
      };

    case SpecialEffect.Skip:
      return {
        newLastValue: state.lastValue,
        newDirection: state.direction,
        skipNext: true,
        clearMiddlePile: false,
      };

    case SpecialEffect.Bomb:
      return {
        newLastValue: null,
        newDirection: state.direction,
        skipNext: false,
        clearMiddlePile: false,
      };

    case SpecialEffect.Nuclear:
      return {
        newLastValue: null,
        newDirection: state.direction,
        skipNext: false,
        clearMiddlePile: true,
      };

    case SpecialEffect.Random: {
      const value = randomInt(1, 13);
      return {
        newLastValue: value,
        newDirection: state.direction,
        skipNext: false,
        clearMiddlePile: false,
        randomValue: value,
      };
    }
  }
}
