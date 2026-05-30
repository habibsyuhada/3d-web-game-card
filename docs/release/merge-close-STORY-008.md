# Merge and Close Notes

**Story ID:** STORY-008  
**Title:** Game Engine: Full Orchestration (initGame, resetGame)  
**Wave:** Wave 2 — Engine Completion & State Entry  
**Status:** CLOSED  
**Close Date:** 2026-05-31  

---

## Story Summary

STORY-008 delivers the top-level game orchestration layer — `initGame()` and `resetGame()` — that ties together all previously built engine modules (deck, cards, turn, player, special-cards, bot-ai, win-condition) into a single `GameState` factory. This finalizes the pure game engine layer with no React or 3D imports. The implementation closely follows the architecture specification (Section 8.7, Appendix B) and the PRD requirements (FR-010, FR-011, FR-013, FR-014, FR-015, FR-090, FR-091).

- `initGame()` builds a 53-card deck, shuffles it, deals 3 cards round-robin to 4 players, and returns a complete `GameState` with the human player (index 0) taking the first turn clockwise.
- `resetGame()` delegates to `initGame()`, producing a completely clean slate with no residual state.
- The engine barrel export (`src/engine/index.ts`) is finalized with all 8 modules.

---

## Gate Summary

| Gate | Reviewer | Score | Status | Document |
|------|----------|-------|--------|----------|
| Dev Complete | Developer | — | READY_FOR_SM_REVIEW | `docs/dev-notes/DEV-NOTES-STORY-008.md` |
| SM Completion Review | Scrum Master | **10/10** | APPROVED | `docs/queue/completion-review-STORY-008.md` |
| QA Review | QA Engineer | **10/10** | PASS | `docs/qa/QA-REVIEW-STORY-008.md` |

**All gates passed. Story approved for merge and close.**

---

## Files Delivered

| # | File | Action | Story | Lines | Description |
|---|------|--------|-------|-------|-------------|
| 1 | `src/engine/game.ts` | Created | STORY-008 | 91 | `initGame()` and `resetGame()` orchestration functions |
| 2 | `src/engine/index.ts` | Finalized | STORY-008 | 30 | Barrel export for all 8 engine modules |
| 3 | `src/engine/game.test.ts` | Created | STORY-008 | — | 17 test cases in 2 describe blocks |

---

## Orchestration Functions

### `initGame(): GameState`
1. Calls `createDeck()` to build a 53-card deck, then `shuffleDeck()` for randomization.
2. Calls `dealCards(shuffledDeck, TOTAL_PLAYERS=4, HAND_SIZE=3)` to deal 12 cards round-robin (41 remaining).
3. Creates 4 players:
   - **Player 1:** `{ id: 1, name: 'You', type: Human, hand: hands[0], lives: 5, status: Alive }`
   - **Player 2:** `{ id: 2, name: 'Bot 2', type: Bot, hand: hands[1], lives: 5, status: Alive }`
   - **Player 3:** `{ id: 3, name: 'Bot 3', type: Bot, hand: hands[2], lives: 5, status: Alive }`
   - **Player 4:** `{ id: 4, name: 'Bot 4', type: Bot, hand: hands[3], lives: 5, status: Alive }`
4. Returns full `GameState`:
   - `currentPlayerIndex: 0` (human starts)
   - `direction: Direction.Clockwise`
   - `deck: remainingDeck` (41 cards)
   - `middlePile: []`
   - `lastValue: null`
   - `gameStatus: GameStatus.Playing`
   - `winner: null`

### `resetGame(): GameState`
- Delegates directly to `initGame()`.
- Returns a completely fresh state — no residual data persists.

---

## Barrel Export Completeness

`src/engine/index.ts` — all 8 engine modules exported:

| # | Module | Exported Functions / Types | Story |
|---|--------|----------------------------|-------|
| 1 | `./deck` | `createDeck`, `shuffleDeck`, `drawCard`, `dealCards` | STORY-003 |
| 2 | `./cards` | `isCardPlayable`, `hasPlayableCard`, `getCardDisplayValue` | STORY-003 |
| 3 | `./turn` | `getNextActivePlayerIndex`, `getAlivePlayerCount`, `advanceTurn` | STORY-004 |
| 4 | `./player` | `eliminatePlayer`, `canPlayerAct`, `loseLife` | STORY-004 |
| 5 | `./special-cards` | `applySpecialEffect`, `SpecialEffectResult` (type) | STORY-005 |
| 6 | `./bot-ai` | `decideBotPlay` | STORY-006 |
| 7 | `./win-condition` | `checkWinCondition`, `resolveDeadlock`, `isDeadlock` | STORY-007 |
| 8 | `./game` | `initGame`, `resetGame` | STORY-008 |

**Total exported: 18 functions + 1 type across 8 modules — Complete.**

---

## Test Coverage

### Story-Level Tests (game.test.ts)
- **17 new tests** across 2 describe blocks (`initGame`: 15, `resetGame`: 2)
- All 13 required test cases from story spec: **PASS**
- 4 bonus tests (player names, IDs, card validation, reset independence): **PASS**

### Full Project Suite
```
Test Files  10 passed (10)
Tests       132 passed (132)
Duration    ~18-22s
Build       Succeeded (tsc + vite)
Lint        Passed (zero errors, zero warnings)
```

**Zero failures. Zero regressions. All tests pass.**

---

## Acceptance Criteria

| ID | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-003 | 4 players at table, 3 cards each, 5 lives each | **PASS** | Tests #1, #5, #6 verify player count, lives, and hand size |
| AC-016 | Play Again resets all state and starts new round | **PASS** | Tests #16, #17 verify resetGame produces fresh independent state |

---

## Story Points

**5 points** — Medium complexity  
Covers orchestration logic, barrel finalization, and comprehensive test suite.

---

## Next Stories Unlocked

| Story ID | Title | Points | Dependencies |
|----------|-------|--------|--------------|
| **STORY-009** | Zustand Store Implementation (3 slices + selectors) | 8 | STORY-001 through STORY-008 |

**STORY-008 is the final engine-layer dependency for STORY-009.** With STORY-008 closed, STORY-009 is now fully unblocked and ready for development. The Zustand store will consume the `initGame()` and `resetGame()` output directly.

---

## Recommended Commit Message

```
feat(engine): add full game orchestration (initGame, resetGame) (STORY-008)

- Implement initGame: createDeck + shuffleDeck + dealCards + player setup
- Creates fresh GameState with 4 players (You + 3 Bots), 3 cards each, 5 lives
- Sets currentPlayerIndex=0, direction=Clockwise, gameStatus=Playing
- Implement resetGame: delegates to initGame for clean slate
- Finalize engine barrel export with all 8 modules:
  deck, cards, turn, player, special-cards, bot-ai, win-condition, game
- Add 17 unit tests covering all initialization invariants
- Pure game engine layer complete (no React/3D imports)
- Project now has 132 passing tests across 10 files

Closes STORY-008
```

---

## Git Instructions

```bash
# Ensure all changes are staged
git add src/engine/game.ts src/engine/index.ts src/engine/game.test.ts

# Commit with the recommended message
git commit -m "feat(engine): add full game orchestration (initGame, resetGame) (STORY-008)

- Implement initGame: createDeck + shuffleDeck + dealCards + player setup
- Creates fresh GameState with 4 players (You + 3 Bots), 3 cards each, 5 lives
- Sets currentPlayerIndex=0, direction=Clockwise, gameStatus=Playing
- Implement resetGame: delegates to initGame for clean slate
- Finalize engine barrel export with all 8 modules:
  deck, cards, turn, player, special-cards, bot-ai, win-condition, game
- Add 17 unit tests covering all initialization invariants
- Pure game engine layer complete (no React/3D imports)
- Project now has 132 passing tests across 10 files

Closes STORY-008"

# Push to remote
git push origin HEAD
```

---

## Final Checklist

| Item | Status |
|------|--------|
| All code implemented per spec | Done |
| All 17 tests written and passing | Done |
| Full suite: 132/132 passing | Done |
| Build succeeds (tsc + vite) | Done |
| Lint clean (zero errors) | Done |
| Dev notes created | Done |
| SM completion review: 10/10 APPROVED | Done |
| QA review: 10/10 PASS | Done |
| Story status updated to CLOSED | Done |
| Dev-queue updated to Done | Done |
| Story file DoD checkboxes marked | Done |
| Next story (STORY-009) unblocked | Done |

---

## Close Decision

**Status: CLOSED**

STORY-008 has passed all quality gates — Development, Scrum Master Review (10/10, APPROVED), and QA Review (10/10, PASS, 0 defects). All scope items are implemented exactly as specified, both acceptance criteria are satisfied, 17 new tests pass with zero regressions across 132 total tests, and the production build is clean. The pure game engine layer is now complete, and STORY-009 (Zustand Store) is fully unblocked.

**Closing STORY-008. Pure game engine layer: COMPLETE.**

---

*Signed off by: Scrum Master — 2026-05-31*
