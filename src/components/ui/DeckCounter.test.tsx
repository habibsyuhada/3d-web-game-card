// src/components/ui/DeckCounter.test.tsx — Tests for DeckCounter component (STORY-016)
//
// Test cases:
// 1. Renders with correct initial deck count
// 2. Updates when deck count changes
// 3. Shows warning color when deck is empty (orange)
// 4. Normal white color when deck has cards

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeckCounter } from './DeckCounter';
import { useGameStore } from '../../store';
import { GameStatus, Direction } from '../../types';
import type { Card } from '../../types';

function fakeCard(id: string): Card {
  return { id, type: 'number' as never, value: 5, effect: null };
}

function resetStore() {
  useGameStore.setState({
    deck: [],
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    gameStatus: GameStatus.Playing,
    middlePile: [],
    lastValue: null,
    winner: null,
    turnMessage: '',
    isAnimating: false,
    animationQueue: [],
    activeVFX: null,
    vfxPosition: null,
    showTitleScreen: false,
    showGameOver: false,
    isFullscreen: false,
    showMessage: '',
    messageQueue: [],
  });
}

beforeEach(() => {
  resetStore();
});

describe('DeckCounter', () => {
  it('renders deck count correctly when deck has cards', () => {
    const deck = [fakeCard('c1'), fakeCard('c2'), fakeCard('c3')];
    useGameStore.setState({ deck });
    render(<DeckCounter />);
    const countValue = screen.getByTestId('deck-count-value');
    expect(countValue).toHaveTextContent('Deck: 3');
  });

  it('shows "Deck: 0" when deck is empty', () => {
    render(<DeckCounter />);
    const countValue = screen.getByTestId('deck-count-value');
    expect(countValue).toHaveTextContent('Deck: 0');
  });

  it('applies warning color (orange) when deck is empty', () => {
    render(<DeckCounter />);
    const countValue = screen.getByTestId('deck-count-value');
    expect(countValue.className).toContain('text-orange-400');
  });

  it('applies white color when deck has cards', () => {
    const deck = [fakeCard('c1'), fakeCard('c2')];
    useGameStore.setState({ deck });
    render(<DeckCounter />);
    const countValue = screen.getByTestId('deck-count-value');
    expect(countValue.className).toContain('text-white');
  });

  it('updates reactively when deck count changes', () => {
    const deck3 = [fakeCard('c1'), fakeCard('c2'), fakeCard('c3')];
    useGameStore.setState({ deck: deck3 });
    const { rerender } = render(<DeckCounter />);
    expect(screen.getByTestId('deck-count-value')).toHaveTextContent('Deck: 3');

    const deck1 = [fakeCard('c1')];
    useGameStore.setState({ deck: deck1 });
    rerender(<DeckCounter />);
    expect(screen.getByTestId('deck-count-value')).toHaveTextContent('Deck: 1');
  });
});
