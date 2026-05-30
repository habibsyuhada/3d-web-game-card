// src/engine/deck.test.ts — Tests for deck creation, shuffling, drawing, and dealing

import { describe, it, expect } from 'vitest';
import { CardType, SpecialEffect } from '../types';
import { createDeck, shuffleDeck, drawCard, dealCards } from './deck';

describe('createDeck', () => {
  it('returns exactly 53 cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(53);
  });

  it('contains 39 number cards (3 of each value 1-13)', () => {
    const deck = createDeck();
    const numberCards = deck.filter((c) => c.type === CardType.Number);
    expect(numberCards).toHaveLength(39);

    // Check 3 copies of each value 1-13
    for (let value = 1; value <= 13; value++) {
      const copies = numberCards.filter((c) => c.value === value);
      expect(copies).toHaveLength(3);
    }
  });

  it('contains 14 special cards (Reverse x3, Skip x3, Bomb x3, Nuclear x2, Random x3)', () => {
    const deck = createDeck();
    const specialCards = deck.filter((c) => c.type === CardType.Special);
    expect(specialCards).toHaveLength(14);

    const reverses = specialCards.filter(
      (c) => c.effect === SpecialEffect.Reverse
    );
    expect(reverses).toHaveLength(3);

    const skips = specialCards.filter(
      (c) => c.effect === SpecialEffect.Skip
    );
    expect(skips).toHaveLength(3);

    const bombs = specialCards.filter(
      (c) => c.effect === SpecialEffect.Bomb
    );
    expect(bombs).toHaveLength(3);

    const nuclears = specialCards.filter(
      (c) => c.effect === SpecialEffect.Nuclear
    );
    expect(nuclears).toHaveLength(2);

    const randoms = specialCards.filter(
      (c) => c.effect === SpecialEffect.Random
    );
    expect(randoms).toHaveLength(3);
  });

  it('all 53 cards have unique IDs', () => {
    const deck = createDeck();
    const ids = deck.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(53);
  });
});

describe('shuffleDeck', () => {
  it('returns a new array and does not mutate the input', () => {
    const deck = createDeck();
    const originalFirstId = deck[0].id;
    const originalLastId = deck[deck.length - 1].id;
    const originalLength = deck.length;

    const shuffled = shuffleDeck(deck);

    // Original deck is unchanged
    expect(deck).toHaveLength(originalLength);
    expect(deck[0].id).toBe(originalFirstId);
    expect(deck[deck.length - 1].id).toBe(originalLastId);

    // Shuffled is a different array with same length
    expect(shuffled).not.toBe(deck);
    expect(shuffled).toHaveLength(53);

    // Same cards, just reordered
    const originalIds = new Set(deck.map((c) => c.id));
    const shuffledIds = shuffled.map((c) => c.id);
    expect(shuffledIds.every((id) => originalIds.has(id))).toBe(true);
  });

  it('produces different orders on repeated calls (statistical test)', () => {
    const deck = createDeck();
    const orders: string[] = [];

    for (let i = 0; i < 10; i++) {
      const shuffled = shuffleDeck(deck);
      orders.push(shuffled.map((c) => c.id).join(','));
    }

    const uniqueOrders = new Set(orders);
    // With 53 cards, the probability of getting the same order twice is astronomically low
    expect(uniqueOrders.size).toBeGreaterThanOrEqual(2);
  });
});

describe('drawCard', () => {
  it('from a full deck returns 1 card and 52 remaining', () => {
    const deck = createDeck();
    const result = drawCard(deck);

    expect(result.card).not.toBeNull();
    expect(result.card!.type).toBeDefined();
    expect(result.deck).toHaveLength(52);
  });

  it('from an empty deck returns { card: null, deck: [] }', () => {
    const result = drawCard([]);

    expect(result.card).toBeNull();
    expect(result.deck).toEqual([]);
    expect(result.deck).toHaveLength(0);
  });
});

describe('dealCards', () => {
  it('distributes 3 cards to each of 4 players (12 dealt, 41 remaining)', () => {
    const deck = createDeck();
    const result = dealCards(deck, 4, 3);

    // 4 players, each with 3 cards
    expect(result.hands).toHaveLength(4);
    for (let i = 0; i < 4; i++) {
      expect(result.hands[i]).toHaveLength(3);
    }

    // 53 - 12 = 41 remaining
    expect(result.deck).toHaveLength(41);

    // All dealt cards are unique
    const allDealtCards = result.hands.flat();
    const dealtIds = allDealtCards.map((c) => c.id);
    const uniqueDealtIds = new Set(dealtIds);
    expect(uniqueDealtIds.size).toBe(12);

    // Remaining deck has no overlap with dealt cards
    const remainingIds = new Set(result.deck.map((c) => c.id));
    for (const id of dealtIds) {
      expect(remainingIds.has(id)).toBe(false);
    }
  });
});
