// src/types/index.ts — Barrel re-export of all types, enums, interfaces, and constants

// Card types
export { CardType, SpecialEffect } from './card';
export type { Card, NumberCard, SpecialCard } from './card';

// Player types
export { PlayerType, PlayerStatus } from './player';
export type { Player } from './player';

// Game types
export { GameStatus, Direction } from './game';
export type { GameState, BotDecision, TurnResult, AnimationAction } from './game';

// Constants
export {
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
} from './constants';
