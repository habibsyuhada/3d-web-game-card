// src/components/ui/PlayerInfo.tsx — Player info overlay (STORY-016)
//
// Displays one player's name, lives, and status as a positioned HUD element.
// Each of the 4 players is positioned at their respective table side:
//   - Human (index 0): bottom-center
//   - Bot 2 (index 1): left-center
//   - Bot 3 (index 2): top-center
//   - Bot 4 (index 3): right-center
//
// Visual states:
//   - Active (current player): highlighted with teal border and glow
//   - Eliminated: greyed out with "Eliminated" label
//   - Alive: normal display with lives

import type { Player } from '../../types';
import { PlayerStatus } from '../../types';
import { INITIAL_LIVES } from '../../types';
import { useGameStore } from '../../store';

interface PlayerInfoProps {
  player: Player;
  playerIndex: number;
}

/**
 * Returns Tailwind positioning classes for a given player slot index.
 */
function getPositionClasses(playerIndex: number): string {
  switch (playerIndex) {
    case 0: // Human — bottom center
      return 'bottom-4 left-1/2 -translate-x-1/2';
    case 1: // Bot 2 — left center
      return 'left-2 top-1/2 -translate-y-1/2';
    case 2: // Bot 3 — top center
      return 'top-4 left-1/2 -translate-x-1/2';
    case 3: // Bot 4 — right center
      return 'right-2 top-1/2 -translate-y-1/2';
    default:
      return 'bottom-4 left-1/2 -translate-x-1/2';
  }
}

/**
 * PlayerInfo component — shows player name, lives, and status.
 *
 * Positioning is absolute based on playerIndex.
 * Highlights the active player with a teal glow border.
 * Shows "Eliminated" label for eliminated players.
 */
export function PlayerInfo({ player, playerIndex }: PlayerInfoProps) {
  const isCurrentPlayer = useGameStore(
    (s) => s.currentPlayerIndex === playerIndex,
  );

  const positionClasses = getPositionClasses(playerIndex);

  const isEliminated = player.status === PlayerStatus.Eliminated;

  // Base classes for the pill
  const baseClasses =
    'absolute px-3 py-1.5 rounded-full text-white text-xs font-semibold select-none pointer-events-none transition-all duration-200';

  // Background & border
  let styleClasses: string;
  if (isEliminated) {
    styleClasses =
      'bg-gray-900/70 border border-gray-600 opacity-60';
  } else if (isCurrentPlayer) {
    styleClasses =
      'bg-teal-900/80 border-2 border-teal-400 shadow-lg shadow-teal-500/40';
  } else {
    styleClasses =
      'bg-gray-900/80 border border-gray-500';
  }

  const containerClasses = `${baseClasses} ${styleClasses} ${positionClasses}`;

  const testId = `player-info-${playerIndex}`;

  return (
    <div className={containerClasses} data-testid={testId} role="status" aria-label={`${player.name} info`}>
      {isEliminated ? (
        <span className="text-gray-400 line-through" data-testid={`player-eliminated-${playerIndex}`}>
          {player.name} — Eliminated
        </span>
      ) : (
        <div className="flex items-center gap-2">
          <span data-testid={`player-name-${playerIndex}`}>{player.name}</span>
          <span className="text-red-400" data-testid={`player-lives-${playerIndex}`}>
            ♥ {player.lives}/{INITIAL_LIVES}
          </span>
        </div>
      )}
    </div>
  );
}
