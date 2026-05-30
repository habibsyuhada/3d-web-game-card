// src/engine/turn.ts — Turn Manager: advance turns & query alive players
// Pure functions with no React/3D dependencies.

import type { Player, GameState } from '../types';
import { PlayerStatus, Direction } from '../types';

/**
 * Finds the index of the next alive player in the given direction,
 * skipping eliminated and spectator players.
 *
 * Uses a do-while wrap pattern: `(next + direction + count) % count`.
 * Caller must guarantee at least 1 alive player exists in the array;
 * otherwise this function would loop indefinitely.
 *
 * @param players      The full player array (length typically 4).
 * @param currentIndex The index of the player whose turn just ended.
 * @param direction    Direction.Clockwise (1) or Direction.CounterClockwise (-1).
 * @returns The index of the next alive player.
 */
export function getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number,
  direction: Direction
): number {
  const count = players.length;
  let next = currentIndex;

  do {
    next = (next + direction + count) % count;
  } while (players[next].status !== PlayerStatus.Alive);

  return next;
}

/**
 * Counts the number of alive players in the array.
 */
export function getAlivePlayerCount(players: Player[]): number {
  return players.filter((p) => p.status === PlayerStatus.Alive).length;
}

/**
 * Advances the turn to the next alive player.
 * Returns a new GameState (immutable) with `currentPlayerIndex` updated.
 * All other fields are preserved from the input state.
 */
export function advanceTurn(state: GameState): GameState {
  const nextIndex = getNextActivePlayerIndex(
    state.players,
    state.currentPlayerIndex,
    state.direction
  );

  return {
    ...state,
    currentPlayerIndex: nextIndex,
  };
}
