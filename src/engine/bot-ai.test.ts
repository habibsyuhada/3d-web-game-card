// src/engine/bot-ai.test.ts — Tests for bot AI decision tree

import { describe, it, expect } from 'vitest';
import { CardType, SpecialEffect } from '../types';
import type { Card, SpecialEffect as SpecialEffectType, BotDecision } from '../types';
import { decideBotPlay } from './bot-ai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNumberCard(id: string, value: number): Card {
  return { id, type: CardType.Number, value, effect: null };
}

function makeSpecialCard(id: string, effect: SpecialEffectType): Card {
  return { id, type: CardType.Special, value: null, effect };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('decideBotPlay', () => {
  // -------------------------------------------------------------------------
  // 1. Empty pile + hand [3, 7, Reverse]: plays value 3 (smallest card)
  // -------------------------------------------------------------------------
  it('empty pile: plays the smallest card overall (value 3 over 7 and Reverse)', () => {
    const hand: Card[] = [
      makeNumberCard('c3', 3),
      makeNumberCard('c7', 7),
      makeSpecialCard('cRev', SpecialEffect.Reverse),
    ];

    const result = decideBotPlay(hand, null);

    expect(result.action).toBe('play');
    expect(result.cardId).toBe('c3');
    expect(result.reason).toContain('smallest card');
  });

  // -------------------------------------------------------------------------
  // 2. Empty pile + hand [Reverse, Skip, Bomb]: plays a special card
  // -------------------------------------------------------------------------
  it('empty pile with only special cards: plays a special card', () => {
    const hand: Card[] = [
      makeSpecialCard('cRev', SpecialEffect.Reverse),
      makeSpecialCard('cSkp', SpecialEffect.Skip),
      makeSpecialCard('cBmb', SpecialEffect.Bomb),
    ];

    const result = decideBotPlay(hand, null);

    expect(result.action).toBe('play');
    // All specials sort to value 14, so any one is acceptable
    expect(result.cardId).toBeDefined();
    expect(['cRev', 'cSkp', 'cBmb']).toContain(result.cardId);
    expect(result.reason).toContain('smallest card');
  });

  // -------------------------------------------------------------------------
  // 3. Empty pile + hand [5, 2, 9]: plays value 2 (smallest number)
  // -------------------------------------------------------------------------
  it('empty pile with number cards: plays value 2 (minimum)', () => {
    const hand: Card[] = [
      makeNumberCard('c5', 5),
      makeNumberCard('c2', 2),
      makeNumberCard('c9', 9),
    ];

    const result = decideBotPlay(hand, null);

    expect(result.action).toBe('play');
    expect(result.cardId).toBe('c2');
    expect(result.reason).toContain('empty pile');
  });

  // -------------------------------------------------------------------------
  // 4. Pile=8 + hand [3, 10, 12]: plays value 10 (smallest >= 8)
  // -------------------------------------------------------------------------
  it('pile=8: plays the smallest number card >= lastValue (value 10)', () => {
    const hand: Card[] = [
      makeNumberCard('c3', 3),
      makeNumberCard('c10', 10),
      makeNumberCard('c12', 12),
    ];

    const result = decideBotPlay(hand, 8);

    expect(result.action).toBe('play');
    expect(result.cardId).toBe('c10');
    expect(result.reason).toContain('smallest valid number card');
    expect(result.reason).toContain('value=10');
    expect(result.reason).toContain('pile=8');
  });

  // -------------------------------------------------------------------------
  // 5. Pile=8 + hand [3, 5, 7, Bomb]: no valid number cards, plays special
  // -------------------------------------------------------------------------
  it('pile=8 with no valid numbers but has special: plays special card (Bomb)', () => {
    const hand: Card[] = [
      makeNumberCard('c3', 3),
      makeNumberCard('c5', 5),
      makeNumberCard('c7', 7),
      makeSpecialCard('cBmb', SpecialEffect.Bomb),
    ];

    const result = decideBotPlay(hand, 8);

    expect(result.action).toBe('play');
    expect(result.cardId).toBe('cBmb');
    expect(result.reason).toContain('special card');
    expect(result.reason).toContain('pile=8');
  });

  // -------------------------------------------------------------------------
  // 6. Pile=8 + hand [3, 5, 7, Reverse]: plays Reverse
  // -------------------------------------------------------------------------
  it('pile=8 with no valid numbers: plays Reverse when available', () => {
    const hand: Card[] = [
      makeNumberCard('c3', 3),
      makeNumberCard('c5', 5),
      makeNumberCard('c7', 7),
      makeSpecialCard('cRev', SpecialEffect.Reverse),
    ];

    const result = decideBotPlay(hand, 8);

    expect(result.action).toBe('play');
    expect(result.cardId).toBe('cRev');
    expect(result.reason).toContain('special card');
  });

  // -------------------------------------------------------------------------
  // 7. Pile=8 + hand [3, 5, 7]: no valid cards at all → pass
  // -------------------------------------------------------------------------
  it('pile=8 with only low number cards and no specials: passes', () => {
    const hand: Card[] = [
      makeNumberCard('c3', 3),
      makeNumberCard('c5', 5),
      makeNumberCard('c7', 7),
    ];

    const result = decideBotPlay(hand, 8);

    expect(result.action).toBe('pass');
    expect(result.cardId).toBeUndefined();
    expect(result.reason).toContain('No playable cards');
    expect(result.reason).toContain('pile=8');
  });

  // -------------------------------------------------------------------------
  // 8. Empty hand: passes
  // -------------------------------------------------------------------------
  it('empty hand: returns pass with "No cards in hand"', () => {
    const result = decideBotPlay([], 5);

    expect(result.action).toBe('pass');
    expect(result.cardId).toBeUndefined();
    expect(result.reason).toBe('No cards in hand');
  });

  // -------------------------------------------------------------------------
  // 9. Pile=13 + hand [13]: plays value 13 (exact match)
  // -------------------------------------------------------------------------
  it('pile=13 with exact match: plays value 13', () => {
    const hand: Card[] = [makeNumberCard('c13', 13)];

    const result = decideBotPlay(hand, 13);

    expect(result.action).toBe('play');
    expect(result.cardId).toBe('c13');
    expect(result.reason).toContain('smallest valid number card');
    expect(result.reason).toContain('value=13');
    expect(result.reason).toContain('pile=13');
  });

  // -------------------------------------------------------------------------
  // 10. Multiple special cards: plays first special card found in hand order
  // -------------------------------------------------------------------------
  it('multiple special cards: plays the first special card in hand order', () => {
    const hand: Card[] = [
      makeNumberCard('c1', 1),  // number card, not playable if pile is high
      makeSpecialCard('cSkip', SpecialEffect.Skip),
      makeSpecialCard('cNuke', SpecialEffect.Nuclear),
      makeSpecialCard('cRand', SpecialEffect.Random),
    ];

    // Pile=13 means c1 (value=1) is not playable, so we fall through to specials
    const result = decideBotPlay(hand, 13);

    expect(result.action).toBe('play');
    // .find returns the first match → cSkip
    expect(result.cardId).toBe('cSkip');
    expect(result.reason).toContain('special card');
  });

  // -------------------------------------------------------------------------
  // 11. All decision branches produce correct BotDecision objects
  // -------------------------------------------------------------------------
  it('all decision branches return well-formed BotDecision objects', () => {
    // Branch 1: empty hand → pass, no cardId
    const emptyHand: BotDecision = decideBotPlay([], null);
    expect(emptyHand).toEqual(
      expect.objectContaining({ action: 'pass', reason: expect.any(String) })
    );
    expect(emptyHand.cardId).toBeUndefined();

    // Branch 2: empty pile → play with cardId set
    const emptyPile: BotDecision = decideBotPlay(
      [makeNumberCard('x1', 5)],
      null
    );
    expect(emptyPile.action).toBe('play');
    expect(emptyPile.cardId).toBe('x1');
    expect(emptyPile.reason).toBeDefined();

    // Branch 3: has valid number card → play with cardId set
    const validNum: BotDecision = decideBotPlay(
      [makeNumberCard('x2', 10)],
      7
    );
    expect(validNum.action).toBe('play');
    expect(validNum.cardId).toBe('x2');
    expect(validNum.reason).toBeDefined();

    // Branch 4: no valid numbers, has special → play with cardId set
    const specialFallback: BotDecision = decideBotPlay(
      [makeNumberCard('x3', 2), makeSpecialCard('xSpc', SpecialEffect.Reverse)],
      8
    );
    expect(specialFallback.action).toBe('play');
    expect(specialFallback.cardId).toBe('xSpc');
    expect(specialFallback.reason).toBeDefined();

    // Branch 5: no playable cards → pass, no cardId
    const noPlayable: BotDecision = decideBotPlay(
      [makeNumberCard('x4', 1)],
      13
    );
    expect(noPlayable.action).toBe('pass');
    expect(noPlayable.cardId).toBeUndefined();
    expect(noPlayable.reason).toBeDefined();
  });
});
