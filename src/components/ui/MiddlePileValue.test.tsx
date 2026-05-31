// src/components/ui/MiddlePileValue.test.tsx — Tests for MiddlePileValue component (STORY-016)
//
// Test cases:
// 1. Shows the current pile value as a number
// 2. Shows "—" when lastValue is null
// 3. Updates reactively when lastValue changes
// 4. Has correct aria-label for value and empty state
// 5. Applies yellow color for numeric value

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MiddlePileValue } from './MiddlePileValue';
import { useGameStore } from '../../store';
import { GameStatus, Direction } from '../../types';

function resetStore() {
  useGameStore.setState({
    lastValue: null,
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    gameStatus: GameStatus.Playing,
    deck: [],
    middlePile: [],
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

describe('MiddlePileValue', () => {
  it('shows "—" when lastValue is null', () => {
    render(<MiddlePileValue />);
    const emptyEl = screen.getByTestId('pile-value-empty');
    expect(emptyEl).toHaveTextContent('—');
  });

  it('shows the numeric value when lastValue is set', () => {
    useGameStore.setState({ lastValue: 8 });
    render(<MiddlePileValue />);
    const numEl = screen.getByTestId('pile-value-number');
    expect(numEl).toHaveTextContent('8');
  });

  it('shows correct value of 13', () => {
    useGameStore.setState({ lastValue: 13 });
    render(<MiddlePileValue />);
    const numEl = screen.getByTestId('pile-value-number');
    expect(numEl).toHaveTextContent('13');
  });

  it('updates reactively when lastValue changes from null to a number', () => {
    const { rerender } = render(<MiddlePileValue />);
    expect(screen.getByTestId('pile-value-empty')).toHaveTextContent('—');

    act(() => {
      useGameStore.setState({ lastValue: 5 });
    });
    rerender(<MiddlePileValue />);
    expect(screen.getByTestId('pile-value-number')).toHaveTextContent('5');
  });

  it('has correct aria-label when value is set', () => {
    useGameStore.setState({ lastValue: 7 });
    render(<MiddlePileValue />);
    const container = screen.getByTestId('middle-pile-value');
    expect(container.getAttribute('aria-label')).toBe('Pile value: 7');
  });

  it('has aria-label "Pile empty" when lastValue is null', () => {
    render(<MiddlePileValue />);
    const container = screen.getByTestId('middle-pile-value');
    expect(container.getAttribute('aria-label')).toBe('Pile empty');
  });

  it('applies yellow color to numeric value', () => {
    useGameStore.setState({ lastValue: 10 });
    render(<MiddlePileValue />);
    const numEl = screen.getByTestId('pile-value-number');
    expect(numEl.className).toContain('text-yellow-300');
  });

  it('applies gray color to empty state', () => {
    render(<MiddlePileValue />);
    const emptyEl = screen.getByTestId('pile-value-empty');
    expect(emptyEl.className).toContain('text-gray-500');
  });
});
