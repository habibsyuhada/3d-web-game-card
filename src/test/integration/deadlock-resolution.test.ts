// src/test/integration/deadlock-resolution.test.ts
// STORY-021: Deadlock resolution integration tests
//
// Tests verify:
// 1. Deadlock is correctly detected when all alive players have no valid cards
// 2. resolveDeadlock picks the player with the most lives
// 3. Tie-breaker by lowest player index
// 4. Deadlock sets gameStatus to Finished and winner correctly
// 5. Deadlock is NOT triggered when only 1 player is alive (that's a win)
//
// Related: FR-092, AC-023

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../store';
import {
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';
import { createMockPlayer, createNumberCard } from '../helpers';
import { isDeadlock, resolveDeadlock } from '../../engine/win-condition';
import type { GameState } from '../../types';

let cardCounter = 0;
function nextId(): string {
  return `dc-${++cardCounter}`;
}

function resetStore() {
  cardCounter = 0;
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Playing,
    winner: null,
    isFullscreen: false,
    showTitleScreen: false,
    turnMessage: '',
    showGameOver: false,
    showMessage: '',
    messageQueue: [],
    isAnimating: false,
    animationQueue: [],
    activeVFX: null,
    vfxPosition: null,
  });
}

beforeEach(() => {
  resetStore();
});

afterEach(() => {
  resetStore();
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Deadlock Detection', () => {
  it('detects deadlock when all alive players have cards lower than pile value', () => {
    // All players have cards with value < 13, pile value is 13
    const players: Player[] = [
      createMockPlayer({ id: 1, hand: [createNumberCard(1, nextId()), createNumberCard(2, nextId()), createNumberCard(3, nextId())] }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, hand: [createNumberCard(4, nextId()), createNumberCard(5, nextId()), createNumberCard(6, nextId())] }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, hand: [createNumberCard(7, nextId()), createNumberCard(8, nextId()), createNumberCard(9, nextId())] }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, hand: [createNumberCard(10, nextId()), createNumberCard(11, nextId()), createNumberCard(12, nextId())] }),
    ];

    const state: GameState = {
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: [],
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
      gameStatus: GameStatus.Playing,
      winner: null,
    };

    expect(isDeadlock(state)).toBe(true);
  });

  it('does NOT detect deadlock when any player has a valid card', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, hand: [createNumberCard(1, nextId()), createNumberCard(2, nextId()), createNumberCard(13, nextId())] }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, hand: [createNumberCard(4, nextId()), createNumberCard(5, nextId()), createNumberCard(6, nextId())] }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, hand: [createNumberCard(7, nextId()), createNumberCard(8, nextId()), createNumberCard(9, nextId())] }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, hand: [createNumberCard(1, nextId()), createNumberCard(2, nextId()), createNumberCard(3, nextId())] }),
    ];

    const state: GameState = {
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: [],
      middlePile: [createNumberCard(12, 'pile-12')],
      lastValue: 12,
      gameStatus: GameStatus.Playing,
      winner: null,
    };

    expect(isDeadlock(state)).toBe(false);
  });

  it('does NOT detect deadlock when only 1 player is alive (that is a win)', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
    ];

    const state: GameState = {
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: [],
      middlePile: [],
      lastValue: null,
      gameStatus: GameStatus.Playing,
      winner: null,
    };

    expect(isDeadlock(state)).toBe(false);
  });

  it('detects deadlock when alive players have empty hands', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, hand: [] }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, hand: [] }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
    ];

    const state: GameState = {
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: [],
      middlePile: [createNumberCard(10, 'pile-10')],
      lastValue: 10,
      gameStatus: GameStatus.Playing,
      winner: null,
    };

    // Both alive players have empty hands → deadlock
    expect(isDeadlock(state)).toBe(true);
  });
});

describe('Deadlock Resolution', () => {
  it('resolveDeadlock picks the player with the most lives', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 2 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 4 }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 1 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(2); // Most lives (4)
    expect(winner!.lives).toBe(4);
  });

  it('resolveDeadlock tie-breaks by lowest player index', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(1); // Lowest id wins tie
  });

  it('resolveDeadlock ignores eliminated players', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 5, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 2, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 1 }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(3); // Player 3 alive with most lives (3)
  });

  it('resolveDeadlock returns null when no alive players exist', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
    ];

    const winner = resolveDeadlock(players);
    expect(winner).toBeNull();
  });
});

describe('Deadlock via Store Action', () => {
  it('store resolveDeadlock sets winner and game status to Finished', () => {
    // Setup: deadlock state — all alive players have no valid cards
    const players: Player[] = [
      createMockPlayer({
        id: 1,
        lives: 3,
        hand: [createNumberCard(1, nextId()), createNumberCard(2, nextId()), createNumberCard(3, nextId())],
      }),
      createMockPlayer({
        id: 2,
        name: 'Bot 2',
        type: PlayerType.Bot,
        lives: 4,
        hand: [createNumberCard(4, nextId()), createNumberCard(5, nextId()), createNumberCard(6, nextId())],
      }),
      createMockPlayer({
        id: 3,
        name: 'Bot 3',
        type: PlayerType.Bot,
        lives: 2,
        hand: [createNumberCard(7, nextId()), createNumberCard(8, nextId()), createNumberCard(9, nextId())],
      }),
      createMockPlayer({
        id: 4,
        name: 'Bot 4',
        type: PlayerType.Bot,
        lives: 0,
        status: PlayerStatus.Eliminated,
        hand: [],
      }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      deck: [],
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
      gameStatus: GameStatus.Playing,
    });

    // Resolve deadlock via store action
    useGameStore.getState().resolveDeadlock();

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Finished);
    expect(state.winner).toBe('Bot 2'); // Most lives among alive (4 lives)
  });

  it('store resolveDeadlock does nothing when not actually deadlocked', () => {
    // Setup: NOT a deadlock — player 1 has a card >= pile value
    const players: Player[] = [
      createMockPlayer({
        id: 1,
        lives: 3,
        hand: [createNumberCard(13, nextId()), createNumberCard(2, nextId()), createNumberCard(3, nextId())],
      }),
      createMockPlayer({
        id: 2,
        name: 'Bot 2',
        type: PlayerType.Bot,
        lives: 4,
        hand: [createNumberCard(4, nextId()), createNumberCard(5, nextId()), createNumberCard(6, nextId())],
      }),
      createMockPlayer({
        id: 3,
        name: 'Bot 3',
        type: PlayerType.Bot,
        lives: 2,
        hand: [createNumberCard(7, nextId()), createNumberCard(8, nextId()), createNumberCard(9, nextId())],
      }),
      createMockPlayer({
        id: 4,
        name: 'Bot 4',
        type: PlayerType.Bot,
        lives: 1,
        hand: [createNumberCard(10, nextId()), createNumberCard(11, nextId()), createNumberCard(12, nextId())],
      }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      deck: [],
      middlePile: [createNumberCard(12, 'pile-12')],
      lastValue: 12,
      gameStatus: GameStatus.Playing,
    });

    // Should NOT resolve deadlock (player 1 has card value 13 >= 12)
    useGameStore.getState().resolveDeadlock();

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Playing);
    expect(state.winner).toBeNull();
  });

  it('deadlock with tie-breaker: same lives, lowest index wins', () => {
    const players: Player[] = [
      createMockPlayer({
        id: 1,
        lives: 2,
        hand: [createNumberCard(1, nextId()), createNumberCard(1, nextId())],
      }),
      createMockPlayer({
        id: 2,
        name: 'Bot 2',
        type: PlayerType.Bot,
        lives: 2,
        hand: [createNumberCard(1, nextId()), createNumberCard(1, nextId())],
      }),
      createMockPlayer({
        id: 3,
        name: 'Bot 3',
        type: PlayerType.Bot,
        lives: 0,
        status: PlayerStatus.Eliminated,
        hand: [],
      }),
      createMockPlayer({
        id: 4,
        name: 'Bot 4',
        type: PlayerType.Bot,
        lives: 0,
        status: PlayerStatus.Eliminated,
        hand: [],
      }),
    ];

    useGameStore.setState({
      players,
      deck: [],
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
      gameStatus: GameStatus.Playing,
    });

    useGameStore.getState().resolveDeadlock();

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Finished);
    expect(state.winner).toBe('You'); // Lowest index with tied lives
  });
});
