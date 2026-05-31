// src/hooks/useBotTurn.ts — Bot turn decision hook (STORY-015)
//
// Handles automatic bot decision-making with a visible delay:
// 1. When it's a bot's turn and the bot is alive, sets "thinking..." message
// 2. Waits BOT_TURN_DELAY_MS (1500ms) before deciding
// 3. Calls decideBotPlay to determine action
// 4. If 'play': dispatches playCard + drawCard + enqueues animations
// 5. If 'pass': dispatches passTurn + handles elimination/winner/deadlock + advanceTurn
//
// Guards:
// - Skips if not bot's turn
// - Skips if bot is eliminated
// - Skips if game is finished
// - Waits for isAnimating to be false before acting
// - Cleans up timeout on unmount or turn change
// - Uses refs to prevent re-entrancy and infinite loops

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store';
import { decideBotPlay } from '../engine';
import {
  PlayerType,
  PlayerStatus,
  GameStatus,
  BOT_TURN_DELAY_MS,
  CARD_ANIMATION_DURATION_MS,
} from '../types';

/**
 * Player positions used for animation enqueueing (same as useCardInteraction).
 * Maps player index to 3D world-space position at the table.
 */
const PLAYER_POSITIONS: Record<number, [number, number, number]> = {
  0: [0, 0, 3.5],
  1: [-3, 0, 0],
  2: [0, 0, -3.5],
  3: [3, 0, 0],
};

/** Middle pile position (center of the table). */
const MIDDLE_PILE_POS: [number, number, number] = [0, 0.1, 0];

/** Deck position on the table. */
const DECK_POS: [number, number, number] = [1.5, 0.3, 0];

/**
 * Post-action checks: elimination, win condition, deadlock resolution.
 * Called after any card play or pass action completes.
 */
function handlePostAction(playerIndex: number): void {
  const state = useGameStore.getState();
  const player = state.players[playerIndex];

  // Check elimination: if lives reached 0 after passTurn
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
 * Custom hook that handles bot turn decisions automatically.
 *
 * When it's a bot's turn:
 * 1. Sets a "thinking..." message
 * 2. Waits BOT_TURN_DELAY_MS before calling decideBotPlay
 * 3. Dispatches the decided action (play or pass)
 * 4. Handles post-action flow (elimination, winner, deadlock)
 * 5. Advances the turn
 *
 * For 'play' actions, turn advancement happens after animations complete.
 * For 'pass' actions, turn advancement happens immediately.
 */
export function useBotTurn(): void {
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const isAnimating = useGameStore((s) => s.isAnimating);

  /** Timeout handle for the bot thinking delay. */
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Tracks whether a bot just played a card and is waiting for animations. */
  const pendingPlayRef = useRef(false);

  /** Tracks previous isAnimating to detect animation completion. */
  const prevAnimatingRef = useRef(false);

  /** Tracks whether a thinking timer is already active for the current turn. */
  const timerActiveRef = useRef(false);

  useEffect(() => {
    // ── Guard: game is over ───────────────────────────────────────────────
    if (gameStatus !== GameStatus.Playing) {
      // Clean up any pending timer
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      timerActiveRef.current = false;
      pendingPlayRef.current = false;
      prevAnimatingRef.current = false;
      return;
    }

    // ── Guard: get current player ─────────────────────────────────────────
    const state = useGameStore.getState();
    const current = state.players[state.currentPlayerIndex];
    if (!current) return;

    // ── Guard: not a bot or not alive ─────────────────────────────────────
    if (current.type !== PlayerType.Bot || current.status !== PlayerStatus.Alive) {
      // Reset bot-specific refs when it's not a bot's turn
      timerActiveRef.current = false;
      prevAnimatingRef.current = isAnimating;
      return;
    }

    // ── Handle animation completion after bot play ────────────────────────
    if (pendingPlayRef.current && prevAnimatingRef.current && !isAnimating) {
      prevAnimatingRef.current = false;
      pendingPlayRef.current = false;
      timerActiveRef.current = false;

      // Post-action: check elimination, winner, deadlock
      handlePostAction(state.currentPlayerIndex);

      // Advance turn after bot play animations complete
      const latestState = useGameStore.getState();
      if (latestState.gameStatus === GameStatus.Playing) {
        latestState.advanceTurn();
      }
      return;
    }

    // Track previous animating state
    prevAnimatingRef.current = isAnimating;

    // ── Guard: wait for animations to finish ──────────────────────────────
    if (isAnimating) return;

    // ── Guard: don't start a new timer if one is already running ──────────
    if (timerActiveRef.current) return;

    // ── Bot thinking delay ────────────────────────────────────────────────
    timerActiveRef.current = true;

    // "Thinking" message (FR-065: visible delay)
    state.setTurnMessage(`${current.name} is thinking...`);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      const latestState = useGameStore.getState();

      // Re-validate game state after delay
      if (latestState.gameStatus !== GameStatus.Playing) return;

      const bot = latestState.players[latestState.currentPlayerIndex];
      if (!bot || bot.type !== PlayerType.Bot || bot.status !== PlayerStatus.Alive) return;

      // Make bot decision
      const decision = decideBotPlay(bot.hand, latestState.lastValue);

      if (decision.action === 'play' && decision.cardId) {
        // ── Play a card ───────────────────────────────────────────────────
        const playerIdx = latestState.currentPlayerIndex;
        const cardId = decision.cardId;

        // Record hand length to detect if draw occurred
        const handSizeBefore = latestState.players[playerIdx].hand.length;

        // Dispatch play + draw
        latestState.playCard(playerIdx, cardId);
        latestState.drawCard(playerIdx);

        // Update message
        const updatedState = useGameStore.getState();
        latestState.setTurnMessage(`${bot.name} played a card`);

        // Detect if draw occurred
        const handSizeAfter = updatedState.players[playerIdx].hand.length;
        const didDraw = handSizeAfter > handSizeBefore - 1;

        // Enqueue animations
        const fromPos = PLAYER_POSITIONS[playerIdx] || [0, 0, 3.5];

        // Card-play animation (hand → middle pile)
        updatedState.enqueueAnimation({
          type: 'card-play',
          payload: {
            cardId,
            playerIndex: playerIdx,
            fromPosition: fromPos,
            toPosition: MIDDLE_PILE_POS,
          },
          duration: CARD_ANIMATION_DURATION_MS,
        });

        // Card-draw animation (deck → hand) if draw occurred
        if (didDraw) {
          const drawnCard =
            updatedState.players[playerIdx].hand[
              updatedState.players[playerIdx].hand.length - 1
            ];
          if (drawnCard) {
            updatedState.enqueueAnimation({
              type: 'card-draw',
              payload: {
                cardId: drawnCard.id,
                playerIndex: playerIdx,
                fromPosition: DECK_POS,
                toPosition: fromPos,
              },
              duration: 300,
            });
          }
        }

        // Mark that we're waiting for animations before advancing turn
        pendingPlayRef.current = true;
        updatedState.setAnimating(true);
      } else {
        // ── Pass (lose a life) ────────────────────────────────────────────
        const playerIdx = latestState.currentPlayerIndex;
        latestState.passTurn(playerIdx);
        latestState.setTurnMessage(`${bot.name} lost a life!`);

        // Post-action checks
        handlePostAction(playerIdx);

        // Advance turn immediately (no animation for life loss in MVP)
        const afterState = useGameStore.getState();
        if (afterState.gameStatus === GameStatus.Playing) {
          afterState.advanceTurn();
        }
        timerActiveRef.current = false;
      }
    }, BOT_TURN_DELAY_MS);

    // Cleanup: clear the timeout if the effect re-runs before it fires
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [currentPlayerIndex, gameStatus, isAnimating]);
}
