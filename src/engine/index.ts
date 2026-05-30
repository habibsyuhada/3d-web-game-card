// src/engine/index.ts — Public API barrel for game engine

// Deck operations
export { createDeck, shuffleDeck, drawCard, dealCards } from './deck';

// Card operations
export { isCardPlayable, hasPlayableCard, getCardDisplayValue } from './cards';

// Turn operations (STORY-004)
export {
  getNextActivePlayerIndex,
  getAlivePlayerCount,
  advanceTurn,
} from './turn';

// Player operations (STORY-004)
export { eliminatePlayer, canPlayerAct, loseLife } from './player';

// Special card effects (STORY-005)
export { applySpecialEffect } from './special-cards';
export type { SpecialEffectResult } from './special-cards';

// Bot AI (STORY-006)
export { decideBotPlay } from './bot-ai';

// Win condition & deadlock resolution (STORY-007)
export { checkWinCondition, resolveDeadlock, isDeadlock } from './win-condition';

// Game orchestration (STORY-008)
export { initGame, resetGame } from './game';
