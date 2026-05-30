// src/store/selectors.test.ts — Tests for memoized Zustand selectors
// Uses renderHook from @testing-library/react for hook-level testing
// and direct getState() calls for state setup.

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './index';
import {
  useCurrentPlayer,
  useHumanPlayer,
  useIsHumanTurn,
  usePlayableCards,
  useAlivePlayers,
  useDeckCount,
  useMiddlePileTopCard,
} from './selectors';
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
      lives: 2,
      status: PlayerStatus.Alive,
    },
    {
      id: 4,
      name: 'Bot 4',
      type: PlayerType.Bot,
      hand: [numberCard('c10', 2), numberCard('c11', 7), numberCard('c12', 13)],
      lives: 0,
      status: PlayerStatus.Eliminated,
    },
  ];
}

/** Reset the store before each test */
beforeEach(() => {
  useGameStore.setState({
    players: createTestPlayers(),
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: Array.from({ length: 20 }, (_, i) => numberCard(`d${i}`, (i % 13) + 1)),
    middlePile: [numberCard('p1', 3), numberCard('p2', 7)],
    lastValue: 7,
    gameStatus: GameStatus.Playing,
    winner: null,
  });
});

describe('Selectors — useCurrentPlayer()', () => {
  it('returns the player at the current currentPlayerIndex', () => {
    const { result } = renderHook(() => useCurrentPlayer());
    expect(result.current).toBeDefined();
    expect(result.current.id).toBe(1);
    expect(result.current.name).toBe('You');
  });

  it('updates when currentPlayerIndex changes', () => {
    const { result } = renderHook(() => useCurrentPlayer());

    expect(result.current.id).toBe(1);

    act(() => {
      useGameStore.setState({ currentPlayerIndex: 2 });
    });

    expect(result.current.id).toBe(3);
    expect(result.current.name).toBe('Bot 3');
  });
});

describe('Selectors — useHumanPlayer()', () => {
  it('returns the human player', () => {
    const { result } = renderHook(() => useHumanPlayer());
    expect(result.current).toBeDefined();
    expect(result.current!.type).toBe(PlayerType.Human);
    expect(result.current!.name).toBe('You');
  });

  it('returns null when no human player exists', () => {
    const players = createTestPlayers();
    players[0].type = PlayerType.Bot; // No human

    useGameStore.setState({ players });

    const { result } = renderHook(() => useHumanPlayer());
    expect(result.current).toBeNull();
  });
});

describe('Selectors — useIsHumanTurn()', () => {
  it('returns true when it is the human player turn', () => {
    useGameStore.setState({ currentPlayerIndex: 0 });
    const { result } = renderHook(() => useIsHumanTurn());
    expect(result.current).toBe(true);
  });

  it('returns false when it is a bot turn', () => {
    useGameStore.setState({ currentPlayerIndex: 1 });
    const { result } = renderHook(() => useIsHumanTurn());
    expect(result.current).toBe(false);
  });
});

describe('Selectors — usePlayableCards()', () => {
  it('returns only playable cards for a player given lastValue', () => {
    // lastValue = 7. Human has [5, 8, Bomb]
    // Playable: 8 (>= 7), Bomb (always playable). Not playable: 5 (< 7)
    const { result } = renderHook(() => usePlayableCards(0));

    expect(result.current).toHaveLength(2);
    const playableIds = result.current.map((c) => c.id);
    expect(playableIds).toContain('c2'); // value 8
    expect(playableIds).toContain('c3'); // Bomb (special)
    expect(playableIds).not.toContain('c1'); // value 5 < 7
  });

  it('returns all cards as playable when lastValue is null', () => {
    useGameStore.setState({ lastValue: null });
    const { result } = renderHook(() => usePlayableCards(0));

    // All 3 cards should be playable with null lastValue
    expect(result.current).toHaveLength(3);
  });

  it('returns empty array for invalid player index', () => {
    const { result } = renderHook(() => usePlayableCards(99));
    expect(result.current).toHaveLength(0);
  });
});

describe('Selectors — useAlivePlayers()', () => {
  it('returns only players with Alive status', () => {
    const { result } = renderHook(() => useAlivePlayers());

    // 4 test players: 3 alive, 1 eliminated (Bot 4)
    expect(result.current).toHaveLength(3);
    const names = result.current.map((p) => p.name);
    expect(names).toContain('You');
    expect(names).toContain('Bot 2');
    expect(names).toContain('Bot 3');
    expect(names).not.toContain('Bot 4');
  });
});

describe('Selectors — useDeckCount()', () => {
  it('returns the correct deck length', () => {
    const { result } = renderHook(() => useDeckCount());
    expect(result.current).toBe(20);
  });

  it('updates when deck changes', () => {
    const { result } = renderHook(() => useDeckCount());
    expect(result.current).toBe(20);

    act(() => {
      useGameStore.setState({ deck: [numberCard('x1', 1)] });
    });
    expect(result.current).toBe(1);
  });
});

describe('Selectors — useMiddlePileTopCard()', () => {
  it('returns the last card in the middlePile', () => {
    const { result } = renderHook(() => useMiddlePileTopCard());
    expect(result.current).toBeDefined();
    expect(result.current!.id).toBe('p2');
    expect(result.current!.value).toBe(7);
  });

  it('returns null when middlePile is empty', () => {
    useGameStore.setState({ middlePile: [] });
    const { result } = renderHook(() => useMiddlePileTopCard());
    expect(result.current).toBeNull();
  });
});
