// src/engine/bot-ai.ts — Bot AI decision tree for automated card play

import { CardType } from '../types';
import type { Card, BotDecision } from '../types';
import { isCardPlayable } from './cards';

/**
 * Determines the bot's next action based on a deterministic priority decision tree.
 *
 * Decision priority (in order):
 *   1. Empty hand → pass
 *   2. Empty pile (lastValue === null) → play smallest card overall (number first, special last)
 *   3. Has valid number cards (value >= lastValue) → play smallest valid number card
 *   4. No valid number cards but has special cards → play first available special card
 *   5. No playable cards at all → pass
 *
 * @param hand - The bot's current hand of cards
 * @param lastValue - Current middle pile value (null if pile is empty/reset)
 * @returns BotDecision with action, optional cardId, and human-readable reason
 */
export function decideBotPlay(
  hand: Card[],
  lastValue: number | null
): BotDecision {
  // 1. Empty hand
  if (hand.length === 0) {
    return { action: 'pass', reason: 'No cards in hand' };
  }

  // 2. Empty pile — play the smallest card overall
  //    Number cards sort by value; special cards treated as value 14 (come last)
  if (lastValue === null) {
    const sorted = [...hand].sort(
      (a, b) => (a.value ?? 14) - (b.value ?? 14)
    );
    const smallest = sorted[0];
    return {
      action: 'play',
      cardId: smallest.id,
      reason: 'Play smallest card (empty pile)',
    };
  }

  // 3. Has valid number cards with value >= lastValue → play smallest such card
  const validNumberCards = hand.filter(
    (card) =>
      card.type === CardType.Number &&
      card.value !== null &&
      isCardPlayable(card, lastValue)
  );

  if (validNumberCards.length > 0) {
    const smallestValid = validNumberCards.reduce((min, card) =>
      card.value! < min.value! ? card : min
    );
    return {
      action: 'play',
      cardId: smallestValid.id,
      reason: `Play smallest valid number card (value=${smallestValid.value}, pile=${lastValue})`,
    };
  }

  // 4. No valid number cards but has special cards → play first special card
  const specialCard = hand.find((card) => card.type === CardType.Special);
  if (specialCard) {
    return {
      action: 'play',
      cardId: specialCard.id,
      reason: `Play special card (no valid numbers, pile=${lastValue})`,
    };
  }

  // 5. No playable cards at all → pass
  return {
    action: 'pass',
    reason: `No playable cards (pile=${lastValue})`,
  };
}
