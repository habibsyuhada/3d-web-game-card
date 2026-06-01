// src/components/ui/GameOverScreen.tsx — Game Over Screen & Play Again (STORY-019)
//
// Full-viewport overlay shown when gameStatus === 'finished' and a winner is set.
// Displays:
//   - Victory message ("🏆 You Win!") when the human player is the winner (gold/yellow)
//   - Defeat message ("💀 Bot X Wins") when a bot is the winner (red)
//   - Winner name and remaining lives
//   - "Play Again" button that resets state and starts a new game immediately
//
// Z-index: z-50 (above HUD which is z-10, above SpectatorBanner)
// Pointer events: pointer-events-auto (blocks clicks below)
// Animation: fade-in on mount (via Tailwind animate-fade-in)
//
// Related requirements: FR-052, FR-053, FR-054, FR-081, FR-090
// Acceptance criteria: AC-015, AC-016

import { useGameStore } from '../../store';
import { GameStatus } from '../../types';

/**
 * Handle the "Play Again" button tap:
 * 1. resetGame() — resets all game, UI, and animation state
 * 2. initGame() — initializes a fresh game (new deck, deal, shuffle)
 * 3. setShowTitleScreen(false) — jump straight to game (no title screen)
 * 4. setShowGameOver(false) — hide the game-over overlay
 */
function handlePlayAgain(): void {
  const store = useGameStore.getState();
  store.resetGame();
  store.initGame();
  store.setShowTitleScreen(false);
  store.setShowGameOver(false);
}

/**
 * GameOverScreen component — conditionally renders the game-over overlay.
 *
 * Returns null if:
 * - gameStatus is NOT 'finished'
 * - winner is not set (null)
 *
 * Otherwise renders a centered modal with winner info and Play Again button.
 */
export function GameOverScreen() {
  const gameStatus = useGameStore((s) => s.gameStatus);
  const winner = useGameStore((s) => s.winner);
  const players = useGameStore((s) => s.players);

  // Only render when game is finished and we have a winner
  if (gameStatus !== GameStatus.Finished || !winner) {
    return null;
  }

  const isHumanWinner = winner === 'You';
  const winnerPlayer = players.find((p) => p.name === winner);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in pointer-events-auto"
      data-testid="game-over-screen"
    >
      <div
        className="bg-gray-800 rounded-xl p-8 text-center max-w-sm mx-4"
        data-testid="game-over-modal"
      >
        {/* Victory or Defeat heading */}
        <h1
          className={`text-4xl font-bold mb-4 ${
            isHumanWinner ? 'text-yellow-400' : 'text-red-500'
          }`}
          data-testid="game-over-heading"
        >
          {isHumanWinner ? '🏆 You Win!' : `💀 ${winner} Wins`}
        </h1>

        {/* Winner name */}
        <p className="text-gray-300 mb-2" data-testid="game-over-winner">
          Winner: {winner}
        </p>

        {/* Remaining lives (if winner player data available) */}
        {winnerPlayer && (
          <p className="text-gray-400 mb-6" data-testid="game-over-lives">
            Lives remaining: {winnerPlayer.lives}
          </p>
        )}

        {/* Play Again button — large, accessible touch target */}
        <button
          onClick={handlePlayAgain}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg min-w-[200px] min-h-[48px] transition-colors"
          data-testid="play-again-button"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
