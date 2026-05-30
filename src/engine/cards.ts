// src/engine/cards.ts — Card validation and display utilities

import { CardType, SPECIAL_DISPLAY_NAMES } from '../types';
import type { Card } from '../types';

/**
 * Determines whether a card is playable given the current middle pile value.
 * - Special cards are always playable regardless of lastValue.
 * - Number cards are playable if lastValue is null (empty pile) or card.value >= lastValue.
 * @param card - The card to check
 * @param lastValue - Current middle pile value (null if pile is empty/reset)
 * @returns true if the card can be legally played
 */
export function isCardPlayable(card: Card, lastValue: number | null): boolean {
  // Special cards are ALWAYS playable
  if (card.type === CardType.Special) return true;

  // If middle pile is empty, any number card is playable
  if (lastValue === null) return true;

  // Number card must be >= lastValue
  if (card.type === CardType.Number && card.value !== null) {
    return card.value >= lastValue;
  }

  return false;
}

/**
 * Checks if any card in a hand is playable given the current middle pile value.
 * @param hand - Array of cards in the player's hand
 * @param lastValue - Current middle pile value (null if pile is empty/reset)
 * @returns true if at least one card in the hand is playable
 */
export function hasPlayableCard(
  hand: Card[],
  lastValue: number | null
): boolean {
  return hand.some((card) => isCardPlayable(card, lastValue));
}

/**
 * Returns the display string for a card.
 * - Special cards: uses SPECIAL_DISPLAY_NAMES (e.g., "Reverse", "Nuklir")
 * - Number cards: returns the numeric value as a string
 * @param card - The card to get the display value for
 * @returns Display string
 */
export function getCardDisplayValue(card: Card): string {
  if (card.type === CardType.Special && card.effect) {
    return SPECIAL_DISPLAY_NAMES[card.effect];
  }
  return card.value?.toString() ?? '?';
}
