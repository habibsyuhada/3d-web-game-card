// src/hooks/useCardInteraction.test.ts — Tests for card interaction hook (STORY-012)
//
// Test cases:
// 1. playableCardIds returns correct set from playable cards
// 2. handleCardTap dispatches playCard + drawCard for valid card
// 3. handleCardTap does nothing when not human turn
// 4. handleCardTap does nothing when card not playable
// 5. handleCardTap does nothing when isAnimating is true
// 6. handleCardTap does nothing when playerIndex ≠ currentPlayerIndex
// 7. handleCardTap sets the turn message

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../store';
import { useCardInteraction } from './useCardInteraction';
import {
  CardType,
  SpecialEffect,
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

function specialCard(id: string, effect: SpecialEffect): Card {
  return { id, type: CardType.Special, value: null, effect };
}

function createTestPlayers(): Player[] {
  return [
    {
      id: 1,
      name: 'You',
      type: PlayerType.Human,
      hand: [numberCard('c1', 5), numberCard('c2', 8), specialCard('c3', SpecialEffect.Bomb)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 2,
      name: 'Bot 2',
      type: PlayerType.Bot,
      hand: [numberCard('c4', 3), numberCard('c5', 10), numberCard('c6', 1)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 3,
      name: 'Bot 3',
      type: PlayerType.Bot,
      hand: [numberCard('c7', 6), numberCard('c8', 9), numberCard('c9', 11)],
      lives: 3,
      status: PlayerStatus.Alive,
    },
    {
      id: 4,
      name: 'Bot 4',
      type: PlayerType.Bot,
      hand: [numberCard('c10', 2), numberCard('c11', 7), numberCard('c12', 13)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
  ];
}

function resetStore() {
  useGameStore.setState({
    players: createTestPlayers(),
    currentPlayerIndex: 0,
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
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetStore();
});

describe('useCardInteraction — playableCardIds', () => {
  it('returns correct set of playable cards for player 0 (human)', () => {
    // lastValue=7, hand=[5, 8, Bomb]. Playable: 8 (>=7), Bomb (special). Not: 5 (<7)
    const { result } = renderHook(() => useCardInteraction(0));

    expect(result.current.playableCardIds.size).toBe(2);
    expect(result.current.playableCardIds.has('c2')).toBe(true);  // value 8
    expect(result.current.playableCardIds.has('c3')).toBe(true);  // Bomb
    expect(result.current.playableCardIds.has('c1')).toBe(false); // value 5 < 7
  });

  it('returns all cards as playable when lastValue is null (empty pile)', () => {
    useGameStore.setState({ lastValue: null, middlePile: [] });
    const { result } = renderHook(() => useCardInteraction(0));

    // All 3 cards playable when pile is empty
    expect(result.current.playableCardIds.size).toBe(3);
    expect(result.current.playableCardIds.has('c1')).toBe(true);
    expect(result.current.playableCardIds.has('c2')).toBe(true);
    expect(result.current.playableCardIds.has('c3')).toBe(true);
  });

  it('returns empty set for invalid player index', () => {
    const { result } = renderHook(() => useCardInteraction(99));
    expect(result.current.playableCardIds.size).toBe(0);
  });
});

describe('useCardInteraction — handleCardTap', () => {
  it('dispatches playCard + drawCard for a valid playable card', () => {
    const { result } = renderHook(() => useCardInteraction(0));
    // 'c2' is card with value 8, which is >= lastValue 7
    // Verify the card exists before play
    const handBefore = useGameStore.getState().players[0].hand;
    expect(handBefore.some((c) => c.id === 'c2')).toBe(true);

    act(() => {
      result.current.handleCardTap('c2');
    });

    // After tap: card should be removed from player's hand
    const handAfter = useGameStore.getState().players[0].hand;
    expect(handAfter.some((c) => c.id === 'c2')).toBe(false);

    // Card should be added to middlePile
    const pile = useGameStore.getState().middlePile;
    expect(pile.some((c) => c.id === 'c2')).toBe(true);

    // lastValue should be updated to 8
    expect(useGameStore.getState().lastValue).toBe(8);
  });

  it('draws a replacement card after playing', () => {
    const deckBefore = useGameStore.getState().deck.length;
    const handBefore = useGameStore.getState().players[0].hand.length;
    const { result } = renderHook(() => useCardInteraction(0));

    act(() => {
      result.current.handleCardTap('c2');
    });

    // Hand should have drawn a replacement (3 cards: lost 1, gained 1)
    const handAfter = useGameStore.getState().players[0].hand.length;
    expect(handAfter).toBe(handBefore); // stays at 3

    // Deck should have decreased by 1
    const deckAfter = useGameStore.getState().deck.length;
    expect(deckAfter).toBe(deckBefore - 1);
  });

  it('sets turn message after playing a card', () => {
    const { result } = renderHook(() => useCardInteraction(0));

    act(() => {
      result.current.handleCardTap('c2');
    });

    expect(useGameStore.getState().turnMessage).toBe('You played a card');
  });

  it('does nothing when it is NOT human turn (bot turn)', () => {
    // Set currentPlayerIndex to bot (index 1)
    useGameStore.setState({ currentPlayerIndex: 1 });
    const { result } = renderHook(() => useCardInteraction(0));

    const pileBefore = useGameStore.getState().middlePile.length;

    act(() => {
      result.current.handleCardTap('c2');
    });

    // No change: pile length unchanged, card still in hand
    expect(useGameStore.getState().middlePile.length).toBe(pileBefore);
    const hand = useGameStore.getState().players[0].hand;
    expect(hand.some((c) => c.id === 'c2')).toBe(true);
  });

  it('does nothing when card is NOT in playable set', () => {
    // 'c1' has value 5, which is < lastValue 7 → not playable
    const { result } = renderHook(() => useCardInteraction(0));
    const pileBefore = useGameStore.getState().middlePile.length;

    act(() => {
      result.current.handleCardTap('c1');
    });

    // No change
    expect(useGameStore.getState().middlePile.length).toBe(pileBefore);
    expect(useGameStore.getState().players[0].hand.some((c) => c.id === 'c1')).toBe(true);
  });

  it('does nothing when isAnimating is true', () => {
    useGameStore.setState({ isAnimating: true });
    const { result } = renderHook(() => useCardInteraction(0));
    const pileBefore = useGameStore.getState().middlePile.length;

    act(() => {
      result.current.handleCardTap('c2');
    });

    // No change because animation was in progress
    expect(useGameStore.getState().middlePile.length).toBe(pileBefore);
    expect(useGameStore.getState().players[0].hand.some((c) => c.id === 'c2')).toBe(true);
  });

  it('does nothing when playerIndex differs from currentPlayerIndex (defensive)', () => {
    // currentPlayerIndex = 0 (human), but we call useCardInteraction for player 1 (bot)
    useGameStore.setState({ currentPlayerIndex: 0 });
    const { result } = renderHook(() => useCardInteraction(1));

    // Even if card 'c4' were playable, it should be a no-op because
    // playerIndex (1) !== currentPlayerIndex (0)
    // Bot cards: 3, 10, 1. lastValue=7. Only c5 (10) is playable.
    const pileBefore = useGameStore.getState().middlePile.length;
    act(() => {
      result.current.handleCardTap('c5');
    });
    expect(useGameStore.getState().middlePile.length).toBe(pileBefore);
  });

  it('plays special cards regardless of lastValue', () => {
    // 'c3' is a Bomb (special), always playable
    const { result } = renderHook(() => useCardInteraction(0));

    expect(result.current.playableCardIds.has('c3')).toBe(true);

    act(() => {
      result.current.handleCardTap('c3');
    });

    // After Bomb: lastValue should be null (pile reset)
    expect(useGameStore.getState().lastValue).toBeNull();
    // Card removed from hand
    expect(useGameStore.getState().players[0].hand.some((c) => c.id === 'c3')).toBe(false);
  });
});
