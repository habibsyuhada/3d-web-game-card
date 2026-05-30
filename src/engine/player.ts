// src/engine/player.ts — Player operations: elimination, life loss, action guard
// Pure functions with no React/3D dependencies.

import type { Player } from '../types';
import { PlayerStatus } from '../types';

/**
 * Returns a new Player object with the player eliminated:
 * - `lives` set to 0
 * - `status` set to PlayerStatus.Eliminated
 *
 * Immutable: the input player is not mutated.
 */
export function eliminatePlayer(player: Player): Player {
  return {
    ...player,
    lives: 0,
    status: PlayerStatus.Eliminated,
  };
}

/**
 * Returns true if the player is alive and able to act on their turn.
 * Eliminated and spectator players cannot act.
 */
export function canPlayerAct(player: Player): boolean {
  return player.status === PlayerStatus.Alive;
}

/**
 * Decrements the player's lives by 1. If lives reaches 0, the player
 * is marked as Eliminated.
 *
 * Immutable: returns a new Player object.
 *
 * Defensive: if called on a player who is already eliminated or has 0 lives,
 * the function returns the player unchanged (or with lives clamped at 0)
 * and `eliminated: true` to avoid crashing; callers should not reach this path.
 *
 * @returns An object containing the updated player and a boolean indicating
 *          whether the player was eliminated on this call.
 */
export function loseLife(player: Player): { player: Player; eliminated: boolean } {
  // Defensive: if already eliminated or not alive, return unchanged.
  if (player.status !== PlayerStatus.Alive) {
    return { player, eliminated: true };
  }

  const newLives = Math.max(0, player.lives - 1);
  const eliminated = newLives === 0;

  const updatedPlayer: Player = {
    ...player,
    lives: newLives,
    status: eliminated ? PlayerStatus.Eliminated : player.status,
  };

  return { player: updatedPlayer, eliminated };
}
