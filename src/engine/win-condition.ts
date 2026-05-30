// src/engine/win-condition.ts — Win condition and deadlock resolution

import { PlayerStatus } from '../types';
import type { Player, GameState } from '../types';
import { hasPlayableCard } from './cards';

/**
 * Checks if exactly one alive player remains.
 * @param players - All players in the game
 * @returns The winning player if exactly 1 alive, otherwise null
 */
export function checkWinCondition(players: Player[]): Player | null {
  const alive = players.filter((p) => p.status === PlayerStatus.Alive);
  return alive.length === 1 ? alive[0] : null;
}

/**
 * Resolves a deadlock by selecting the alive player with the most lives.
 * Tie-breaker: lowest player id wins.
 * @param players - All players in the game
 * @returns The deadlock winner, or null if no alive players exist
 */
export function resolveDeadlock(players: Player[]): Player | null {
  const alive = players.filter((p) => p.status === PlayerStatus.Alive);
  if (alive.length === 0) return null;
  // Sort by lives descending, then by id ascending
  const sorted = [...alive].sort((a, b) => {
    if (b.lives !== a.lives) return b.lives - a.lives;
    return a.id - b.id;
  });
  return sorted[0];
}

/**
 * Determines if the game is in a deadlock state.
 * A deadlock occurs when more than 1 player is alive AND
 * every alive player has no playable card.
 * If only 1 player is alive, that is a win condition — not a deadlock.
 * @param state - Current game state
 * @returns true if the game is deadlocked
 */
export function isDeadlock(state: GameState): boolean {
  const alive = state.players.filter((p) => p.status === PlayerStatus.Alive);
  // If only 1 alive player, it's a win condition, not deadlock
  if (alive.length <= 1) return false;
  // Deadlock if EVERY alive player has no playable card
  return alive.every((p) => !hasPlayableCard(p.hand, state.lastValue));
}
