// src/components/three/PlayerSlot3D.tsx — Player slot with CardHand + LifeTokens (STORY-012/013)
//
// Renders a single player's card hand and life tokens at a given 3D position.
// - Human (playerIndex 0): face-up cards, interactive taps, playability checks
// - Bots (playerIndex 1–3): face-down cards, no interaction
//
// Also renders a subtle circle marker at the player's slot for spatial orientation.
// Life tokens are rendered in front of the card hand (STORY-013).

import { useGameStore } from '../../store';
import { PlayerType, INITIAL_LIVES } from '../../types';
import { CardHand } from './CardHand';
import { LifeTokens } from './LifeTokens';
import { useCardInteraction } from '../../hooks/useCardInteraction';

interface PlayerSlot3DProps {
  playerIndex: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Renders a player's slot in the 3D scene: card hand + life tokens + position marker.
 *
 * The human slot (playerIndex 0) uses `useCardInteraction` to enable
 * tap-to-play. Bot slots render face-down, non-interactive cards.
 * Life tokens appear in front of the card hand for all players.
 */
export function PlayerSlot3D({
  playerIndex,
  position,
  rotation = [0, 0, 0],
}: PlayerSlot3DProps) {
  const player = useGameStore((state) => state.players[playerIndex]);

  // Only human gets interaction; bots are non-interactive
  const isHuman = player?.type === PlayerType.Human;
  const { handleCardTap, playableCardIds } = useCardInteraction(playerIndex);

  if (!player) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* Player's card hand */}
      <CardHand
        cards={player.hand}
        faceUp={isHuman}
        playableCardIds={isHuman ? playableCardIds : new Set()}
        onCardTap={isHuman ? handleCardTap : undefined}
      />

      {/* Life tokens — positioned in front of the card hand (STORY-013) */}
      <LifeTokens
        count={player.lives}
        position={[0, 0.02, -0.7]}
        maxLives={INITIAL_LIVES}
      />

      {/* Subtle circle marker at the base of the slot for spatial orientation */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial
          color={isHuman ? '#fbbf24' : '#6b7280'}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}
