// src/hooks/useBotTurn.test.ts — Tests for bot turn hook (STORY-015)
//
// Test cases:
// 1. Bot calls decideBotPlay after BOT_TURN_DELAY_MS
// 2. Bot plays correct card based on decision
// 3. Bot passes (loses life) when no valid cards
// 4. Timeout is cleaned up on turn change
// 5. Does nothing when game is finished
// 6. Does nothing when bot is eliminated
// 7. Waits for isAnimating to be false
// 8. After bot play animations complete → advanceTurn
// 9. After bot pass → checks elimination/winner and advanceTurn
// 10. Sets "thinking..." message at start of bot turn

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../store';
import { useBotTurn } from './useBotTurn';
import {
  CardType,
  SpecialEffect,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
  INITIAL_LIVES,
  BOT_TURN_DELAY_MS,
} from '../types';
import type { Card, Player } from '../types';

// ── Helper factories ──────────────────────────────────────────────────────

function numberCard(id: string, value: number): Card {
  return { id, type: CardType.Number, value, effect: null };
}

function specialCard(id: string, effect: SpecialEffect): Card {
  return { id, type: CardType.Special, value: null, effect };
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
      hand: [numberCard('c4', 3), numberCard('c5', 10), numberCard('c6', 12)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 3,
      name: 'Bot 3',
      type: PlayerType.Bot,
      hand: [numberCard('c7', 2), numberCard('c8', 1)],
      lives: 3,
      status: PlayerStatus.Alive,
    },
    {
      id: 4,
      name: 'Bot 4',
      type: PlayerType.Bot,
      hand: [numberCard('c10', 4), specialCard('c11', SpecialEffect.Skip)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
  ];
}

function resetStore(overrides?: Partial<ReturnType<typeof useGameStore.getState>>) {
  useGameStore.setState({
    players: createTestPlayers(),
    currentPlayerIndex: 1, // Bot 2's turn
    direction: Direction.Clockwise,
    deck: [numberCard('d1', 4), numberCard('d2', 12), numberCard('d3', 7)],
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

describe('useBotTurn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets "thinking..." message immediately when it is bot turn', () => {
    // Bot 2 (index 1) has cards: 3, 10, 12 — lastValue=7
    // Only 10 and 12 are playable
    renderHook(() => useBotTurn());

    const msg = useGameStore.getState().turnMessage;
    expect(msg).toBe('Bot 2 is thinking...');
  });

  it('plays the smallest valid card after BOT_TURN_DELAY_MS', () => {
    // Bot 2 hand: [3, 10, 12], lastValue=7 → smallest valid = 10 (c5)
    renderHook(() => useBotTurn());

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    // Bot should have played card c5 (value 10)
    const bot2 = state.players[1];
    expect(bot2.hand.some((c) => c.id === 'c5')).toBe(false); // card removed from hand
    expect(state.lastValue).toBe(10); // pile value updated
    expect(state.turnMessage).toBe('Bot 2 played a card');
  });

  it('calls drawCard after playing a card', () => {
    const deckBefore = useGameStore.getState().deck.length;
    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const deckAfter = useGameStore.getState().deck.length;
    // Deck should decrease by 1 (card drawn)
    expect(deckAfter).toBe(deckBefore - 1);
  });

  it('enqueues card-play animation after bot plays', () => {
    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    // Animation queue should have at least one card-play animation
    expect(state.animationQueue.length).toBeGreaterThanOrEqual(1);
    expect(state.animationQueue[0].type).toBe('card-play');
    expect(state.isAnimating).toBe(true);
  });

  it('passes (loses life) when bot has no valid cards', () => {
    // Bot 3 (index 2) hand: [2, 1], lastValue=7 → no valid number cards, no specials
    resetStore({ currentPlayerIndex: 2 });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    const bot3 = state.players[2];
    // Should have lost 1 life (3 → 2)
    expect(bot3.lives).toBe(2);
    // After pass, advanceTurn moves to Bot 4 (index 3), which starts thinking
    // The immediate post-pass message before advance was "lost a life"
    // After advance, Bot 4 starts thinking, so check that turn advanced
    expect(state.currentPlayerIndex).toBe(3);
  });

  it('passes (loses life) when bot has empty hand', () => {
    // Give bot an empty hand
    resetStore({
      currentPlayerIndex: 1,
      players: createTestPlayers().map((p, i) =>
        i === 1 ? { ...p, hand: [] } : p,
      ),
    });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    const bot2 = state.players[1];
    expect(bot2.lives).toBe(INITIAL_LIVES - 1);
  });

  it('advances turn after bot pass (life loss)', () => {
    // Bot 3 (index 2) passes. Next alive player is Bot 4 (index 3).
    resetStore({ currentPlayerIndex: 2 });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    // Turn should advance to Bot 4 (index 3)
    expect(state.currentPlayerIndex).toBe(3);
  });

  it('cleans up timeout when turn changes', () => {
    const { unmount } = renderHook(() => useBotTurn());

    // Change the turn before the timeout fires
    act(() => {
      useGameStore.setState({ currentPlayerIndex: 0 });
    });

    // Advance past the original delay — no action should fire
    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    // Bot 2 should not have lost a life or played a card
    const state = useGameStore.getState();
    expect(state.players[1].hand.length).toBe(3); // hand unchanged
    unmount();
  });

  it('does nothing when game is finished', () => {
    resetStore({ gameStatus: GameStatus.Finished });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    // No changes to bot 2's hand
    expect(state.players[1].hand.length).toBe(3);
    expect(state.turnMessage).toBe(''); // no message set
  });

  it('does nothing when bot is eliminated', () => {
    // Bot 2 is eliminated
    resetStore({
      players: createTestPlayers().map((p, i) =>
        i === 1 ? { ...p, status: PlayerStatus.Eliminated, lives: 0 } : p,
      ),
    });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    // No message set (hook should have skipped)
    const state = useGameStore.getState();
    expect(state.turnMessage).toBe('');
  });

  it('waits for isAnimating to finish before acting', () => {
    // Start with isAnimating=true
    resetStore({ isAnimating: true });

    renderHook(() => useBotTurn());

    // No thinking message yet
    expect(useGameStore.getState().turnMessage).toBe('');

    // Advance timer — nothing should happen yet (animating)
    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    expect(useGameStore.getState().turnMessage).toBe('');

    // Now set isAnimating to false — next effect should start the bot
    act(() => {
      useGameStore.setState({ isAnimating: false });
    });

    // Now the "thinking" message should appear
    expect(useGameStore.getState().turnMessage).toBe('Bot 2 is thinking...');
  });

  it('eliminates player when lives reach 0 after pass', () => {
    // Bot 3 with 1 life — if they pass, they should be eliminated
    resetStore({
      currentPlayerIndex: 2,
      players: createTestPlayers().map((p, i) =>
        i === 2 ? { ...p, lives: 1 } : p,
      ),
    });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    const bot3 = state.players[2];
    expect(bot3.lives).toBe(0);
    expect(bot3.status).toBe(PlayerStatus.Eliminated);
  });

  it('sets winner when only one player remains after elimination', () => {
    // 3 bots eliminated, only human alive — set up via bot 3 losing last life
    resetStore({
      currentPlayerIndex: 2,
      players: createTestPlayers().map((p, i) => {
        if (i === 1) return { ...p, status: PlayerStatus.Eliminated, lives: 0, hand: [] };
        if (i === 2) return { ...p, lives: 1, hand: [] };
        if (i === 3) return { ...p, status: PlayerStatus.Eliminated, lives: 0, hand: [] };
        return p;
      }),
    });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    expect(state.gameStatus).toBe(GameStatus.Finished);
    expect(state.winner).toBe('You');
  });

  it('does not act when current player is human', () => {
    // Human's turn
    resetStore({ currentPlayerIndex: 0 });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    // Human's hand should be unchanged
    const state = useGameStore.getState();
    expect(state.players[0].hand.length).toBe(2);
    // No thinking message for human
    expect(state.turnMessage).toBe('');
  });

  it('plays special card when no valid number cards exist', () => {
    // Bot 4 (index 3) has: [4, Skip], lastValue=7
    // 4 < 7 not playable, Skip is special → should play Skip
    resetStore({ currentPlayerIndex: 3 });

    renderHook(() => useBotTurn());

    act(() => {
      vi.advanceTimersByTime(BOT_TURN_DELAY_MS);
    });

    const state = useGameStore.getState();
    const bot4 = state.players[3];
    // Skip card should be removed from hand
    expect(bot4.hand.some((c) => c.id === 'c11')).toBe(false);
  });
});
