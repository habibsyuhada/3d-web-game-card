// src/components/ui/DeckCounter.tsx — Deck counter overlay (STORY-016)
//
// Displays remaining deck count in the top-right corner.
// Reads useDeckCount() from store selectors.
// Shows a warning color (orange/red) when the deck is empty.

import { useDeckCount } from '../../store/selectors';

/**
 * DeckCounter component — shows remaining card count.
 *
 * Position: top-right corner.
 * Warning color when deck === 0.
 */
export function DeckCounter() {
  const deckCount = useDeckCount();

  const isEmpty = deckCount === 0;
  const warningClass = isEmpty ? 'text-orange-400' : 'text-white';

  const containerClasses =
    'absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gray-900/80 border border-gray-500 text-xs font-semibold select-none pointer-events-none flex items-center gap-1.5';

  return (
    <div className={containerClasses} data-testid="deck-counter" role="status" aria-label="Deck count">
      <span aria-hidden="true">🂠</span>
      <span className={warningClass} data-testid="deck-count-value">
        Deck: {deckCount}
      </span>
    </div>
  );
}
