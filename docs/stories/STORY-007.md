# STORY-007 — Game Engine: Win Condition & Deadlock Resolution

**Status:** Ready

---

## Requirement IDs
- FR-052 (game continues until exactly 1 active player remains)
- FR-053 (last remaining alive player is declared winner)
- FR-091 (handle edge cases: simultaneous eliminations)
- FR-092 (deadlock: all alive players have no valid cards — winner is player with most lives, tie-breaker: lowest index)

## Acceptance Criteria IDs
- AC-015 (victory/defeat screen appears when 1 player remains)
- AC-023 (deadlock resolved by most lives, tie-breaker by lowest index)

## Business Context
The win condition checker ensures the game always reaches a terminal state. The deadlock resolver prevents infinite loops when the deck is depleted and no player can make a valid play. Together, these guarantee every game has a definitive winner.

## Technical Context
Per architecture Section 8.6, win condition functions are pure — they query player states and return a winner or null. The deadlock check uses `hasPlayableCard()` from `engine/cards.ts`.

## Scope
1. Create `src/engine/win-condition.ts`:
   - `checkWinCondition(players: Player[]): Player | null`
     - Returns the single alive player if exactly 1 remains, otherwise null
   - `resolveDeadlock(players: Player[]): Player | null`
     - Sorts alive players by lives descending, then by id ascending
     - Returns the first player (most lives, lowest index tie-breaker)
   - `isDeadlock(state: GameState): boolean`
     - Returns true if more than 1 alive player exists AND every alive player has no playable card

2. Update `src/engine/index.ts` to export win-condition functions

## Out of Scope
- Game over UI screen (STORY-019)
- Store integration for setting winner and gameStatus (STORY-009)

## Files Likely Affected
- `src/engine/win-condition.ts` (create)
- `src/engine/index.ts` (modify — add exports)
- `src/engine/win-condition.test.ts` (create)

## Implementation Notes
- `checkWinCondition`: Filter `players` by `status === PlayerStatus.Alive`. If length === 1, return that player. Else null.
- `resolveDeadlock`: Filter alive, sort by `b.lives - a.lives` then `a.id - b.id`, return `sorted[0]`
- `isDeadlock`: Needs `state.lastValue` to check `hasPlayableCard(player.hand, state.lastValue)` for each alive player
- All functions are pure, no side effects
- `resolveDeadlock` returns null if no alive players (shouldn't happen, but defensive)

## Test Requirements
- [x] `checkWinCondition` with 4 players, 3 eliminated → returns the alive player
- [x] `checkWinCondition` with 4 players, 2 eliminated (2 alive) → returns null
- [x] `checkWinCondition` with all alive → returns null
- [x] `resolveDeadlock` with players having lives [5,3,2,1] → returns player with 5 lives
- [x] `resolveDeadlock` with tied lives [3,3,2,1] → returns player with lowest id among tied
- [x] `resolveDeadlock` with all same lives [3,3,3,3] → returns player with id=1 (lowest index)
- [x] `isDeadlock` with all alive having no playable cards → returns true
- [x] `isDeadlock` with at least one alive player having a playable card → returns false
- [x] `isDeadlock` with only 1 alive player → returns false (that's a win, not a deadlock)

## Edge Cases
- All 4 players eliminated simultaneously (shouldn't happen per game logic, but defensive: return null from both)
- Deadlock with all alive players having exactly the same lives and same index (impossible with unique IDs)
- `isDeadlock` called when deck is not empty but no one has valid cards (still a deadlock)
- Deadlock where the player with most lives is the human (victory) vs a bot (defeat for human)

## Dependencies
- STORY-001 (project scaffolded)
- STORY-002 (type definitions)
- STORY-003 (card validator `hasPlayableCard`)

## Definition of Done
- [ ] Story context reviewed by Developer
- [ ] Code implemented
- [ ] Tests written
- [ ] Tests pass locally
- [ ] Dev notes created
- [ ] Scrum Master completion review passed
- [ ] QA review passed
- [ ] Story closed
