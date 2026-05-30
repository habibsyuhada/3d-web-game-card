// src/components/three/Card3D.tsx — 3D card component (STORY-012)
//
// Procedural card mesh composed of:
// 1. RoundedBox body (0.7 × 1.0 × 0.02) — card body
// 2. Front face Text — card value or special card name
// 3. Edge stripe — visual type indicator (blue for number, red for special)
//
// Supports face-up (interactive) and face-down (bot) rendering.
// Disabled state: reduced opacity, no pointer events.
// Hover effect: slight elevation + scale.

import { memo, useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import { CardType, SpecialEffect } from '../../types';
import type { Card } from '../../types';
import { getCardDisplayValue } from '../../engine';

interface Card3DProps {
  card: Card;
  faceUp: boolean;
  disabled: boolean;
  onTap?: (cardId: string) => void;
}

/**
 * Returns a distinctive text color for each special card effect.
 * Provides quick visual identification beyond card name alone.
 */
function getSpecialColor(effect: SpecialEffect): string {
  switch (effect) {
    case SpecialEffect.Reverse:
      return '#16a34a'; // green
    case SpecialEffect.Skip:
      return '#ca8a04'; // yellow/brown
    case SpecialEffect.Bomb:
      return '#dc2626'; // red
    case SpecialEffect.Nuclear:
      return '#7c3aed'; // purple
    case SpecialEffect.Random:
      return '#0891b2'; // cyan
  }
}

/**
 * Single 3D card rendered in the scene.
 *
 * Wrapped in React.memo to prevent unnecessary re-renders when parent
 * state changes do not affect this specific card's props.
 *
 * Card dimensions: 0.7 × 1.0 × 0.02 per architecture Section 9.
 */
export const Card3D = memo(function Card3D({
  card,
  faceUp,
  disabled,
  onTap,
}: Card3DProps) {
  const [hovered, setHovered] = useState(false);

  // Card body color: white for face-up, dark blue for face-down
  const bodyColor = faceUp ? '#ffffff' : '#1e3a5f';

  return (
    <group
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!disabled && onTap) {
          onTap(card.id);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!disabled) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      position={hovered ? [0, 0.05, 0] : [0, 0, 0]}
      scale={hovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
    >
      {/* Card body — RoundedBox 0.7 × 1.0 × 0.02, radius 0.03 */}
      <RoundedBox args={[0.7, 1.0, 0.02]} radius={0.03} smoothness={2}>
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.6}
          metalness={0.1}
          transparent={disabled}
          opacity={disabled ? 0.4 : 1}
        />
      </RoundedBox>

      {/* Front face text — card value or special effect name */}
      {faceUp && (
        <Text
          position={[0, 0, 0.015]}
          fontSize={card.type === CardType.Special ? 0.15 : 0.3}
          color={
            card.type === CardType.Special && card.effect
              ? getSpecialColor(card.effect)
              : '#000000'
          }
          anchorX="center"
          anchorY="middle"
          maxWidth={0.55}
        >
          {getCardDisplayValue(card)}
        </Text>
      )}

      {/* Face-down back pattern — "ZZ" watermark text */}
      {!faceUp && (
        <Text
          position={[0, 0, -0.015]}
          fontSize={0.15}
          color="#4a6fa5"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
        >
          {'ZZ'}
        </Text>
      )}

      {/* Edge stripe on right side — blue for number cards, red for special */}
      <mesh position={[0.35, 0, 0]}>
        <boxGeometry args={[0.02, 0.9, 0.025]} />
        <meshStandardMaterial
          color={card.type === CardType.Special ? '#dc2626' : '#2563eb'}
          transparent={disabled}
          opacity={disabled ? 0.4 : 1}
        />
      </mesh>

      {/* Disabled overlay — darkening layer for visual disabled indicator */}
      {disabled && (
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.65, 0.95]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
});
