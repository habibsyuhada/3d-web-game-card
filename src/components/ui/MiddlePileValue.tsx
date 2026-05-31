// src/components/ui/MiddlePileValue.tsx — Middle pile value overlay (STORY-016)
//
// Displays the current pile value as a large centered number.
// When lastValue is null (empty pile), shows "—".
//
// Position: center of the screen (over the 3D middle pile).

import { useGameStore } from '../../store';

/**
 * MiddlePileValue component — shows the current pile target value.
 *
 * Position: center screen.
 * Large bold text for easy reading.
 * Em-dash when no value is set.
 */
export function MiddlePileValue() {
  const lastValue = useGameStore((s) => s.lastValue);

  const containerClasses =
    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none';

  const hasValue = lastValue !== null;

  return (
    <div
      className={containerClasses}
      data-testid="middle-pile-value"
      role="status"
      aria-label={hasValue ? `Pile value: ${lastValue}` : 'Pile empty'}
    >
      <div
        className={`
          px-5 py-2.5 rounded-2xl
          bg-black/60 border text-center
          transition-all duration-200
          ${hasValue ? 'border-yellow-400/60' : 'border-gray-600/50'}
        `}
      >
        {hasValue ? (
          <span
            className="text-yellow-300 text-3xl font-bold tracking-wider"
            data-testid="pile-value-number"
          >
            {lastValue}
          </span>
        ) : (
          <span
            className="text-gray-500 text-2xl font-medium"
            data-testid="pile-value-empty"
          >
            —
          </span>
        )}
        <div className="text-gray-400 text-[10px] mt-0.5 uppercase tracking-widest">
          Pile
        </div>
      </div>
    </div>
  );
}
