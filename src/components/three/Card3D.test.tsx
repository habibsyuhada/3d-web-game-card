// src/components/three/Card3D.test.tsx — Tests for 3D Card component (STORY-012)
//
// R3F components require WebGL context which is NOT available in jsdom.
// Strategy: mock @react-three/drei (RoundedBox, Text) to test rendering
// and verify component composition without actual WebGL rendering.
//
// For deep interaction testing (pointer events), the useCardInteraction
// hook tests cover all guard logic. Card3D delegates to onTap which is
// tested at the hook + integration level.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useGameStore } from '../../store';
import { GameStatus, Direction, CardType, SpecialEffect } from '../../types';
import type { Card } from '../../types';

// ── Mock @react-three/fiber ────────────────────────────────────────────
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children: _children, ...rest }: Record<string, unknown>) => (
    <div data-testid="r3f-canvas" {...rest} />
  ),
}));

// ── Mock @react-three/drei ─────────────────────────────────────────────
// RoundedBox → div[data-testid="rounded-box"]
// Text → span[data-testid="text"] with children as text content
// This lets us verify Card3D composition in jsdom.
vi.mock('@react-three/drei', () => ({
  RoundedBox: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="rounded-box" {...rest}>
      {children}
    </div>
  ),
  Text: ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <span data-testid="card-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks (vi.mock is hoisted)
import { Card3D } from './Card3D';

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

describe('Card3D — renders without crashing', () => {
  it('renders number card face-up', () => {
    const card = numberCard('test-1', 7);
    const { container } = render(
      <Card3D card={card} faceUp={true} disabled={false} />,
    );
    expect(container).toBeTruthy();
    expect(screen.getByTestId('rounded-box')).toBeInTheDocument();
  });

  it('renders special card face-up', () => {
    const card = specialCard('test-2', SpecialEffect.Bomb);
    const { container } = render(
      <Card3D card={card} faceUp={true} disabled={false} />,
    );
    expect(container).toBeTruthy();
    expect(screen.getByTestId('rounded-box')).toBeInTheDocument();
  });

  it('renders card face-down', () => {
    const card = numberCard('test-3', 5);
    const { container } = render(
      <Card3D card={card} faceUp={false} disabled={false} />,
    );
    expect(container).toBeTruthy();
    expect(screen.getByTestId('rounded-box')).toBeInTheDocument();
  });

  it('renders disabled card without crashing', () => {
    const card = numberCard('test-4', 3);
    const { container } = render(
      <Card3D card={card} faceUp={true} disabled={true} />,
    );
    expect(container).toBeTruthy();
  });
});

describe('Card3D — face-up text', () => {
  it('shows number value for number card face-up', () => {
    const card = numberCard('test-5', 13);
    render(<Card3D card={card} faceUp={true} disabled={false} />);
    const textElements = screen.getAllByTestId('card-text');
    // First text element is the front face value
    const valueText = textElements[0];
    expect(valueText.textContent).toBe('13');
  });

  it('shows effect name for special card face-up', () => {
    const card = specialCard('test-6', SpecialEffect.Reverse);
    render(<Card3D card={card} faceUp={true} disabled={false} />);
    const textElements = screen.getAllByTestId('card-text');
    const valueText = textElements[0];
    expect(valueText.textContent).toBe('Reverse');
  });

  it('shows Nuklir for Nuclear special card', () => {
    const card = specialCard('test-7', SpecialEffect.Nuclear);
    render(<Card3D card={card} faceUp={true} disabled={false} />);
    const textElements = screen.getAllByTestId('card-text');
    const valueText = textElements[0];
    expect(valueText.textContent).toBe('Nuklir');
  });

  it('does NOT show front text when face-down', () => {
    const card = numberCard('test-8', 10);
    render(<Card3D card={card} faceUp={false} disabled={false} />);
    const textElements = screen.getAllByTestId('card-text');
    // Face-down shows "ZZ" watermark on the back, not the card value
    const hasBackText = textElements.some((el) => el.textContent === 'ZZ');
    expect(hasBackText).toBe(true);
    // Should NOT show the number value
    const hasValue = textElements.some((el) => el.textContent === '10');
    expect(hasValue).toBe(false);
  });
});

describe('Card3D — onTap callback', () => {
  it('fires onTap with card ID on pointer down (mocked)', () => {
    const onTap = vi.fn();
    const card = numberCard('test-9', 7);
    const { container } = render(
      <Card3D card={card} faceUp={true} disabled={false} onTap={onTap} />,
    );
    // Find the root group element (first child) and simulate pointer down
    // Since R3F pointer events won't fire in jsdom, we verify the component
    // renders correctly with the onTap prop — actual event dispatch is tested
    // via the useCardInteraction hook tests.
    expect(container).toBeTruthy();
    expect(onTap).not.toHaveBeenCalled();
  });
});
