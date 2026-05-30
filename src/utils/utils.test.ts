// src/utils/utils.test.ts — Tests for utility functions

import { describe, it, expect } from 'vitest';
import { randomInt, clamp, lerp } from './math';
import { delay } from './delay';
import { generateCardId } from './id';

describe('randomInt', () => {
  it('returns values within the [min, max] range (inclusive)', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomInt(1, 5);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});

describe('clamp', () => {
  it('clamps value above max to max', () => {
    expect(clamp(5, 1, 3)).toBe(3);
  });

  it('clamps value below min to min', () => {
    expect(clamp(-5, 1, 3)).toBe(1);
  });

  it('returns value unchanged when within range', () => {
    expect(clamp(2, 1, 3)).toBe(2);
  });
});

describe('lerp', () => {
  it('interpolates between two values', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(2, 8, 0.25)).toBeCloseTo(3.5);
  });
});

describe('delay', () => {
  it('resolves after the specified time', async () => {
    const start = Date.now();
    await delay(10);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(5);
  }, 1000);
});

describe('generateCardId', () => {
  it('returns expected format for number cards', () => {
    expect(generateCardId('num', 1, 0)).toBe('num-1-0');
    expect(generateCardId('num', 13, 2)).toBe('num-13-2');
  });

  it('returns expected format for special cards', () => {
    expect(generateCardId('spc', 'reverse', 0)).toBe('spc-reverse-0');
    expect(generateCardId('spc', 'nuclear', 1)).toBe('spc-nuclear-1');
  });
});
