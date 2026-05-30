// src/engine/game.ts — Game orchestration: initGame and resetGame

import {
  Direction,
  GameStatus,
  PlayerType,
  PlayerStatus,
  TOTAL_PLAYERS,
  INITIAL_LIVES,
  HAND_SIZE,
} from '../types';
import type { GameState } from '../types';
import { createDeck, shuffleDeck, dealCards } from './deck';

/**
 * Creates a complete initial GameState:
 * - Builds and shuffles a 53-card deck
 * - Deals 3 cards to each of 4 players (round-robin)
 * - Player 1 is Human ("You"), Players 2-4 are Bots
 * - Current player index is 0 (human starts)
 * - Direction is clockwise
 * @returns A fresh GameState ready for play
 */
export function initGame(): GameState {
  // 1. Create and shuffle deck
  const deck = shuffleDeck(createDeck());

  // 2. Deal cards round-robin
  const { hands, deck: remainingDeck } = dealCards(
    deck,
    TOTAL_PLAYERS,
    HAND_SIZE
  );

  // 3. Create 4 players
  const players = [
    {
      id: 1,
      name: 'You',
      type: PlayerType.Human,
      hand: hands[0],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 2,
      name: 'Bot 2',
      type: PlayerType.Bot,
      hand: hands[1],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 3,
      name: 'Bot 3',
      type: PlayerType.Bot,
      hand: hands[2],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 4,
      name: 'Bot 4',
      type: PlayerType.Bot,
      hand: hands[3],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
  ];

  // 4. Return full GameState
  return {
    players,
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: remainingDeck,
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Playing,
    winner: null,
  };
}

/**
 * Resets the game to a completely fresh state.
 * Identical to calling initGame() — no residual state persists.
 * @returns A fresh GameState ready for play
 */
export function resetGame(): GameState {
  return initGame();
}
