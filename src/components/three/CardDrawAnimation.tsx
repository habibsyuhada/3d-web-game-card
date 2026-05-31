// src/components/three/CardDrawAnimation.tsx — Card draw fly animation (STORY-014)
//
// Animates a Card3D from the deck position to a player's hand position.
// Used when a card is drawn (deck → hand).
// Duration: 300ms (faster than play animation).
//
// The card starts face-down during flight. For the human player, the destination
// card will be face-up (handled by the hand re-render after animation).

import React, { memo } from 'react';
import { motion } from 'framer-motion-3d';
import type { Card } from '../../types';
import { Card3D } from './Card3D';

/** Motion-wrapped Three.js group element for position animation. */
// Type assertion: framer-motion-3d's custom() return type is incomplete in .d.ts
const MotionGroup = motion('group') as React.ComponentType<{
  children?: React.ReactNode;
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  onAnimationComplete?: () => void;
  rotation?: [number, number, number];
}>;

/** Deck source position (matching DeckPile3D position + elevation). */
const DECK_FROM_POSITION: [number, number, number] = [1.5, 0.3, 0];

/** Default draw animation duration in ms. */
const DRAW_DURATION_MS = 300;

interface CardDrawAnimationProps {
  card: Card;
  toPosition: [number, number, number];
  faceUp: boolean;
  onComplete: () => void;
  duration?: number;
}

/**
 * Animated card that flies from the deck position to a player's hand position.
 * Used for card draw animations (deck → hand).
 *
 * The card is rendered as a "ghost" — separate from the actual hand rendering.
 * The store has already added the card to the player's hand; this component
 * shows it visually flying from the deck to its destination.
 *
 * Cards fly face-down during transit, matching the visual expectation that
 * drawn cards come from the face-down deck pile.
 */
export const CardDrawAnimation = memo(function CardDrawAnimation({
  card,
  toPosition,
  faceUp,
  onComplete,
  duration = DRAW_DURATION_MS,
}: CardDrawAnimationProps) {
  return (
    <MotionGroup
      initial={{ position: DECK_FROM_POSITION }}
      animate={{ position: toPosition }}
      transition={{ duration: duration / 1000, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <Card3D card={card} faceUp={faceUp} disabled={true} />
    </MotionGroup>
  );
});
