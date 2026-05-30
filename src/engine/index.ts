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

// Additional engine modules will be added in STORY-005 through STORY-008
