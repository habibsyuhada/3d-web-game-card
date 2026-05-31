// src/components/three/CardAnimation.tsx — Card play fly animation (STORY-014)
//
// Animates a Card3D from a source position to a target position using framer-motion-3d.
// Used when a card is played (hand → middle pile).
// Duration: CARD_ANIMATION_DURATION_MS (400ms).
// Fires onComplete when animation finishes.

import React, { memo } from 'react';
import { motion } from 'framer-motion-3d';
import { CARD_ANIMATION_DURATION_MS } from '../../types';
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

interface CardAnimationProps {
  card: Card;
  fromPosition: [number, number, number];
  toPosition: [number, number, number];
  faceUp: boolean;
  onComplete: () => void;
  duration?: number;
}

/**
 * Animated card that flies from one position to another in the 3D scene.
 * Used for card play animations (hand → middle pile).
 *
 * The card is rendered as a "ghost" — it is separate from the actual hand
 * rendering. The store has already removed the card from the player's hand;
 * this component shows it visually flying to its destination.
 *
 * The group is rotated to lay the card flat on the table (cards in hand
 * are stood upright, but flying cards should be horizontal like the pile).
 */
export const CardAnimation = memo(function CardAnimation({
  card,
  fromPosition,
  toPosition,
  faceUp,
  onComplete,
  duration = CARD_ANIMATION_DURATION_MS,
}: CardAnimationProps) {
  return (
    <MotionGroup
      initial={{ position: fromPosition }}
      animate={{ position: toPosition }}
      transition={{ duration: duration / 1000, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <Card3D card={card} faceUp={faceUp} disabled={true} />
    </MotionGroup>
  );
});
