// src/store/ui-slice.ts — UI state slice: title screen, fullscreen, messages, game over
// Uses immer middleware for clean mutation syntax.

import type { StateCreator } from 'zustand';
import type { GameStore } from './index';

/**
 * UI slice manages visual/UI-only state that does not affect game logic:
 * - Fullscreen API state
 * - Title screen / Game screen toggle
 * - Turn indicator messages
 * - Game over overlay
 * - Message queue for transient UI notifications
 */
export interface UISlice {
  /** Whether the document is currently in fullscreen mode. */
  isFullscreen: boolean;
  /** Whether to display the title/landing screen. */
  showTitleScreen: boolean;
  /** Current turn message, e.g. "Your turn!" or "Bot 2 is thinking..." */
  turnMessage: string;
  /** Whether to display the game-over overlay. */
  showGameOver: boolean;
  /** Currently displayed transient message. Empty string = no message. */
  showMessage: string;
  /** Queue of pending messages to display sequentially. */
  messageQueue: string[];

  /** Sets fullscreen state flag. */
  setFullscreen: (value: boolean) => void;
  /** Shows or hides the title screen. */
  setShowTitleScreen: (value: boolean) => void;
  /** Updates the current turn message. */
  setTurnMessage: (msg: string) => void;
  /** Shows or hides the game-over overlay. */
  setShowGameOver: (value: boolean) => void;
  /** Appends a message to the queue. */
  pushMessage: (msg: string) => void;
  /** Clears the message queue and the active message. */
  clearMessages: () => void;
}

/**
 * Creates the UI slice for the Zustand store.
 * @param set - Zustand set function (wrapped by immer)
 * @returns Initial state + action implementations
 */
export const createUISlice: StateCreator<
  GameStore,
  [['zustand/immer', never]],
  [],
  UISlice
> = (set) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  isFullscreen: false,
  showTitleScreen: true,
  turnMessage: '',
  showGameOver: false,
  showMessage: '',
  messageQueue: [],

  // ── Actions ──────────────────────────────────────────────────────────────

  setFullscreen: (value: boolean) =>
    set((draft) => {
      draft.isFullscreen = value;
    }),

  setShowTitleScreen: (value: boolean) =>
    set((draft) => {
      draft.showTitleScreen = value;
    }),

  setTurnMessage: (msg: string) =>
    set((draft) => {
      draft.turnMessage = msg;
    }),

  setShowGameOver: (value: boolean) =>
    set((draft) => {
      draft.showGameOver = value;
    }),

  pushMessage: (msg: string) =>
    set((draft) => {
      draft.messageQueue.push(msg);
      // If no message currently displayed, promote the first queued message
      if (draft.showMessage === '') {
        draft.showMessage = draft.messageQueue.shift() ?? '';
      }
    }),

  clearMessages: () =>
    set((draft) => {
      draft.showMessage = '';
      draft.messageQueue = [];
    }),
});
