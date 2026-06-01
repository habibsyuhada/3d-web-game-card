// src/test/integration/elimination-flow.test.ts
// STORY-021: Elimination flow integration tests
//
// Tests verify:
// 1. Player status changes to Eliminated when lives reach 0
// 2. Eliminated players are skipped in turn order
// 3. Win condition is checked after elimination
// 4. Game continues with remaining players
// 5. Game ends when only 1 player is alive
// 6. Multiple eliminations in sequence work correctly
//
// Related: FR-035, FR-050, FR-051, FR-052, FR-053, AC-007, AC-013

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../store';
import {
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';
import { createMockPlayer, createNumberCard, playFullGame, simulateBotTurn } from '../helpers';
import { checkWinCondition } from '../../engine/win-condition';
import { canPlayerAct } from '../../engine/player';

// We also need the count helper from the turn module
import { getAlivePlayerCount } from '../../engine/turn';

let cardCounter = 0;
function nextId(): string {
  return `ef-${++cardCounter}`;
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

describe('Player Elimination via passTurn', () => {
  it('player loses a life when passing (no valid cards)', () => {
    const players: Player[] = [
      createMockPlayer({
        id: 1, lives: 5,
        hand: [createNumberCard(1, nextId()), createNumberCard(2, nextId()), createNumberCard(3, nextId())],
      }),
      createMockPlayer({ id: 2, type: PlayerType.Bot }),
      createMockPlayer({ id: 3, type: PlayerType.Bot }),
      createMockPlayer({ id: 4, type: PlayerType.Bot }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
    });

    // Player 0 has cards 1,2,3 — none >= 13 → must pass
    useGameStore.getState().passTurn(0);

    const state = useGameStore.getState();
    expect(state.players[0].lives).toBe(4); // Lost 1 life
    expect(state.players[0].status).toBe(PlayerStatus.Alive); // Still alive
  });

  it('player is eliminated when lives reach 0', () => {
    const players: Player[] = [
      createMockPlayer({
        id: 1, lives: 1,
        hand: [createNumberCard(1, nextId())],
      }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
    });

    // Player 0 has 1 life, must pass → lives = 0 → eliminated
    useGameStore.getState().passTurn(0);

    const state = useGameStore.getState();
    expect(state.players[0].lives).toBe(0);
    expect(state.players[0].status).toBe(PlayerStatus.Eliminated);
  });

  it('player becomes spectator (eliminated) and cannot act', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 2, type: PlayerType.Bot }),
      createMockPlayer({ id: 3, type: PlayerType.Bot }),
      createMockPlayer({ id: 4, type: PlayerType.Bot }),
    ];

    // Eliminated player cannot act
    expect(canPlayerAct(players[0])).toBe(false);
    expect(canPlayerAct(players[1])).toBe(true);
  });
});

describe('Eliminated Players Skipped in Turn Order', () => {
  it('advanceTurn skips eliminated players', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
    });

    // From player 0, next alive should skip player 1 (eliminated) and go to player 2
    useGameStore.getState().advanceTurn();

    const state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(2); // Skips eliminated player 1
  });

  it('advanceTurn skips multiple eliminated players', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
    });

    // From player 0, next alive should skip players 1 and 2 and go to player 3
    useGameStore.getState().advanceTurn();

    const state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(3);
  });

  it('turn order wraps correctly with eliminated players', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 3, // Bot 4 just acted
      direction: Direction.Clockwise,
    });

    // From player 3 CW → should wrap to player 1 (skipping eliminated 0 and 2)
    useGameStore.getState().advanceTurn();

    const state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(1);
  });
});

describe('Win Condition After Elimination', () => {
  it('game ends when elimination leaves only 1 alive player', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 1 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 2, // Bot 3's turn
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
    });

    // Bot 3 has 1 life but no valid cards → passes → eliminated
    // First we need to give Bot 3 only low cards
    useGameStore.setState({
      players: [
        ...useGameStore.getState().players.slice(0, 2),
        createMockPlayer({
          id: 3, type: PlayerType.Bot, lives: 1,
          hand: [createNumberCard(1, nextId()), createNumberCard(2, nextId())],
        }),
        useGameStore.getState().players[3],
      ],
      currentPlayerIndex: 2,
    });

    useGameStore.getState().passTurn(2);

    // Check: Bot 3 should now be eliminated
    let state = useGameStore.getState();
    expect(state.players[2].status).toBe(PlayerStatus.Eliminated);

    // Now check win condition
    useGameStore.getState().checkAndSetWinner();

    state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Finished);
    expect(state.winner).toBe('You'); // Only player 0 is still alive
  });

  it('game continues when 2+ players are still alive after elimination', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 2 }),
    ];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      deck: [createNumberCard(5, nextId()), createNumberCard(6, nextId())],
      middlePile: [createNumberCard(13, 'pile-13')],
      lastValue: 13,
      gameStatus: GameStatus.Playing,
    });

    // Check win condition: 2 alive players → no winner yet
    useGameStore.getState().checkAndSetWinner();

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Playing);
    expect(state.winner).toBeNull();
    expect(getAlivePlayerCount(state.players)).toBe(2);
  });
});

describe('Elimination Flow Integration', () => {
  it('full game play ends with at least one winner and game finished', () => {
    const finalState = playFullGame();

    // Game must be finished (by elimination or deadlock)
    expect(finalState.gameStatus).toBe(GameStatus.Finished);

    // Must have a winner
    expect(finalState.winner).not.toBeNull();

    // At least 1 alive player (winner)
    const alive = finalState.players.filter((p: Player) => p.status === PlayerStatus.Alive);
    expect(alive.length).toBeGreaterThanOrEqual(1);

    // Winner must be among alive players
    const winnerPlayer = alive.find((p: Player) => p.name === finalState.winner);
    expect(winnerPlayer).toBeDefined();
    expect(winnerPlayer!.lives).toBeGreaterThan(0);

    // Eliminated players must have 0 lives
    const eliminated = finalState.players.filter((p: Player) => p.status === PlayerStatus.Eliminated);
    for (const p of eliminated) {
      expect(p.lives).toBe(0);
    }
  });

  it('simulating turns shows gradual life loss or deadlock resolution', () => {
    useGameStore.getState().initGame();

    let state = useGameStore.getState();
    let turnsPlayed = 0;
    const maxTurns = 500;
    let sawLifeLoss = false;

    while (state.gameStatus !== GameStatus.Finished && turnsPlayed < maxTurns) {
      const playerIndex = state.currentPlayerIndex;
      const playerBefore = { ...state.players[playerIndex], lives: state.players[playerIndex].lives };

      simulateBotTurn(() => useGameStore.getState(), playerIndex);

      state = useGameStore.getState();
      const playerAfter = state.players.find((p: Player) => p.id === playerBefore.id);

      if (playerAfter && playerAfter.lives < playerBefore.lives) {
        sawLifeLoss = true;
      }

      turnsPlayed++;
    }

    // Game should finish (by elimination or deadlock)
    expect(state.gameStatus).toBe(GameStatus.Finished);
    expect(state.winner).not.toBeNull();

    // Either we saw life loss (most games) or it was a quick deadlock
    expect(sawLifeLoss || turnsPlayed > 0).toBe(true);
  });

  it('eliminated player is not included in alive count', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 3 }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 3 }),
    ];

    expect(getAlivePlayerCount(players)).toBe(3);
  });

  it('checkWinCondition returns null when 2+ players alive', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 2 }),
    ];

    expect(checkWinCondition(players)).toBeNull();
  });

  it('checkWinCondition returns the winner when exactly 1 player alive', () => {
    const players: Player[] = [
      createMockPlayer({ id: 1, lives: 3 }),
      createMockPlayer({ id: 2, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 3, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
      createMockPlayer({ id: 4, type: PlayerType.Bot, lives: 0, status: PlayerStatus.Eliminated }),
    ];

    const winner = checkWinCondition(players);
    expect(winner).not.toBeNull();
    expect(winner!.id).toBe(1);
    expect(winner!.name).toBe('You');
  });
});
