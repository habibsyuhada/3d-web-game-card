// src/components/ui/DirectionIndicator.tsx — Direction indicator overlay (STORY-016)
//
// Displays clockwise (↻) or counter-clockwise (↺) arrow to show turn direction.
// Reads direction from the Zustand store.
// Updates immediately when Reverse is played.
//
// Position: top area, next to the deck counter (top-right with offset).

import { useGameStore } from '../../store';
import { Direction } from '../../types';

/**
 * DirectionIndicator component — shows current play direction.
 *
 * Position: top-right, below the deck counter.
 * Colors: cyan for clockwise, amber for counter-clockwise.
 */
export function DirectionIndicator() {
  const direction = useGameStore((s) => s.direction);

  const isClockwise = direction === Direction.Clockwise;
  const arrow = isClockwise ? '↻' : '↺';
  const label = isClockwise ? 'Clockwise' : 'Counter-clockwise';
  const colorClass = isClockwise ? 'text-cyan-300' : 'text-amber-300';

  const containerClasses =
    'absolute top-12 right-3 px-2.5 py-1 rounded-full bg-gray-900/80 border border-gray-500 text-xs font-medium select-none pointer-events-none flex items-center gap-1.5 transition-all duration-300';

  return (
    <div
      className={containerClasses}
      data-testid="direction-indicator"
      role="status"
      aria-label={label}
    >
      <span className={`${colorClass} text-base leading-none`} data-testid="direction-arrow">
        {arrow}
      </span>
      <span className="text-gray-300" data-testid="direction-label">
        {label}
      </span>
    </div>
  );
}
