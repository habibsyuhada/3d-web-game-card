// src/hooks/useCardInteraction.ts — Card interaction logic (STORY-012)
//
// Provides:
// - `handleCardTap(cardId)`: validates and dispatches playCard + drawCard
// - `playableCardIds`: Set<string> of valid card IDs for the given player
//
// Guards:
// 1. Not human's turn → no-op
// 2. Animation in progress → no-op (prevents double-tap)
// 3. Card not in playable set → no-op
// 4. Player index doesn't match current player index → no-op
//
// For MVP (STORY-012), card play and draw happen synchronously.
// Animation delay will be introduced in STORY-014 via the animation queue.

import { useMemo, useCallback } from 'react';
import { useGameStore } from '../store';
import { usePlayableCards, useIsHumanTurn } from '../store/selectors';

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

      // Dispatch card play + draw + turn message (synchronous for MVP)
      playCard(playerIndex, cardId);
      drawCard(playerIndex);
      setTurnMessage('You played a card');
    },
    [
      isHumanTurn,
      isAnimating,
      playableCardIds,
      playerIndex,
      playCard,
      drawCard,
      setTurnMessage,
    ],
  );

  return { handleCardTap, playableCardIds };
}
