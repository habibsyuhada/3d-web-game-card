// src/hooks/useFullscreen.ts — Fullscreen API controller hook
// Wraps the Browser Fullscreen API with webkit prefix support.
// Gracefully handles browsers that don't support fullscreen (e.g. iOS Safari).

import { useState, useCallback, useSyncExternalStore } from 'react';

/**
 * Return shape of the useFullscreen hook.
 */
export interface UseFullscreenReturn {
  /** Whether the document is currently in fullscreen mode. */
  isFullscreen: boolean;
  /** Request fullscreen on the document element. Resolves even on failure (graceful). */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen mode. Resolves even on failure (graceful). */
  exitFullscreen: () => Promise<void>;
  /** Whether the fullscreen API is supported in the current browser. */
  isSupported: boolean;
}

/**
 * Read the current fullscreen element from the document.
 * Used by useSyncExternalStore to subscribe to fullscreen changes.
 */
function getFullscreenSnapshot(): boolean {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    (document as unknown as Record<string, unknown>).webkitFullscreenElement
  );
}

/**
 * Server-side snapshot — always false (no fullscreen on server).
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Subscribe to fullscreen change events on the document.
 * Used by useSyncExternalStore.
 */
function subscribeFullscreen(callback: () => void): () => void {
  document.addEventListener('fullscreenchange', callback);
  document.addEventListener('webkitfullscreenchange', callback);
  return () => {
    document.removeEventListener('fullscreenchange', callback);
    document.removeEventListener('webkitfullscreenchange', callback);
  };
}

/**
 * Detect fullscreen API support synchronously.
 * Computed once via useState lazy initializer.
 */
function detectFullscreenSupport(): boolean {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenEnabled ||
    (document as unknown as Record<string, unknown>).webkitFullscreenEnabled
  );
}

/**
 * Custom hook that wraps the Browser Fullscreen API.
 *
 * Features:
 * - Detects support via `document.fullscreenEnabled` or `document.webkitFullscreenEnabled`
 * - Subscribes to `fullscreenchange` and `webkitfullscreenchange` events via useSyncExternalStore
 * - `enterFullscreen` uses `requestFullscreen` with webkit fallback
 * - `exitFullscreen` uses `document.exitFullscreen` with webkit fallback
 * - All operations are wrapped in try-catch — never crashes
 *
 * @returns {UseFullscreenReturn} Fullscreen state and control functions.
 */
export function useFullscreen(): UseFullscreenReturn {
  // Support detection — computed once on first render via lazy initializer
  const [isSupported] = useState(detectFullscreenSupport);

  // Fullscreen state — synced to document via useSyncExternalStore (no useEffect setState)
  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    getFullscreenSnapshot,
    getServerSnapshot,
  );

  const enterFullscreen = useCallback(async (): Promise<void> => {
    try {
      const el = document.documentElement as unknown as Record<string, unknown>;
      if (typeof el.requestFullscreen === 'function') {
        await (el.requestFullscreen as () => Promise<void>)();
      } else if (typeof el.webkitRequestFullscreen === 'function') {
        await (el.webkitRequestFullscreen as () => Promise<void>)();
      }
    } catch {
      // Graceful: fullscreen request failed (e.g. user denied, or not in user gesture context)
      // Caller should proceed without fullscreen per FR-004
    }
  }, []);

  const exitFullscreen = useCallback(async (): Promise<void> => {
    try {
      if (typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen();
      } else {
        const doc = document as unknown as Record<string, unknown>;
        if (typeof doc.webkitExitFullscreen === 'function') {
          await (doc.webkitExitFullscreen as () => Promise<void>)();
        }
      }
    } catch {
      // Graceful: exit fullscreen failed — noop
    }
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen, isSupported };
}
