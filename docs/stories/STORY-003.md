# STORY-003 — Game Engine: Deck Manager & Utility Functions

**Status:** CLOSED

---

## Requirement IDs
- FR-012 (deck contains 39 number cards + 14 special cards)
- FR-013 (deck shuffled randomly)
- FR-020 (number cards: values 1-13, 3 copies each)
- FR-021 (special cards: Reverse, Skip, Bomb, Nuclear, Random)
- FR-022 (special card quantities: 3, 3, 3, 2, 3)
- FR-023 (deck depletion: draw from empty deck returns null)

## Acceptance Criteria IDs
- AC-003 (deck creation with correct card counts)
- AC-020 (draw from empty deck is handled gracefully)

## Business Context
The deck is the fundamental data source for the entire game. Every card draw, deal, and play operation depends on the deck manager. Utility functions for ID generation and delays are shared across multiple modules.

## Technical Context
Per architecture Section 8.1, the deck manager provides pure functions for creating, shuffling, drawing, and dealing cards. All functions in `src/engine/` must have zero React/3D dependencies.

## Scope
1. Create `src/utils/id.ts`:
   - `generateCardId(prefix: string, value: string | number, copy: number): string`
   - Produces unique string IDs like `"num-1-0"`, `"spc-reverse-1"`
2. Create `src/utils/math.ts`:
   - `clamp(value: number, min: number, max: number): number`
   - `lerp(a: number, b: number, t: number): number`
   - `randomInt(min: number, max: number): number` (inclusive)
3. Create `src/utils/delay.ts`:
   - `delay(ms: number): Promise<void>` (Promise-based setTimeout wrapper)
4. Create `src/engine/deck.ts`:
   - `createDeck(): Card[]` — Creates a full 53-card deck (39 number + 14 special)
   - `shuffleDeck(deck: Card[]): Card[]` — Fisher-Yates shuffle, returns new array
   - `drawCard(deck: Card[]): { card: Card | null; deck: Card[] }` — Draw top card, return remaining
   - `dealCards(deck: Card[], playerCount: number, handSize: number): { hands: Card[][]; deck: Card[] }` — Deal round-robin to players
5. Create `src/engine/cards.ts`:
   - `isCardPlayable(card: Card, lastValue: number | null): boolean`
   - `hasPlayableCard(hand: Card[], lastValue: number | null): boolean`
   - `getCardDisplayValue(card: Card): string`
6. Update `src/engine/index.ts` to export all public functions from deck.ts and cards.ts

## Out of Scope
- Turn management, special card effects, bot AI (separate stories)
- Any React components or 3D rendering
- Zustand store integration

## Files Likely Affected
- `src/utils/id.ts` (create)
- `src/utils/math.ts` (create)
- `src/utils/delay.ts` (create)
- `src/engine/deck.ts` (create)
- `src/engine/cards.ts` (create)
- `src/engine/index.ts` (modify — add exports)
- `src/engine/deck.test.ts` (create)
- `src/engine/cards.test.ts` (create)

## Implementation Notes
- `createDeck()` iterates values 1-13, 3 copies each for number cards, then iterates `SPECIAL_CARD_QUANTITIES` for special cards
- Fisher-Yates shuffle must create a copy (not mutate input) — `const shuffled = [...deck]`
- `drawCard()` returns `{ card: null, deck }` when deck is empty (FR-023)
- `dealCards()` deals in round-robin: card to player 0, player 1, player 2, player 3, repeat
- `isCardPlayable()`: Special cards always return true; number cards return true if `lastValue === null` or `card.value >= lastValue`
- `getCardDisplayValue()` uses `SPECIAL_DISPLAY_NAMES` from constants for special cards
- All functions are pure — no side effects, no state mutation

## Test Requirements
- [x] `createDeck()` returns exactly 53 cards
- [x] Deck contains 39 number cards (3 each of values 1-13)
- [x] Deck contains 14 special cards (Reverse x3, Skip x3, Bomb x3, Nuclear x2, Random x3)
- [x] All 53 cards have unique IDs
- [x] `shuffleDeck()` returns a new array of same length (does not mutate input)
- [x] `shuffleDeck()` produces different orders on repeated calls (statistical test)
- [x] `drawCard()` from 53-card deck returns 1 card + 52 remaining
- [x] `drawCard()` from empty deck returns `{ card: null, deck: [] }`
- [x] `dealCards()` distributes 3 cards to each of 4 players (12 dealt, 41 remaining)
- [x] `isCardPlayable()` — special card always playable regardless of lastValue
- [x] `isCardPlayable()` — number card >= lastValue is playable
- [x] `isCardPlayable()` — number card < lastValue is NOT playable
- [x] `isCardPlayable()` — any number card playable when lastValue is null
- [x] `hasPlayableCard()` correctly checks if any card in hand is playable
- [x] `getCardDisplayValue()` returns correct display strings

## Edge Cases
- Shuffling a single-card deck
- Drawing from a deck with exactly 1 card
- Dealing when deck has fewer cards than needed (some players get fewer cards)
- Number card with value exactly equal to lastValue (should be playable)
- Checking playability with mixed hand (number + special cards)

## Dependencies
- STORY-001 (project scaffolded)
- STORY-002 (type definitions available)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed — 95/100 APPROVED
- [x] QA review passed — 99/100 PASS, 0 defects
- [x] Story closed — 2026-05-30
