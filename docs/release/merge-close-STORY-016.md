# Merge and Close Notes

**Story ID:** STORY-016  
**Story Title:** HUD Overlay (Turn Indicator, Player Info, Deck Counter, Direction, Middle Pile Value)  
**Wave:** Wave 4 — Animation & Loop  
**Status:** CLOSED  
**Close Date:** 2026-05-31  

---

## 1. Story Summary

STORY-016 (5 pts) delivers the full HUD (Heads-Up Display) overlay system for the Zinky Zoogle 3D card game:

1. **HUD.tsx** — Container component positioned `absolute inset-0 pointer-events-none z-10` over the R3F Canvas. Guards against rendering when `players.length === 0` (pre-init state). Composes all child overlay components.

2. **PlayerInfo.tsx** — One instance per player (4 total), absolutely positioned at each table side (bottom/left/top/right). Displays player name ("You"/"Bot N"), lives ("♥ X/5"), and status. Active player highlighted with teal glow border. Eliminated players greyed with `line-through` and "Eliminated" label.

3. **DeckCounter.tsx** — Reads `useDeckCount()` from store. Displays remaining card count with card emoji. Applies orange warning color (`text-orange-400`) when deck is empty.

4. **DirectionIndicator.tsx** — Reads `direction` from store. Shows `↻` (cyan, clockwise) or `↺` (amber, counter-clockwise) with text labels. Includes `transition-all duration-300` CSS class for smooth direction changes. ARIA label for accessibility.

5. **MiddlePileValue.tsx** — Reads `lastValue` from store. Shows large yellow number (`text-3xl`) centered on screen or gray em-dash when null. Includes "Pile" sublabel and conditional border colors.

6. **SpectatorBanner.tsx** — Conditionally renders when human player status is `Eliminated`. Dark red themed banner with "You are now spectating" message. Has `role="alert"` and `aria-live="assertive"` for accessibility.

7. **App.tsx (updated)** — Replaced standalone `<TurnIndicator />` with `<HUD />` which now wraps TurnIndicator inside the composite overlay.

This is the **fourth and final story of Wave 4**, completing the animation and game loop layer with the information overlay players see during gameplay.

---

## 2. Gate Summary

| Gate | Reviewer | Score | Status |
|------|----------|-------|--------|
| Developer Self-Review | Dev Agent | READY_FOR_SM_REVIEW | PASS |
| Scrum Master Completion Review | SM Agent | **ALL PASS (344/344 tests, 7/7 scope items)** | **APPROVED** |
| QA Review | QA Agent | **PASS (0 defects, 6/6 AC met, all FRs/NFRs met)** | **PASS** |
| **All Gates** | | | **CLOSED** |

---

## 3. Files Delivered (13 files)

### Created (12 files)

| # | File | Description |
|---|------|-------------|
| 1 | `src/components/ui/HUD.tsx` | HUD container — absolute overlay, empty-state guard, composes all 6 children |
| 2 | `src/components/ui/PlayerInfo.tsx` | Per-player label — name, lives (♥ X/5), active glow, eliminated state, position mapping |
| 3 | `src/components/ui/DeckCounter.tsx` | Deck count display — card emoji + count, orange warning at 0 |
| 4 | `src/components/ui/DirectionIndicator.tsx` | Direction arrow — ↻/↺ symbols, cyan/amber colors, ARIA label |
| 5 | `src/components/ui/MiddlePileValue.tsx` | Pile value display — large yellow number or em-dash, centered, "Pile" sublabel |
| 6 | `src/components/ui/SpectatorBanner.tsx` | Spectator alert — conditional on human elimination, role="alert" |
| 7 | `src/components/ui/HUD.test.tsx` | 11 tests: render guard, children present, spectator integration, pointer-events |
| 8 | `src/components/ui/PlayerInfo.test.tsx` | 10 tests: name, lives, active highlight, eliminated, 4 positions |
| 9 | `src/components/ui/DeckCounter.test.tsx` | 5 tests: count display, warning color, reactivity |
| 10 | `src/components/ui/DirectionIndicator.test.tsx` | 6 tests: arrow symbols, labels, direction change, aria-label |
| 11 | `src/components/ui/MiddlePileValue.test.tsx` | 8 tests: numeric/empty display, reactivity, aria-labels, colors |
| 12 | `src/components/ui/SpectatorBanner.test.tsx` | 6 tests: hidden when alive, visible when eliminated, role=alert |

### Modified (1 file)

| # | File | Description |
|---|------|-------------|
| 13 | `src/App.tsx` | Replaced `<TurnIndicator />` with `<HUD />` composite overlay |

**Total: 12 created + 1 modified = 13 files**

---

## 4. Component Specifications

### HUD Container

| Element | Implementation |
|---------|----------------|
| Positioning | `absolute inset-0 pointer-events-none z-10` |
| Empty guard | `players.length === 0` → renders nothing |
| Children | TurnIndicator, 4× PlayerInfo, DeckCounter, DirectionIndicator, MiddlePileValue, SpectatorBanner |
| Data attribute | `data-testid="hud-overlay"` for testing |

### PlayerInfo

| Element | Implementation |
|---------|----------------|
| Instances | 4 (one per player via `players.map()`) |
| Positioning | `getPositionClasses(playerIndex)` → bottom/left/top/right absolute positions |
| Active state | Teal glow border (`border-teal-400 shadow-teal-500/30`) |
| Eliminated state | Gray border, `line-through`, "Eliminated" label, reduced opacity |
| Content | Player name + "♥ X/5" lives |

### DeckCounter

| Element | Implementation |
|---------|----------------|
| Selector | `useDeckCount()` from store |
| Display | Card emoji (🂠) + "N cards" |
| Warning | Orange color (`text-orange-400`) when count === 0 |
| Normal | White text |

### DirectionIndicator

| Element | Implementation |
|---------|----------------|
| Selector | `direction` from store |
| Clockwise | `↻` symbol, cyan color, "Clockwise" label |
| Counter-clockwise | `↺` symbol, amber color, "Counter-clockwise" label |
| Transition | `transition-all duration-300` CSS class |

### MiddlePileValue

| Element | Implementation |
|---------|----------------|
| Selector | `lastValue` from store |
| Number display | Large yellow number (`text-3xl font-bold text-yellow-300`) |
| Empty display | Gray em-dash (`—`) |
| Sublabel | "Pile" below value |
| Border | Conditional border color based on value presence |

### SpectatorBanner

| Element | Implementation |
|---------|----------------|
| Trigger | Human player `status === Eliminated` |
| Message | "You are now spectating" |
| Style | Dark red theme, semi-transparent |
| Accessibility | `role="alert"`, `aria-live="assertive"` |

---

## 5. Test Coverage

### Story-Specific Tests

| Test File | Tests | Status |
|-----------|-------|--------|
| `HUD.test.tsx` | 11 | ALL PASS |
| `PlayerInfo.test.tsx` | 10 | ALL PASS |
| `DeckCounter.test.tsx` | 5 | ALL PASS |
| `DirectionIndicator.test.tsx` | 6 | ALL PASS |
| `MiddlePileValue.test.tsx` | 8 | ALL PASS |
| `SpectatorBanner.test.tsx` | 6 | ALL PASS |
| **New tests (STORY-016)** | **46** | **ALL PASS** |
| **Project total (30 files)** | **344** | **ALL PASS** |

### Coverage Highlights

- **HUD:** Render guard (empty players), all children present (4 PlayerInfo, DeckCounter, DirectionIndicator, MiddlePileValue, TurnIndicator), SpectatorBanner integration, pointer-events-none, absolute inset-0
- **PlayerInfo:** Name display, lives format (♥ X/5), active player teal highlight, non-active no highlight, "Eliminated" label with strikethrough, 4 position slots, reduced opacity
- **DeckCounter:** Count display, empty state (0), orange warning color at 0, white color when has cards, reactive update
- **DirectionIndicator:** ↻ symbol (clockwise), ↺ symbol (counter-clockwise), text labels, reactive direction change, aria-label
- **MiddlePileValue:** Em-dash when null, numeric display, value of 13, reactive null→number update, aria-labels, yellow/gray colors
- **SpectatorBanner:** Hidden when human alive, visible when eliminated, message text, no-players guard, bot-only elimination guard, role=alert
- **Zero regressions** across all 344 tests (298 pre-existing + 46 new)

---

## 6. Acceptance Criteria

| AC ID | Criterion | Evidence | Status |
|-------|-----------|----------|--------|
| AC-002 | 3D game scene loads with HUD | `App.tsx` renders `<HUD />` inside `GameContainer` alongside `<Canvas><GameScene /></Canvas>`. HUD guards on `players.length === 0` for pre-init. | **PASS** |
| AC-003 | Player positions visible with life tokens and names | `PlayerInfo` renders per-player: name, lives (♥ X/5), positioned at respective table sides. 4 instances via `players.map()`. | **PASS** |
| AC-008 | Direction indicator changes after Reverse | `DirectionIndicator` reads `direction` from store, displays ↻ or ↺. Reactive update confirmed via test. | **PASS** |
| AC-014 | Spectator banner when eliminated | `SpectatorBanner` renders conditionally when human player status is `Eliminated`. Has `role="alert"` and `aria-live="assertive"`. | **PASS** |
| AC-015 | Whose turn always visible | `TurnIndicator` (from STORY-015) included inside HUD container, reads `turnMessage` from store. | **PASS** |
| AC-022 | Portrait mode, touch targets adequate | HUD container uses `pointer-events-none`; 3D card tap interactions pass through unobstructed. | **PASS** |

**6/6 Acceptance Criteria Met**

### Functional & Non-Functional Requirements

| Req ID | Requirement | Status |
|--------|-------------|--------|
| FR-080 | Turn indicator overlay: whose turn + instructions | **PASS** |
| FR-082 | Player names and life counts as 2D overlays | **PASS** |
| FR-083 | Deck counter: remaining cards | **PASS** |
| FR-084 | Spectator message when human is eliminated | **PASS** |
| NFR-005 | Adapt to mobile widths 320-428px | **PASS** |
| NFR-008 | Card values readable, valid/invalid distinguishable | **PASS** |

---

## 7. Story Points

**5 pts** — Medium complexity. Six new UI components with proper Zustand selector integration, accessibility attributes, responsive positioning, and 46 comprehensive tests. The HUD overlay completes the information layer that makes the game playable.

---

## 8. Wave 4 — Final Status

| Metric | Value |
|--------|-------|
| **Wave 4 Stories** | 4/4 (100%) |
| **Wave 4 Points** | 23/23 (100%) |
| **STORY-016 New Tests** | 46 |
| **Total Tests (end of Wave 4)** | 344 across 30 files |
| **QA Defects (STORY-016)** | 0 |
| **QA Defects (Wave 4 total)** | 0 |
| **Build Failures** | 0 |
| **Lint Violations** | 0 |
| **TypeScript Errors** | 0 |

### Wave 4 Stories

| Story | Title | Points | SM Review | QA Review | Status |
|-------|-------|--------|-----------|-----------|--------|
| STORY-013 | Life Tokens & Middle Pile 3D Rendering | 5 | APPROVED | PASS | **CLOSED** ✅ |
| STORY-014 | Card Play Animation & Draw Animation | 5 | APPROVED | PASS | **CLOSED** ✅ |
| STORY-015 | Bot Turn Hook & Game Loop Orchestration | 8 | APPROVED | PASS | **CLOSED** ✅ |
| STORY-016 | HUD Overlay | 5 | APPROVED | PASS | **CLOSED** ✅ |

**Wave 4: 4/4 CLOSED — 23/23 points — COMPLETE**

---

## 9. Known Limitations (Accepted, Non-blocking)

1. **320px overlap risk** — PlayerInfo elements may visually crowd on smallest screens; `text-xs` and offset mitigations applied. Polish deferred to STORY-020.
2. **MiddlePileValue center positioning** — May overlap with 3D pile rendering; per architecture spec, tunable in STORY-020.
3. **TurnIndicator `fixed` positioning** — Stacks above HUD's `absolute`; acceptable, revisitable in STORY-019.
4. **No direction-change animation** — Optional per story; CSS transition class present but no rotation animation.

---

## 10. Final Checklist

| Item | Status |
|------|--------|
| All scope items implemented (7/7) | DONE |
| All tests passing (344/344) | DONE |
| Build clean (tsc + vite) | DONE |
| Lint clean (0 errors) | DONE |
| SM completion review | DONE |
| QA review (PASS, 0 defects) | DONE |
| Acceptance criteria (6/6) | DONE |
| Functional requirements (FR-080, 082, 083, 084) | DONE |
| Non-functional requirements (NFR-005, 008) | DONE |
| Dev notes created | DONE |
| Story status updated to Done | DONE |
| Queue status updated | DONE |
| Merge/close notes created | DONE |
| Wave 4 complete | DONE |

---

## 11. Sign-Off

| Role | Date | Decision |
|------|------|----------|
| Developer | 2026-05-31 | Implemented and documented |
| Scrum Master | 2026-05-31 | APPROVED — Forwarded to QA |
| QA Engineer | 2026-05-31 | PASSED (0 defects, 6/6 AC met, all FRs/NFRs met) |
| Scrum Master (Close) | 2026-05-31 | **CLOSED** — Wave 4 story 4/4, **WAVE 4 COMPLETE** |

---

## Close Decision

**Status: CLOSED**

STORY-016 passes all quality gates. All 7 scope items are implemented across six new UI components (`HUD`, `PlayerInfo`, `DeckCounter`, `DirectionIndicator`, `MiddlePileValue`, `SpectatorBanner`) and one App.tsx integration update. The full test suite (344/344) passes with 46 new STORY-016 tests covering render guards, per-player positioning, lives display, active player highlighting, eliminated state, deck count reactivity, direction changes, pile value transitions, spectator mode, and accessibility attributes. TypeScript compiles cleanly. Build succeeds. QA found zero defects with all 6 acceptance criteria met and all functional requirements satisfied. Code quality is high with proper Zustand selector patterns, `pointer-events-none` overlay architecture, ARIA accessibility on all components, and comprehensive edge case handling. No rework required.

Wave 4 is now **4/4 complete (23/23 points)**. Wave 5 (Assembly & VFX) is next: STORY-017, STORY-018, STORY-019.
