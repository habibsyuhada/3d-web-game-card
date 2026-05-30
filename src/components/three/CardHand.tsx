// src/components/three/CardHand.tsx — Hand of cards rendered as a fan (STORY-012)
//
// Arranges 0–3 cards in a fan/spread layout:
//   - 1 card: centered
//   - 2 cards: side-by-side with slight rotation
//   - 3 cards: standard fan with x offsets [-0.8, 0, 0.8], rotation [-5, 0, -5] deg
//
// Cards are interactive only if their ID is in playableCardIds.
// Bot hands are face-down and always pass `disabled={false}` (they cannot be tapped).

import { useMemo } from 'react';
import type { Card } from '../../types';
import { Card3D } from './Card3D';

interface CardHandProps {
  cards: Card[];
  faceUp: boolean;
  playableCardIds: Set<string>;
  onCardTap?: (cardId: string) => void;
}

/**
 * Position + rotation descriptor for a single card within the hand fan.
 */
interface CardLayout {
  x: number;
  y: number;
  rotation: number;
}

/**
 * Computes fan layout positions for `count` cards.
 *   - 1 card: centered, no rotation
 *   - 2 cards: evenly spaced with ±3° tilt
 *   - 3 cards: standard fan with ±5° tilt, middle card elevated
 */
function computeFanLayout(count: number): CardLayout[] {
  if (count === 0) return [];
  if (count === 1) {
    return [{ x: 0, y: 0, rotation: 0 }];
  }
  if (count === 2) {
    const rot3deg = (3 * Math.PI) / 180;
    return [
      { x: -0.5, y: 0, rotation: -rot3deg },
      { x: 0.5, y: 0, rotation: rot3deg },
    ];
  }
  // 3 cards: standard fan
  const rot5deg = (5 * Math.PI) / 180;
  return [
    { x: -0.8, y: 0, rotation: -rot5deg },
    { x: 0, y: 0.1, rotation: 0 },
    { x: 0.8, y: 0, rotation: rot5deg },
  ];
}

/**
 * Renders a player's hand of cards in a fan layout.
 *
 * Disabled logic:
 *   - Face-up hands: cards NOT in `playableCardIds` are disabled
 *   - Face-down hands (bots): no cards are "disabled" visually (they
 *     are uniformly face-down). `onCardTap` will be undefined so they
 *     receive no interaction anyway.
 */
export function CardHand({
  cards,
  faceUp,
  playableCardIds,
  onCardTap,
}: CardHandProps) {
  const layout = useMemo(() => computeFanLayout(cards.length), [cards.length]);

  return (
    <group>
      {cards.map((card, idx) => {
        const pos = layout[idx];
        // Bot (face-down) cards are never visually disabled based on playability;
        // only face-up cards have their interactiveness tied to playableCardIds.
        const isDisabled = faceUp && !playableCardIds.has(card.id);
        return (
          <group
            key={card.id}
            position={[pos.x, pos.y, 0]}
            rotation={[0, 0, pos.rotation]}
          >
            <Card3D
              card={card}
              faceUp={faceUp}
              disabled={isDisabled}
              onTap={onCardTap}
            />
          </group>
        );
      })}
    </group>
  );
}
