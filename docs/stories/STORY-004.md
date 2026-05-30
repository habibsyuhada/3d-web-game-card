# STORY-004 — Game Engine: Turn Manager & Player Operations

**Status:** CLOSED

---

## Requirement IDs
- FR-030 (check if current player is alive at start of turn)
- FR-035 (player with no valid card loses 1 life)
- FR-037 (turn advances to next active player in current direction)
- FR-040 (eliminated players remain skipped in turn order)
- FR-050 (player marked as eliminated when lives reach 0)
- FR-051 (eliminated players transition to spectator, skipped in turn order)

## Acceptance Criteria IDs
- AC-007 (life loss when no valid cards, turn passes)
- AC-008 (turn direction changes after Reverse, subsequent turns flow opposite)
- AC-013 (elimination when lives reach 0)

## Business Context
Turn management is the heartbeat of the game loop. It determines whose turn it is, handles player elimination, and ensures that only alive players participate. Combined with player operations, this module enables the full turn cycle.

## Technical Context
Per architecture Section 8.3, the turn manager provides pure functions for advancing turns and querying player status. The `Direction` enum uses numeric values (1 = clockwise, -1 = counter-clockwise) to enable modular arithmetic for player index calculation.

## Scope
1. Create `src/engine/turn.ts`:
   - `getNextActivePlayerIndex(players: Player[], currentIndex: number, direction: Direction): number`
     - Iterates in the given direction, skipping eliminated/spectator players
     - Wraps around using `(next + direction + count) % count`
     - Guaranteed to find an alive player (caller ensures at least 1 alive player exists)
   - `getAlivePlayerCount(players: Player[]): number`
     - Counts players with `status === PlayerStatus.Alive`
   - `advanceTurn(state: GameState): GameState`
     - Returns new GameState with `currentPlayerIndex` set to next active player
2. Create `src/engine/player.ts`:
   - `eliminatePlayer(player: Player): Player`
     - Returns new Player with `lives: 0`, `status: PlayerStatus.Eliminated`
   - `canPlayerAct(player: Player): boolean`
     - Returns true if `player.status === PlayerStatus.Alive`
   - `loseLife(player: Player): { player: Player; eliminated: boolean }`
     - Decrements lives by 1; if lives reaches 0, marks as Eliminated
     - Returns updated player and elimination flag
3. Update `src/engine/index.ts` to export turn.ts and player.ts public functions

## Out of Scope
- Special card effect application (Reverse direction change is handled in STORY-005)
- Card validation and playing (STORY-003)
- Win condition checking (STORY-007)
- Any hooks or components

## Files Likely Affected
- `src/engine/turn.ts` (create)
- `src/engine/player.ts` (create)
- `src/engine/index.ts` (modify — add exports)
- `src/engine/turn.test.ts` (create)
- `src/engine/player.test.ts` (create)

## Implementation Notes
- `getNextActivePlayerIndex` uses a do-while loop: starts from `currentIndex + direction`, wraps around, and stops when it finds an alive player
- With 4 players and Direction.Clockwise (1): sequence is 0,1,2,3,0,1,...
- With Direction.CounterClockwise (-1): sequence is 0,3,2,1,0,3,...
- `eliminatePlayer()` does NOT mutate input; returns a new player object
- `loseLife()` handles the case where lives drops from 1 to 0, returning `eliminated: true`
- `canPlayerAct()` is a simple guard; could be inlined but improves readability

## Test Requirements
- [x] `getNextActivePlayerIndex` with all 4 alive, clockwise: 0→1→2→3→0
- [x] `getNextActivePlayerIndex` with all 4 alive, counter-clockwise: 0→3→2→1→0
- [x] `getNextActivePlayerIndex` with player 2 eliminated, clockwise: 1→3 (skip 2)
- [x] `getNextActivePlayerIndex` with 2 players eliminated: wraps correctly between remaining 2
- [x] `getAlivePlayerCount` with all alive returns 4
- [x] `getAlivePlayerCount` with 1 eliminated returns 3
- [x] `eliminatePlayer` sets status to Eliminated and lives to 0
- [x] `canPlayerAct` returns true for alive player, false for eliminated/spectator
- [x] `loseLife` decrements life correctly: 5→4, 4→3, etc.
- [x] `loseLife` returns `eliminated: true` when life drops from 1 to 0
- [x] `loseLife` returns `eliminated: false` for normal decrements

## Edge Cases
- Only 2 alive players: turn alternates between them regardless of direction
- All players except current are eliminated: `getNextActivePlayerIndex` would loop infinitely if not guarded (caller must ensure at least 2 alive before advancing, or at least 1 alive including current)
- Player with 0 lives should still be skippable (eliminated players are skipped)
- `loseLife` called on already-eliminated player (defensive: should not happen but shouldn't crash)

## Dependencies
- STORY-001 (project scaffolded)
- STORY-002 (type definitions)

## Definition of Done
- [x] Story context reviewed by Developer
- [x] Code implemented
- [x] Tests written
- [x] Tests pass locally
- [x] Dev notes created
- [x] Scrum Master completion review passed — 10.0/10.0 APPROVED
- [x] QA review passed — 10.0/10.0 PASS, 0 defects
- [x] Story closed — 2026-05-30
