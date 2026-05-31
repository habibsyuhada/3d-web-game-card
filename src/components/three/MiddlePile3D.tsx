// src/components/three/MiddlePile3D.tsx — Middle pile of played cards (STORY-013)
//
// Renders the central pile of played cards in the 3D scene:
// - Stacked Card3D objects with Y offset 0.03 per card (performance-capped at top 5)
// - Text display above the stack showing the current pile value
// - Subtle circle outline when pile is empty
//
// Edge cases handled:
// - Empty pile (no cards, null lastValue): renders just a subtle circle
// - Bomb/Nuclear (lastValue null but cards may exist): shows "—" for value
// - Large piles (10+ cards): only renders top 5 cards visually
// - Random card result: shows the rolled number

import { memo } from 'react';
import { Text } from '@react-three/drei';
import { useGameStore } from '../../store';
import { Card3D } from './Card3D';

/** Y offset between stacked cards in the pile. */
const CARD_STACK_OFFSET = 0.03;

/** Maximum number of cards rendered visually in the pile stack. */
const MAX_VISIBLE_CARDS = 5;

/**
 * Middle pile 3D component — renders played cards stacked at the center
 * of the table with the current pile value displayed above.
 *
 * Position: [0, 0.02, 0] (center of table, slight elevation).
 */
export const MiddlePile3D = memo(function MiddlePile3D() {
  const middlePile = useGameStore((state) => state.middlePile);
  const lastValue = useGameStore((state) => state.lastValue);

  // Only render the top N cards for performance (don't render 53 stacked cards)
  const visibleCards = middlePile.slice(-MAX_VISIBLE_CARDS);

  // Determine value display text
  const valueText =
    lastValue !== null ? String(lastValue) : middlePile.length > 0 ? '\u2014' : '';

  return (
    <group position={[0, 0.02, 0]}>
      {/* Empty pile marker — subtle circle outline on table surface */}
      {middlePile.length === 0 && (
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Stacked played cards — flat on the table surface (XY plane rotated) */}
      {visibleCards.map((card, idx) => (
        <group
          key={card.id}
          position={[0, idx * CARD_STACK_OFFSET, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <Card3D card={card} faceUp={true} disabled={true} />
        </group>
      ))}

      {/* Current pile value display — Text above the stack */}
      {valueText !== '' && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {valueText}
        </Text>
      )}
    </group>
  );
});
