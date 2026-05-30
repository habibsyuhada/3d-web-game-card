// src/types/constants.ts — Game configuration constants

import { SpecialEffect } from './card';

export const TOTAL_PLAYERS = 4;
export const INITIAL_LIVES = 5;
export const HAND_SIZE = 3;
export const NUMBER_CARD_MIN = 1;
export const NUMBER_CARD_MAX = 13;
export const NUMBER_COPIES_PER_VALUE = 3;

export const SPECIAL_CARD_QUANTITIES: Record<SpecialEffect, number> = {
  [SpecialEffect.Reverse]: 3,
  [SpecialEffect.Skip]: 3,
  [SpecialEffect.Bomb]: 3,
  [SpecialEffect.Nuclear]: 2,
  [SpecialEffect.Random]: 3,
};
// Total: 39 number + 14 special = 53 cards

export const BOT_TURN_DELAY_MS = 1500;
export const CARD_ANIMATION_DURATION_MS = 400;
export const VFX_DURATION_MS = 800;

export const SPECIAL_DISPLAY_NAMES: Record<SpecialEffect, string> = {
  [SpecialEffect.Reverse]: 'Reverse',
  [SpecialEffect.Skip]: 'Skip',
  [SpecialEffect.Bomb]: 'Bomb',
  [SpecialEffect.Nuclear]: 'Nuklir',
  [SpecialEffect.Random]: 'Random',
};
