# Dev Notes
Story ID: STORY-002

## Story Context Reviewed
- STORY-002: Data Model & Type Definitions
- docs/architecture/architecture.md (Section 6 — Data Model: Enums, Interfaces, Constants)
- docs/prd/prd.md (Section 11 — Data Requirements: Core Game State, Player State, Card State, Special Card Reference)
- docs/queue/dev-queue.md (Wave 1 — Foundation, STORY-002 is second in queue, depends on STORY-001)
- STORY-001 dev notes reviewed: project scaffolded with Vite + React + TypeScript; path alias `@/*` configured in tsconfig.app.json but not in vite/vitest configs

## Files Changed

### Created — Type Definition Files
| File | Purpose |
|------|---------|
| `src/types/card.ts` | `CardType` enum, `SpecialEffect` enum, `Card` interface, `NumberCard` interface, `SpecialCard` interface |
| `src/types/player.ts` | `PlayerType` enum, `PlayerStatus` enum, `Player` interface |
| `src/types/game.ts` | `GameStatus` enum, `Direction` enum (numeric), `GameState` interface, `BotDecision` interface, `TurnResult` interface, `AnimationAction` interface |
| `src/types/constants.ts` | All game configuration constants (players, lives, hand size, card quantities, timings, display names) |

### Modified — Barrel Export & Config Files
| File | Purpose |
|------|---------|
| `src/types/index.ts` | Replaced empty placeholder with barrel re-exports of all types, enums, interfaces, and constants |
| `vite.config.ts` | Added `resolve.alias` for `@/*` → `src/*` path resolution (was missing from STORY-001) |
| `vitest.config.ts` | Added `resolve.alias` for `@/*` → `src/*` path resolution (was missing from STORY-001) |
| `tsconfig.node.json` | Added `"types": ["node"]` to enable Node.js type declarations in config files |

### Created — Test File
| File | Purpose |
|------|---------|
| `src/types/types.test.ts` | 25 test cases verifying constants math, all enum values, barrel imports |

### Dependencies Added
| Package | Purpose |
|---------|---------|
| `@types/node` | Required Node.js type declarations for `node:url` import in vite/vitest config files |

## Implementation Summary

1. **Card types** (`src/types/card.ts`):
   - `CardType` string enum: `Number = 'number'`, `Special = 'special'`
   - `SpecialEffect` string enum: `Reverse = 'reverse'`, `Skip = 'skip'`, `Bomb = 'bomb'`, `Nuclear = 'nuclear'`, `Random = 'random'`
   - `Card` interface: `id: string`, `type: CardType`, `value: number | null`, `effect: SpecialEffect | null`
   - `NumberCard` narrows `Card`: type constrained to `CardType.Number`, value to `number`, effect to `null`
   - `SpecialCard` narrows `Card`: type constrained to `CardType.Special`, value to `null`, effect to `SpecialEffect`

2. **Player types** (`src/types/player.ts`):
   - `PlayerType` string enum: `Human = 'human'`, `Bot = 'bot'`
   - `PlayerStatus` string enum: `Alive = 'alive'`, `Eliminated = 'eliminated'`, `Spectator = 'spectator'`
   - `Player` interface: `id: number`, `name: string`, `type: PlayerType`, `hand: Card[]`, `lives: number`, `status: PlayerStatus`

3. **Game types** (`src/types/game.ts`):
   - `GameStatus` string enum: `Waiting = 'waiting'`, `Playing = 'playing'`, `Finished = 'finished'`
   - `Direction` numeric enum: `Clockwise = 1`, `CounterClockwise = -1` (arithmetic-friendly for turn calculation)
   - `GameState` interface: `players`, `currentPlayerIndex`, `direction`, `deck`, `middlePile`, `lastValue: number | null`, `gameStatus`, `winner: Player | null`
   - `BotDecision` interface: `action: 'play' | 'pass'`, `cardId?: string`, `reason: string`
   - `TurnResult` interface: `playerId`, `action`, `card`, `livesLost`, `eliminated`, `specialEffectApplied`, `randomValue?: number`
   - `AnimationAction` interface: `type` is a union of 5 string literals, `payload` object with optional fields, `duration: number`

4. **Constants** (`src/types/constants.ts`):
   - Game settings: `TOTAL_PLAYERS = 4`, `INITIAL_LIVES = 5`, `HAND_SIZE = 3`
   - Card config: `NUMBER_CARD_MIN = 1`, `NUMBER_CARD_MAX = 13`, `NUMBER_COPIES_PER_VALUE = 3`
   - `SPECIAL_CARD_QUANTITIES` Record: Reverse×3, Skip×3, Bomb×3, Nuclear×2, Random×3
   - Timing: `BOT_TURN_DELAY_MS = 1500`, `CARD_ANIMATION_DURATION_MS = 400`, `VFX_DURATION_MS = 800`
   - `SPECIAL_DISPLAY_NAMES` Record: maps SpecialEffect values to human-readable strings ('Nuklir' for Nuclear)

5. **Barrel export** (`src/types/index.ts`):
   - Re-exports all 6 enums as values, all 7 interfaces as types, all 11 constants

6. **Path alias fix** (`vite.config.ts`, `vitest.config.ts`, `tsconfig.node.json`):
   - STORY-001 configured `@/*` alias in tsconfig.app.json but not in the runtime configs
   - Added `resolve.alias` to both Vite and Vitest configs using `fileURLToPath(new URL('./src', import.meta.url))` (ESM-compatible)
   - Added `@types/node` dev dependency and `"types": ["node"]` to `tsconfig.node.json`

## Tests Added or Updated

| Test File | Description | Status |
|-----------|-------------|--------|
| `src/types/types.test.ts` | 25 tests across 12 describe blocks | ✅ All pass |

Test categories:
- **Constants math** (3 tests): 39 number cards, 14 special cards, 53 total
- **Game settings** (3 tests): players, lives, hand size, card range, timings
- **Special card quantities** (2 tests): exact per-effect counts, all 5 keys present
- **Special display names** (1 test): human-readable names including 'Nuklir'
- **CardType enum** (2 tests): string values, 2 members
- **SpecialEffect enum** (2 tests): string values, 5 members
- **PlayerType enum** (2 tests): string values, 2 members
- **PlayerStatus enum** (2 tests): string values, 3 members
- **GameStatus enum** (2 tests): string values, 3 members
- **Direction enum** (3 tests): numeric values (1, -1), 2 named members, arithmetic wrap-around
- **Barrel import resolution** (2 tests): all enums and constants resolve from `@/types/index`

## Test Commands Run

| Command | Result |
|---------|--------|
| `npx tsc -b --noEmit` | ✅ Zero type errors |
| `npm test` (vitest run) | ✅ 2 test files, 25 tests passed (5.29s) |
| `npm run build` (tsc -b && vite build) | ✅ Built in 6.46s, 5 output files |
| `npm run lint` (eslint .) | ✅ Zero errors, zero warnings |

## Test Results

### Vitest Output
```
 Test Files  2 passed (2)
      Tests  25 passed (25)
   Duration  5.29s
```

### Build Output
```
dist/index.html                        0.77 kB │ gzip:  0.38 kB
dist/assets/index-vgqLo1Ne.css         5.54 kB │ gzip:  1.67 kB
dist/assets/app-vendor-DiXAKaTd.js     0.04 kB │ gzip:  0.06 kB
dist/assets/index-0tEBv-ou.js          1.93 kB │ gzip:  1.07 kB
dist/assets/three-vendor-BP8ymcgN.js 140.93 kB │ gzip: 45.29 kB
```
Total JS gzipped: ~46 KB (unchanged from STORY-001, types are tree-shaken since only consumed by tests yet)

## Commit Notes
Suggested commit message:
```
feat: add data model & type definitions (STORY-002)

- Define Card, NumberCard, SpecialCard interfaces with CardType and SpecialEffect enums
- Define Player interface with PlayerType and PlayerStatus enums
- Define GameState, BotDecision, TurnResult, AnimationAction interfaces
- Define Direction enum (numeric: 1/-1) for turn arithmetic
- Define all game constants: players, lives, hand size, card quantities, timings
- Add SPECIAL_DISPLAY_NAMES map (including 'Nuklir' for Nuclear)
- Add SPECIAL_CARD_QUANTITIES record (3+3+3+2+3 = 14, 39+14 = 53 total)
- Create barrel re-export index.ts for all types, enums, interfaces, constants
- Fix Vite/Vitest path alias @/* resolution (was missing from STORY-001)
- Add @types/node dev dep for node:url in config files
- Add 25 unit tests verifying constants math, all enum values, barrel imports
```

## Deviations from Spec

1. **`winner` type is `Player | null`, not `string | null`** — The task implementation notes say `winner` should be `string | null` (player ID), but both the architecture document (Section 6) and PRD (Section 11) specify `winner: Player | null`. The architecture document is the canonical reference explicitly called out by the story; the store layer can manage serialization. Followed the architecture spec.

2. **Added path alias config to Vite/Vitest** — STORY-001 configured `@/*` in `tsconfig.app.json` but omitted the runtime `resolve.alias` in vite.config.ts and vitest.config.ts. This was necessary for downstream code using `@/types` imports to work at runtime. Added `@types/node` as a dev dependency for the ESM-compatible `fileURLToPath(new URL(...))` pattern.

3. **Used `fileURLToPath(new URL('./src', import.meta.url))` instead of `path.resolve(__dirname, 'src')`** — The project uses `"type": "module"` in package.json, making `__dirname` unavailable in ESM. Used the standard ESM-compatible approach with `node:url`.

4. **Added `@types/node` as devDependency** — Required for TypeScript compilation of config files that import from `node:url`.

## Risks / Limitations

1. **Direction enum reverse mapping** — TypeScript numeric enums produce reverse mappings (`Direction[1] === 'Clockwise'`). This is expected behavior but means `Object.keys(Direction)` and `Object.values(Direction)` include entries for both directions. Downstream code should use `Direction.Clockwise` / `Direction.CounterClockwise` directly, not iterate over the enum.

2. **`winner: Player | null` stores full Player object** — This embeds the full player snapshot in game state. If the player object is later mutated (e.g., lives change), the winner reference may be stale. The Zustand store (immutably updated) prevents this, but it's worth noting for any non-store usage.

3. **No runtime validation** — Types are compile-time only. Interfaces like `NumberCard` and `SpecialCard` are narrowed via their extends clauses, but at runtime a `Card` with `type: 'number'` could still have `effect` set (TypeScript won't catch it at runtime). All card construction should go through factory functions (STORY-003).

## Ready for Scrum Master Review?
Status: READY_FOR_SM_REVIEW
