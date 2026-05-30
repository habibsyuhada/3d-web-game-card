// src/utils/id.ts — Unique ID generators

/**
 * Generates a unique card ID string.
 * @param prefix - Card type prefix ('num' for number, 'spc' for special)
 * @param value - Card value (number for number cards, effect string for special cards)
 * @param copy - Copy index (0-based)
 * @returns Unique ID string like "num-1-0" or "spc-reverse-1"
 */
export function generateCardId(
  prefix: string,
  value: string | number,
  copy: number
): string {
  return `${prefix}-${value}-${copy}`;
}
