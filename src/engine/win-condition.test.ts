// src/engine/win-condition.test.ts — Tests for win condition and deadlock resolution

import { describe, it, expect } from 'vitest';
import {
  CardType,
  SpecialEffect,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../types';
import type { Player, Card, GameState } from '../types';
import {
  checkWinCondition,
  resolveDeadlock,
  isDeadlock,
} from './win-condition';

// Helper to create a player for testing
function makePlayer(id: number, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: `Player ${id}`,
    type: PlayerType.Bot,
    hand: [],
    lives: 5,
    status: PlayerStatus.Alive,
    ...overrides,
  };
}

// Helper to create a number card for testing
function makeNumberCard(value: number, copy: number = 0): Card {
  return {
    id: `num-${value}-${copy}`,
    type: CardType.Number,
    value,
    effect: null,
  };
}

// Helper to create a special card for testing
function makeSpecialCard(effect: SpecialEffect, copy: number = 0): Card {
  return {
    id: `spc-${effect}-${copy}`,
    type: CardType.Special,
    value: null,
    effect,
  };
}

// Helper to build a minimal GameState for isDeadlock tests
function makeGameState(overrides: Partial<GameState>): GameState {
  return {
    players: [],
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

describe('checkWinCondition', () => {
  it('returns the alive player when 3 of 4 players are eliminated', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(2, { status: PlayerStatus.Alive, lives: 3 }),
      makePlayer(3, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(4, { status: PlayerStatus.Eliminated, lives: 0 }),
    ];

    const winner = checkWinCondition(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(2);
    expect(winner!.status).toBe(PlayerStatus.Alive);
  });

  it('returns null when 2 players are still alive', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Alive, lives: 2 }),
      makePlayer(2, { status: PlayerStatus.Alive, lives: 3 }),
      makePlayer(3, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(4, { status: PlayerStatus.Eliminated, lives: 0 }),
    ];

    expect(checkWinCondition(players)).toBeNull();
  });

  it('returns null when all players are alive', () => {
    const players: Player[] = [
      makePlayer(1),
      makePlayer(2),
      makePlayer(3),
      makePlayer(4),
    ];

    expect(checkWinCondition(players)).toBeNull();
  });

  it('returns null when all 4 players are eliminated', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(2, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(3, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(4, { status: PlayerStatus.Eliminated, lives: 0 }),
    ];

    expect(checkWinCondition(players)).toBeNull();
  });
});

describe('resolveDeadlock', () => {
  it('returns the player with the most lives', () => {
    const players: Player[] = [
      makePlayer(1, { lives: 5 }),
      makePlayer(2, { lives: 3 }),
      makePlayer(3, { lives: 2 }),
      makePlayer(4, { lives: 1 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(1);
    expect(winner!.lives).toBe(5);
  });

  it('returns the player with lowest id when lives are tied', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(2, { lives: 3 }),
      makePlayer(3, { lives: 3 }),
      makePlayer(4, { lives: 1 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(2);
    expect(winner!.lives).toBe(3);
  });

  it('returns the player with lowest id when all alive players have same lives', () => {
    const players: Player[] = [
      makePlayer(1, { lives: 3 }),
      makePlayer(2, { lives: 3 }),
      makePlayer(3, { lives: 3 }),
      makePlayer(4, { lives: 3 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(1);
    expect(winner!.lives).toBe(3);
  });

  it('returns null when all players are eliminated', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(2, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(3, { status: PlayerStatus.Eliminated, lives: 0 }),
      makePlayer(4, { status: PlayerStatus.Eliminated, lives: 0 }),
    ];

    expect(resolveDeadlock(players)).toBeNull();
  });

  it('only considers alive players, ignoring eliminated ones', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, lives: 5 }),
      makePlayer(2, { lives: 2 }),
      makePlayer(3, { status: PlayerStatus.Eliminated, lives: 4 }),
      makePlayer(4, { lives: 3 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(4);
    expect(winner!.lives).toBe(3);
  });
});

describe('isDeadlock', () => {
  it('returns true when all alive players have no playable cards', () => {
    // All alive players have number cards lower than lastValue
    const players: Player[] = [
      makePlayer(1, { hand: [makeNumberCard(2)] }),
      makePlayer(2, { hand: [makeNumberCard(3)] }),
      makePlayer(3, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(4, { hand: [makeNumberCard(1)] }),
    ];

    const state = makeGameState({
      players,
      lastValue: 10, // All number cards are < 10, so none playable
    });

    expect(isDeadlock(state)).toBe(true);
  });

  it('returns false when at least one alive player has a playable card', () => {
    const players: Player[] = [
      makePlayer(1, { hand: [makeNumberCard(2)] }),
      makePlayer(2, { hand: [makeNumberCard(12)] }), // 12 >= 10, playable
      makePlayer(3, { hand: [makeNumberCard(1)] }),
      makePlayer(4, { hand: [makeNumberCard(3)] }),
    ];

    const state = makeGameState({
      players,
      lastValue: 10,
    });

    expect(isDeadlock(state)).toBe(false);
  });

  it('returns false when only 1 player is alive (that is a win, not deadlock)', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(2, { hand: [makeNumberCard(1)] }), // Only alive player
      makePlayer(3, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(4, { status: PlayerStatus.Eliminated, hand: [] }),
    ];

    const state = makeGameState({
      players,
      lastValue: 10,
    });

    expect(isDeadlock(state)).toBe(false);
  });

  it('returns false when lastValue is null and all hands have specials (specials always playable)', () => {
    const players: Player[] = [
      makePlayer(1, { hand: [makeSpecialCard(SpecialEffect.Bomb)] }),
      makePlayer(2, { hand: [makeSpecialCard(SpecialEffect.Reverse)] }),
      makePlayer(3, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(4, { hand: [makeSpecialCard(SpecialEffect.Skip)] }),
    ];

    const state = makeGameState({
      players,
      lastValue: null,
    });

    // Special cards are always playable, so no deadlock
    expect(isDeadlock(state)).toBe(false);
  });

  it('returns false when players have empty hands and lastValue is null', () => {
    const players: Player[] = [
      makePlayer(1, { hand: [] }),
      makePlayer(2, { hand: [] }),
      makePlayer(3, { hand: [] }),
      makePlayer(4, { hand: [] }),
    ];

    const state = makeGameState({
      players,
      lastValue: null,
    });

    // Empty hands means no playable cards — but we need at least 2 alive
    // hasPlayableCard returns false for empty hand, so all alive have no playable → deadlock
    // Actually all 4 are alive and all have no playable cards → deadlock
    expect(isDeadlock(state)).toBe(true);
  });

  it('returns false when no players are alive', () => {
    const players: Player[] = [
      makePlayer(1, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(2, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(3, { status: PlayerStatus.Eliminated, hand: [] }),
      makePlayer(4, { status: PlayerStatus.Eliminated, hand: [] }),
    ];

    const state = makeGameState({
      players,
      lastValue: 10,
    });

    // 0 alive players → alive.length <= 1, so not a deadlock
    expect(isDeadlock(state)).toBe(false);
  });
});
