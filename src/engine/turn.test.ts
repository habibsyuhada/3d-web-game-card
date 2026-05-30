// src/engine/turn.test.ts — Tests for Turn Manager

import { describe, it, expect } from 'vitest';
import {
  getNextActivePlayerIndex,
  getAlivePlayerCount,
  advanceTurn,
} from './turn';
import type { Player, GameState } from '../types';
import {
  PlayerType,
  PlayerStatus,
  Direction,
  GameStatus,
} from '../types';

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

function createTestGameState(overrides?: Partial<GameState>): GameState {
  return {
    players: [
      createTestPlayer(0),
      createTestPlayer(1),
      createTestPlayer(2),
      createTestPlayer(3),
    ],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Playing,
    winner: null,
    ...overrides,
  };
}

describe('getNextActivePlayerIndex', () => {
  it('with all 4 alive, clockwise: 0→1→2→3→0', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1),
      createTestPlayer(2),
      createTestPlayer(3),
    ];

    expect(getNextActivePlayerIndex(players, 0, Direction.Clockwise)).toBe(1);
    expect(getNextActivePlayerIndex(players, 1, Direction.Clockwise)).toBe(2);
    expect(getNextActivePlayerIndex(players, 2, Direction.Clockwise)).toBe(3);
    expect(getNextActivePlayerIndex(players, 3, Direction.Clockwise)).toBe(0);
  });

  it('with all 4 alive, counter-clockwise: 0→3→2→1→0', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1),
      createTestPlayer(2),
      createTestPlayer(3),
    ];

    expect(getNextActivePlayerIndex(players, 0, Direction.CounterClockwise)).toBe(3);
    expect(getNextActivePlayerIndex(players, 3, Direction.CounterClockwise)).toBe(2);
    expect(getNextActivePlayerIndex(players, 2, Direction.CounterClockwise)).toBe(1);
    expect(getNextActivePlayerIndex(players, 1, Direction.CounterClockwise)).toBe(0);
  });

  it('with player 2 eliminated, clockwise: 1→3 (skip 2)', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1),
      createTestPlayer(2, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(3),
    ];

    // From player 1 going clockwise, next should be 3 (skip eliminated 2)
    expect(getNextActivePlayerIndex(players, 1, Direction.Clockwise)).toBe(3);
    // From player 0 clockwise should also skip to 1 (1 is alive)
    expect(getNextActivePlayerIndex(players, 0, Direction.Clockwise)).toBe(1);
  });

  it('with 2 players eliminated, wraps correctly between remaining 2', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(2),
      createTestPlayer(3, { status: PlayerStatus.Eliminated, lives: 0 }),
    ];

    // From player 0 clockwise: skip 1 (dead), skip 2? No, 2 is alive → 2
    expect(getNextActivePlayerIndex(players, 0, Direction.Clockwise)).toBe(2);
    // From player 2 clockwise: skip 3 (dead), skip 0? No, 0 is alive → 0
    expect(getNextActivePlayerIndex(players, 2, Direction.Clockwise)).toBe(0);
  });

  it('with only 2 alive, turn alternates regardless of direction', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(2, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(3),
    ];

    // Clockwise: 0→3, 3→0
    expect(getNextActivePlayerIndex(players, 0, Direction.Clockwise)).toBe(3);
    expect(getNextActivePlayerIndex(players, 3, Direction.Clockwise)).toBe(0);

    // CounterClockwise: same alternation between 0 and 3
    expect(getNextActivePlayerIndex(players, 0, Direction.CounterClockwise)).toBe(3);
    expect(getNextActivePlayerIndex(players, 3, Direction.CounterClockwise)).toBe(0);
  });
});

describe('getAlivePlayerCount', () => {
  it('with all alive returns 4', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1),
      createTestPlayer(2),
      createTestPlayer(3),
    ];
    expect(getAlivePlayerCount(players)).toBe(4);
  });

  it('with 1 eliminated returns 3', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1),
      createTestPlayer(2, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(3),
    ];
    expect(getAlivePlayerCount(players)).toBe(3);
  });

  it('does not count spectators as alive', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1, { status: PlayerStatus.Spectator }),
      createTestPlayer(2, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(3),
    ];
    expect(getAlivePlayerCount(players)).toBe(2);
  });
});

describe('advanceTurn', () => {
  it('returns new GameState with updated currentPlayerIndex', () => {
    const state = createTestGameState({
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
    });

    const next = advanceTurn(state);

    // New object returned
    expect(next).not.toBe(state);
    // Other fields preserved
    expect(next.players).toBe(state.players);
    expect(next.direction).toBe(state.direction);
    expect(next.deck).toBe(state.deck);
    expect(next.gameStatus).toBe(state.gameStatus);
    // currentPlayerIndex advanced
    expect(next.currentPlayerIndex).toBe(1);
  });

  it('advances counter-clockwise correctly', () => {
    const state = createTestGameState({
      currentPlayerIndex: 0,
      direction: Direction.CounterClockwise,
    });

    const next = advanceTurn(state);
    expect(next.currentPlayerIndex).toBe(3);
  });

  it('skips eliminated players when advancing', () => {
    const players = [
      createTestPlayer(0),
      createTestPlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      createTestPlayer(2),
      createTestPlayer(3),
    ];
    const state = createTestGameState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
    });

    const next = advanceTurn(state);
    // Player 1 is eliminated, so from 0 clockwise should be 2
    expect(next.currentPlayerIndex).toBe(2);
  });
});
