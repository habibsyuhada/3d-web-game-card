# STORY-006 — Game Engine: Bot AI Decision Tree

**Status:** CLOSED

---

## Requirement IDs
- FR-060 (bots play automatically without human input)
- FR-061 (play smallest valid number card when available)
- FR-062 (play a special card when no valid number cards)
- FR-063 (play smallest card when pile is empty)
- FR-064 (lose 1 life when no valid card)
- FR-066 (bot cards displayed face-down to human)

## Acceptance Criteria IDs
- AC-017 (bot plays automatically after 1-2 second delay with animation)
- AC-018 (bot plays smallest valid number card)
- AC-019 (bot plays special card when no valid number cards)

## Business Context
Bot AI provides the three opponents in the single-player experience. The AI strategy must be simple, deterministic, and follow the exact priority rules specified. This makes the game predictable enough to test but engaging enough to play.

## Technical Context
Per architecture Section 8.5, `decideBotPlay()` is a pure function that takes a hand and current `lastValue`, returning a `BotDecision` object with `action`, optional `cardId`, and `reason`. The delay (FR-065) is handled by the `useBotTurn` hook, not the engine function.

## Scope
1. Create `src/engine/bot-ai.ts`:
   - `decideBotPlay(hand: Card[], lastValue: number | null): BotDecision`
   - Decision priority (per architecture Section 8.5):
     1. **Empty pile (lastValue === null):** Play the smallest card overall (prefer number cards over special)
     2. **Has valid number cards (value >= lastValue):** Play the smallest valid number card
     3. **No valid number cards but has special cards:** Play first available special card
     4. **No playable cards at all:** Return `{ action: 'pass', reason: 'No playable cards' }`
   - Returns `BotDecision` with:
     - `action: 'play' | 'pass'`
     - `cardId?: string` (the ID of the card to play)
     - `reason: string` (human-readable explanation for debugging)

2. Update `src/engine/index.ts` to export `decideBotPlay`

## Out of Scope
- The timed delay for bot play (handled in `useBotTurn` hook)
- Animation of bot card play (handled in animation story)
- Bot "thinking" indicator (handled in UI)
- Face-down rendering of bot cards (handled in 3D rendering)

## Files Likely Affected
- `src/engine/bot-ai.ts` (create)
- `src/engine/index.ts` (modify — add export)
- `src/engine/bot-ai.test.ts` (create)

## Implementation Notes
- For empty pile: sort all playable cards by `value ?? 14` (special cards treated as value 14, sorted last)
- For valid number cards: filter hand to playable number cards, find minimum by `.value`
- For special cards: take the first special card in hand (order doesn't matter for MVP)
- `decideBotPlay` is called with the bot's actual hand cards (face-up to the engine, face-down visually)
- The function must handle edge case of empty hand (player has 0 cards due to deck depletion)
- Import `isCardPlayable` from `cards.ts` for validation

## Test Requirements
- [x] Empty pile + hand has [3, 7, Reverse]: plays card with value 3 (smallest)
- [x] Empty pile + hand has [Reverse, Skip, Bomb]: plays a special card (smallest overall, any is fine)
- [x] Empty pile + hand has [5, 2, 9]: plays card with value 2
- [x] Pile value 8 + hand has [3, 10, 12]: plays card with value 10 (smallest >= 8)
- [x] Pile value 8 + hand has [3, 5, 7]: no valid number cards, plays special if available
- [x] Pile value 8 + hand has [3, 5, 7, Reverse]: plays Reverse (special card)
- [x] Pile value 8 + hand has [3, 5, 7]: no valid cards at all, returns `{ action: 'pass' }`
- [x] Empty hand: returns `{ action: 'pass', reason: 'No cards in hand' }` (or similar)
- [x] Pile value 13 + hand has [13]: plays card with value 13 (exact match)
- [x] Multiple special cards: plays first special card found
- [x] All decision branches produce correct `BotDecision` objects with `cardId` set for 'play'

## Edge Cases
- Hand with only special cards and empty pile (should play a special card)
- Hand with mix of number cards all below lastValue plus special (falls through to special)
- Hand with exactly 3 cards all the same value
- Empty hand (0 cards due to deck depletion) — should pass
- Random card value after special is played doesn't affect bot decision (decision is pre-effect)

## Dependencies
- STORY-001 (project scaffolded)
- STORY-002 (type definitions including BotDecision)
- STORY-003 (card validator `isCardPlayable`)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed (9.5/10)
- [x] QA review passed (9.9/10, 0 defects)
- [x] Story closed (2026-05-31)
