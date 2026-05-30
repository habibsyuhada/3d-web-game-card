// src/utils/delay.ts — Promise-based delay utility

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 * @param ms - Delay duration in milliseconds
 * @returns Promise that resolves after ms milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
