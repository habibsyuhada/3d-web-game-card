// src/components/ui/SpectatorBanner.tsx — Spectator banner overlay (STORY-016)
//
// Conditionally shown when the human player is eliminated.
// Displays a persistent "You are now spectating" banner.
// Styling: dark red semi-transparent background, top-center.

import { useGameStore } from '../../store';
import { PlayerStatus, PlayerType } from '../../types';

/**
 * SpectatorBanner component — shown when the human player is eliminated.
 *
 * Position: top-center, below the turn indicator.
 * Styling: dark red bg, white text, persistent.
 */
export function SpectatorBanner() {
  const humanEliminated = useGameStore((state) => {
    const human = state.players.find((p) => p.type === PlayerType.Human);
    if (!human) return false;
    return human.status === PlayerStatus.Eliminated;
  });

  if (!humanEliminated) {
    return null;
  }

  const containerClasses =
    'absolute top-16 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-red-900/85 border border-red-500 text-center select-none pointer-events-none shadow-lg shadow-red-900/40';

  return (
    <div
      className={containerClasses}
      data-testid="spectator-banner"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-red-100 text-sm font-semibold tracking-wide">
        You are now spectating
      </div>
      <div className="text-red-300/70 text-xs mt-0.5">
        Watch the game continue
      </div>
    </div>
  );
}
