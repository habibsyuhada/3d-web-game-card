// src/test/helpers.ts — Test helper functions for integration tests (STORY-021)
//
// Provides:
// - createTestStore: resets Zustand store with optional overrides
// - simulateBotTurn: runs one bot turn (decide + dispatch + draw + check)
// - playFullGame: runs an entire game from init to finished using bot AI
// - createMockPlayer: factory for Player objects with overrides
// - createMockCard: factory for Card objects with overrides

import {
  CardType,
  SpecialEffect,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../types';
import type { Player, Card } from '../types';
import { useGameStore } from '../store';
import type { GameStore } from '../store';
import { decideBotPlay } from '../engine/bot-ai';

/** Maximum turns to run before declaring a stuck loop. */
const MAX_TURNS = 1000;

/**
 * Creates a mock Player with sensible defaults and optional overrides.
 * @param overrides - Partial Player fields to override
 * @returns A valid Player object
 */
export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    name: 'You',
    type: PlayerType.Human,
    hand: [],
    lives: 5,
    status: PlayerStatus.Alive,
    ...overrides,
  };
}

/**
 * Creates a mock Card with sensible defaults and optional overrides.
 * @param overrides - Partial Card fields to override
 * @returns A valid Card object
 */
export function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: `card-${Math.random().toString(36).slice(2, 8)}`,
    type: CardType.Number,
    value: 5,
    effect: null,
    ...overrides,
  };
}

/**
 * Creates a mock number Card with a specific value.
 * @param value - The card value (1–13)
 * @param id - Optional explicit ID
 * @returns A NumberCard
 */
export function createNumberCard(value: number, id?: string): Card {
  return {
    id: id ?? `num-${value}-${Math.random().toString(36).slice(2, 6)}`,
    type: CardType.Number,
    value,
    effect: null,
  };
}

/**
 * Creates a mock Special Card with a specific effect.
 * @param effect - The special effect type
 * @param id - Optional explicit ID
 * @returns A SpecialCard
 */
export function createSpecialCard(effect: SpecialEffect, id?: string): Card {
  return {
    id: id ?? `spc-${effect}-${Math.random().toString(36).slice(2, 6)}`,
    type: CardType.Special,
    value: null,
    effect,
  };
}

/**
 * Resets the Zustand store to a clean baseline with optional overrides.
 * This is the testing equivalent of "createTestStore" — since useGameStore
 * is a singleton, we reset it rather than create new instances.
 *
 * @param overrides - Partial GameStore state to apply after reset
 */
export function createTestStore(
  overrides: Partial<GameStore> = {},
): typeof useGameStore.getState {
  useGameStore.setState({
    // Game slice defaults
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Waiting,
    winner: null,
    // UI slice defaults
    isFullscreen: false,
    showTitleScreen: true,
    turnMessage: '',
    showGameOver: false,
    showMessage: '',
    messageQueue: [],
    // Animation slice defaults
    isAnimating: false,
    animationQueue: [],
    activeVFX: null,
    vfxPosition: null,
    // Apply overrides
    ...overrides,
  });

  return useGameStore.getState;
}

/**
 * Simulates a single bot turn for the player at playerIndex.
 * Uses decideBotPlay to determine the action, then dispatches the
 * appropriate store actions (playCard/passTurn, drawCard, check win/deadlock, advanceTurn).
 *
 * @param getState - Function to get current store state
 * @param playerIndex - The index of the player taking the turn
 * @returns true if the game continued, false if the game ended
 */
export function simulateBotTurn(
  getState: () => GameStore,
  playerIndex: number,
): boolean {
  const state = getState();

  // Guard: if game is already finished, do nothing
  if (state.gameStatus === GameStatus.Finished) return false;

  // Guard: player must be alive
  const player = state.players[playerIndex];
  if (!player || player.status !== PlayerStatus.Alive) {
    // Advance past dead players
    useGameStore.getState().advanceTurn();
    return getState().gameStatus !== GameStatus.Finished;
  }

  // Use bot AI to decide action (even for human in automated test)
  const decision = decideBotPlay(player.hand, state.lastValue);

  const store = useGameStore.getState();

  if (decision.action === 'play' && decision.cardId) {
    // Play the card
    store.playCard(playerIndex, decision.cardId);

    // Draw a card if deck has cards
    store.drawCard(playerIndex);
  } else {
    // Pass: lose a life
    store.passTurn(playerIndex);
  }

  // Check win condition after every action
  store.checkAndSetWinner();

  const stateAfterCheck = getState();
  if (stateAfterCheck.gameStatus === GameStatus.Finished) return false;

  // Check deadlock
  store.resolveDeadlock();

  const stateAfterDeadlock = getState();
  if (stateAfterDeadlock.gameStatus === GameStatus.Finished) return false;

  // Advance to next player
  store.advanceTurn();

  return true;
}

/**
 * Runs a full automated game from start to finish.
 * Initializes the game, then loops through all players using bot AI
 * (including the human player) until the game reaches a terminal state.
 *
 * @param getState - Function to get current store state (optional; uses useGameStore by default)
 * @returns The final game state
 */
export function playFullGame(
  getState?: () => GameStore,
): GameStore {
  const gs = getState ?? (() => useGameStore.getState());

  // Initialize the game
  useGameStore.getState().initGame();

  let turnCount = 0;

  while (gs().gameStatus !== GameStatus.Finished) {
    const state = gs();
    const playerIndex = state.currentPlayerIndex;

    // Safety: prevent infinite loops
    if (turnCount >= MAX_TURNS) {
      const aliveCount = state.players.filter(
        (p: Player) => p.status === PlayerStatus.Alive,
      ).length;
      throw new Error(
        `Game did not finish within ${MAX_TURNS} turns. ` +
        `Current state: ${state.gameStatus}, alive: ${aliveCount}`,
      );
    }

    simulateBotTurn(gs, playerIndex);
    turnCount++;
  }

  return gs();
}
