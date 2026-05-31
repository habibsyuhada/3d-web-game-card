# Dev Notes
Story ID: STORY-016

## Story Context Reviewed
- Read `docs/queue/dev-queue.md` — STORY-016 is the next in-progress story in Wave 4
- Read `docs/stories/STORY-016.md` — acceptance criteria & scope fully understood
- Read `docs/prd/prd.md` — HUD requirements (FR-080/082/083/084) confirmed
- Read `docs/architecture/architecture.md` — HUD belongs in UI layer as HTML overlay

## Files Changed
| File | Action |
|------|--------|
| `src/components/ui/HUD.tsx` | Created — HUD container |
| `src/components/ui/PlayerInfo.tsx` | Created — per-player label |
| `src/components/ui/DeckCounter.tsx` | Created — deck count |
| `src/components/ui/DirectionIndicator.tsx` | Created — turn direction |
| `src/components/ui/MiddlePileValue.tsx` | Created — pile value |
| `src/components/ui/SpectatorBanner.tsx` | Created — spectator alert |
| `src/App.tsx` | Updated — replaced `<TurnIndicator />` with `<HUD />` |
| `src/components/ui/HUD.test.tsx` | Created — HUD container tests |
| `src/components/ui/PlayerInfo.test.tsx` | Created — PlayerInfo tests |
| `src/components/ui/DeckCounter.test.tsx` | Created — DeckCounter tests |
| `src/components/ui/DirectionIndicator.test.tsx` | Created — DirectionIndicator tests |
| `src/components/ui/MiddlePileValue.test.tsx` | Created — MiddlePileValue tests |
| `src/components/ui/SpectatorBanner.test.tsx` | Created — SpectatorBanner tests |

## Implementation Summary
The HUD is implemented as a composite HTML overlay positioned `absolute inset-0 pointer-events-none z-10` over the R3F Canvas. Architecture:

- **HUD.tsx** is the container. It guards against rendering when `players.length === 0` (pre-init state) and composes all children.
- **TurnIndicator**, already created in STORY-015, is re-used inside HUD without modification.
- **PlayerInfo** positions each player absolutely using `playerIndex` → fixed slots (bottom/left/top/right). Active player gets a teal glow border. Eliminated players are greyed with `line-through`.
- **DeckCounter** reads `useDeckCount()` and applies orange warning color when count === 0.
- **DirectionIndicator** reads `direction` and shows `↻` (cyan) or `↺` (amber).
- **MiddlePileValue** reads `lastValue` — shows large yellow number or em-dash when null.
- **SpectatorBanner** conditionally renders when the human player is `Eliminated`.

All components use `pointer-events-none` via the parent container so 3D canvas interactions pass through unhindered.

## Tests Added or Updated
| Test file | Tests |
|-----------|-------|
| `HUD.test.tsx` | 11 tests — render guard, children present, spectator, pointer-events |
| `PlayerInfo.test.tsx` | 10 tests — name, lives, active highlight, eliminated, positions |
| `DeckCounter.test.tsx` | 5 tests — count display, warning color, reactivity |
| `DirectionIndicator.test.tsx` | 6 tests — arrow symbol, label, direction change, aria-label |
| `MiddlePileValue.test.tsx` | 8 tests — numeric/empty display, reactivity, aria-labels, colors |
| `SpectatorBanner.test.tsx` | 6 tests — hidden when alive, visible when eliminated, role=alert |

## Test Commands Run
- `npx tsc --noEmit` — clean, no errors
- `npm test -- --run` — **344 tests pass, 0 failures**
- `npm run build` — builds successfully (pre-existing three.js chunk warning is non-blocking)

## Test Results
```
Test Files  30 passed (30)
Tests       344 passed (344)
```
Previous baseline (STORY-015): 295 tests passed. STORY-016 added 49 new tests.

## Commit Notes
Suggested commit message:
```
feat(hud): implement STORY-016 HUD overlay

- Add HUD container (absolute inset-0 pointer-events-none z-10)
- Add PlayerInfo per-player labels (name + ♥ lives + active glow)
- Add DeckCounter with empty-deck warning color
- Add DirectionIndicator (↻/↺ with cyan/amber coloring)
- Add MiddlePileValue (large centered number or em-dash)
- Add SpectatorBanner (conditional on human elimination)
- Update App.tsx to replace TurnIndicator with HUD
- Add 49 tests across 6 new test files (344 total passing)
```

## Risks / Limitations
1. **Overlap at 320px width** — PlayerInfo elements (especially left/right bots) may visually crowd on the smallest screens. Mitigation: text is `text-xs` and positioned with `left-2`/`right-2` offsets. A future mobile polish pass (STORY-020) could adjust.
2. **MiddlePileValue vs HUD center** — The pile value is positioned dead-center, which may overlap with 3D pile rendering. This is intentional per architecture (§10) and can be tuned in STORY-020.
3. **TurnIndicator is unchanged** — The STORY-015 component was reused as-is per story guidance. It retains `fixed` positioning which stacks above HUD's `absolute`. Acceptable — STORY-019 (Game Over) may revisit full layout.
4. **No animations on direction change** — A CSS transition class is present (`transition-all duration-300`) but no rotation animation was added. The story marks this as optional.

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
