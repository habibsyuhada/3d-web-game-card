// src/engine/special-cards.test.ts — Tests for special card effects (STORY-005)

import { describe, it, expect } from 'vitest';
import { SpecialEffect, Direction, GameStatus } from '../types';
import type { GameState } from '../types';
import { applySpecialEffect } from './special-cards';

/**
 * Factory for a minimal valid GameState used in effect tests.
 * Only the fields that affect special-card resolution are parameterized.
 */
function createTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Playing,
    winner: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Reverse
// ---------------------------------------------------------------------------
describe('applySpecialEffect — Reverse', () => {
  it('flips Clockwise to CounterClockwise', () => {
    const state = createTestState({ direction: Direction.Clockwise });
    const result = applySpecialEffect(SpecialEffect.Reverse, state);
    expect(result.newDirection).toBe(Direction.CounterClockwise);
  });

  it('flips CounterClockwise to Clockwise', () => {
    const state = createTestState({ direction: Direction.CounterClockwise });
    const result = applySpecialEffect(SpecialEffect.Reverse, state);
    expect(result.newDirection).toBe(Direction.Clockwise);
  });

  it('skipNext is false and newLastValue is unchanged', () => {
    const state = createTestState({ lastValue: 7 });
    const result = applySpecialEffect(SpecialEffect.Reverse, state);
    expect(result.skipNext).toBe(false);
    expect(result.newLastValue).toBe(7);
    expect(result.clearMiddlePile).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Skip
// ---------------------------------------------------------------------------
describe('applySpecialEffect — Skip', () => {
  it('direction unchanged, skipNext is true, newLastValue unchanged', () => {
    const state = createTestState({
      direction: Direction.CounterClockwise,
      lastValue: 10,
    });
    const result = applySpecialEffect(SpecialEffect.Skip, state);
    expect(result.newDirection).toBe(Direction.CounterClockwise);
    expect(result.skipNext).toBe(true);
    expect(result.newLastValue).toBe(10);
    expect(result.clearMiddlePile).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Bomb
// ---------------------------------------------------------------------------
describe('applySpecialEffect — Bomb', () => {
  it('newLastValue is null, clearMiddlePile is false', () => {
    const state = createTestState({ lastValue: 13 });
    const result = applySpecialEffect(SpecialEffect.Bomb, state);
    expect(result.newLastValue).toBeNull();
    expect(result.clearMiddlePile).toBe(false);
  });

  it('direction unchanged, skipNext is false', () => {
    const state = createTestState({ direction: Direction.Clockwise, lastValue: 5 });
    const result = applySpecialEffect(SpecialEffect.Bomb, state);
    expect(result.newDirection).toBe(Direction.Clockwise);
    expect(result.skipNext).toBe(false);
  });

  it('stays null when lastValue is already null', () => {
    const state = createTestState({ lastValue: null });
    const result = applySpecialEffect(SpecialEffect.Bomb, state);
    expect(result.newLastValue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Nuclear
// ---------------------------------------------------------------------------
describe('applySpecialEffect — Nuclear', () => {
  it('newLastValue is null, clearMiddlePile is true', () => {
    const state = createTestState({ lastValue: 8 });
    const result = applySpecialEffect(SpecialEffect.Nuclear, state);
    expect(result.newLastValue).toBeNull();
    expect(result.clearMiddlePile).toBe(true);
  });

  it('direction unchanged, skipNext is false', () => {
    const state = createTestState({ direction: Direction.CounterClockwise });
    const result = applySpecialEffect(SpecialEffect.Nuclear, state);
    expect(result.newDirection).toBe(Direction.CounterClockwise);
    expect(result.skipNext).toBe(false);
  });

  it('stays null when lastValue is already null', () => {
    const state = createTestState({ lastValue: null });
    const result = applySpecialEffect(SpecialEffect.Nuclear, state);
    expect(result.newLastValue).toBeNull();
    expect(result.clearMiddlePile).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Random
// ---------------------------------------------------------------------------
describe('applySpecialEffect — Random', () => {
  it('newLastValue is between 1 and 13 inclusive', () => {
    const state = createTestState();
    const result = applySpecialEffect(SpecialEffect.Random, state);
    expect(result.newLastValue).toBeGreaterThanOrEqual(1);
    expect(result.newLastValue).toBeLessThanOrEqual(13);
  });

  it('randomValue equals newLastValue', () => {
    const state = createTestState();
    const result = applySpecialEffect(SpecialEffect.Random, state);
    expect(result.randomValue).toBe(result.newLastValue);
  });

  it('multiple calls produce varied results (statistical)', () => {
    const state = createTestState();
    const values = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const result = applySpecialEffect(SpecialEffect.Random, state);
      values.add(result.newLastValue!);
    }
    // With 20 rolls over 13 possible values, at least 2 distinct values is virtually certain
    expect(values.size).toBeGreaterThanOrEqual(2);
  });

  it('produces values in valid range consistently (50 rolls)', () => {
    const state = createTestState();
    for (let i = 0; i < 50; i++) {
      const result = applySpecialEffect(SpecialEffect.Random, state);
      expect(result.newLastValue).toBeGreaterThanOrEqual(1);
      expect(result.newLastValue).toBeLessThanOrEqual(13);
      expect(Number.isInteger(result.newLastValue)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Exhaustive switch coverage
// ---------------------------------------------------------------------------
describe('applySpecialEffect — exhaustive enum handling', () => {
  it('handles every SpecialEffect enum value without throwing', () => {
    const state = createTestState();
    const allEffects = Object.values(SpecialEffect);
    for (const effect of allEffects) {
      expect(() => applySpecialEffect(effect, state)).not.toThrow();
    }
    // Ensure we actually tested all 5 effects
    expect(allEffects).toHaveLength(5);
  });
});
