// src/utils/math.ts — Math utility functions

/**
 * Clamps a value between min and max (inclusive).
 * @param value - The value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Linear interpolation between two values.
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0 = a, 1 = b)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Returns a random integer between min and max (inclusive on both ends).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in [min, max]
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
