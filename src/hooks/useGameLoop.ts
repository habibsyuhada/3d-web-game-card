// src/hooks/useGameLoop.ts — Game loop orchestration hook (STORY-015)
//
// Main orchestration hook that reacts to currentPlayerIndex and game state changes.
// Responsibility split:
//   - useGameLoop: handles turn flow for ALL players (eliminated skip, human messages),
//     and post-action flow for the HUMAN player (elimination, winner, deadlock, advance).
//   - useBotTurn: handles bot decision-making and post-action flow for bots.
//
// Turn resolution flow:
//   1. Is current player alive? NO → advanceTurn()
//   2. Is it the human's turn? YES → set "Your turn!" and wait for tap
//   3. Is it a bot's turn? YES → no-op (useBotTurn handles it)
//   4. After any card play (animation ends for human):
//      a. Check if player lost life to 0 → eliminatePlayer
//      b. checkAndSetWinner()
//      c. resolveDeadlock()
//      d. advanceTurn()
//
// CRITICAL: Uses useRef to prevent infinite loops caused by
// useEffect re-triggering on every state mutation.

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import {
  PlayerType,
  PlayerStatus,
  GameStatus,
} from '../types';

/**
 * Post-action checks: elimination, win condition, deadlock resolution.
 * Called after a human's card play animations complete.
 */
function handlePostAction(playerIndex: number): void {
  const state = useGameStore.getState();
  const player = state.players[playerIndex];

  // Check elimination: if lives reached 0
  if (player && player.lives === 0 && player.status !== PlayerStatus.Eliminated) {
    state.eliminatePlayer(playerIndex);
    state.setTurnMessage(`${player.name} has been eliminated!`);
  }

  // Check win condition
  state.checkAndSetWinner();

  // Check deadlock
  if (useGameStore.getState().gameStatus === GameStatus.Playing) {
    state.resolveDeadlock();
  }
}

/**
 * Custom hook that orchestrates the main game loop.
 *
 * This hook:
 * 1. Skips eliminated players automatically (advanceTurn)
 * 2. Sets "Your turn!" message for the human player
 * 3. After human card play animations complete, runs post-action checks and advances turn
 * 4. Stops processing when the game is finished
 *
 * This hook does NOT handle bot turns — that's useBotTurn's responsibility.
 * The two hooks work together via shared state (currentPlayerIndex, isAnimating).
 */
export function useGameLoop(): void {
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isAnimating = useGameStore((s) => s.isAnimating);

  /** Tracks previous isAnimating value to detect animation completion. */
  const prevAnimatingRef = useRef(false);

  /** Tracks whether we've already set the human turn message for this turn. */
  const humanMessageSetRef = useRef(false);

  useEffect(() => {
    // ── Guard: game is over ───────────────────────────────────────────────
    if (gameStatus === GameStatus.Finished) {
      // Reset refs when game ends
      prevAnimatingRef.current = false;
      humanMessageSetRef.current = false;
      return;
    }

    // ── Wait for animations to finish ─────────────────────────────────────
    if (isAnimating) {
      prevAnimatingRef.current = true;
      return;
    }

    // ── Detect animation completion ───────────────────────────────────────
    const animationJustEnded = prevAnimatingRef.current && !isAnimating;
    prevAnimatingRef.current = false;

    // ── Get current player ────────────────────────────────────────────────
    const state = useGameStore.getState();
    const current = state.players[state.currentPlayerIndex];
    if (!current) return;

    // ── Skip eliminated players ───────────────────────────────────────────
    if (current.status !== PlayerStatus.Alive) {
      state.advanceTurn();
      // Reset human message flag when turn advances past dead player
      humanMessageSetRef.current = false;
      return;
    }

    // ── Human player's turn ───────────────────────────────────────────────
    if (current.type === PlayerType.Human) {
      if (animationJustEnded) {
        // Human just finished playing a card — run post-action checks
        handlePostAction(state.currentPlayerIndex);

        const afterState = useGameStore.getState();
        if (afterState.gameStatus === GameStatus.Playing) {
          afterState.advanceTurn();
        }
        // Reset message flag for next human turn
        humanMessageSetRef.current = false;
      } else if (!humanMessageSetRef.current) {
        // Fresh human turn — set the message
        state.setTurnMessage('Your turn! Play a card');
        humanMessageSetRef.current = true;
      }
      return;
    }

    // ── Bot player's turn ─────────────────────────────────────────────────
    // useBotTurn handles everything for bots. We just reset the human message flag
    // so it's ready when it's the human's turn next.
    humanMessageSetRef.current = false;

    // If animations just ended on a bot's turn, it's handled by useBotTurn
    // We don't do anything here to avoid double-processing.
  }, [currentPlayerIndex, gameStatus, isAnimating]);
}
