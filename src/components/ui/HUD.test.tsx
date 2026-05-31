// src/components/ui/HUD.test.tsx — Tests for HUD container component (STORY-016)
//
// Test cases:
// 1. Renders without crashing when players are present
// 2. Does not render when players array is empty
// 3. Renders all 4 PlayerInfo components for 4 players
// 4. Renders DeckCounter, DirectionIndicator, MiddlePileValue
// 5. Renders TurnIndicator inside HUD
// 6. Renders SpectatorBanner when human is eliminated
// 7. Does not block pointer events (pointer-events-none)

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HUD } from './HUD';
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

const fourPlayers: Player[] = [
  makeHuman(),
  makeBot(2),
  makeBot(3),
  makeBot(4),
];

function resetStore() {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    gameStatus: GameStatus.Playing,
    deck: Array.from({ length: 40 }, (_, i) => ({
      id: `c${i}`,
      type: 'number' as never,
      value: 5,
      effect: null,
    })),
    middlePile: [],
    lastValue: 5,
    winner: null,
    turnMessage: 'Your turn!',
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

describe('HUD', () => {
  it('does NOT render when players array is empty', () => {
    render(<HUD />);
    expect(screen.queryByTestId('hud-overlay')).not.toBeInTheDocument();
  });

  it('renders when players are present', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    expect(screen.getByTestId('hud-overlay')).toBeInTheDocument();
  });

  it('renders all 4 PlayerInfo components (one per player)', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    expect(screen.getByTestId('player-info-0')).toBeInTheDocument();
    expect(screen.getByTestId('player-info-1')).toBeInTheDocument();
    expect(screen.getByTestId('player-info-2')).toBeInTheDocument();
    expect(screen.getByTestId('player-info-3')).toBeInTheDocument();
  });

  it('renders DeckCounter', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    expect(screen.getByTestId('deck-counter')).toBeInTheDocument();
  });

  it('renders DirectionIndicator', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    expect(screen.getByTestId('direction-indicator')).toBeInTheDocument();
  });

  it('renders MiddlePileValue', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    expect(screen.getByTestId('middle-pile-value')).toBeInTheDocument();
  });

  it('renders TurnIndicator inside HUD', () => {
    useGameStore.setState({
      players: fourPlayers,
      turnMessage: 'Your turn! Play a card',
    });
    render(<HUD />);
    expect(screen.getByTestId('turn-indicator')).toBeInTheDocument();
  });

  it('renders SpectatorBanner when human is eliminated', () => {
    useGameStore.setState({
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2),
        makeBot(3),
        makeBot(4),
      ],
    });
    render(<HUD />);
    expect(screen.getByTestId('spectator-banner')).toBeInTheDocument();
  });

  it('does NOT render SpectatorBanner when human is alive', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    expect(screen.queryByTestId('spectator-banner')).not.toBeInTheDocument();
  });

  it('HUD overlay has pointer-events-none to allow 3D interaction pass-through', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    const overlay = screen.getByTestId('hud-overlay');
    expect(overlay.className).toContain('pointer-events-none');
  });

  it('HUD overlay has absolute inset-0 for full canvas coverage', () => {
    useGameStore.setState({ players: fourPlayers });
    render(<HUD />);
    const overlay = screen.getByTestId('hud-overlay');
    expect(overlay.className).toContain('absolute');
    expect(overlay.className).toContain('inset-0');
  });
});
