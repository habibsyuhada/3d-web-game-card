// src/store/selectors.ts — Memoized Zustand selectors for derived game state
// Each selector subscribes only to the relevant slice of state for granular re-renders.

import { useGameStore } from './index';
import type { Player, Card } from '../types';
import { PlayerType, PlayerStatus } from '../types';
import { isCardPlayable } from '../engine';

/**
 * Returns the player whose turn it currently is.
 * Subscribes to: `players`, `currentPlayerIndex`
 */
export const useCurrentPlayer = (): Player =>
  useGameStore((state) => state.players[state.currentPlayerIndex]);

/**
 * Returns the human player, or null if not yet initialized.
 * Subscribes to: `players`
 */
export const useHumanPlayer = (): Player | null =>
  useGameStore(
    (state) => state.players.find((p) => p.type === PlayerType.Human) ?? null,
  );

/**
 * Returns true if it is currently the human player's turn.
 * Subscribes to: `players`, `currentPlayerIndex`
 */
export const useIsHumanTurn = (): boolean =>
  useGameStore((state) => {
    const current = state.players[state.currentPlayerIndex];
    if (!current) return false;
    return current.type === PlayerType.Human;
  });

/**
 * Returns the list of playable cards in the given player's hand,
 * filtered by `isCardPlayable(card, lastValue)`.
 *
 * @param playerIndex - Index of the player to check
 * @returns Array of playable Card objects
 */
export const usePlayableCards = (playerIndex: number): Card[] =>
  useGameStore((state) => {
    const player = state.players[playerIndex];
    if (!player) return [];
    return player.hand.filter((card) =>
      isCardPlayable(card, state.lastValue),
    );
  });

/**
 * Returns all players with status === Alive.
 * Subscribes to: `players`
 */
export const useAlivePlayers = (): Player[] =>
  useGameStore((state) =>
    state.players.filter((p) => p.status === PlayerStatus.Alive),
  );

/**
 * Returns the count of remaining cards in the deck.
 * Subscribes to: `deck`
 */
export const useDeckCount = (): number =>
  useGameStore((state) => state.deck.length);

/**
 * Returns the top card of the middle pile, or null if the pile is empty.
 * Subscribes to: `middlePile`
 */
export const useMiddlePileTopCard = (): Card | null =>
  useGameStore((state) => {
    const pile = state.middlePile;
    return pile.length > 0 ? pile[pile.length - 1] : null;
  });
