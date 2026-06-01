// src/components/ui/GameOverScreen.test.tsx — Tests for GameOverScreen component (STORY-019)
//
// Test cases:
// 1. Does NOT render when gameStatus is 'playing'
// 2. Does NOT render when gameStatus is 'waiting'
// 3. Does NOT render when gameStatus is 'finished' but winner is null
// 4. Renders when gameStatus is 'finished' and winner is set
// 5. Shows victory message ("🏆 You Win!") when human is winner
// 6. Shows defeat message ("💀 Bot X Wins") when bot is winner
// 7. Winner name displayed correctly
// 8. Winner lives remaining displayed
// 9. Play Again button visible and clickable
// 10. Play Again button dispatches resetGame + initGame + hides overlays
// 11. Blocks pointer events (overlay has pointer-events-auto class)
// 12. Has fade-in animation class

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameOverScreen } from './GameOverScreen';
import { useGameStore } from '../../store';
import {
  GameStatus,
  PlayerType,
  PlayerStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';

// ── Helper factories ──────────────────────────────────────────────────────

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

/**
 * Resets the Zustand store to a clean baseline for each test.
 */
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

// ── Tests ─────────────────────────────────────────────────────────────────

describe('GameOverScreen', () => {
  it('does NOT render when gameStatus is "playing"', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Playing,
      winner: null,
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    expect(screen.queryByTestId('game-over-screen')).not.toBeInTheDocument();
  });

  it('does NOT render when gameStatus is "waiting"', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Waiting,
      winner: null,
      players: [],
    });
    render(<GameOverScreen />);
    expect(screen.queryByTestId('game-over-screen')).not.toBeInTheDocument();
  });

  it('does NOT render when gameStatus is "finished" but winner is null', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: null,
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    expect(screen.queryByTestId('game-over-screen')).not.toBeInTheDocument();
  });

  it('renders when gameStatus is "finished" and winner is set', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    expect(screen.getByTestId('game-over-screen')).toBeInTheDocument();
  });

  it('shows victory message when human player is winner', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    const heading = screen.getByTestId('game-over-heading');
    expect(heading).toHaveTextContent('🏆 You Win!');
    expect(heading.className).toContain('text-yellow-400');
  });

  it('shows defeat message when bot is winner', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'Bot 3',
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(3, { lives: 2 }),
        makeBot(4, { status: PlayerStatus.Eliminated, lives: 0 }),
      ],
    });
    render(<GameOverScreen />);
    const heading = screen.getByTestId('game-over-heading');
    expect(heading).toHaveTextContent('💀 Bot 3 Wins');
    expect(heading.className).toContain('text-red-500');
  });

  it('displays winner name correctly', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'Bot 2',
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2, { lives: 3 }),
        makeBot(3, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(4, { status: PlayerStatus.Eliminated, lives: 0 }),
      ],
    });
    render(<GameOverScreen />);
    expect(screen.getByTestId('game-over-winner')).toHaveTextContent(
      'Winner: Bot 2',
    );
  });

  it('displays winner lives remaining', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman({ lives: 3 }), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    expect(screen.getByTestId('game-over-lives')).toHaveTextContent(
      'Lives remaining: 3',
    );
  });

  it('Play Again button is visible and clickable', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    const button = screen.getByTestId('play-again-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Play Again');
    expect(button).toBeEnabled();
  });

  it('Play Again button dispatches resetGame + initGame and hides overlays', async () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [
        makeHuman({ lives: 2 }),
        makeBot(2, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(3, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(4, { status: PlayerStatus.Eliminated, lives: 0 }),
      ],
      showTitleScreen: false,
      showGameOver: true,
    });

    render(<GameOverScreen />);
    const button = screen.getByTestId('play-again-button');

    await act(async () => {
      fireEvent.click(button);
    });

    const state = useGameStore.getState();
    // After initGame, game should be playing
    expect(state.gameStatus).toBe(GameStatus.Playing);
    // Players should be re-initialized (4 players, all alive)
    expect(state.players.length).toBe(4);
    // Title screen should be hidden (jump straight to game)
    expect(state.showTitleScreen).toBe(false);
    // Game over overlay should be hidden
    expect(state.showGameOver).toBe(false);
  });

  it('overlay has pointer-events-auto to block clicks below', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    const overlay = screen.getByTestId('game-over-screen');
    expect(overlay.className).toContain('pointer-events-auto');
  });

  it('overlay has z-50 to sit above HUD elements', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    const overlay = screen.getByTestId('game-over-screen');
    expect(overlay.className).toContain('z-50');
  });

  it('has fade-in animation class', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'You',
      players: [makeHuman(), makeBot(2), makeBot(3), makeBot(4)],
    });
    render(<GameOverScreen />);
    const overlay = screen.getByTestId('game-over-screen');
    expect(overlay.className).toContain('animate-fade-in');
  });

  it('is readable on 320px screen width (max-w-sm, mx-4)', () => {
    useGameStore.setState({
      gameStatus: GameStatus.Finished,
      winner: 'Bot 4',
      players: [
        makeHuman({ status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(2, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(3, { status: PlayerStatus.Eliminated, lives: 0 }),
        makeBot(4, { lives: 1 }),
      ],
    });
    render(<GameOverScreen />);
    const modal = screen.getByTestId('game-over-modal');
    expect(modal.className).toContain('max-w-sm');
    expect(modal.className).toContain('mx-4');
  });
});
