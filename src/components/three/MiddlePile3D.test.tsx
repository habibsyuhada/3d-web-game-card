// src/components/three/MiddlePile3D.test.tsx — Tests for MiddlePile3D component (STORY-013)
//
// R3F components require WebGL context which is NOT available in jsdom.
// Strategy: mock @react-three/fiber and @react-three/drei to test rendering
// and verify component composition without actual WebGL rendering.
//
// Test cases:
// - Pile with cards renders Card3D components
// - Pile with lastValue shows value text
// - Pile with null lastValue (after Bomb/Nuclear) shows "—"
// - Empty pile shows no cards and no value
// - Large pile (10+ cards) only renders top 5 visible

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useGameStore } from '../../store';
import {
  CardType,
  SpecialEffect,
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
  RoundedBox: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="rounded-box" {...rest}>
      {children}
    </div>
  ),
  Text: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <span data-testid="pile-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks
import { MiddlePile3D } from './MiddlePile3D';

// ── Helpers ────────────────────────────────────────────────────────────

function numberCard(id: string, value: number): Card {
  return { id, type: CardType.Number, value, effect: null };
}

function specialCard(id: string, effect: SpecialEffect): Card {
  return { id, type: CardType.Special, value: null, effect };
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

describe('MiddlePile3D — empty pile', () => {
  it('renders without crashing when pile is empty', () => {
    const { container } = render(<MiddlePile3D />);
    expect(container).toBeTruthy();
  });

  it('shows no cards and no value text when pile is empty', () => {
    render(<MiddlePile3D />);
    // No card RoundedBox elements (Card3D renders rounded-box in mocked drei)
    const roundedBoxes = screen.queryAllByTestId('rounded-box');
    expect(roundedBoxes).toHaveLength(0);
    // No pile value text
    const texts = screen.queryAllByTestId('pile-text');
    expect(texts).toHaveLength(0);
  });
});

describe('MiddlePile3D — pile with cards', () => {
  it('renders stacked Card3D components for played cards', () => {
    const cards: Card[] = [numberCard('p1', 5), numberCard('p2', 8)];
    useGameStore.setState({ middlePile: cards, lastValue: 8 });

    render(<MiddlePile3D />);
    // Each Card3D renders a RoundedBox (card body) via mocked drei
    const roundedBoxes = screen.getAllByTestId('rounded-box');
    // 2 cards, each Card3D has 1 RoundedBox = 2 total
    expect(roundedBoxes.length).toBe(2);
  });

  it('shows value text when lastValue is set', () => {
    useGameStore.setState({
      middlePile: [numberCard('p1', 7)],
      lastValue: 7,
    });

    render(<MiddlePile3D />);
    const texts = screen.getAllByTestId('pile-text');
    expect(texts.length).toBeGreaterThanOrEqual(1);
    // The value text should show "7"
    const hasValue = texts.some((el) => el.textContent === '7');
    expect(hasValue).toBe(true);
  });

  it('shows "—" when lastValue is null but pile has cards (after Bomb)', () => {
    useGameStore.setState({
      middlePile: [numberCard('p1', 5), specialCard('p2', SpecialEffect.Bomb)],
      lastValue: null,
    });

    render(<MiddlePile3D />);
    const texts = screen.getAllByTestId('pile-text');
    const hasEmDash = texts.some((el) => el.textContent === '\u2014');
    expect(hasEmDash).toBe(true);
  });

  it('shows no value text when pile is empty and lastValue is null (after Nuclear)', () => {
    useGameStore.setState({
      middlePile: [],
      lastValue: null,
    });

    render(<MiddlePile3D />);
    const texts = screen.queryAllByTestId('pile-text');
    expect(texts).toHaveLength(0);
  });
});

describe('MiddlePile3D — performance cap', () => {
  it('only renders top 5 cards when pile has 10+ cards', () => {
    const manyCards: Card[] = [];
    for (let i = 0; i < 12; i++) {
      manyCards.push(numberCard(`pile-${i}`, (i % 13) + 1));
    }
    useGameStore.setState({ middlePile: manyCards, lastValue: 12 });

    render(<MiddlePile3D />);
    // Should only render 5 Card3D components (= 5 RoundedBox)
    const roundedBoxes = screen.getAllByTestId('rounded-box');
    expect(roundedBoxes.length).toBe(5);
  });

  it('shows correct value text even with a large pile', () => {
    const manyCards: Card[] = [];
    for (let i = 0; i < 10; i++) {
      manyCards.push(numberCard(`pile-${i}`, i + 1));
    }
    useGameStore.setState({ middlePile: manyCards, lastValue: 10 });

    render(<MiddlePile3D />);
    const texts = screen.getAllByTestId('pile-text');
    const hasValue = texts.some((el) => el.textContent === '10');
    expect(hasValue).toBe(true);
  });
});

describe('MiddlePile3D — special card values', () => {
  it('shows Random card rolled value', () => {
    useGameStore.setState({
      middlePile: [specialCard('p1', SpecialEffect.Random)],
      lastValue: 9, // Random card rolled a 9
    });

    render(<MiddlePile3D />);
    const texts = screen.getAllByTestId('pile-text');
    const hasValue = texts.some((el) => el.textContent === '9');
    expect(hasValue).toBe(true);
  });
});
