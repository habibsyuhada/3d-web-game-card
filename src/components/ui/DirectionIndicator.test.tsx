// src/components/ui/DirectionIndicator.test.tsx — Tests for DirectionIndicator component (STORY-016)
//
// Test cases:
// 1. Shows clockwise symbol "↻" when direction is Clockwise
// 2. Shows counter-clockwise symbol "↺" when direction is CounterClockwise
// 3. Displays "Clockwise" / "Counter-clockwise" label
// 4. Updates reactively when direction changes

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DirectionIndicator } from './DirectionIndicator';
import { useGameStore } from '../../store';
import { Direction, GameStatus } from '../../types';

function resetStore() {
  useGameStore.setState({
    direction: Direction.Clockwise,
    players: [],
    currentPlayerIndex: 0,
    gameStatus: GameStatus.Playing,
    deck: [],
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

describe('DirectionIndicator', () => {
  it('shows "↻" symbol when direction is Clockwise', () => {
    useGameStore.setState({ direction: Direction.Clockwise });
    render(<DirectionIndicator />);
    expect(screen.getByTestId('direction-arrow')).toHaveTextContent('↻');
  });

  it('shows "↺" symbol when direction is CounterClockwise', () => {
    useGameStore.setState({ direction: Direction.CounterClockwise });
    render(<DirectionIndicator />);
    expect(screen.getByTestId('direction-arrow')).toHaveTextContent('↺');
  });

  it('displays "Clockwise" label for clockwise direction', () => {
    useGameStore.setState({ direction: Direction.Clockwise });
    render(<DirectionIndicator />);
    expect(screen.getByTestId('direction-label')).toHaveTextContent('Clockwise');
  });

  it('displays "Counter-clockwise" label for counter-clockwise', () => {
    useGameStore.setState({ direction: Direction.CounterClockwise });
    render(<DirectionIndicator />);
    expect(screen.getByTestId('direction-label')).toHaveTextContent(
      'Counter-clockwise',
    );
  });

  it('updates reactively when direction changes from Clockwise to CounterClockwise', () => {
    useGameStore.setState({ direction: Direction.Clockwise });
    const { rerender } = render(<DirectionIndicator />);
    expect(screen.getByTestId('direction-arrow')).toHaveTextContent('↻');

    useGameStore.setState({ direction: Direction.CounterClockwise });
    rerender(<DirectionIndicator />);
    expect(screen.getByTestId('direction-arrow')).toHaveTextContent('↺');
  });

  it('has correct aria-label for accessibility', () => {
    useGameStore.setState({ direction: Direction.Clockwise });
    render(<DirectionIndicator />);
    const container = screen.getByTestId('direction-indicator');
    expect(container.getAttribute('aria-label')).toBe('Clockwise');
  });
});
