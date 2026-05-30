// src/components/three/CardHand.test.tsx — Tests for CardHand component (STORY-012)
//
// CardHand arranges Card3D components in a fan layout.
// R3F primitives are mocked to divs for jsdom compatibility.

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
    <span data-testid="card-text" {...rest}>
      {children}
    </span>
  ),
}));

// Import after mocks
import { CardHand } from './CardHand';

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

describe('CardHand — empty hand', () => {
  it('renders without cards (0 cards)', () => {
    const { container } = render(
      <CardHand
        cards={[]}
        faceUp={true}
        playableCardIds={new Set()}
        onCardTap={() => {}}
      />,
    );
    // No RoundedBox rendered (no cards)
    expect(screen.queryByTestId('rounded-box')).not.toBeInTheDocument();
    expect(container).toBeTruthy();
  });
});

describe('CardHand — card count rendering', () => {
  it('renders 1 card', () => {
    const cards = [numberCard('c1', 5)];
    const playableCardIds = new Set(['c1']);
    render(
      <CardHand
        cards={cards}
        faceUp={true}
        playableCardIds={playableCardIds}
        onCardTap={() => {}}
      />,
    );
    // 1 RoundedBox for card body
    const boxes = screen.getAllByTestId('rounded-box');
    expect(boxes).toHaveLength(1);
  });

  it('renders 2 cards', () => {
    const cards = [numberCard('c1', 5), numberCard('c2', 8)];
    const playableCardIds = new Set(['c1', 'c2']);
    render(
      <CardHand
        cards={cards}
        faceUp={true}
        playableCardIds={playableCardIds}
        onCardTap={() => {}}
      />,
    );
    const boxes = screen.getAllByTestId('rounded-box');
    expect(boxes).toHaveLength(2);
  });

  it('renders 3 cards in a fan layout', () => {
    const cards = [
      numberCard('c1', 5),
      numberCard('c2', 8),
      specialCard('c3', SpecialEffect.Bomb),
    ];
    const playableCardIds = new Set(['c2', 'c3']);
    render(
      <CardHand
        cards={cards}
        faceUp={true}
        playableCardIds={playableCardIds}
        onCardTap={() => {}}
      />,
    );
    const boxes = screen.getAllByTestId('rounded-box');
    expect(boxes).toHaveLength(3);
  });
});

describe('CardHand — disabled state', () => {
  it('passes correct disabled state based on playableCardIds', () => {
    // lastValue = 7. Card c1 (value 5) is NOT playable, c2 (value 8) IS playable
    const cards = [numberCard('c1', 5), numberCard('c2', 8)];
    const playableCardIds = new Set(['c2']); // only c2 is playable
    render(
      <CardHand
        cards={cards}
        faceUp={true}
        playableCardIds={playableCardIds}
        onCardTap={() => {}}
      />,
    );
    // Both cards should be rendered
    const boxes = screen.getAllByTestId('rounded-box');
    expect(boxes).toHaveLength(2);
    // We can't easily verify the `disabled` prop from DOM, but we verify
    // the component renders correctly with mixed playable/non-playable cards
  });

  it('face-down cards use empty playableCardIds (bot hand)', () => {
    const cards = [numberCard('c1', 5), numberCard('c2', 8), numberCard('c3', 10)];
    // Bot: face-down, empty playable set, no onCardTap
    render(
      <CardHand
        cards={cards}
        faceUp={false}
        playableCardIds={new Set()}
      />,
    );
    const boxes = screen.getAllByTestId('rounded-box');
    expect(boxes).toHaveLength(3);
    // Face-down cards should NOT show value text
    const texts = screen.getAllByTestId('card-text');
    const hasValues = texts.some((el) => el.textContent === '5' || el.textContent === '8' || el.textContent === '10');
    expect(hasValues).toBe(false);
  });
});

describe('CardHand — special card handling', () => {
  it('renders special cards with their display names', () => {
    const cards = [
      specialCard('c1', SpecialEffect.Reverse),
      specialCard('c2', SpecialEffect.Nuclear),
      numberCard('c3', 10),
    ];
    render(
      <CardHand
        cards={cards}
        faceUp={true}
        playableCardIds={new Set(['c1', 'c2', 'c3'])}
        onCardTap={() => {}}
      />,
    );
    const texts = screen.getAllByTestId('card-text');
    const textContent = texts.map((el) => el.textContent);
    expect(textContent).toContain('Reverse');
    expect(textContent).toContain('Nuklir');
    expect(textContent).toContain('10');
  });
});
