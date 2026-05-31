// src/components/ui/SpectatorBanner.test.tsx — Tests for SpectatorBanner component (STORY-016)
//
// Test cases:
// 1. Hidden when human player is alive
// 2. Visible when human player is eliminated
// 3. Shows "You are now spectating" text
// 4. Hidden when no players exist
// 5. Hidden when only bots are eliminated (human alive)

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpectatorBanner } from './SpectatorBanner';
import { useGameStore } from '../../store';
import {
  GameStatus,
  PlayerType,
  PlayerStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';

function makeHuman(overrides: Partial<Player> = {}): Player {
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

function makeBot(id: number, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: `Bot ${id}`,
    type: PlayerType.Bot,
    hand: [],
    lives: 5,
    status: PlayerStatus.Alive,
    ...overrides,
  };
}

function resetStore() {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
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

describe('SpectatorBanner', () => {
  it('is NOT visible when human player is alive', () => {
    useGameStore.setState({
      players: [
        makeHuman({ status: PlayerStatus.Alive, lives: 3 }),
        makeBot(2),
        makeBot(3),
        makeBot(4),
      ],
    });
    render(<SpectatorBanner />);
    expect(screen.queryByTestId('spectator-banner')).not.toBeInTheDocument();
  });

  it('is visible when human player is eliminated', () => {
    useGameStore.setState({
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2),
        makeBot(3),
        makeBot(4),
      ],
    });
    render(<SpectatorBanner />);
    expect(screen.getByTestId('spectator-banner')).toBeInTheDocument();
  });

  it('displays "You are now spectating" message', () => {
    useGameStore.setState({
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2),
        makeBot(3),
        makeBot(4),
      ],
    });
    render(<SpectatorBanner />);
    expect(screen.getByTestId('spectator-banner')).toHaveTextContent(
      'You are now spectating',
    );
  });

  it('is NOT visible when no players exist', () => {
    render(<SpectatorBanner />);
    expect(screen.queryByTestId('spectator-banner')).not.toBeInTheDocument();
  });

  it('is NOT visible when a bot is eliminated but human is alive', () => {
    useGameStore.setState({
      players: [
        makeHuman({ status: PlayerStatus.Alive, lives: 2 }),
        makeBot(2, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(3),
        makeBot(4),
      ],
    });
    render(<SpectatorBanner />);
    expect(screen.queryByTestId('spectator-banner')).not.toBeInTheDocument();
  });

  it('has role="alert" for screen reader announcement', () => {
    useGameStore.setState({
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2),
        makeBot(3),
        makeBot(4),
      ],
    });
    render(<SpectatorBanner />);
    const banner = screen.getByTestId('spectator-banner');
    expect(banner.getAttribute('role')).toBe('alert');
  });
});
