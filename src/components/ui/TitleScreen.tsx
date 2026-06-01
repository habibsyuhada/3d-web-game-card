// src/components/ui/TitleScreen.tsx — Landing screen with game title and fullscreen entry
// Displays a full-viewport centered layout with the game title and a PLAY FULLSCREEN button.
// On button tap: enters fullscreen (if supported), hides title screen, and initializes the game.

import { useFullscreen } from '../../hooks/useFullscreen';
import { useGameStore } from '../../store';

/**
 * TitleScreen component — the first thing users see when they open the game.
 *
 * Flow on button tap:
 * 1. Attempt to enter fullscreen (graceful if unsupported/fails)
 * 2. Set isFullscreen in store
 * 3. Hide title screen (showTitleScreen → false)
 * 4. Initialize the game (initGame)
 *
 * If fullscreen fails, the game still proceeds (FR-004 fallback).
 */
export function TitleScreen() {
  const { enterFullscreen, isSupported, isStandalone } = useFullscreen();
  const setFullscreen = useGameStore((s) => s.setFullscreen);
  const setShowTitleScreen = useGameStore((s) => s.setShowTitleScreen);
  const initGame = useGameStore((s) => s.initGame);

  const handlePlay = async () => {
    try {
      // In standalone PWA mode, fullscreen is already active — skip fullscreen request
      if (!isStandalone && isSupported) {
        await enterFullscreen();
      }
      setFullscreen(true);
      setShowTitleScreen(false);
      initGame();
    } catch {
      // Fallback: still enter game even if fullscreen fails (FR-004)
      setFullscreen(false);
      setShowTitleScreen(false);
      initGame();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900"
      data-testid="title-screen"
    >
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 animate-pulse select-none">
          ZINKY ZOOGLE
        </h1>
        <button
          onClick={handlePlay}
          onTouchStart={(e) => e.preventDefault()}
          className="px-8 py-4 text-2xl font-bold bg-yellow-400 text-purple-900 rounded-lg shadow-lg hover:bg-yellow-300 active:scale-95 transition-transform touch-manipulation"
          style={{ minWidth: '48px', minHeight: '48px' }}
        >
          {isStandalone ? 'PLAY' : 'PLAY FULLSCREEN'}
        </button>
      </div>
    </div>
  );
}
