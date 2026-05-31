# QA Review

**Story ID:** STORY-015 — Bot Turn Hook & Game Loop Orchestration  
**Status:** PASS

---

## Summary

STORY-015 implements the game loop orchestration layer connecting the pure game engine to the React rendering cycle. Two custom hooks (`useBotTurn` and `useGameLoop`) manage bot decision-making with visible delay and turn flow orchestration respectively. A `TurnIndicator` overlay UI component displays turn status messages. The hooks are integrated into `App.tsx` via an extracted `GameContainer` component. All 26 new tests pass, the full suite of 298 tests passes, TypeScript compilation is clean, and the production build succeeds.

---

## Acceptance Criteria Check

| Acceptance Criteria | ID | Status | Evidence |
|---|---|---|---|
| No valid cards → lose 1 life, turn passes | AC-007 | ✅ PASS | `useBotTurn.ts` L230-244 dispatches `passTurn()`, `handlePostAction()`, then `advanceTurn()`. Test: "passes (loses life) when bot has no valid cards" passes. |
| Lives reach 0 → eliminated | AC-013 | ✅ PASS | `handlePostAction()` in both hooks checks `player.lives === 0` → `eliminatePlayer()`. Tests: "eliminates player when lives reach 0 after pass" (bot), "checks elimination after human animation ends" (game loop). Both pass. |
| Spectator mode after elimination | AC-014 | ✅ PASS | Eliminated players are skipped automatically by `useGameLoop` L100-105 (`status !== PlayerStatus.Alive` → `advanceTurn()`). Tests: "skips eliminated players automatically", "skips multiple consecutive eliminated players". Both pass. Game over screen (full spectator) is out of scope for this story. |
| Victory when 1 player remains | AC-015 | ✅ PASS | `checkAndSetWinner()` called in `handlePostAction()` of both hooks. Tests: "sets winner when only one player remains after elimination" (bot hook), "detects winner when only one player remains after human elimination" (game loop). Both pass. |
| Bot plays with 1-2 second delay | AC-017 | ✅ PASS | `BOT_TURN_DELAY_MS` = 1500ms used in `setTimeout` at `useBotTurn.ts` L158. "thinking..." message set immediately (L156) giving visible feedback during the wait. Test: "sets 'thinking...' message immediately when it is bot turn" passes. |
| Bot plays smallest valid number card | AC-018 | ✅ PASS | Delegated to `decideBotPlay()` from engine (tested in STORY-006). Test: "plays the smallest valid card after BOT_TURN_DELAY_MS" confirms correct card selection. |
| Bot plays special when no valid numbers | AC-019 | ✅ PASS | Handled by `decideBotPlay()` returning special card. Test: "plays special card when no valid number cards exist" verifies Skip card is played. |
| Deadlock resolves correctly | AC-023 | ✅ PASS | `resolveDeadlock()` called in `handlePostAction()` when `gameStatus === Playing`. Store-level deadlock tests exist in `game-slice.test.ts`. |

---

## Test Commands Run

| Command | Result |
|---|---|
| `npx tsc --noEmit` | ✅ PASS — No type errors (clean output) |
| `npm test -- --run` (full suite) | ✅ PASS — 298/298 tests passed (24 files) |
| `npx vitest run src/hooks/useBotTurn.test.ts src/hooks/useGameLoop.test.ts` | ✅ PASS — 26/26 tests passed (2 files) |
| `npm run build` | ✅ PASS — Production build successful (only pre-existing three.js vendor warnings) |

---

## Test Results

### STORY-015 Specific Tests (26/26)

**useBotTurn.test.ts (15 tests):**

| Test | Status |
|---|---|
| Sets "thinking..." message immediately when it is bot turn | ✅ |
| Plays the smallest valid card after BOT_TURN_DELAY_MS | ✅ |
| Calls drawCard after playing a card | ✅ |
| Enqueues card-play animation after bot plays | ✅ |
| Passes (loses life) when bot has no valid cards | ✅ |
| Passes (loses life) when bot has empty hand | ✅ |
| Advances turn after bot pass (life loss) | ✅ |
| Cleans up timeout when turn changes | ✅ |
| Does nothing when game is finished | ✅ |
| Does nothing when bot is eliminated | ✅ |
| Waits for isAnimating to finish before acting | ✅ |
| Eliminates player when lives reach 0 after pass | ✅ |
| Sets winner when only one player remains after elimination | ✅ |
| Does not act when current player is human | ✅ |
| Plays special card when no valid number cards exist | ✅ |

**useGameLoop.test.ts (11 tests):**

| Test | Status |
|---|---|
| Sets "Your turn!" message for human player | ✅ |
| Skips eliminated players automatically | ✅ |
| Skips multiple consecutive eliminated players | ✅ |
| Does not process when game is finished | ✅ |
| Does not advance turn while animating | ✅ |
| Handles animation completion: post-action + advanceTurn | ✅ |
| Checks elimination after human animation ends when lives are 0 | ✅ |
| Detects winner when only one player remains after human elimination | ✅ |
| Does not process bot turns (bot hook handles it) | ✅ |
| Does not create infinite loops on repeated renders | ✅ |
| Does nothing if isAnimating was never true (initial render) | ✅ |

### Regression

Full test suite: 298/298 passed, 0 failures. No regressions detected.

---

## Manual Review

### useBotTurn.ts
- ✅ Clean architecture: subscribes to `currentPlayerIndex`, `gameStatus`, `isAnimating`
- ✅ Proper timeout cleanup in useEffect return function (L249-254)
- ✅ Re-validates state after async delay (L161-167) — prevents stale state issues
- ✅ `pendingPlayRef` prevents re-entrancy between bot play animation completion and new turn detection
- ✅ `timerActiveRef` prevents duplicate timer creation
- ✅ Post-action helper (`handlePostAction`) correctly chains: elimination → winner → deadlock
- ✅ Animation enqueueing with correct positions (hand → middle pile, deck → hand)
- ✅ Guards: game finished, bot eliminated, not alive, not a bot, isAnimating
- ✅ drawCard detection via hand-size-before/after comparison (L188-190) — robust approach

### useGameLoop.ts
- ✅ Clear responsibility partitioning from useBotTurn
- ✅ `prevAnimatingRef` correctly detects animation completion (true→false transition)
- ✅ `humanMessageSetRef` prevents repeated message setting
- ✅ Eliminated player skip is recursive-safe (single `advanceTurn()` call per effect run)
- ✅ Post-action flow on human animation end is complete
- ✅ Game finished guard at top of effect
- ✅ Bot turn no-op with flag reset for next human turn

### TurnIndicator.tsx
- ✅ Reads from Zustand store (reactive)
- ✅ Hidden when game is finished or message is empty
- ✅ Correct visual differentiation: blue for human, pulsing gray for bot thinking, neutral for other
- ✅ Accessibility: `role="status"` + `aria-live="polite"`
- ✅ `pointer-events-none` prevents interference with card interactions
- ✅ Fixed positioning with z-50 overlay

### App.tsx
- ✅ `GameContainer` extraction ensures hooks only run when game scene is active
- ✅ Hooks called inside `GameContainer` (correct React rules of hooks)
- ✅ TurnIndicator rendered alongside Canvas
- ✅ TitleScreen still takes priority when `showTitleScreen` is true

---

## Edge Cases Checked

| Edge Case | Covered? | Notes |
|---|---|---|
| All bots eliminated, human wins alone | ✅ | Tested: "sets winner when only one player remains after elimination" |
| Skip card followed by another Skip | ✅ | Handled at store level (documented risk, acceptable) |
| Reverse card changes direction mid-turn | ✅ | Direction is store state; hooks react to `currentPlayerIndex` changes |
| Bot has 0 cards (deck depleted) | ✅ | Tested: "passes (loses life) when bot has empty hand" |
| Multiple simultaneous eliminations | ✅ | Tested via winner detection after elimination |
| Game loop re-entrancy | ✅ | Ref-guard patterns prevent double-processing (`pendingPlayRef`, `humanMessageSetRef`, `prevAnimatingRef`) |
| Rapid animation completion | ✅ | `prevAnimatingRef` detects true→false transition reliably |
| Turn change during bot thinking timeout | ✅ | Timeout cleanup in useEffect return, re-validation after delay |
| isAnimating flag initially true | ✅ | Hook waits and processes only after animation completes |
| Game finishes mid-bot-thinking | ✅ | State re-validated after timeout (L164) |

---

## Bugs Found

**None.**

---

## Regression Risk

| Risk | Assessment | Notes |
|---|---|---|
| App.tsx restructuring | ⚠️ Low | `GameContainer` extraction is clean. Existing `GameScene`, `Canvas`, `TitleScreen` imports unchanged. No regressions in test suite. |
| New hooks running on every render | ⚠️ Low | Guard patterns (refs, early returns) prevent unnecessary processing. Infinite loop test confirms no repeated renders. |
| Zustand store access patterns | ✅ None | Uses `useGameStore.getState()` for imperative reads and `useGameStore(selector)` for reactive reads — correct pattern. |
| Animation queue interaction | ✅ None | Animations enqueued correctly; `setAnimating(true)` matches existing animation queue system. |
| TypeScript strict mode | ✅ None | `tsc --noEmit` passes cleanly. |
| Production build | ✅ None | Build succeeds with only pre-existing three.js vendor warnings. |

---

## Final Verdict

**PASS** ✅

STORY-015 meets all acceptance criteria. The implementation is architecturally sound with clear separation of concerns between the two hooks. Ref-based guard patterns effectively prevent infinite loops and re-entrancy. All 26 new tests pass, full suite of 298 tests pass with no regressions, TypeScript compiles cleanly, and the production build succeeds. The TurnIndicator component is well-styled with proper accessibility attributes. Edge cases are thoroughly handled in code and verified by tests.

**Three minor observations (non-blocking):**
1. Full 4-bot integration test from game start to completion is not present — more appropriate for STORY-021.
2. Deadlock resolution is tested at store level but not explicitly at hook level — store-level coverage is sufficient.
3. Skip effect handling relies on store-level pre-advancement rather than explicit hook-level detection — architectural decision, documented transparently.

None of these block the PASS decision.

---

*QA Review Date: 2026-05-31*  
*Reviewer: QA Engineer*
