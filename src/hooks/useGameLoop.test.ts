// src/hooks/useGameLoop.test.ts — Tests for game loop orchestration hook (STORY-015)
//
// Test cases:
// 1. Skips eliminated players (advanceTurn)
// 2. Sets "Your turn!" message for human player
// 3. After human card play animation completes → post-action + advanceTurn
// 4. Stops when game is finished
// 5. Does not process bots (useBotTurn handles it)
// 6. Handles win condition detection
// 7. Handles deadlock detection
// 8. Does not create infinite loops (ref-guarded)

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../store';
import { useGameLoop } from './useGameLoop';
import {
  CardType,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
  INITIAL_LIVES,
} from '../types';
import type { Card, Player } from '../types';

// ── Helper factories ──────────────────────────────────────────────────────

function numberCard(id: string, value: number): Card {
  return { id, type: CardType.Number, value, effect: null };
}

function createTestPlayers(): Player[] {
  return [
    {
      id: 1,
      name: 'You',
      type: PlayerType.Human,
      hand: [numberCard('c1', 5), numberCard('c2', 8)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 2,
      name: 'Bot 2',
      type: PlayerType.Bot,
      hand: [numberCard('c4', 10)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 3,
      name: 'Bot 3',
      type: PlayerType.Bot,
      hand: [numberCard('c7', 6)],
      lives: 3,
      status: PlayerStatus.Alive,
    },
    {
      id: 4,
      name: 'Bot 4',
      type: PlayerType.Bot,
      hand: [numberCard('c10', 4)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
  ];
}

function resetStore(overrides?: Partial<ReturnType<typeof useGameStore.getState>>) {
  useGameStore.setState({
    players: createTestPlayers(),
    currentPlayerIndex: 0, // Human's turn
    direction: Direction.Clockwise,
    deck: [numberCard('d1', 4), numberCard('d2', 12)],
    middlePile: [numberCard('p1', 7)],
    lastValue: 7,
    gameStatus: GameStatus.Playing,
    winner: null,
    isAnimating: false,
    animationQueue: [],
    turnMessage: '',
    showTitleScreen: false,
    showMessage: '',
    messageQueue: [],
    activeVFX: null,
    vfxPosition: null,
    showGameOver: false,
    isFullscreen: false,
    ...overrides,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets "Your turn!" message for human player', () => {
    resetStore({ currentPlayerIndex: 0 });

    renderHook(() => useGameLoop());

    const msg = useGameStore.getState().turnMessage;
    expect(msg).toBe('Your turn! Play a card');
  });

  it('skips eliminated players automatically', () => {
    // Player at index 1 is eliminated; next alive player is Bot 3 at index 2
    resetStore({
      currentPlayerIndex: 1,
      players: createTestPlayers().map((p, i) =>
        i === 1 ? { ...p, status: PlayerStatus.Eliminated, lives: 0 } : p,
      ),
    });

    renderHook(() => useGameLoop());

    const state = useGameStore.getState();
    // Turn should advance past the eliminated bot to Bot 3 (index 2)
    expect(state.currentPlayerIndex).toBe(2);
  });

  it('skips multiple consecutive eliminated players', () => {
    // Players at index 1 and 2 are eliminated
    resetStore({
      currentPlayerIndex: 1,
      players: createTestPlayers().map((p, i) => {
        if (i === 1 || i === 2) return { ...p, status: PlayerStatus.Eliminated, lives: 0 };
        return p;
      }),
    });

    renderHook(() => useGameLoop());

    const state = useGameStore.getState();
    // Should skip both eliminated players to Bot 4 (index 3)
    expect(state.currentPlayerIndex).toBe(3);
  });

  it('does not process when game is finished', () => {
    resetStore({
      currentPlayerIndex: 0,
      gameStatus: GameStatus.Finished,
      winner: 'You',
    });

    renderHook(() => useGameLoop());

    const state = useGameStore.getState();
    // No message should be set
    expect(state.turnMessage).toBe('');
  });

  it('does not advance turn while animating', () => {
    resetStore({
      currentPlayerIndex: 0,
      isAnimating: true,
    });

    renderHook(() => useGameLoop());

    const state = useGameStore.getState();
    // Player index should not change while animating
    expect(state.currentPlayerIndex).toBe(0);
  });

  it('handles animation completion for human player: runs post-action and advanceTurn', () => {
    // Simulate: human just played, animation ends
    // First render with isAnimating=true, then set it to false
    resetStore({
      currentPlayerIndex: 0,
      isAnimating: true,
    });

    renderHook(() => useGameLoop());

    // Nothing should happen while animating
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);

    // Now end animation
    act(() => {
      useGameStore.setState({ isAnimating: false });
    });

    const state = useGameStore.getState();
    // Should advance to next player (Bot 2 at index 1)
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('checks elimination after human animation ends when lives are 0', () => {
    // Human player has 0 lives (somehow), animation just ended
    resetStore({
      currentPlayerIndex: 0,
      isAnimating: true,
      players: createTestPlayers().map((p, i) =>
        i === 0 ? { ...p, lives: 0 } : p,
      ),
    });

    renderHook(() => useGameLoop());

    act(() => {
      useGameStore.setState({ isAnimating: false });
    });

    const state = useGameStore.getState();
    const human = state.players[0];
    expect(human.status).toBe(PlayerStatus.Eliminated);
  });

  it('detects winner when only one player remains after human elimination', () => {
    // Only human (lives=0) and Bot 2 (alive) remain
    resetStore({
      currentPlayerIndex: 0,
      isAnimating: true,
      players: createTestPlayers().map((p, i) => {
        if (i === 0) return { ...p, lives: 0 };
        if (i === 2 || i === 3) return { ...p, status: PlayerStatus.Eliminated, lives: 0 };
        return p;
      }),
    });

    renderHook(() => useGameLoop());

    act(() => {
      useGameStore.setState({ isAnimating: false });
    });

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Finished);
    expect(state.winner).toBe('Bot 2');
  });

  it('does not process bot turns (bot hook handles it)', () => {
    // Bot 2's turn (index 1)
    resetStore({ currentPlayerIndex: 1 });

    renderHook(() => useGameLoop());

    const state = useGameStore.getState();
    // Turn message should NOT be "Your turn!" since it's a bot
    expect(state.turnMessage).not.toBe('Your turn! Play a card');
    // Player index should not change (bot hasn't acted yet)
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('does not create infinite loops on repeated renders', () => {
    // Human turn — should set message once and not loop
    resetStore({ currentPlayerIndex: 0 });

    const { rerender } = renderHook(() => useGameLoop());

    const msg1 = useGameStore.getState().turnMessage;
    expect(msg1).toBe('Your turn! Play a card');

    // Re-render multiple times
    rerender();
    rerender();
    rerender();

    // Message should remain the same — no repeated processing
    const msg2 = useGameStore.getState().turnMessage;
    expect(msg2).toBe('Your turn! Play a card');
    // Player index should not change
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);
  });

  it('does nothing if isAnimating flag is set but was never true before (initial render)', () => {
    // Edge case: isAnimating is false from the start, prevAnimatingRef is also false
    // This should just set the human message, not run post-action
    resetStore({ currentPlayerIndex: 0, isAnimating: false });

    renderHook(() => useGameLoop());

    const state = useGameStore.getState();
    expect(state.turnMessage).toBe('Your turn! Play a card');
    // Should NOT have advanced the turn (no post-action)
    expect(state.currentPlayerIndex).toBe(0);
  });
});
