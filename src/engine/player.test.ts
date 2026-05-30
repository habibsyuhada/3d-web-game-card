// src/engine/player.test.ts — Tests for Player Operations

import { describe, it, expect } from 'vitest';
import { eliminatePlayer, canPlayerAct, loseLife } from './player';
import type { Player } from '../types';
import { PlayerType, PlayerStatus } from '../types';

function createTestPlayer(id: number, overrides?: Partial<Player>): Player {
  return {
    id,
    name: `Player ${id + 1}`,
    type: PlayerType.Human,
    hand: [],
    lives: 5,
    status: PlayerStatus.Alive,
    ...overrides,
  };
}

describe('eliminatePlayer', () => {
  it('sets status to Eliminated and lives to 0', () => {
    const player = createTestPlayer(0, { lives: 3 });
    const eliminated = eliminatePlayer(player);

    expect(eliminated.status).toBe(PlayerStatus.Eliminated);
    expect(eliminated.lives).toBe(0);
    // Original unchanged (immutability)
    expect(player.status).toBe(PlayerStatus.Alive);
    expect(player.lives).toBe(3);
  });

  it('returns a new object, not the same reference', () => {
    const player = createTestPlayer(0);
    const eliminated = eliminatePlayer(player);
    expect(eliminated).not.toBe(player);
  });

  it('preserves other fields (name, id, type, hand)', () => {
    const player = createTestPlayer(2, { name: 'Bot 3', type: PlayerType.Bot });
    const eliminated = eliminatePlayer(player);

    expect(eliminated.id).toBe(player.id);
    expect(eliminated.name).toBe(player.name);
    expect(eliminated.type).toBe(player.type);
    expect(eliminated.hand).toEqual(player.hand);
  });
});

describe('canPlayerAct', () => {
  it('returns true for alive player', () => {
    const player = createTestPlayer(0);
    expect(canPlayerAct(player)).toBe(true);
  });

  it('returns false for eliminated player', () => {
    const player = createTestPlayer(0, {
      status: PlayerStatus.Eliminated,
      lives: 0,
    });
    expect(canPlayerAct(player)).toBe(false);
  });

  it('returns false for spectator player', () => {
    const player = createTestPlayer(0, { status: PlayerStatus.Spectator });
    expect(canPlayerAct(player)).toBe(false);
  });
});

describe('loseLife', () => {
  it('decrements lives: 5→4 with eliminated:false', () => {
    const player = createTestPlayer(0, { lives: 5 });
    const result = loseLife(player);

    expect(result.player.lives).toBe(4);
    expect(result.eliminated).toBe(false);
    expect(result.player.status).toBe(PlayerStatus.Alive);
    // Original unchanged
    expect(player.lives).toBe(5);
  });

  it('decrements lives: 4→3 with eliminated:false', () => {
    const player = createTestPlayer(0, { lives: 4 });
    const result = loseLife(player);

    expect(result.player.lives).toBe(3);
    expect(result.eliminated).toBe(false);
    expect(result.player.status).toBe(PlayerStatus.Alive);
  });

  it('decrements lives: 1→0 returns eliminated:true', () => {
    const player = createTestPlayer(0, { lives: 1 });
    const result = loseLife(player);

    expect(result.player.lives).toBe(0);
    expect(result.eliminated).toBe(true);
    expect(result.player.status).toBe(PlayerStatus.Eliminated);
  });

  it('returns a new player object (immutability)', () => {
    const player = createTestPlayer(0, { lives: 3 });
    const result = loseLife(player);
    expect(result.player).not.toBe(player);
  });

  it('defensive: does not crash on already-eliminated player', () => {
    const player = createTestPlayer(0, {
      lives: 0,
      status: PlayerStatus.Eliminated,
    });
    const result = loseLife(player);

    // Should return the player unchanged (or defensively handled)
    expect(result.eliminated).toBe(true);
    expect(result.player.lives).toBe(0);
    expect(result.player.status).toBe(PlayerStatus.Eliminated);
  });

  it('defensive: handles spectator player gracefully', () => {
    const player = createTestPlayer(0, { status: PlayerStatus.Spectator, lives: 0 });
    const result = loseLife(player);

    expect(result.eliminated).toBe(true);
    expect(result.player.status).toBe(PlayerStatus.Spectator);
  });

  it('preserves other fields when decrementing', () => {
    const player = createTestPlayer(1, {
      lives: 3,
      name: 'Bot 2',
      type: PlayerType.Bot,
    });
    const result = loseLife(player);

    expect(result.player.id).toBe(1);
    expect(result.player.name).toBe('Bot 2');
    expect(result.player.type).toBe(PlayerType.Bot);
  });
});
