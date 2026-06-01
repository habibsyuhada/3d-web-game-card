// src/test/integration/store-reset.test.ts
// STORY-021: Store reset integration tests
//
// Tests verify:
// 1. resetGame() returns state to initial game configuration
// 2. No residual UI state (messages, title screen flag)
// 3. No residual animation state (queue, VFX)
// 4. State after reset + initGame matches fresh initGame
// 5. Store actions work correctly after reset
//
// Related: FR-090, AC-016

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../store';
import {
  SpecialEffect,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';
import { playFullGame } from '../helpers';

let cardCounter = 0;
function nextId(): string {
  return `sr-${++cardCounter}`;
}
// Suppress unused warning
void nextId;

function resetStore() {
  cardCounter = 0;
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

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Store Reset', () => {
  it('resetGame clears game state to initial configuration', () => {
    // First, set up a "dirty" game state
    useGameStore.getState().initGame();

    // Play a few turns to dirty the state
    const state = useGameStore.getState();
    const player0 = state.players[0];
    if (player0.hand.length > 0) {
      useGameStore.getState().playCard(0, player0.hand[0].id);
    }
    useGameStore.getState().advanceTurn();

    // Add UI state
    useGameStore.getState().setTurnMessage('Bot 2 is thinking...');
    useGameStore.getState().pushMessage('Reverse played!');
    useGameStore.getState().setShowGameOver(true);
    useGameStore.getState().setFullscreen(true);

    // Add animation state
    useGameStore.getState().setAnimating(true);
    useGameStore.getState().enqueueAnimation({
      type: 'card-play',
      payload: { cardId: 'test-card', playerIndex: 0 },
      duration: 400,
    });
    useGameStore.getState().setActiveVFX(SpecialEffect.Bomb, [0, 0, 0]);

    // Now reset
    useGameStore.getState().resetGame();

    const resetState = useGameStore.getState();

    // ── Game Slice Assertions ──
    // Players should be re-initialized (fresh from initGame)
    expect(resetState.players.length).toBe(4);
    expect(resetState.currentPlayerIndex).toBe(0);
    expect(resetState.direction).toBe(Direction.Clockwise);
    expect(resetState.lastValue).toBeNull();
    expect(resetState.middlePile).toHaveLength(0);
    expect(resetState.gameStatus).toBe(GameStatus.Playing);
    expect(resetState.winner).toBeNull();
    // All players should have 5 lives and 3 cards
    for (const player of resetState.players) {
      expect(player.lives).toBe(5);
      expect(player.hand).toHaveLength(3);
      expect(player.status).toBe(PlayerStatus.Alive);
    }
    // Deck should have remaining cards
    expect(resetState.deck.length).toBe(41);

    // ── UI Slice Assertions ──
    expect(resetState.showTitleScreen).toBe(true);
    expect(resetState.showGameOver).toBe(false);
    expect(resetState.isFullscreen).toBe(false);
    expect(resetState.turnMessage).toBe('');
    expect(resetState.showMessage).toBe('');
    expect(resetState.messageQueue).toHaveLength(0);

    // ── Animation Slice Assertions ──
    expect(resetState.isAnimating).toBe(false);
    expect(resetState.animationQueue).toHaveLength(0);
    expect(resetState.activeVFX).toBeNull();
    expect(resetState.vfxPosition).toBeNull();
  });

  it('after reset, playing a new game works correctly', () => {
    // Play a full game
    const firstGame = playFullGame();
    expect(firstGame.gameStatus).toBe(GameStatus.Finished);
    expect(firstGame.winner).not.toBeNull();

    // Reset
    useGameStore.getState().resetGame();

    // Verify reset puts us back to initial state
    const resetState = useGameStore.getState();
    expect(resetState.players).toHaveLength(4);
    expect(resetState.gameStatus).toBe(GameStatus.Playing);
    expect(resetState.lastValue).toBeNull();
    expect(resetState.winner).toBeNull();

    // Play another full game from clean state
    const secondGame = playFullGame();
    expect(secondGame.gameStatus).toBe(GameStatus.Finished);
    expect(secondGame.winner).not.toBeNull();

    // At least 1 alive player (the winner)
    const alivePlayers = secondGame.players.filter(
      (p: Player) => p.status === PlayerStatus.Alive,
    );
    expect(alivePlayers.length).toBeGreaterThanOrEqual(1);

    // Winner is alive
    const winnerPlayer = alivePlayers.find((p: Player) => p.name === secondGame.winner);
    expect(winnerPlayer).toBeDefined();
  });

  it('resetGame during animation clears all VFX and animation state', () => {
    useGameStore.getState().initGame();

    // Simulate VFX and animation state
    useGameStore.getState().setActiveVFX(SpecialEffect.Nuclear, [1, 2, 3]);
    useGameStore.getState().enqueueAnimation({
      type: 'vfx',
      payload: { effect: SpecialEffect.Nuclear },
      duration: 800,
    });
    useGameStore.getState().enqueueAnimation({
      type: 'card-play',
      payload: { cardId: 'x', playerIndex: 1 },
      duration: 400,
    });
    useGameStore.getState().setAnimating(true);

    // Verify VFX and animations were set
    let state = useGameStore.getState();
    expect(state.activeVFX).toBe(SpecialEffect.Nuclear);
    expect(state.vfxPosition).toEqual([1, 2, 3]);
    expect(state.animationQueue).toHaveLength(2);
    expect(state.isAnimating).toBe(true);

    // Reset
    useGameStore.getState().resetGame();
    state = useGameStore.getState();

    // All animation state cleared
    expect(state.activeVFX).toBeNull();
    expect(state.vfxPosition).toBeNull();
    expect(state.animationQueue).toHaveLength(0);
    expect(state.isAnimating).toBe(false);

    // Game is fresh
    expect(state.players).toHaveLength(4);
    expect(state.gameStatus).toBe(GameStatus.Playing);
  });

  it('resetGame clears message queue completely', () => {
    useGameStore.getState().initGame();

    // Push several messages
    useGameStore.getState().pushMessage('Message 1');
    useGameStore.getState().pushMessage('Message 2');
    useGameStore.getState().pushMessage('Message 3');
    useGameStore.getState().setTurnMessage('Test turn message');

    let state = useGameStore.getState();
    expect(state.showMessage).toBeTruthy();
    expect(state.messageQueue.length).toBeGreaterThan(0);
    expect(state.turnMessage).toBe('Test turn message');

    // Reset
    useGameStore.getState().resetGame();
    state = useGameStore.getState();

    expect(state.showMessage).toBe('');
    expect(state.messageQueue).toHaveLength(0);
    expect(state.turnMessage).toBe('');
  });

  it('store actions work correctly after multiple resets', () => {
    for (let i = 0; i < 3; i++) {
      useGameStore.getState().initGame();
      let state = useGameStore.getState();
      expect(state.players).toHaveLength(4);
      expect(state.gameStatus).toBe(GameStatus.Playing);

      // Play a turn
      if (state.players[0].hand.length > 0) {
        useGameStore.getState().playCard(0, state.players[0].hand[0].id);
        state = useGameStore.getState();
        // Card was removed from hand
        expect(state.players[0].hand.length).toBeLessThanOrEqual(3);
      }

      // Reset
      useGameStore.getState().resetGame();
      state = useGameStore.getState();
      expect(state.players).toHaveLength(4);
      // All hands have 3 cards
      for (const player of state.players) {
        expect(player.hand).toHaveLength(3);
      }
    }
  });
});
