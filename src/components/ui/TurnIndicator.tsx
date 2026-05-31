// src/components/ui/TurnIndicator.tsx — Turn message overlay (STORY-015)
//
// Displays the current turn message as a centered overlay at the top of the screen.
// Reads turnMessage from the Zustand store.
// - Shows a blue accent for human turns
// - Shows a neutral/gray style for bot turns
// - Hidden when game is finished or message is empty

import { useGameStore } from '../../store';
import { GameStatus } from '../../types';

/**
 * Checks if the current message indicates a human turn.
 */
function isHumanTurnMessage(message: string): boolean {
  return message.toLowerCase().includes('your turn');
}

/**
 * Checks if the current message indicates a bot thinking turn.
 */
function isBotThinkingMessage(message: string): boolean {
  return message.toLowerCase().includes('thinking');
}

/**
 * TurnIndicator component — displays current turn information as an overlay.
 *
 * Positioning: top-center of the viewport, fixed position.
 * Styling: semi-transparent dark background, white text, Tailwind CSS.
 *
 * Different visual styles:
 * - Human turn ("Your turn!"): blue accent border and glow
 * - Bot thinking ("Bot X is thinking..."): pulsing gray
 * - Other messages (played, lost life): neutral dark
 *
 * Hidden when:
 * - gameStatus === 'finished'
 * - turnMessage is empty string
 */
export function TurnIndicator() {
  const turnMessage = useGameStore((s) => s.turnMessage);
  const gameStatus = useGameStore((s) => s.gameStatus);

  // Don't render when game is finished or no message
  if (gameStatus === GameStatus.Finished || !turnMessage) {
    return null;
  }

  const isHuman = isHumanTurnMessage(turnMessage);
  const isBotThinking = isBotThinkingMessage(turnMessage);

  // Build dynamic className
  let containerClass =
    'fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-center pointer-events-none select-none transition-all duration-300';

  if (isHuman) {
    containerClass += ' bg-blue-900/80 border border-blue-400 shadow-lg shadow-blue-500/30';
  } else if (isBotThinking) {
    containerClass += ' bg-gray-800/80 border border-gray-500 animate-pulse';
  } else {
    containerClass += ' bg-gray-900/80 border border-gray-600';
  }

  return (
    <div className={containerClass} data-testid="turn-indicator" role="status" aria-live="polite">
      <span className="text-white text-sm font-medium tracking-wide">
        {turnMessage}
      </span>
    </div>
  );
}
