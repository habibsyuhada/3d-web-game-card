# Dev Notes
Story ID: STORY-003

## Story Context Reviewed
- STORY-003: Game Engine: Deck Manager & Utility Functions
- PRD: Functional Requirements FR-012, FR-013, FR-020, FR-021, FR-022, FR-023
- Architecture: Section 8.1 (Deck Manager), Section 8.2 (Card Validator)
- Types: Card, CardType, SpecialEffect, SPECIAL_DISPLAY_NAMES, SPECIAL_CARD_QUANTITIES, NUMBER_CARD_MIN/MAX, NUMBER_COPIES_PER_VALUE

## Files Changed
- `src/utils/id.ts` — Created: `generateCardId(prefix, value, copy): string`
- `src/utils/math.ts` — Created: `clamp`, `lerp`, `randomInt`
- `src/utils/delay.ts` — Created: `delay(ms): Promise<void>`
- `src/engine/deck.ts` — Created: `createDeck`, `shuffleDeck`, `drawCard`, `dealCards`
- `src/engine/cards.ts` — Created: `isCardPlayable`, `hasPlayableCard`, `getCardDisplayValue`
- `src/engine/index.ts` — Modified: Re-exports from deck.ts and cards.ts
- `src/engine/deck.test.ts` — Created: 9 test cases for deck module
- `src/engine/cards.test.ts` — Created: 10 test cases for cards module
- `src/utils/utils.test.ts` — Created: 7+ test cases for utility functions

## Implementation Summary

### Module: `src/utils/id.ts`
- `generateCardId(prefix: string, value: string | number, copy: number): string`
- Produces IDs like `"num-1-0"`, `"spc-reverse-1"`

### Module: `src/utils/math.ts`
- `clamp(value, min, max)` — clamps value within bounds
- `lerp(a, b, t)` — linear interpolation
- `randomInt(min, max)` — inclusive range random integer

### Module: `src/utils/delay.ts`
- `delay(ms)` — Promise-based setTimeout wrapper

### Module: `src/engine/deck.ts`
- `createDeck()` — Builds full 53-card deck (39 number + 14 special) using constants
- `shuffleDeck(deck)` — Fisher-Yates immutable shuffle using `randomInt` utility
- `drawCard(deck)` — Returns `{ card, deck }` or `{ card: null, deck: [] }` if empty
- `dealCards(deck, playerCount, handSize)` — Round-robin dealing

### Module: `src/engine/cards.ts`
- `isCardPlayable(card, lastValue)` — Special = always true; Number = playable if lastValue is null or value >= lastValue
- `hasPlayableCard(hand, lastValue)` — Checks hand for any playable card
- `getCardDisplayValue(card)` — Uses SPECIAL_DISPLAY_NAMES map for specials, else value.toString()

### Module: `src/engine/index.ts`
- Barrel re-exports for all public functions from deck.ts and cards.ts

## Tests Added or Updated
- `src/engine/deck.test.ts`: 9 test cases
  1. createDeck() returns exactly 53 cards
  2. Deck has 39 number cards (3 of each value 1-13)
  3. Deck has 14 special cards (correct quantities per type)
  4. All 53 card IDs are unique
  5. shuffleDeck() returns new array, does not mutate input
  6. shuffleDeck() produces different orders (statistical: 10 runs, ≥2 unique)
  7. drawCard() from full deck yields card + 52 remaining
  8. drawCard() from empty deck yields { card: null, deck: [] }
  9. dealCards(deck, 4, 3) gives 3 cards × 4 players = 12 dealt, 41 remaining

- `src/engine/cards.test.ts`: 10 test cases
  10. Special card is always playable regardless of lastValue
  11. Number card is playable when lastValue is null (multiple values tested)
  12. Number card >= lastValue is playable (equal case included)
  13. Number card < lastValue is NOT playable (multiple cases)
  14. hasPlayableCard(hand, 5) = true when one card is valid
  15. hasPlayableCard(hand, 13) = false when no number cards match
  16. hasPlayableCard with special card always returns true
  17. hasPlayableCard on empty hand returns false
  18. getCardDisplayValue returns SPECIAL_DISPLAY_NAMES for specials
  19. getCardDisplayValue returns string value for number cards

- `src/utils/utils.test.ts`: 7 test cases
  20. randomInt(1, 5) returns value in [1, 5] (run 100 times, integer only)
  21. clamp(5, 1, 3) === 3
  22. clamp(-5, 1, 3) === 1
  23. clamp(2, 1, 3) === 2
  24. lerp(0, 10, 0.5) === 5 (plus lerp at 0, 1, 0.25)
  25. delay(10) resolves within 1000ms timeout
  26. generateCardId produces expected formats for 'num' and 'spc' prefixes

**Total: 26 test cases across 3 new + 1 placeholder test files (50 tests run, all pass).**

## Test Commands Run
- `npm test` — vitest run (4 test files, 50 tests)

## Test Results
- **4 test files passed**
- **50 tests passed, 0 failures**
- Duration: ~4.5s

## Build & Lint Results
- `npm run build`: ✅ Success (6.39s) — no TypeScript errors
- `npm run lint`: ✅ Clean — 0 errors, 0 warnings

## Commit Notes
Suggested commit message:
```
feat(engine): implement deck manager, card validator, and utility functions [STORY-003]

- Add utils: generateCardId, clamp, lerp, randomInt, delay
- Add engine/deck.ts: createDeck, shuffleDeck, drawCard, dealCards
- Add engine/cards.ts: isCardPlayable, hasPlayableCard, getCardDisplayValue
- Update src/engine/index.ts barrel exports
- Add comprehensive tests for deck, cards, and utils modules (50 tests pass)
- Satisfies FR-012, FR-013, FR-020, FR-021, FR-022, FR-023
```

## Risks / Limitations
- `shuffleDeck` uses a custom `randomInt` utility rather than directly calling `Math.random()`. This was done per architecture spec to use the utility function. The `randomInt` function internally uses `Math.random()` which is not cryptographically secure — acceptable for a game shuffle.
- No React or 3D dependencies were introduced, keeping the engine layer pure as specified.
- `dealCards` handles the edge case of deck running out (some players may get fewer cards) — verified in architecture doc.
- The `cards.test.ts` and `deck.test.ts` test files include helper functions (`makeNumberCard`, `makeSpecialCard`) for cleaner test setup.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
