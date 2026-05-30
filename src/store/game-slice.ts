// src/store/game-slice.ts — Game state & actions slice
// Uses immer middleware for clean mutation syntax on nested player/deck arrays.

import type { StateCreator } from 'zustand';
import {
  CardType,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../types';
import type {
  Player,
  Card,
  SpecialEffect,
  GameState,
} from '../types';
import type { GameStore } from './index';
import * as Engine from '../engine';

/**
 * Game slice defines the core game state and all mutative game actions.
 * This is the backbone of the game — all state mutations flow through these actions.
 * Engine functions are pure and called here; their results are applied via immer `set()`.
 */
export interface GameSlice {
  // ── State ──────────────────────────────────────────────────────────────────
  /** Array of all 4 players (human + 3 bots). */
  players: Player[];
  /** Index of the player whose turn it currently is. */
  currentPlayerIndex: number;
  /** Direction of play: Clockwise (1) or CounterClockwise (-1). */
  direction: Direction;
  /** Remaining undealt deck of cards. */
  deck: Card[];
  /** Pile of cards played to the middle. Last card determines current value. */
  middlePile: Card[];
  /** The value the next card must beat. null means pile is empty/reset. */
  lastValue: number | null;
  /** Current game phase: Waiting, Playing, or Finished. */
  gameStatus: GameStatus;
  /** Name of the winner when gameStatus is Finished, or null. */
  winner: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  /** Initialize a new game with shuffled deck and dealt cards. */
  initGame: () => void;
  /** Reset all game, UI, and animation state; return to title screen. */
  resetGame: () => void;
  /**
   * Play a card from a player's hand to the middle pile.
   * Applies special effects, updates direction/value/pile.
   * Handles Skip by pre-advancing the currentPlayerIndex.
   * Defensive: no-op if card not found, not in hand, or not playable.
   */
  playCard: (playerIndex: number, cardId: string) => void;
  /**
   * Pass the turn: the player loses 1 life.
   * If lives reach 0, the player is eliminated.
   */
  passTurn: (playerIndex: number) => void;
  /**
   * Draw the top card from the deck and add to the player's hand.
   * No-op if deck is empty.
   */
  drawCard: (playerIndex: number) => void;
  /** Advance to the next alive player in the current direction. */
  advanceTurn: () => void;
  /**
   * Apply a special effect to the current game state.
   * Updates lastValue, direction, and potentially clears the middle pile.
   */
  applySpecialEffect: (effect: SpecialEffect) => void;
  /** Mark a player as eliminated (lives = 0, status = Eliminated). */
  eliminatePlayer: (playerIndex: number) => void;
  /**
   * Check if exactly one alive player remains.
   * If so, set the winner and gameStatus to Finished.
   */
  checkAndSetWinner: () => void;
  /**
   * Check for deadlock (all alive players stuck with no playable cards).
   * If deadlocked, resolve by awarding win to player with most lives.
   */
  resolveDeadlock: () => void;
}

/**
 * Helper: builds a GameState snapshot from store state for use with engine functions.
 * The engine expects `winner: Player | null`, but the store uses `string | null`,
 * so we pass `null` (engine functions don't read the winner field).
 */
function toGameState(state: GameSlice): GameState {
  return {
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    direction: state.direction,
    deck: state.deck,
    middlePile: state.middlePile,
    lastValue: state.lastValue,
    gameStatus: state.gameStatus,
    winner: null,
  };
}

/**
 * Creates the Game slice for the Zustand store.
 * @param set - Zustand set function (wrapped by immer)
 * @param get - Zustand get function (returns current non-draft state)
 * @returns Initial state + action implementations
 */
export const createGameSlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  GameSlice
> = (set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  players: [],
  currentPlayerIndex: 0,
  direction: Direction.Clockwise,
  deck: [],
  middlePile: [],
  lastValue: null,
  gameStatus: GameStatus.Waiting,
  winner: null,

  // ── Actions ──────────────────────────────────────────────────────────────

  initGame: () => {
    const fresh = Engine.initGame();
    set((draft) => {
      draft.players = fresh.players;
      draft.currentPlayerIndex = fresh.currentPlayerIndex;
      draft.direction = fresh.direction;
      draft.deck = fresh.deck;
      draft.middlePile = fresh.middlePile;
      draft.lastValue = fresh.lastValue;
      draft.gameStatus = fresh.gameStatus;
      draft.winner = null;
    });
  },

  resetGame: () => {
    const fresh = Engine.resetGame();
    set((draft) => {
      // Game slice reset
      draft.players = fresh.players;
      draft.currentPlayerIndex = fresh.currentPlayerIndex;
      draft.direction = fresh.direction;
      draft.deck = fresh.deck;
      draft.middlePile = fresh.middlePile;
      draft.lastValue = fresh.lastValue;
      draft.gameStatus = fresh.gameStatus;
      draft.winner = null;

      // UI slice reset
      draft.showTitleScreen = true;
      draft.showGameOver = false;
      draft.isFullscreen = false;
      draft.turnMessage = '';
      draft.showMessage = '';
      draft.messageQueue = [];

      // Animation slice reset
      draft.isAnimating = false;
      draft.animationQueue = [];
      draft.activeVFX = null;
      draft.vfxPosition = null;
    });
  },

  playCard: (playerIndex: number, cardId: string) => {
    const state = get();
    const player = state.players[playerIndex];

    // Defensive: player must exist and be alive
    if (!player || player.status !== PlayerStatus.Alive) return;

    // Find card in the player's hand
    const cardIndex = player.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return; // card not in hand

    const card = player.hand[cardIndex];

    // Verify the card is playable
    if (!Engine.isCardPlayable(card, state.lastValue)) return;

    // Pre-compute all state changes from special effects (pure, no mutation)
    let newLastValue: number | null = card.value;
    let newDirection = state.direction;
    let clearMiddlePile = false;
    let skipTarget: number | null = null;

    if (card.type === CardType.Special && card.effect !== null) {
      const gameSnapshot = toGameState(state);
      const result = Engine.applySpecialEffect(card.effect, gameSnapshot);
      newLastValue = result.newLastValue;
      newDirection = result.newDirection;
      clearMiddlePile = result.clearMiddlePile;

      // For Skip: pre-compute the target player to skip to
      if (result.skipNext) {
        skipTarget = Engine.getNextActivePlayerIndex(
          state.players,
          state.currentPlayerIndex,
          newDirection,
        );
      }
    }

    set((draft) => {
      // 1. Remove card from player's hand
      draft.players[playerIndex].hand.splice(cardIndex, 1);

      // 2. Update middle pile
      if (clearMiddlePile) {
        // Nuclear: clear the entire pile (played card is not added)
        draft.middlePile = [];
      } else {
        draft.middlePile.push(card);
      }

      // 3. Update last value
      draft.lastValue = newLastValue;

      // 4. Update direction (Reverse flips it)
      draft.direction = newDirection;

      // 5. Handle Skip: advance currentPlayerIndex to skip the next player
      if (skipTarget !== null) {
        draft.currentPlayerIndex = skipTarget;
      }
    });
  },

  passTurn: (playerIndex: number) => {
    const state = get();
    const player = state.players[playerIndex];

    // Defensive: player must exist and be alive
    if (!player || player.status !== PlayerStatus.Alive) return;

    const result = Engine.loseLife(player);

    set((draft) => {
      draft.players[playerIndex].lives = result.player.lives;
      draft.players[playerIndex].status = result.player.status;
    });
  },

  drawCard: (playerIndex: number) => {
    const state = get();

    // Defensive: player must exist
    const player = state.players[playerIndex];
    if (!player) return;

    // Deck empty — cannot draw (FR-023)
    if (state.deck.length === 0) return;

    const result = Engine.drawCard(state.deck);

    if (result.card) {
      set((draft) => {
        draft.deck = result.deck;
        draft.players[playerIndex].hand.push(result.card!);
      });
    }
  },

  advanceTurn: () => {
    const state = get();
    const nextIndex = Engine.getNextActivePlayerIndex(
      state.players,
      state.currentPlayerIndex,
      state.direction,
    );
    set((draft) => {
      draft.currentPlayerIndex = nextIndex;
    });
  },

  applySpecialEffect: (effect: SpecialEffect) => {
    const state = get();
    const gameSnapshot = toGameState(state);
    const result = Engine.applySpecialEffect(effect, gameSnapshot);

    set((draft) => {
      draft.lastValue = result.newLastValue;
      draft.direction = result.newDirection;
      if (result.clearMiddlePile) {
        draft.middlePile = [];
      }
    });
  },

  eliminatePlayer: (playerIndex: number) => {
    set((draft) => {
      if (draft.players[playerIndex]) {
        draft.players[playerIndex].lives = 0;
        draft.players[playerIndex].status = PlayerStatus.Eliminated;
      }
    });
  },

  checkAndSetWinner: () => {
    const state = get();
    const winnerPlayer = Engine.checkWinCondition(state.players);
    if (winnerPlayer) {
      set((draft) => {
        draft.winner = winnerPlayer.name;
        draft.gameStatus = GameStatus.Finished;
      });
    }
  },

  resolveDeadlock: () => {
    const state = get();
    const gameSnapshot = toGameState(state);

    if (!Engine.isDeadlock(gameSnapshot)) return;

    const winnerPlayer = Engine.resolveDeadlock(state.players);
    if (winnerPlayer) {
      set((draft) => {
        draft.winner = winnerPlayer.name;
        draft.gameStatus = GameStatus.Finished;
      });
    }
  },
});
