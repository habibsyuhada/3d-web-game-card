// src/components/three/DeckPile3D.tsx — Visual representation of the draw pile (STORY-013)
//
// Renders a stack of face-down cards as a RoundedBox with height proportional to
// the remaining deck count. Positioned slightly offset from the middle pile.
//
// Performance:
// - React.memo prevents unnecessary re-renders
// - Subscribes only to deck.length via useDeckCount() selector
// - Height capped at Math.min(deckCount, 30) * 0.025 for visual sanity
//
// When deck is 0: renders a minimal flat box (0.01 height) as an empty marker.

import { memo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useDeckCount } from '../../store/selectors';

/** Height per visual card in the deck stack. */
const CARD_THICKNESS = 0.025;

/** Maximum number of cards visually represented in the stack. */
const MAX_VISUAL_CARDS = 30;

/** Minimum height when deck is empty — subtle flat marker. */
const EMPTY_DECK_HEIGHT = 0.01;

/**
 * Deck pile 3D visual — a RoundedBox whose height represents
// the number of remaining cards in the draw pile.
 *
 * Position: [1.5, 0.02, 0] — offset to the right of the middle pile.
 */
export const DeckPile3D = memo(function DeckPile3D() {
  const deckCount = useDeckCount();

  const visualCards = Math.min(deckCount, MAX_VISUAL_CARDS);
  const height =
    deckCount > 0 ? visualCards * CARD_THICKNESS : EMPTY_DECK_HEIGHT;

  // Y position: half the height so the bottom of the box sits at y ≈ 0
  const yPos = height / 2;

  return (
    <group position={[1.5, 0.02, 0]}>
      <RoundedBox
        args={[0.7, height, 1.0]}
        radius={0.02}
        smoothness={2}
        position={[0, yPos, 0]}
      >
        <meshStandardMaterial
          color={deckCount > 0 ? '#1e3a5f' : '#4a4a4a'}
          roughness={0.7}
          metalness={0.1}
          transparent={deckCount === 0}
          opacity={deckCount === 0 ? 0.3 : 1}
        />
      </RoundedBox>

      {/* Card back pattern watermark on top of deck */}
      {deckCount > 0 && (
        <mesh position={[0, height + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.9]} />
          <meshBasicMaterial color="#2a4f7a" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
});
