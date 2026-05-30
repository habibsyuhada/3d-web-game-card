# Dev Notes

**Story ID:** STORY-007

---

## Story Context Reviewed

- **Requirement:** FR-052 (game continues until 1 active player), FR-053 (last alive player wins), FR-091 (simultaneous eliminations), FR-092 (deadlock resolution by most lives, lowest index tie-breaker)
- **Acceptance Criteria:** AC-015, AC-023
- **Dependencies:** STORY-001 (scaffold), STORY-002 (types), STORY-003 (hasPlayableCard)
- **Architecture:** Pure game engine functions, no UI/3D dependencies (Section 8.6)

## Files Changed

| File | Action |
|------|--------|
| `src/engine/win-condition.ts` | **Created** — 3 pure functions: checkWinCondition, resolveDeadlock, isDeadlock |
| `src/engine/index.ts` | **Modified** — Added export for win-condition functions |
| `src/engine/win-condition.test.ts` | **Created** — 16 test cases covering all required scenarios + edge cases |

## Implementation Summary

### `checkWinCondition(players: Player[]): Player | null`
Filters players by `PlayerStatus.Alive`. If exactly 1 remains, returns that player. Otherwise returns `null`. Handles edge case of all players eliminated (returns null).

### `resolveDeadlock(players: Player[]): Player | null`
Filters alive players, sorts by lives descending then id ascending (tie-breaker). Returns `sorted[0]`. Returns `null` if no alive players (defensive).

### `isDeadlock(state: GameState): boolean`
Checks if more than 1 player is alive AND every alive player has no playable card (using `hasPlayableCard` from `engine/cards.ts`). Returns `false` for 0 or 1 alive players (those are edge/win cases, not deadlocks).

All three functions are pure with zero side effects.

## Tests Added or Updated

**File:** `src/engine/win-condition.test.ts` — 16 test cases in 3 describe blocks

### `checkWinCondition` (4 tests)
1. ✅ 4 players, 3 eliminated → returns the alive player (id=2)
2. ✅ 4 players, 2 eliminated (2 alive) → returns null
3. ✅ All alive → returns null
4. ✅ All 4 eliminated → returns null (edge case)

### `resolveDeadlock` (5 tests)
5. ✅ Players with lives [5,3,2,1] → returns player with 5 lives (id=1)
6. ✅ Tied lives [3,3,2,1] → returns player with lowest id (id=2)
7. ✅ All same lives [3,3,3,3] → returns player with lowest id (id=1)
8. ✅ All players dead → returns null (edge case)
9. ✅ Only alive players considered, eliminated ones ignored (edge case)

### `isDeadlock` (6 tests)
10. ✅ All alive have no playable cards (hand values < lastValue) → true
11. ✅ At least one alive has playable card → false
12. ✅ Only 1 alive player → false (win, not deadlock)
13. ✅ lastValue=null, hands have specials → false (specials always playable)
14. ✅ All alive with empty hands → true (no playable cards exist)
15. ✅ No alive players → false

## Test Commands Run

```
npm test       → 115 tests passed (9 test files, 0 failures)
npm run build  → tsc -b && vite build — SUCCESS (built in 13.26s)
npm run lint   → eslint . — 0 errors, 0 warnings
```

## Test Results

| Command | Result |
|---------|--------|
| `npm test` | ✅ 115 passed, 0 failed |
| `npm run build` | ✅ Built successfully |
| `npm run lint` | ✅ No issues |

## Commit Notes

**Suggested commit message:**

```
feat(engine): add win condition and deadlock resolution (STORY-007)

- Add checkWinCondition: detects when exactly 1 alive player remains
- Add resolveDeadlock: picks winner by most lives, lowest id tie-breaker
- Add isDeadlock: detects when all alive players have no playable cards
- 16 unit tests covering all acceptance criteria and edge cases
- All 115 tests pass, build clean, lint clean
```

## Risks / Limitations

- `isDeadlock` does not check if the deck is empty — per the story spec, deadlock is purely based on playable card availability regardless of deck state. STORY-008 (full orchestration) should determine when to call `isDeadlock` (i.e., after deck depletion and all players pass).
- `resolveDeadlock` sorts by `a.id - b.id` for tie-breaker, which assumes player IDs are unique positive integers (guaranteed by type definition: IDs 1–4).

## Ready for Scrum Master Review?

**Status: READY_FOR_SM_REVIEW**
