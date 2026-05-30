// src/engine/deck.ts — Deck creation, shuffling, drawing, and dealing

import {
  CardType,
  SpecialEffect,
  NUMBER_CARD_MIN,
  NUMBER_CARD_MAX,
  NUMBER_COPIES_PER_VALUE,
  SPECIAL_CARD_QUANTITIES,
} from '../types';
import type { Card } from '../types';
import { generateCardId } from '../utils/id';
import { randomInt } from '../utils/math';

/**
 * Creates a full 53-card deck: 39 number cards (values 1–13, 3 copies each)
 * plus 14 special cards (Reverse ×3, Skip ×3, Bomb ×3, Nuclear ×2, Random ×3).
 * @returns Array of 53 Card objects with unique IDs
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  // Number cards: values 1–13, 3 copies each
  for (let value = NUMBER_CARD_MIN; value <= NUMBER_CARD_MAX; value++) {
    for (let copy = 0; copy < NUMBER_COPIES_PER_VALUE; copy++) {
      deck.push({
        id: generateCardId('num', value, copy),
        type: CardType.Number,
        value,
        effect: null,
      });
    }
  }

  // Special cards
  for (const [effect, quantity] of Object.entries(SPECIAL_CARD_QUANTITIES)) {
    for (let copy = 0; copy < quantity; copy++) {
      deck.push({
        id: generateCardId('spc', effect, copy),
        type: CardType.Special,
        value: null,
        effect: effect as SpecialEffect,
      });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using the Fisher-Yates algorithm.
 * Returns a new array — does NOT mutate the input.
 * @param deck - The deck to shuffle
 * @returns A new shuffled array of cards
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draws the top card from the deck.
 * If the deck is empty, returns { card: null, deck: [] } (FR-023).
 * @param deck - The current deck
 * @returns Object with the drawn card (or null) and the remaining deck
 */
export function drawCard(deck: Card[]): { card: Card | null; deck: Card[] } {
  if (deck.length === 0) {
    return { card: null, deck: [] };
  }
  const [card, ...remaining] = deck;
  return { card, deck: remaining };
}

/**
 * Deals cards to players in round-robin fashion.
 * Each player receives cards one at a time in order: player 0, 1, 2, 3, then repeat.
 * @param deck - The shuffled deck to deal from
 * @param playerCount - Number of players
 * @param handSize - Number of cards each player should receive
 * @returns Object with hands array (one per player) and remaining deck
 */
export function dealCards(
  deck: Card[],
  playerCount: number,
  handSize: number
): { hands: Card[][]; deck: Card[] } {
  let remaining = deck;
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);

  for (let cardIdx = 0; cardIdx < handSize; cardIdx++) {
    for (let playerIdx = 0; playerIdx < playerCount; playerIdx++) {
      const result = drawCard(remaining);
      if (result.card) {
        hands[playerIdx].push(result.card);
        remaining = result.deck;
      }
    }
  }

  return { hands, deck: remaining };
}
