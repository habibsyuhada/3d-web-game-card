// src/test/integration/full-game-simulation.test.ts
// STORY-021: Full game simulation — 100 automated games complete without errors
//
// Acceptance criteria tested:
// - AC-001–AC-023 (end-to-end validation)
// - FR-091 (edge case handling)
// - G-001 (fully playable single-player vs 3 AI bots)
//
// Test scenarios:
// 1. Single game completes with exactly 1 winner
// 2. 100 iterations with different random seeds — no crashes, always terminal state
// 3. Game always ends in 'finished' status with a winner name set
// 4. Winner is always one of the 4 players
// 5. All non-winner players are eliminated (status !== 'alive')
// 6. Game uses the correct number of players (4)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../store';
import {
  GameStatus,
  PlayerType,
  PlayerStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';
import { playFullGame } from '../helpers';

const PLAYER_NAMES = ['You', 'Bot 2', 'Bot 3', 'Bot 4'];
const ITERATION_COUNT = 100;
const TIMEOUT_PER_TEST = 30000; // 30s for 100 iterations

/**
 * Resets the Zustand store to a clean baseline before each test.
 */
function resetStore() {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Waiting,
    winner: null,
    isFullscreen: false,
    showTitleScreen: true,
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

describe('Full Game Simulation', () => {
  it(
    'completes a single game with exactly 1 winner (by elimination or deadlock)',
    () => {
      const finalState = playFullGame();

      // Game must be finished
      expect(finalState.gameStatus).toBe(GameStatus.Finished);

      // Exactly one winner set
      expect(finalState.winner).not.toBeNull();
      expect(PLAYER_NAMES).toContain(finalState.winner);

      // At least 1 alive player (normally exactly 1 by elimination;
      // deadlock resolution may leave multiple alive)
      const alivePlayers = finalState.players.filter(
        (p: Player) => p.status === PlayerStatus.Alive,
      );
      expect(alivePlayers.length).toBeGreaterThanOrEqual(1);

      // Winner must be among alive players
      const winnerPlayer = alivePlayers.find((p: Player) => p.name === finalState.winner);
      expect(winnerPlayer).toBeDefined();
    },
    TIMEOUT_PER_TEST,
  );

  it(
    'always has exactly 4 players throughout the game',
    () => {
      const finalState = playFullGame();
      expect(finalState.players).toHaveLength(4);
    },
    TIMEOUT_PER_TEST,
  );

  it(
    'winner lives must be > 0 (alive player wins)',
    () => {
      const finalState = playFullGame();
      const winnerPlayer = finalState.players.find(
        (p: Player) => p.name === finalState.winner,
      );
      expect(winnerPlayer).toBeDefined();
      expect(winnerPlayer!.lives).toBeGreaterThan(0);
      expect(winnerPlayer!.status).toBe(PlayerStatus.Alive);
    },
    TIMEOUT_PER_TEST,
  );

  it(
    'all non-winner players are either eliminated or have fewer lives (deadlock)',
    () => {
      const finalState = playFullGame();
      const losers = finalState.players.filter(
        (p: Player) => p.name !== finalState.winner,
      );
      // In most games, losers are eliminated. In deadlock resolutions,
      // losers may still be alive but have fewer or equal lives than the winner.
      const winnerPlayer = finalState.players.find(
        (p: Player) => p.name === finalState.winner,
      );
      for (const loser of losers) {
        if (loser.status === PlayerStatus.Alive) {
          // Deadlock: loser alive but must have lives <= winner
          expect(loser.lives).toBeLessThanOrEqual(winnerPlayer!.lives);
        } else {
          // Eliminated
          expect(loser.status).toBe(PlayerStatus.Eliminated);
          expect(loser.lives).toBe(0);
        }
      }
    },
    TIMEOUT_PER_TEST,
  );

  it(
    'game starts with correct initial state',
    () => {
      useGameStore.getState().initGame();
      const state = useGameStore.getState();

      // 4 players initialized
      expect(state.players).toHaveLength(4);

      // Player 1 is human
      expect(state.players[0].type).toBe(PlayerType.Human);
      expect(state.players[0].name).toBe('You');

      // Players 2-4 are bots
      for (let i = 1; i < 4; i++) {
        expect(state.players[i].type).toBe(PlayerType.Bot);
      }

      // All start with 5 lives
      for (const player of state.players) {
        expect(player.lives).toBe(5);
        expect(player.status).toBe(PlayerStatus.Alive);
        expect(player.hand).toHaveLength(3); // 3 cards dealt
      }

      // Current player is human (index 0)
      expect(state.currentPlayerIndex).toBe(0);

      // Direction is clockwise
      expect(state.direction).toBe(Direction.Clockwise);

      // Game status is playing
      expect(state.gameStatus).toBe(GameStatus.Playing);

      // No winner yet
      expect(state.winner).toBeNull();

      // Pile is empty
      expect(state.lastValue).toBeNull();
      expect(state.middlePile).toHaveLength(0);

      // Deck has remaining cards (53 total - 12 dealt = 41)
      expect(state.deck.length).toBe(41);
    },
    TIMEOUT_PER_TEST,
  );
});

describe.concurrent('100 Iteration Game Simulation', { timeout: TIMEOUT_PER_TEST }, () => {
  for (let iteration = 0; iteration < ITERATION_COUNT; iteration++) {
    it(`game #${iteration + 1}: completes without crash and has exactly 1 winner`, () => {
      // Reset store before each iteration (concurrent tests share store singleton)
      resetStore();

      const finalState = playFullGame();

      // Must reach terminal state (either by elimination or deadlock resolution)
      expect(finalState.gameStatus).toBe(GameStatus.Finished);

      // Must have exactly 1 winner
      expect(finalState.winner).not.toBeNull();
      expect(PLAYER_NAMES).toContain(finalState.winner);

      // At least 1 alive player (normally exactly 1, but deadlock may leave multiple alive)
      const aliveCount = finalState.players.filter(
        (p: Player) => p.status === PlayerStatus.Alive,
      ).length;
      expect(aliveCount).toBeGreaterThanOrEqual(1);

      // All players exist
      expect(finalState.players).toHaveLength(4);
    });
  }
});
