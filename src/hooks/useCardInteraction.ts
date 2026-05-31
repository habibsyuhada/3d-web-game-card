// src/hooks/useCardInteraction.ts — Card interaction logic (STORY-012, updated STORY-014)
//
// Provides:
// - `handleCardTap(cardId)`: validates and dispatches playCard + drawCard + animations
// - `playableCardIds`: Set<string> of valid card IDs for the given player
//
// Guards:
// 1. Not human's turn → no-op
// 2. Animation in progress → no-op (prevents double-tap)
// 3. Card not in playable set → no-op
// 4. Player index doesn't match current player index → no-op
//
// STORY-014: After playCard + drawCard, enqueue card-play and card-draw animations.
// The animations are processed sequentially by useAnimationQueue hook.

import { useMemo, useCallback } from 'react';
import { useGameStore } from '../store';
import { usePlayableCards, useIsHumanTurn } from '../store/selectors';
import { CARD_ANIMATION_DURATION_MS } from '../types';

/**
 * Custom hook for handling card interactions for a specific player.
 * Primarily used by PlayerSlot3D for the human player's hand.
 *
 * @param playerIndex - The index of the player whose interaction we're handling
 * @returns `{ handleCardTap, playableCardIds }`
 */
export function useCardInteraction(playerIndex: number) {
  const isHumanTurn = useIsHumanTurn();
  const playableCards = usePlayableCards(playerIndex);
  const isAnimating = useGameStore((state) => state.isAnimating);
  const playCard = useGameStore((state) => state.playCard);
  const drawCard = useGameStore((state) => state.drawCard);
  const setTurnMessage = useGameStore((state) => state.setTurnMessage);
  const enqueueAnimation = useGameStore((state) => state.enqueueAnimation);
  const setAnimating = useGameStore((state) => state.setAnimating);

  /**
   * Precomputed Set of playable card IDs, memoized to avoid
   * re-creating the Set on every render.
   */
  const playableCardIds = useMemo(
    () => new Set(playableCards.map((c) => c.id)),
    [playableCards],
  );

  /**
   * Handles a card tap event.
   * Validates that the tap is legal before dispatching state mutations.
   */
  const handleCardTap = useCallback(
    (cardId: string) => {
      // Guard 1: not human's turn (bots cannot trigger this path)
      if (!isHumanTurn) return;

      // Guard 2: animation in progress (prevent double-tap)
      if (isAnimating) return;

      // Guard 3: card not in the playable set
      if (!playableCardIds.has(cardId)) return;

      // Guard 4: player index must match current player (defensive)
      const currentPlayerIndex = useGameStore.getState().currentPlayerIndex;
      if (currentPlayerIndex !== playerIndex) return;

      // Record hand length before play+draw to detect if a draw occurred
      const handSizeBeforePlay =
        useGameStore.getState().players[playerIndex].hand.length;

      // Dispatch card play + draw + turn message (synchronous for MVP)
      playCard(playerIndex, cardId);
      drawCard(playerIndex);
      setTurnMessage('You played a card');

      // Detect whether a draw actually occurred by comparing hand sizes.
      // Before play: N cards. After play: N-1 cards. After draw: N cards (if deck non-empty) or N-1 (if empty).
      const handSizeAfterPlayDraw =
        useGameStore.getState().players[playerIndex].hand.length;
      const didDraw = handSizeAfterPlayDraw > handSizeBeforePlay - 1;

      // STORY-014: Enqueue animations for card play and card draw
      // Player positions per architecture Section 9
      const PLAYER_POSITIONS: Record<number, [number, number, number]> = {
        0: [0, 0, 3.5],
        1: [-3, 0, 0],
        2: [0, 0, -3.5],
        3: [3, 0, 0],
      };

      const fromPos = PLAYER_POSITIONS[playerIndex] || [0, 0, 3.5];

      // Enqueue card-play animation (hand → middle pile)
      enqueueAnimation({
        type: 'card-play',
        payload: {
          cardId,
          playerIndex,
          fromPosition: fromPos,
          toPosition: [0, 0.1, 0],
        },
        duration: CARD_ANIMATION_DURATION_MS,
      });

      // Enqueue card-draw animation (deck → hand) if a draw actually occurred
      if (didDraw) {
        const drawnCard =
          useGameStore.getState().players[playerIndex].hand[
            useGameStore.getState().players[playerIndex].hand.length - 1
          ]; // last added card
        if (drawnCard) {
          enqueueAnimation({
            type: 'card-draw',
            payload: {
              cardId: drawnCard.id,
              playerIndex,
              fromPosition: [1.5, 0.3, 0],
              toPosition: fromPos,
            },
            duration: 300,
          });
        }
      }

      // Set animating flag to block further interactions until animations complete
      setAnimating(true);
    },
    [
      isHumanTurn,
      isAnimating,
      playableCardIds,
      playerIndex,
      playCard,
      drawCard,
      setTurnMessage,
      enqueueAnimation,
      setAnimating,
    ],
  );

  return { handleCardTap, playableCardIds };
}
