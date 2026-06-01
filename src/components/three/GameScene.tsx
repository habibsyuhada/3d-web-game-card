// src/components/three/GameScene.tsx — Root 3D scene component
//
// Renders inside an R3F <Canvas> and sets up:
// - Lighting rig: ambient, key directional, fill directional, spot (pile)
// - Table (procedural green felt surface)
// - Middle pile — stacked played cards with value display (STORY-013)
// - Deck pile — visual draw pile indicator (STORY-013)
// - 4 player slots at cardinal positions with life tokens (STORY-012/013)
// - Animation layer — card play/draw animations (STORY-014)

import { Table3D } from './Table3D';
import { MiddlePile3D } from './MiddlePile3D';
import { DeckPile3D } from './DeckPile3D';
import { PlayerSlot3D } from './PlayerSlot3D';
import { CardAnimation } from './CardAnimation';
import { CardDrawAnimation } from './CardDrawAnimation';
import { BombVFX, NuclearVFX, ReverseVFX, SkipVFX, RandomVFX } from './vfx';
import { useAnimationQueue } from '../../hooks/useAnimationQueue';
import { useGameStore } from '../../store';
import { CardType, SpecialEffect } from '../../types';
import type { Card } from '../../types';

/** Fallback card used when the original card cannot be resolved from state. */
const FALLBACK_CARD: Card = {
  id: 'unknown',
  type: CardType.Number,
  value: 1,
  effect: null,
};

export function GameScene() {
  const { currentAnimation, onAnimationComplete } = useAnimationQueue();
  const middlePile = useGameStore((state) => state.middlePile);
  const players = useGameStore((state) => state.players);

  // STORY-018: Read active VFX state from animation slice.
  // VFX components render conditionally based on activeVFX and auto-unmount
  // via their onComplete callback.
  const activeVFX = useGameStore((state) => state.activeVFX);
  const vfxPosition = useGameStore((state) => state.vfxPosition);
  const lastValue = useGameStore((state) => state.lastValue);
  const setActiveVFX = useGameStore((state) => state.setActiveVFX);

  // Resolve card for card-play animation:
  // The card has already been moved to middlePile by the store action,
  // so we look it up there.
  const resolvePlayedCard = (cardId?: string): Card => {
    if (!cardId) return FALLBACK_CARD;
    return middlePile.find((c) => c.id === cardId) ?? FALLBACK_CARD;
  };

  // Resolve card for card-draw animation:
  // The card has already been added to the player's hand by the store action.
  const resolveDrawnCard = (playerIndex: number, cardId?: string): Card => {
    if (!cardId) return FALLBACK_CARD;
    const player = players[playerIndex];
    if (!player) return FALLBACK_CARD;
    return player.hand.find((c) => c.id === cardId) ?? FALLBACK_CARD;
  };

  return (
    <>
      {/* Lighting rig — per architecture Section 9 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />
      <spotLight
        position={[0, 6, 0]}
        intensity={0.5}
        angle={0.6}
        penumbra={0.3}
      />

      {/* Table at center */}
      <Table3D />

      {/* Middle pile — played cards + value display (STORY-013) */}
      <MiddlePile3D />

      {/* Deck pile — draw pile visual (STORY-013) */}
      <DeckPile3D />

      {/* 4 player slots at cardinal positions */}
      <PlayerSlot3D playerIndex={0} position={[0, 0, 3.5]} rotation={[0, 0, 0]} />
      <PlayerSlot3D playerIndex={1} position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <PlayerSlot3D playerIndex={2} position={[0, 0, -3.5]} rotation={[0, Math.PI, 0]} />
      <PlayerSlot3D playerIndex={3} position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Animation layer — card play/draw animations (STORY-014) */}
      {currentAnimation && currentAnimation.type === 'card-play' && (
        <CardAnimation
          card={resolvePlayedCard(currentAnimation.payload.cardId)}
          fromPosition={currentAnimation.payload.fromPosition ?? [0, 0, 3.5]}
          toPosition={currentAnimation.payload.toPosition ?? [0, 0.1, 0]}
          faceUp={currentAnimation.payload.playerIndex === 0}
          onComplete={onAnimationComplete}
        />
      )}
      {currentAnimation && currentAnimation.type === 'card-draw' && (
        <CardDrawAnimation
          card={resolveDrawnCard(
            currentAnimation.payload.playerIndex ?? 0,
            currentAnimation.payload.cardId,
          )}
          toPosition={currentAnimation.payload.toPosition ?? [0, 0, 3.5]}
          faceUp={currentAnimation.payload.playerIndex === 0}
          onComplete={onAnimationComplete}
        />
      )}

      {/* VFX layer — STORY-018: Special card visual effects */}
      {activeVFX !== null && vfxPosition !== null && (
        <>
          {activeVFX === SpecialEffect.Bomb && (
            <BombVFX
              position={vfxPosition}
              onComplete={() => setActiveVFX(null)}
            />
          )}
          {activeVFX === SpecialEffect.Nuclear && (
            <NuclearVFX
              position={vfxPosition}
              onComplete={() => setActiveVFX(null)}
            />
          )}
          {activeVFX === SpecialEffect.Reverse && (
            <ReverseVFX
              position={vfxPosition}
              onComplete={() => setActiveVFX(null)}
            />
          )}
          {activeVFX === SpecialEffect.Skip && (
            <SkipVFX
              position={vfxPosition}
              onComplete={() => setActiveVFX(null)}
            />
          )}
          {activeVFX === SpecialEffect.Random && (
            <RandomVFX
              position={vfxPosition}
              finalValue={lastValue ?? 7}
              onComplete={() => setActiveVFX(null)}
            />
          )}
        </>
      )}
    </>
  );
}
