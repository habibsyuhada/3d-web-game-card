// src/types/types.test.ts — Tests for type definitions and constants

import { describe, it, expect } from 'vitest';
import {
  // Enums
  CardType,
  SpecialEffect,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,

  // Constants
  TOTAL_PLAYERS,
  INITIAL_LIVES,
  HAND_SIZE,
  NUMBER_CARD_MIN,
  NUMBER_CARD_MAX,
  NUMBER_COPIES_PER_VALUE,
  SPECIAL_CARD_QUANTITIES,
  BOT_TURN_DELAY_MS,
  CARD_ANIMATION_DURATION_MS,
  VFX_DURATION_MS,
  SPECIAL_DISPLAY_NAMES,
} from '@/types/index';

describe('Constants - Card Deck Math', () => {
  it('should have 39 number cards: 13 values * 3 copies', () => {
    const numberValues = NUMBER_CARD_MAX - NUMBER_CARD_MIN + 1;
    expect(numberValues).toBe(13);

    const totalNumberCards = numberValues * NUMBER_COPIES_PER_VALUE;
    expect(totalNumberCards).toBe(39);
  });

  it('should have 14 special cards: 3 + 3 + 3 + 2 + 3', () => {
    const totalSpecialCards = Object.values(SPECIAL_CARD_QUANTITIES).reduce(
      (sum, count) => sum + count,
      0,
    );
    expect(totalSpecialCards).toBe(14);
  });

  it('should have 53 total cards (39 number + 14 special)', () => {
    const numberValues = NUMBER_CARD_MAX - NUMBER_CARD_MIN + 1;
    const totalNumberCards = numberValues * NUMBER_COPIES_PER_VALUE;
    const totalSpecialCards = Object.values(SPECIAL_CARD_QUANTITIES).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalCards = totalNumberCards + totalSpecialCards;
    expect(totalCards).toBe(53);
  });
});

describe('Constants - Game Settings', () => {
  it('should have correct player and gameplay constants', () => {
    expect(TOTAL_PLAYERS).toBe(4);
    expect(INITIAL_LIVES).toBe(5);
    expect(HAND_SIZE).toBe(3);
  });

  it('should have correct number card range', () => {
    expect(NUMBER_CARD_MIN).toBe(1);
    expect(NUMBER_CARD_MAX).toBe(13);
    expect(NUMBER_COPIES_PER_VALUE).toBe(3);
  });

  it('should have correct animation timing constants', () => {
    expect(BOT_TURN_DELAY_MS).toBe(1500);
    expect(CARD_ANIMATION_DURATION_MS).toBe(400);
    expect(VFX_DURATION_MS).toBe(800);
  });
});

describe('Constants - Special Card Quantities', () => {
  it('should have all 5 special effects with correct quantities', () => {
    expect(SPECIAL_CARD_QUANTITIES[SpecialEffect.Reverse]).toBe(3);
    expect(SPECIAL_CARD_QUANTITIES[SpecialEffect.Skip]).toBe(3);
    expect(SPECIAL_CARD_QUANTITIES[SpecialEffect.Bomb]).toBe(3);
    expect(SPECIAL_CARD_QUANTITIES[SpecialEffect.Nuclear]).toBe(2);
    expect(SPECIAL_CARD_QUANTITIES[SpecialEffect.Random]).toBe(3);
  });

  it('should have all SpecialEffect keys present', () => {
    const keys = Object.keys(SPECIAL_CARD_QUANTITIES);
    expect(keys).toHaveLength(5);
  });
});

describe('Constants - Special Display Names', () => {
  it('should have human-readable names for all special effects', () => {
    expect(SPECIAL_DISPLAY_NAMES[SpecialEffect.Reverse]).toBe('Reverse');
    expect(SPECIAL_DISPLAY_NAMES[SpecialEffect.Skip]).toBe('Skip');
    expect(SPECIAL_DISPLAY_NAMES[SpecialEffect.Bomb]).toBe('Bomb');
    expect(SPECIAL_DISPLAY_NAMES[SpecialEffect.Nuclear]).toBe('Nuklir');
    expect(SPECIAL_DISPLAY_NAMES[SpecialEffect.Random]).toBe('Random');
  });
});

describe('Enum - CardType', () => {
  it('should have correct string values', () => {
    expect(CardType.Number).toBe('number');
    expect(CardType.Special).toBe('special');
  });

  it('should have exactly 2 members', () => {
    const values = Object.values(CardType);
    expect(values).toHaveLength(2);
  });
});

describe('Enum - SpecialEffect', () => {
  it('should have correct string values', () => {
    expect(SpecialEffect.Reverse).toBe('reverse');
    expect(SpecialEffect.Skip).toBe('skip');
    expect(SpecialEffect.Bomb).toBe('bomb');
    expect(SpecialEffect.Nuclear).toBe('nuclear');
    expect(SpecialEffect.Random).toBe('random');
  });

  it('should have exactly 5 members', () => {
    const values = Object.values(SpecialEffect);
    expect(values).toHaveLength(5);
  });
});

describe('Enum - PlayerType', () => {
  it('should have correct string values', () => {
    expect(PlayerType.Human).toBe('human');
    expect(PlayerType.Bot).toBe('bot');
  });

  it('should have exactly 2 members', () => {
    const values = Object.values(PlayerType);
    expect(values).toHaveLength(2);
  });
});

describe('Enum - PlayerStatus', () => {
  it('should have correct string values', () => {
    expect(PlayerStatus.Alive).toBe('alive');
    expect(PlayerStatus.Eliminated).toBe('eliminated');
    expect(PlayerStatus.Spectator).toBe('spectator');
  });

  it('should have exactly 3 members', () => {
    const values = Object.values(PlayerStatus);
    expect(values).toHaveLength(3);
  });
});

describe('Enum - GameStatus', () => {
  it('should have correct string values', () => {
    expect(GameStatus.Waiting).toBe('waiting');
    expect(GameStatus.Playing).toBe('playing');
    expect(GameStatus.Finished).toBe('finished');
  });

  it('should have exactly 3 members', () => {
    const values = Object.values(GameStatus);
    expect(values).toHaveLength(3);
  });
});

describe('Enum - Direction', () => {
  it('should have correct numeric values', () => {
    expect(Direction.Clockwise).toBe(1);
    expect(Direction.CounterClockwise).toBe(-1);
  });

  it('should have exactly 2 named members', () => {
    // Numeric enums produce reverse mappings; filter to named keys only
    const namedKeys = Object.keys(Direction).filter(
      (key) => typeof Direction[key as keyof typeof Direction] === 'number',
    );
    expect(namedKeys).toHaveLength(2);
    expect(namedKeys).toContain('Clockwise');
    expect(namedKeys).toContain('CounterClockwise');
  });

  it('should support arithmetic for turn calculation', () => {
    const playerCount = 4;
    // Simulate advancing one step clockwise
    const nextCW = (0 + Direction.Clockwise + playerCount) % playerCount;
    expect(nextCW).toBe(1);

    // Simulate going counter-clockwise from index 0
    const nextCCW = (0 + Direction.CounterClockwise + playerCount) % playerCount;
    expect(nextCCW).toBe(3);
  });
});

describe('Barrel Import Resolution', () => {
  it('should resolve all enum exports from index', () => {
    // Verify all enums are defined and have expected values
    expect(CardType).toBeDefined();
    expect(SpecialEffect).toBeDefined();
    expect(PlayerType).toBeDefined();
    expect(PlayerStatus).toBeDefined();
    expect(GameStatus).toBeDefined();
    expect(Direction).toBeDefined();
  });

  it('should resolve all constant exports from index', () => {
    expect(TOTAL_PLAYERS).toBeDefined();
    expect(INITIAL_LIVES).toBeDefined();
    expect(HAND_SIZE).toBeDefined();
    expect(NUMBER_CARD_MIN).toBeDefined();
    expect(NUMBER_CARD_MAX).toBeDefined();
    expect(NUMBER_COPIES_PER_VALUE).toBeDefined();
    expect(SPECIAL_CARD_QUANTITIES).toBeDefined();
    expect(BOT_TURN_DELAY_MS).toBeDefined();
    expect(CARD_ANIMATION_DURATION_MS).toBeDefined();
    expect(VFX_DURATION_MS).toBeDefined();
    expect(SPECIAL_DISPLAY_NAMES).toBeDefined();
  });
});
