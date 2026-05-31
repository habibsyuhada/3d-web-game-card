// src/components/ui/HUD.tsx — HUD container (STORY-016)
//
// Container component that renders all HUD overlays as a single `pointer-events-none` layer.
// Positioned absolute inset-0 with z-10 so it sits above the Canvas.
//
// Children:
// - TurnIndicator (top-center, shows turn messages)
// - PlayerInfo x 4 (one per player slot)
// - DeckCounter (top-right)
// - DirectionIndicator (below deck counter)
// - MiddlePileValue (center screen)
// - SpectatorBanner (when human is eliminated)

import { useGameStore } from '../../store';
import { TurnIndicator } from './TurnIndicator';
import { PlayerInfo } from './PlayerInfo';
import { DeckCounter } from './DeckCounter';
import { DirectionIndicator } from './DirectionIndicator';
import { MiddlePileValue } from './MiddlePileValue';
import { SpectatorBanner } from './SpectatorBanner';

/**
 * HUD component — composite overlay for all in-game information.
 *
 * Positioned over the R3F Canvas with `absolute inset-0 pointer-events-none z-10`.
 * Only renders when there are players (i.e. game has been initialized).
 */
export function HUD() {
  const players = useGameStore((s) => s.players);

  // Don't render HUD before game is initialized
  if (players.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      data-testid="hud-overlay"
    >
      {/* Turn messages */}
      <TurnIndicator />

      {/* One PlayerInfo per player slot */}
      {players.map((player, index) => (
        <PlayerInfo key={player.id} player={player} playerIndex={index} />
      ))}

      {/* Deck counter and direction indicator */}
      <DeckCounter />
      <DirectionIndicator />

      {/* Center pile value */}
      <MiddlePileValue />

      {/* Spectator mode banner */}
      <SpectatorBanner />
    </div>
  );
}
