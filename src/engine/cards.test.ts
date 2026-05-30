// src/engine/cards.test.ts — Tests for card validation and display utilities

import { describe, it, expect } from 'vitest';
import {
  CardType,
  SpecialEffect,
  SPECIAL_DISPLAY_NAMES,
} from '../types';
import type { Card } from '../types';
import { isCardPlayable, hasPlayableCard, getCardDisplayValue } from './cards';

// Helper to create a number card for testing
function makeNumberCard(value: number, copy: number = 0): Card {
  return {
    id: `num-${value}-${copy}`,
    type: CardType.Number,
    value,
    effect: null,
  };
}

// Helper to create a special card for testing
function makeSpecialCard(effect: SpecialEffect, copy: number = 0): Card {
  return {
    id: `spc-${effect}-${copy}`,
    type: CardType.Special,
    value: null,
    effect,
  };
}

describe('isCardPlayable', () => {
  it('special card is always playable regardless of lastValue', () => {
    const specialCard = makeSpecialCard(SpecialEffect.Bomb);

    expect(isCardPlayable(specialCard, 1)).toBe(true);
    expect(isCardPlayable(specialCard, 13)).toBe(true);
    expect(isCardPlayable(specialCard, null)).toBe(true);
    expect(isCardPlayable(specialCard, 0)).toBe(true);
  });

  it('number card is playable when lastValue is null (empty pile)', () => {
    const numberCard = makeNumberCard(1);
    expect(isCardPlayable(numberCard, null)).toBe(true);

    const highCard = makeNumberCard(13);
    expect(isCardPlayable(highCard, null)).toBe(true);
  });

  it('number card >= lastValue is playable', () => {
    const card5 = makeNumberCard(5);
    expect(isCardPlayable(card5, 5)).toBe(true);

    const card10 = makeNumberCard(10);
    expect(isCardPlayable(card10, 5)).toBe(true);

    const card13 = makeNumberCard(13);
    expect(isCardPlayable(card13, 13)).toBe(true);
  });

  it('number card < lastValue is NOT playable', () => {
    const card3 = makeNumberCard(3);
    expect(isCardPlayable(card3, 5)).toBe(false);

    const card1 = makeNumberCard(1);
    expect(isCardPlayable(card1, 13)).toBe(false);

    const card12 = makeNumberCard(12);
    expect(isCardPlayable(card12, 13)).toBe(false);
  });
});

describe('hasPlayableCard', () => {
  it('returns true if at least one card in hand is playable', () => {
    const hand: Card[] = [
      makeNumberCard(3),
      makeNumberCard(7),
      makeNumberCard(10),
    ];

    // lastValue = 5: cards 7 and 10 are playable
    expect(hasPlayableCard(hand, 5)).toBe(true);

    // lastValue = 13: no number cards are playable
    expect(hasPlayableCard(hand, 13)).toBe(false);
  });

  it('returns true if hand has a special card even when no number cards are playable', () => {
    const hand: Card[] = [
      makeNumberCard(1),
      makeNumberCard(2),
      makeSpecialCard(SpecialEffect.Reverse),
    ];

    // lastValue = 13: number cards not playable, but Reverse is always playable
    expect(hasPlayableCard(hand, 13)).toBe(true);
  });

  it('returns false for an empty hand', () => {
    expect(hasPlayableCard([], null)).toBe(false);
    expect(hasPlayableCard([], 5)).toBe(false);
  });
});

describe('getCardDisplayValue', () => {
  it('returns SPECIAL_DISPLAY_NAMES[effect] for special cards', () => {
    const reverse = makeSpecialCard(SpecialEffect.Reverse);
    expect(getCardDisplayValue(reverse)).toBe(
      SPECIAL_DISPLAY_NAMES[SpecialEffect.Reverse]
    );

    const skip = makeSpecialCard(SpecialEffect.Skip);
    expect(getCardDisplayValue(skip)).toBe(
      SPECIAL_DISPLAY_NAMES[SpecialEffect.Skip]
    );

    const bomb = makeSpecialCard(SpecialEffect.Bomb);
    expect(getCardDisplayValue(bomb)).toBe(
      SPECIAL_DISPLAY_NAMES[SpecialEffect.Bomb]
    );

    const nuclear = makeSpecialCard(SpecialEffect.Nuclear);
    expect(getCardDisplayValue(nuclear)).toBe(
      SPECIAL_DISPLAY_NAMES[SpecialEffect.Nuclear]
    );

    const random = makeSpecialCard(SpecialEffect.Random);
    expect(getCardDisplayValue(random)).toBe(
      SPECIAL_DISPLAY_NAMES[SpecialEffect.Random]
    );
  });

  it('returns value as string for number cards', () => {
    const card1 = makeNumberCard(1);
    expect(getCardDisplayValue(card1)).toBe('1');

    const card13 = makeNumberCard(13);
    expect(getCardDisplayValue(card13)).toBe('13');

    const card7 = makeNumberCard(7);
    expect(getCardDisplayValue(card7)).toBe('7');
  });
});
