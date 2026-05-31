// src/components/ui/PlayerInfo.test.tsx — Tests for PlayerInfo component (STORY-016)
//
// Test cases:
// 1. Renders player name for alive player
// 2. Renders lives in "♥ 3/5" format
// 3. Highlights active player with teal border class
// 4. Shows "Eliminated" for eliminated player
// 5. Positions correctly for each player slot (0–3)
// 6. No glow/border for non-active player

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerInfo } from './PlayerInfo';
import { useGameStore } from '../../store';
import {
  GameStatus,
  PlayerType,
  PlayerStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    name: 'You',
    type: PlayerType.Human,
    hand: [],
    lives: 5,
    status: PlayerStatus.Alive,
    ...overrides,
  };
}

function resetStore(overrides: Partial<{ currentPlayerIndex: number }> = {}) {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: overrides.currentPlayerIndex ?? 0,
    direction: Direction.Clockwise,
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

describe('PlayerInfo', () => {
  it('renders player name for alive player', () => {
    const player = makePlayer({ name: 'Bot 2' });
    render(<PlayerInfo player={player} playerIndex={1} />);
    expect(screen.getByTestId('player-name-1')).toHaveTextContent('Bot 2');
  });

  it('renders lives in "♥ X/5" format', () => {
    const player = makePlayer({ lives: 3 });
    render(<PlayerInfo player={player} playerIndex={0} />);
    const livesEl = screen.getByTestId('player-lives-0');
    expect(livesEl).toHaveTextContent('♥ 3/5');
  });

  it('highlights active player with teal border (currentPlayerIndex match)', () => {
    resetStore({ currentPlayerIndex: 2 });
    const player = makePlayer({ name: 'Bot 3', type: PlayerType.Bot });
    render(<PlayerInfo player={player} playerIndex={2} />);
    const container = screen.getByTestId('player-info-2');
    // Teal border is added when player is active
    expect(container.className).toContain('border-teal-400');
    expect(container.className).toContain('shadow-teal-500');
  });

  it('does NOT highlight non-active players with teal', () => {
    resetStore({ currentPlayerIndex: 0 });
    const player = makePlayer({ name: 'Bot 4', type: PlayerType.Bot });
    render(<PlayerInfo player={player} playerIndex={3} />);
    const container = screen.getByTestId('player-info-3');
    expect(container.className).not.toContain('border-teal-400');
    expect(container.className).toContain('border-gray-500');
  });

  it('shows "Eliminated" label for eliminated player with strikethrough', () => {
    const player = makePlayer({
      name: 'Bot 2',
      lives: 0,
      status: PlayerStatus.Eliminated,
    });
    render(<PlayerInfo player={player} playerIndex={1} />);
    const eliminatedLabel = screen.getByTestId('player-eliminated-1');
    expect(eliminatedLabel).toHaveTextContent('Bot 2 — Eliminated');
    expect(eliminatedLabel.className).toContain('line-through');
  });

  it('positions human player (index 0) at bottom-center', () => {
    const player = makePlayer();
    render(<PlayerInfo player={player} playerIndex={0} />);
    const container = screen.getByTestId('player-info-0');
    expect(container.className).toContain('bottom-4');
    expect(container.className).toContain('left-1/2');
    expect(container.className).toContain('-translate-x-1/2');
  });

  it('positions Bot 2 (index 1) at left-center', () => {
    const player = makePlayer({ name: 'Bot 2', type: PlayerType.Bot });
    render(<PlayerInfo player={player} playerIndex={1} />);
    const container = screen.getByTestId('player-info-1');
    expect(container.className).toContain('left-2');
    expect(container.className).toContain('top-1/2');
    expect(container.className).toContain('-translate-y-1/2');
  });

  it('positions Bot 3 (index 2) at top-center', () => {
    const player = makePlayer({ name: 'Bot 3', type: PlayerType.Bot });
    render(<PlayerInfo player={player} playerIndex={2} />);
    const container = screen.getByTestId('player-info-2');
    expect(container.className).toContain('top-4');
    expect(container.className).toContain('left-1/2');
    expect(container.className).toContain('-translate-x-1/2');
  });

  it('positions Bot 4 (index 3) at right-center', () => {
    const player = makePlayer({ name: 'Bot 4', type: PlayerType.Bot });
    render(<PlayerInfo player={player} playerIndex={3} />);
    const container = screen.getByTestId('player-info-3');
    expect(container.className).toContain('right-2');
    expect(container.className).toContain('top-1/2');
    expect(container.className).toContain('-translate-y-1/2');
  });

  it('applies reduced opacity for eliminated players', () => {
    const player = makePlayer({
      status: PlayerStatus.Eliminated,
      lives: 0,
    });
    render(<PlayerInfo player={player} playerIndex={0} />);
    const container = screen.getByTestId('player-info-0');
    expect(container.className).toContain('opacity-60');
  });
});
