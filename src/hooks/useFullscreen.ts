// src/hooks/useFullscreen.ts — Fullscreen API controller with iOS CSS fallback (STORY-020)
//
// Wraps the Browser Fullscreen API with webkit prefix support.
// On iOS Safari (where Fullscreen API is unavailable for non-video elements),
// provides a CSS-based fullscreen fallback.
//
// Features:
// - Detects support via `document.fullscreenEnabled` or `document.webkitFullscreenEnabled`
// - Detects iOS via userAgent + maxTouchPoints (iPad reports as MacIntel)
// - Detects `navigator.standalone` for iOS "Add to Home Screen" PWA mode
// - Subscribes to fullscreen change events via useSyncExternalStore
// - iOS: applies CSS class `css-fullscreen-active` on body + scrollTo(0,1)
// - CSS fullscreen state tracked via useState for reactive re-renders
// - All operations are wrapped in try-catch — never crashes

import { useState, useCallback, useSyncExternalStore } from 'react';

/** CSS class applied to document.body for iOS fullscreen fallback. */
const CSS_FULLSCREEN_CLASS = 'css-fullscreen-active';

/**
 * Return shape of the useFullscreen hook.
 */
export interface UseFullscreenReturn {
  /** Whether the document is currently in fullscreen mode (native or CSS fallback). */
  isFullscreen: boolean;
  /** Request fullscreen on the document element. Resolves even on failure (graceful). */
  enterFullscreen: () => Promise<void>;
  /** Exit fullscreen mode. Resolves even on failure (graceful). */
  exitFullscreen: () => Promise<void>;
  /** Whether the native fullscreen API is supported in the current browser. */
  isSupported: boolean;
  /** Whether the current device is iOS (iPhone, iPad, iPod). */
  isIOS: boolean;
  /** Whether the app is running in iOS standalone (Add to Home Screen) mode. */
  isStandalone: boolean;
}

/**
 * Detect iOS devices.
 * Handles iPad running iPadOS 13+ which reports as MacIntel via navigator.platform.
 * Uses maxTouchPoints to distinguish iPad from actual Mac.
 */
export function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports platform as 'MacIntel' but has touch support
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
  return false;
}

/**
 * Detect whether the app is running in iOS standalone (Add to Home Screen) mode.
 * When `navigator.standalone` is true, the PWA is already fullscreen.
 */
export function detectStandalone(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
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
 * Custom hook that wraps the Browser Fullscreen API with iOS CSS fallback.
 *
 * Features:
 * - Detects support via `document.fullscreenEnabled` or `document.webkitFullscreenEnabled`
 * - Detects iOS devices (iPhone, iPad, iPod) for CSS fullscreen fallback
 * - Subscribes to `fullscreenchange` and `webkitfullscreenchange` events via useSyncExternalStore
 * - `enterFullscreen` uses `requestFullscreen` with webkit fallback, or CSS fallback on iOS
 * - `exitFullscreen` uses `document.exitFullscreen` with webkit fallback, or CSS class removal on iOS
 * - All operations are wrapped in try-catch — never crashes
 *
 * @returns {UseFullscreenReturn} Fullscreen state and control functions.
 */
export function useFullscreen(): UseFullscreenReturn {
  // Support detection — computed once on first render via lazy initializer
  const [isSupported] = useState(detectFullscreenSupport);

  // iOS detection — computed once on first render
  const [isIOS] = useState(detectIOS);

  // Standalone detection — computed once on first render (iOS Add to Home Screen)
  const [isStandalone] = useState(detectStandalone);

  // Track CSS fullscreen state for iOS fallback (useState triggers re-render on toggle)
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);

  // Fullscreen state — synced to document via useSyncExternalStore (no useEffect setState)
  const isFullscreenNative = useSyncExternalStore(
    subscribeFullscreen,
    getFullscreenSnapshot,
    getServerSnapshot,
  );

  // Combined fullscreen state: native OR CSS fullscreen active
  const isFullscreen = isFullscreenNative || isCssFullscreen;

  const enterFullscreen = useCallback(async (): Promise<void> => {
    // iOS CSS fullscreen fallback
    if (isIOS) {
      document.body.classList.add(CSS_FULLSCREEN_CLASS);
      setIsCssFullscreen(true);
      // Attempt to hide iOS status bar by scrolling
      window.scrollTo(0, 1);
      return;
    }

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
  }, [isIOS]);

  const exitFullscreen = useCallback(async (): Promise<void> => {
    // iOS CSS fullscreen fallback
    if (isIOS && isCssFullscreen) {
      document.body.classList.remove(CSS_FULLSCREEN_CLASS);
      setIsCssFullscreen(false);
      return;
    }

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
  }, [isIOS, isCssFullscreen]);

  return { isFullscreen, enterFullscreen, exitFullscreen, isSupported, isIOS, isStandalone };
}
