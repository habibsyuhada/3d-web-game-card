// src/components/three/DeckPile3D.test.tsx — Tests for DeckPile3D component (STORY-013)
//
// R3F components require WebGL context which is NOT available in jsdom.
// Strategy: mock @react-three/fiber and @react-three/drei to test rendering
// and verify component composition without actual WebGL rendering.
//
// Test cases:
// - Deck with cards renders a RoundedBox
// - Deck with 0 cards renders minimal/empty visual
// - Visual height is proportional to card count

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useGameStore } from '../../store';
import {
  CardType,
  GameStatus,
  Direction,
} from '../../types';
import type { Card } from '../../types';

// ── Mock @react-three/fiber ────────────────────────────────────────────
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children: _children, ...rest }: Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest} />
  ),
}));

// ── Mock @react-three/drei ─────────────────────────────────────────────
vi.mock('@react-three/drei', () => ({
  RoundedBox: ({ children, args, ...rest }: { children?: React.ReactNode; args?: number[] } & Record<string, unknown>) => (
    <div data-testid="rounded-box" data-args={args ? JSON.stringify(args) : undefined} {...rest}>
      {children}
    </div>
  ),
  Text: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <span data-testid="card-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks
import { DeckPile3D } from './DeckPile3D';

// ── Helpers ────────────────────────────────────────────────────────────

function numberCard(id: string, value: number): Card {
  return { id, type: CardType.Number, value, effect: null };
}

// ── Store reset ─────────────────────────────────────────────────────────

beforeEach(() => {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Waiting,
    winner: null,
    isAnimating: false,
  });
});

// ── Tests ──────────────────────────────────────────────────────────────

describe('DeckPile3D — renders with cards', () => {
  it('renders a RoundedBox when deck has cards', () => {
    const cards: Card[] = [];
    for (let i = 0; i < 20; i++) {
      cards.push(numberCard(`deck-${i}`, (i % 13) + 1));
    }
    useGameStore.setState({ deck: cards });

    render(<DeckPile3D />);
    const boxes = screen.getAllByTestId('rounded-box');
    // At least 1 RoundedBox for the deck stack
    expect(boxes.length).toBeGreaterThanOrEqual(1);
  });

  it('RoundedBox height is proportional to deck count', () => {
    // 20 cards → height = min(20, 30) * 0.025 = 0.5
    const cards20: Card[] = [];
    for (let i = 0; i < 20; i++) {
      cards20.push(numberCard(`deck-${i}`, (i % 13) + 1));
    }
    useGameStore.setState({ deck: cards20 });

    const { container: container20 } = render(<DeckPile3D />);
    const box20 = screen.getAllByTestId('rounded-box')[0];
    const args20 = JSON.parse(box20.getAttribute('data-args') || '[]');
    const height20 = args20[1]; // args = [width, height, depth]

    expect(height20).toBeCloseTo(20 * 0.025, 3);

    // Clean up for next render
    container20.remove();
  });

  it('caps visual height at 30 cards', () => {
    const cards45: Card[] = [];
    for (let i = 0; i < 45; i++) {
      cards45.push(numberCard(`deck-${i}`, (i % 13) + 1));
    }
    useGameStore.setState({ deck: cards45 });

    render(<DeckPile3D />);
    const box = screen.getAllByTestId('rounded-box')[0];
    const args = JSON.parse(box.getAttribute('data-args') || '[]');
    const height = args[1];

    // Should cap at min(45, 30) * 0.025 = 0.75
    expect(height).toBeCloseTo(30 * 0.025, 3);
  });
});

describe('DeckPile3D — empty deck', () => {
  it('renders a minimal RoundedBox when deck is empty', () => {
    useGameStore.setState({ deck: [] });

    render(<DeckPile3D />);
    const boxes = screen.getAllByTestId('rounded-box');
    expect(boxes.length).toBeGreaterThanOrEqual(1);
  });

  it('empty deck has minimal height (0.01)', () => {
    useGameStore.setState({ deck: [] });

    render(<DeckPile3D />);
    const box = screen.getAllByTestId('rounded-box')[0];
    const args = JSON.parse(box.getAttribute('data-args') || '[]');
    const height = args[1];

    expect(height).toBeCloseTo(0.01, 3);
  });
});
