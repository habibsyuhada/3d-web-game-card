# Architecture Document

**Project:** Zinky Zoogle — Mobile-First 3D Web Card Game  
**Status:** Ready  
**Version:** 1.0  
**Date:** 2025-05-30  
**Author:** Solution Architect  

---

## 1. Architecture Overview

Zinky Zoogle is a fully client-side, mobile-first 3D card game rendered in the browser using React Three Fiber. The architecture follows a **layered separation of concerns** with four primary layers:

```
┌──────────────────────────────────────────────────┐
│                  UI LAYER (HTML)                   │
│  Title Screen · HUD · Modals · Fullscreen Btn     │
│  Tailwind CSS · React (DOM)                        │
├──────────────────────────────────────────────────┤
│               3D RENDERER LAYER (R3F)              │
│  Canvas · Scene · Camera · Lighting · VFX          │
│  3D Cards · Table · Life Tokens · Animations       │
│  @react-three/fiber + @react-three/drei            │
├──────────────────────────────────────────────────┤
│             STATE MANAGEMENT LAYER                 │
│  Zustand Store · Game Slices · Derived State       │
│  Immer middleware for immutable updates             │
├──────────────────────────────────────────────────┤
│              GAME ENGINE LAYER (Pure TS)           │
│  Turn Manager · Card Validator · Deck Manager      │
│  Bot AI · Win Condition Checker                    │
│  No React/3D dependencies — pure functions          │
└──────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Pure Game Engine** — All game logic lives in plain TypeScript functions with zero UI/3D dependencies. This enables unit testing and future AI improvements without touching the renderer.
2. **Unidirectional Data Flow** — User input / Bot AI → Zustand actions → State change → React re-render (HTML + R3F).
3. **Procedural Everything** — All 3D geometry, materials, and card visuals are generated in code. No external asset loading = instant startup.
4. **Mobile-First Performance** — Low-poly geometry, instanced meshes where possible, capped frame rate, touch-optimized hit areas.

---

## 2. Requirement Mapping

| Requirement ID | Technical Component | Implementation Notes |
|---|---|---|
| FR-001 – FR-004 | `TitleScreen` component, `useFullscreen` hook | HTML overlay rendered before R3F Canvas |
| FR-010 – FR-015 | `GameEngine.initGame()` | Pure function that creates 4 players, shuffles deck, deals cards |
| FR-020 – FR-023 | `DeckManager` module | Factory functions for card creation, shuffle, draw |
| FR-030 – FR-037 | `TurnManager` module | State machine for turn flow, card validation, life loss |
| FR-040 – FR-045 | `SpecialCardEffects` module | Effect resolver functions, one per card type |
| FR-050 – FR-054 | `WinConditionChecker`, `GameOverScreen` | Pure check + UI overlay |
| FR-060 – FR-066 | `BotAI` module, `useBotTurn` hook | Decision tree + delayed dispatch via `setTimeout` |
| FR-070 – FR-079 | `3D Scene` components | R3F `<Canvas>`, procedural meshes, camera config |
| FR-080 – FR-084 | `HUD` components, HTML overlay | Tailwind-styled divs positioned over the Canvas |
| FR-090 – FR-092 | `GameEngine.resetGame()` | Full state reset action in Zustand store |
| NFR-001 | Performance budget, LOD, instancing | See Section 13 |
| NFR-002 | Vite code splitting, tree shaking | No heavy assets; bundle < 500KB gzipped target |
| NFR-003 | `pointer` events on R3F meshes | `onPointerDown` with `stopPropagation` |
| NFR-005 – NFR-006 | Responsive camera, Tailwind viewport | `useMediaQuery` for responsive 3D layout |
| NFR-007 | Memory budget enforcement | Geometry disposal, texture atlas avoidance |
| NFR-008 | Color + icon disabled state | `opacity` + `grayscale` filter + lock icon |
| NFR-011 | Zustand store | Single store with slices, serializable state |
| NFR-012 | Module separation | `src/engine/` has no React imports |

---

## 3. System Context

```
┌─────────────────────────────────┐
│        Mobile Browser            │
│  (Chrome / Safari / Firefox /    │
│   Samsung Internet)              │
│                                  │
│  ┌───────────────────────────┐   │
│  │    Zinky Zoogle (PWA)     │   │
│  │                           │   │
│  │  ┌─────────┐ ┌─────────┐ │   │
│  │  │ HTML UI │ │R3F Canvas│ │   │
│  │  │(overlay)│ │ (3D)    │ │   │
│  │  └────┬────┘ └────┬────┘ │   │
│  │       │           │       │   │
│  │  ┌────▼───────────▼────┐ │   │
│  │  │   Zustand Store     │ │   │
│  │  └────────┬────────────┘ │   │
│  │           │               │   │
│  │  ┌────────▼────────────┐ │   │
│  │  │   Game Engine       │ │   │
│  │  │   (Pure TS)         │ │   │
│  │  └─────────────────────┘ │   │
│  └───────────────────────────┘   │
│                                  │
│  ┌───────────────────────────┐   │
│  │ Browser Fullscreen API    │   │
│  └───────────────────────────┘   │
└─────────────────────────────────┘
```

**External Dependencies:** None. The game is fully self-contained in the browser. No network requests, no backend, no third-party APIs.

---

## 4. Tech Stack

| Technology | Version | Purpose | Rationale |
|---|---|---|---|
| **TypeScript** | ~5.4+ | Language | Type safety, IDE support, better refactoring |
| **React** | ~18.3+ | UI framework | Declarative composition, R3F compatibility |
| **Vite** | ~5.x+ | Build tool | Fast HMR, optimized builds, native ESM |
| **@react-three/fiber** | ~8.x | 3D rendering | Declarative Three.js in React, hooks-based |
| **@react-three/drei** | ~9.x | 3D helpers | `Text`, `Html`, `RoundedBox`, `useGLTF`-free helpers |
| **three.js** | ~0.164+ | 3D engine (peer dep) | Underlying WebGL renderer |
| **zustand** | ~4.5+ | State management | Lightweight, no boilerplate, middleware support |
| **immer** | ~10.x | Immutable updates | Used as Zustand middleware for nested state updates |
| **tailwindcss** | ~3.4+ | UI styling | Utility-first, no CSS files needed, tree-shakeable |
| **framer-motion-3d** | ~11.x+ | 3D animations | Declarative animations for R3F meshes |

### Dev Dependencies

| Technology | Purpose |
|---|---|
| **@types/three** | Three.js TypeScript definitions |
| **vitest** | Unit testing (fast, Vite-native) |
| **@testing-library/react** | Component testing |
| **eslint + @typescript-eslint** | Linting |
| **prettier** | Code formatting |
| **autoprefixer + postcss** | Tailwind CSS pipeline |

---

## 5. Folder Structure

```
src/
├── main.tsx                      # App entry point
├── App.tsx                       # Root component (Title/Game switch)
├── vite-env.d.ts
│
├── types/                        # Shared TypeScript types
│   ├── index.ts                  # Re-exports
│   ├── card.ts                   # Card, CardType, SpecialEffect
│   ├── player.ts                 # Player, PlayerType, PlayerStatus
│   ├── game.ts                   # GameState, GameStatus, Direction
│   └── constants.ts              # Magic numbers, card definitions
│
├── engine/                       # Pure game logic (NO React imports)
│   ├── index.ts                  # Public API barrel
│   ├── deck.ts                   # createDeck(), shuffleDeck(), drawCard()
│   ├── cards.ts                  # isCardPlayable(), getCardValue()
│   ├── turn.ts                   # advanceTurn(), getNextActivePlayer()
│   ├── special-cards.ts          # applyReverse(), applySkip(), applyBomb(), etc.
│   ├── bot-ai.ts                 # decideBotPlay() — decision tree
│   ├── player.ts                 # eliminatePlayer(), canPlayerAct()
│   ├── win-condition.ts          # checkWinCondition(), resolveDeadlock()
│   └── game.ts                   # initGame(), resetGame(), orchestrateTurn()
│
├── store/                        # Zustand state management
│   ├── index.ts                  # useGameStore hook (single store)
│   ├── game-slice.ts             # Game state + actions
│   ├── ui-slice.ts               # UI-specific state (modals, messages)
│   ├── animation-slice.ts        # Animation queue state
│   └── selectors.ts              # Memoized derived selectors
│
├── hooks/                        # Custom React hooks
│   ├── useFullscreen.ts          # Fullscreen API controller
│   ├── useBotTurn.ts             # Bot turn timer + dispatch
│   ├── useGameLoop.ts            # Turn orchestration hook
│   └── useCardInteraction.ts     # Card tap handler + validation
│
├── components/
│   ├── ui/                       # HTML overlay components (Tailwind)
│   │   ├── TitleScreen.tsx       # Landing screen with fullscreen button
│   │   ├── HUD.tsx               # In-game overlay container
│   │   ├── TurnIndicator.tsx     # "Your turn!" / "Bot 2 is thinking..."
│   │   ├── PlayerInfo.tsx        # Name + lives overlay per player
│   │   ├── DeckCounter.tsx       # Remaining cards display
│   │   ├── DirectionIndicator.tsx# Clockwise/CCW arrow
│   │   ├── GameOverScreen.tsx    # Victory/defeat + Play Again
│   │   ├── SpectatorBanner.tsx   # "You are spectating" message
│   │   └── MiddlePileValue.tsx   # Current pile value display
│   │
│   └── three/                    # R3F 3D components (inside Canvas)
│       ├── GameScene.tsx         # Root 3D scene (table, players, pile)
│       ├── Card3D.tsx            # Single 3D card (shared: face-up/down)
│       ├── CardHand.tsx          # Fan of cards for a player
│       ├── Table3D.tsx           # Procedural table mesh
│       ├── MiddlePile3D.tsx      # Stacked cards in center
│       ├── LifeTokens.tsx        # Heart/gem tokens per player
│       ├── PlayerSlot3D.tsx      # Combined: hand + name + lives at position
│       ├── CardAnimation.tsx     # Play/draw animation wrapper
│       └── vfx/
│           ├── BombVFX.tsx       # Particle burst on Bomb
│           ├── NuclearVFX.tsx    # Radiation ring on Nuclear
│           ├── RandomVFX.tsx     # Dice shuffle on Random
│           ├── ReverseVFX.tsx    # Spinning arrows on Reverse
│           ├── SkipVFX.tsx       # Dash trail on Skip
│           └── EliminationVFX.tsx# Shatter/fade on elimination
│
├── utils/                        # Shared helpers
│   ├── math.ts                   # Clamp, lerp, random helpers
│   ├── delay.ts                  # Promise-based delay for bot turns
│   └── id.ts                     # Card/Player ID generators
│
└── styles/
    └── index.css                 # Tailwind base + minimal global CSS
```

---

## 6. Data Model

### Enums

```typescript
// src/types/card.ts
export enum CardType {
  Number = 'number',
  Special = 'special',
}

export enum SpecialEffect {
  Reverse = 'reverse',
  Skip = 'skip',
  Bomb = 'bomb',
  Nuclear = 'nuclear',
  Random = 'random',
}

// src/types/player.ts
export enum PlayerType {
  Human = 'human',
  Bot = 'bot',
}

export enum PlayerStatus {
  Alive = 'alive',
  Eliminated = 'eliminated',
  Spectator = 'spectator',
}

// src/types/game.ts
export enum GameStatus {
  Waiting = 'waiting',
  Playing = 'playing',
  Finished = 'finished',
}

export enum Direction {
  Clockwise = 1,
  CounterClockwise = -1,
}
```

### Interfaces

```typescript
// src/types/card.ts
export interface Card {
  id: string;
  type: CardType;
  value: number | null;      // 1–13 for Number cards, null for Special
  effect: SpecialEffect | null;
}

export interface NumberCard extends Card {
  type: CardType.Number;
  value: number;             // 1–13
  effect: null;
}

export interface SpecialCard extends Card {
  type: CardType.Special;
  value: null;
  effect: SpecialEffect;
}

// src/types/player.ts
export interface Player {
  id: number;                // 1–4
  name: string;              // "You" | "Bot 2" | "Bot 3" | "Bot 4"
  type: PlayerType;
  hand: Card[];              // max 3 cards
  lives: number;             // 0–5
  status: PlayerStatus;
}

// src/types/game.ts
export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  direction: Direction;
  deck: Card[];
  middlePile: Card[];
  lastValue: number | null;
  gameStatus: GameStatus;
  winner: Player | null;
}

// src/types/game.ts — Bot decision output
export interface BotDecision {
  action: 'play' | 'pass';
  cardId?: string;
  reason: string;
}

// src/types/game.ts — Turn result
export interface TurnResult {
  playerId: number;
  action: 'played' | 'passed';
  card: Card | null;
  livesLost: number;
  eliminated: boolean;
  specialEffectApplied: SpecialEffect | null;
  randomValue?: number;
}
```

### Constants

```typescript
// src/types/constants.ts
export const TOTAL_PLAYERS = 4;
export const INITIAL_LIVES = 5;
export const HAND_SIZE = 3;
export const NUMBER_CARD_MIN = 1;
export const NUMBER_CARD_MAX = 13;
export const NUMBER_COPIES_PER_VALUE = 3;

export const SPECIAL_CARD_QUANTITIES: Record<SpecialEffect, number> = {
  [SpecialEffect.Reverse]: 3,
  [SpecialEffect.Skip]: 3,
  [SpecialEffect.Bomb]: 3,
  [SpecialEffect.Nuclear]: 2,
  [SpecialEffect.Random]: 3,
};
// Total: 39 number + 14 special = 53 cards

export const BOT_TURN_DELAY_MS = 1500;
export const CARD_ANIMATION_DURATION_MS = 400;
export const VFX_DURATION_MS = 800;
```

---

## 7. State Management Design

### Zustand Store Shape

The store is a single `useGameStore` hook composed of three slices merged together.

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface GameSlice {
  // State
  players: Player[];
  currentPlayerIndex: number;
  direction: Direction;
  deck: Card[];
  middlePile: Card[];
  lastValue: number | null;
  gameStatus: GameStatus;
  winner: Player | null;

  // Actions
  initGame: () => void;
  resetGame: () => void;
  playCard: (playerIndex: number, cardId: string) => TurnResult;
  passTurn: (playerIndex: number) => TurnResult;
  drawCard: (playerIndex: number) => Card | null;
  advanceTurn: () => void;
  applySpecialEffect: (effect: SpecialEffect) => number | null;
  eliminatePlayer: (playerIndex: number) => void;
  checkAndSetWinner: () => void;
  resolveDeadlock: () => void;
}

interface UISlice {
  // State
  isFullscreen: boolean;
  showTitleScreen: boolean;
  turnMessage: string;
  showGameOver: boolean;
  showMessage: string | null;
  messageQueue: string[];

  // Actions
  setFullscreen: (value: boolean) => void;
  setShowTitleScreen: (value: boolean) => void;
  setTurnMessage: (msg: string) => void;
  setShowGameOver: (value: boolean) => void;
  pushMessage: (msg: string) => void;
  clearMessages: () => void;
}

interface AnimationSlice {
  // State
  isAnimating: boolean;
  animationQueue: AnimationAction[];
  activeVFX: SpecialEffect | null;
  vfxPosition: [number, number, number] | null;

  // Actions
  enqueueAnimation: (action: AnimationAction) => void;
  clearAnimationQueue: () => void;
  setAnimating: (value: boolean) => void;
  setActiveVFX: (effect: SpecialEffect | null, position?: [number, number, number]) => void;
}

export type GameStore = GameSlice & UISlice & AnimationSlice;

export const useGameStore = create<GameStore>()(
  immer((...args) => ({
    ...createGameSlice(...args),
    ...createUISlice(...args),
    ...createAnimationSlice(...args),
  }))
);
```

### Animation Action Type

```typescript
export interface AnimationAction {
  type: 'card-play' | 'card-draw' | 'life-loss' | 'elimination' | 'vfx';
  payload: {
    cardId?: string;
    playerIndex?: number;
    fromPosition?: [number, number, number];
    toPosition?: [number, number, number];
    effect?: SpecialEffect;
  };
  duration: number;
}
```

### Key Selectors (memoized)

```typescript
// src/store/selectors.ts
import { useGameStore } from './index';

export const useCurrentPlayer = () =>
  useGameStore((s) => s.players[s.currentPlayerIndex]);

export const useHumanPlayer = () =>
  useGameStore((s) => s.players.find((p) => p.type === PlayerType.Human)!);

export const useIsHumanTurn = () =>
  useGameStore((s) => s.players[s.currentPlayerIndex].type === PlayerType.Human);

export const usePlayableCards = (playerIndex: number) =>
  useGameStore((s) => {
    const player = s.players[playerIndex];
    return player.hand.filter((card) => isCardPlayable(card, s.lastValue));
  });

export const useAlivePlayers = () =>
  useGameStore((s) => s.players.filter((p) => p.status === PlayerStatus.Alive));

export const useDeckCount = () =>
  useGameStore((s) => s.deck.length);

export const useMiddlePileTopCard = () =>
  useGameStore((s) => s.middlePile[s.middlePile.length - 1] ?? null);
```

### Middleware

- **immer** — Enables mutable-style updates on the deeply nested game state (player hands, deck array). Critical because card arrays are frequently mutated (splice, push).
- No `persist` middleware — Game state is ephemeral; no localStorage needed.
- No `devtools` middleware in production (can be conditionally added in dev).

---

## 8. Game Engine Logic

### 8.1 Deck Manager (`src/engine/deck.ts`)

```typescript
export function createDeck(): Card[] {
  const cards: Card[] = [];

  // Number cards: values 1–13, 3 copies each
  for (let value = 1; value <= 13; value++) {
    for (let copy = 0; copy < NUMBER_COPIES_PER_VALUE; copy++) {
      cards.push({
        id: generateCardId('num', value, copy),
        type: CardType.Number,
        value,
        effect: null,
      });
    }
  }

  // Special cards
  for (const [effect, count] of Object.entries(SPECIAL_CARD_QUANTITIES)) {
    for (let copy = 0; copy < count; copy++) {
      cards.push({
        id: generateCardId('spc', effect, copy),
        type: CardType.Special,
        value: null,
        effect: effect as SpecialEffect,
      });
    }
  }

  return cards;
}

export function shuffleDeck(deck: Card[]): Card[] {
  // Fisher-Yates shuffle
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCard(deck: Card[]): { card: Card | null; deck: Card[] } {
  if (deck.length === 0) return { card: null, deck };
  const [card, ...remaining] = deck;
  return { card, deck: remaining };
}

export function dealCards(
  deck: Card[],
  playerCount: number,
  handSize: number
): { hands: Card[][]; deck: Card[] } {
  let remaining = deck;
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);

  for (let cardIdx = 0; cardIdx < handSize; cardIdx++) {
    for (let playerIdx = 0; playerIdx < playerCount; playerIdx++) {
      const result = drawCard(remaining);
      if (result.card) {
        hands[playerIdx].push(result.card);
        remaining = result.deck;
      }
    }
  }

  return { hands, deck: remaining };
}
```

### 8.2 Card Validator (`src/engine/cards.ts`)

```typescript
export function isCardPlayable(card: Card, lastValue: number | null): boolean {
  // Special cards are ALWAYS playable
  if (card.type === CardType.Special) return true;

  // If middle pile is empty, any number card is playable
  if (lastValue === null) return true;

  // Number card must be >= lastValue
  if (card.type === CardType.Number && card.value !== null) {
    return card.value >= lastValue;
  }

  return false;
}

export function hasPlayableCard(hand: Card[], lastValue: number | null): boolean {
  return hand.some((card) => isCardPlayable(card, lastValue));
}

export function getCardDisplayValue(card: Card): string {
  if (card.type === CardType.Special && card.effect) {
    return SPECIAL_DISPLAY_NAMES[card.effect]; // "Reverse", "Skip", etc.
  }
  return card.value?.toString() ?? '?';
}
```

### 8.3 Turn Manager (`src/engine/turn.ts`)

```typescript
export function getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number,
  direction: Direction
): number {
  const count = players.length;
  let next = currentIndex;

  do {
    next = (next + direction + count) % count;
  } while (players[next].status !== PlayerStatus.Alive);

  return next;
}

export function getAlivePlayerCount(players: Player[]): number {
  return players.filter((p) => p.status === PlayerStatus.Alive).length;
}

export function advanceTurn(state: GameState): GameState {
  const nextIndex = getNextActivePlayerIndex(
    state.players,
    state.currentPlayerIndex,
    state.direction
  );

  return {
    ...state,
    currentPlayerIndex: nextIndex,
  };
}
```

### 8.4 Special Card Effects (`src/engine/special-cards.ts`)

```typescript
export function applySpecialEffect(
  effect: SpecialEffect,
  state: GameState
): { newLastValue: number | null; newDirection: Direction; skipNext: boolean; randomValue?: number } {

  switch (effect) {
    case SpecialEffect.Reverse:
      return {
        newLastValue: state.lastValue,
        newDirection: state.direction === Direction.Clockwise
          ? Direction.CounterClockwise
          : Direction.Clockwise,
        skipNext: false,
      };

    case SpecialEffect.Skip:
      return {
        newLastValue: state.lastValue,
        newDirection: state.direction,
        skipNext: true,
      };

    case SpecialEffect.Bomb:
      return {
        newLastValue: null,        // Reset pile value
        newDirection: state.direction,
        skipNext: false,
      };

    case SpecialEffect.Nuclear:
      return {
        newLastValue: null,        // Clear entire pile
        newDirection: state.direction,
        skipNext: false,
        // Note: Also triggers middlePile = [] in the store action
      };

    case SpecialEffect.Random:
      const randomValue = Math.floor(Math.random() * 13) + 1; // 1–13
      return {
        newLastValue: randomValue,
        newDirection: state.direction,
        skipNext: false,
        randomValue,
      };
  }
}
```

### 8.5 Bot AI Decision Tree (`src/engine/bot-ai.ts`)

```typescript
export function decideBotPlay(
  hand: Card[],
  lastValue: number | null
): BotDecision {

  const numberCards = hand.filter(
    (c) => c.type === CardType.Number && isCardPlayable(c, lastValue)
  );
  const specialCards = hand.filter((c) => c.type === CardType.Special);

  // Case 1: Middle pile is empty — play smallest card overall
  if (lastValue === null) {
    const allPlayable = [...numberCards, ...specialCards];
    if (allPlayable.length === 0) {
      return { action: 'pass', reason: 'No cards in hand' };
    }
    // Prefer smallest number card
    const sorted = allPlayable.sort((a, b) => {
      const aVal = a.value ?? 14; // Special cards sorted last
      const bVal = b.value ?? 14;
      return aVal - bVal;
    });
    return { action: 'play', cardId: sorted[0].id, reason: 'Empty pile, play smallest' };
  }

  // Case 2: Has valid number cards — play smallest valid
  if (numberCards.length > 0) {
    const smallest = numberCards.reduce((min, c) =>
      (c.value ?? 99) < (min.value ?? 99) ? c : min
    );
    return { action: 'play', cardId: smallest.id, reason: 'Smallest valid number card' };
  }

  // Case 3: No valid number cards but has special cards
  if (specialCards.length > 0) {
    return { action: 'play', cardId: specialCards[0].id, reason: 'No valid numbers, use special' };
  }

  // Case 4: No playable cards at all
  return { action: 'pass', reason: 'No playable cards' };
}
```

### 8.6 Win Condition (`src/engine/win-condition.ts`)

```typescript
export function checkWinCondition(players: Player[]): Player | null {
  const alive = players.filter((p) => p.status === PlayerStatus.Alive);
  if (alive.length === 1) return alive[0];
  return null;
}

export function resolveDeadlock(players: Player[]): Player | null {
  // FR-092: All alive players have no valid cards simultaneously
  const alive = players.filter((p) => p.status === PlayerStatus.Alive);
  if (alive.length <= 1) return alive[0] ?? null;

  // Award to player with most lives; tie-breaker: lowest index
  const sorted = [...alive].sort((a, b) => {
    if (b.lives !== a.lives) return b.lives - a.lives;
    return a.id - b.id;
  });

  return sorted[0];
}

export function isDeadlock(state: GameState): boolean {
  const alive = state.players.filter((p) => p.status === PlayerStatus.Alive);
  return alive.length > 1 && alive.every(
    (p) => !hasPlayableCard(p.hand, state.lastValue)
  );
}
```

### 8.7 Full Turn Orchestration

```
┌──────────────────────────────────────────┐
│           Turn Orchestration Flow          │
├──────────────────────────────────────────┤
│                                            │
│  1. useGameLoop hook fires on turn change  │
│     └─ Check: is current player alive?     │
│        ├─ NO → advanceTurn(), loop         │
│        └─ YES ↓                            │
│                                            │
│  2. Check: isHumanTurn?                    │
│     ├─ YES → Wait for user tap             │
│     │  └─ useCardInteraction handles tap   │
│     │     └─ Dispatch playCard()           │
│     │                                      │
│     └─ NO (bot) → useBotTurn hook fires    │
│        └─ setTimeout(1500ms)               │
│           └─ decideBotPlay() engine fn     │
│              ├─ play → dispatch playCard() │
│              └─ pass → dispatch passTurn() │
│                                            │
│  3. After playCard() / passTurn():          │
│     ├─ Apply special effect (if any)       │
│     ├─ Enqueue card animation              │
│     ├─ Draw card (if played + deck has)    │
│     ├─ Lose life (if passed)               │
│     ├─ Check elimination (lives === 0)     │
│     ├─ Check win condition                 │
│     ├─ Check deadlock                      │
│     └─ advanceTurn()                       │
│                                            │
│  4. Loop back to step 1                    │
└──────────────────────────────────────────┘
```

---

## 9. 3D Scene Graph

### Camera Setup

```
Camera: PerspectiveCamera
  Position: [0, 8, 6]
  LookAt:   [0, 0, 0]
  FOV:      50
  Near:     0.1
  Far:      100
```

The camera is mounted at an elevated angle (bird's-eye tilt) looking down at the table, providing a clear view of the human's hand at the bottom and the middle pile in the center.

### Lighting Plan

| Light | Type | Position | Intensity | Purpose |
|---|---|---|---|---|
| Ambient | `ambientLight` | — | 0.4 | Base fill to prevent pitch-black shadows |
| Key | `directionalLight` | [5, 10, 5] | 0.8 | Main illumination from top-right |
| Fill | `directionalLight` | [-3, 5, -3] | 0.3 | Soften shadows from key light |
| Spot (pile) | `spotLight` | [0, 6, 0] | 0.5 | Highlight the middle pile area |

### Scene Hierarchy

```
<Canvas>
└── <GameScene>
    ├── <ambientLight />
    ├── <directionalLight /> (key)
    ├── <directionalLight /> (fill)
    ├── <spotLight /> (pile spotlight)
    │
    ├── <Table3D />                    — Rounded plane/box, green felt material
    │
    ├── <group name="player-slots">
    │   ├── <PlayerSlot3D index={0} /> — Bottom (Human): face-up cards
    │   │   ├── <CardHand>             — Fan of 3 cards
    │   │   │   ├── <Card3D faceUp />
    │   │   │   ├── <Card3D faceUp />
    │   │   │   └── <Card3D faceUp />
    │   │   └── <LifeTokens count={5} position="bottom-left" />
    │   │
    │   ├── <PlayerSlot3D index={1} /> — Left (Bot 2): face-down cards
    │   │   ├── <CardHand>
    │   │   │   └── <Card3D faceDown />×3
    │   │   └── <LifeTokens count={5} />
    │   │
    │   ├── <PlayerSlot3D index={2} /> — Top (Bot 3): face-down cards
    │   │   ├── <CardHand>
    │   │   │   └── <Card3D faceDown />×3
    │   │   └── <LifeTokens count={5} />
    │   │
    │   └── <PlayerSlot3D index={3} /> — Right (Bot 4): face-down cards
    │       ├── <CardHand>
    │       │   └── <Card3D faceDown />×3
    │       └── <LifeTokens count={5} />
    │
    ├── <MiddlePile3D />               — Center: stacked played cards + value
    │   ├── <Card3D /> ... (stacked with slight Y offset per card)
    │   └── <Text> (current value display)
    │
    ├── <DeckPile3D />                 — Visual representation of remaining deck
    │   └── <Card3D faceDown /> (stack thickness = deck count)
    │
    └── <group name="vfx-layer">
        ├── <BombVFX /> (conditional)
        ├── <NuclearVFX /> (conditional)
        ├── <RandomVFX /> (conditional)
        ├── <ReverseVFX /> (conditional)
        ├── <SkipVFX /> (conditional)
        └── <EliminationVFX /> (conditional)
</Canvas>
```

### Player Slot Positions (Portrait Orientation)

```
        ┌──────────────┐
        │   Bot 3       │  position: [ 0, 0, -3.5]
        │  (Top)        │  rotation: facing camera
        │               │
        │ Bot 2    Bot 4│  Bot2: [-3, 0, 0] Bot4: [3, 0, 0]
        │ (Left) (Right)│  rotated 90° to face center
        │               │
        │   Middle Pile │  position: [0, 0, 0]
        │   [cards]     │
        │               │
        │   You (Human) │  position: [0, 0, 3.5]
        │   [card][card]│  face-up, interactive
        └──────────────┘
```

### Card3D Geometry (Procedural)

```typescript
// Each card is composed of:
// 1. RoundedBox (0.7 × 1.0 × 0.02) — card body
//    Material: MeshStandardMaterial, color varies by card type
// 2. Front face (Text from drei) — value/symbol
// 3. Back face (Text) — generic card back pattern
// 4. Edge stripe (thin box) — color indicates card type (blue=number, red=special)
```

---

## 10. Component Hierarchy

### React DOM Tree

```
<App>
├── <TitleScreen />                    (shown when showTitleScreen === true)
│   ├── <h1> "Zinky Zoogle" </h1>
│   └── <FullscreenButton />
│
└── <GameContainer>                    (shown when showTitleScreen === false)
    ├── <Canvas>                       (R3F — occupies full viewport)
    │   └── <GameScene />
    │       └── (see Section 9: 3D Scene Graph)
    │
    └── <div className="absolute inset-0 pointer-events-none">
        │                              (HTML overlay layer)
        ├── <HUD>
        │   ├── <TurnIndicator />
        │   ├── <DeckCounter />
        │   ├── <DirectionIndicator />
        │   ├── <MiddlePileValue />
        │   └── <PlayerInfo /> × 4    (positioned via CSS per player slot)
        │
        ├── <SpectatorBanner />       (conditional: human eliminated)
        │
        └── <GameOverScreen />        (conditional: game finished)
            ├── <VictoryMessage /> | <DefeatMessage />
            └── <PlayAgainButton />
    </div>
```

### Key Component Responsibilities

| Component | Type | Responsibility |
|---|---|---|
| `App` | DOM | Root; toggles between TitleScreen and GameContainer |
| `TitleScreen` | DOM | Landing screen, fullscreen entry |
| `GameScene` | R3F | Root 3D scene; positions all 3D children |
| `Table3D` | R3F | Procedural table surface |
| `PlayerSlot3D` | R3F | Groups a player's hand + life tokens at a position |
| `CardHand` | R3F | Arranges cards in a fan/spread layout |
| `Card3D` | R3F | Single interactive card mesh; handles `onPointerDown` |
| `MiddlePile3D` | R3F | Renders stack of played cards with top value |
| `LifeTokens` | R3F | Row of heart/gem meshes representing lives |
| `CardAnimation` | R3F | Wraps a Card3D with `framer-motion-3d` `AnimatePresence` |
| `HUD` | DOM | Container for all HTML overlays |
| `TurnIndicator` | DOM | Shows current player name and action prompt |
| `GameOverScreen` | DOM | End-game modal with winner + Play Again |

---

## 11. API / Interface Design

Since the game is fully client-side with no backend, there are no REST/WebSocket APIs. The "interfaces" are the internal module boundaries:

### Game Engine Public API (`src/engine/index.ts`)

```typescript
// Deck operations
export { createDeck, shuffleDeck, drawCard, dealCards } from './deck';

// Card operations
export { isCardPlayable, hasPlayableCard, getCardDisplayValue } from './cards';

// Turn operations
export { getNextActivePlayerIndex, getAlivePlayerCount, advanceTurn } from './turn';

// Special card effects
export { applySpecialEffect } from './special-cards';

// Bot AI
export { decideBotPlay } from './bot-ai';

// Player operations
export { eliminatePlayer, canPlayerAct } from './player';

// Win condition
export { checkWinCondition, resolveDeadlock, isDeadlock } from './win-condition';

// Game orchestration
export { initGame, resetGame } from './game';
```

### Store Action Interface (dispatched by hooks/components)

```typescript
// Called by useCardInteraction when human taps a card
store.playCard(playerIndex: number, cardId: string): TurnResult

// Called by useBotTurn after delay
store.playCard(playerIndex: number, cardId: string): TurnResult
store.passTurn(playerIndex: number): TurnResult

// Called by useGameLoop after turn resolution
store.advanceTurn(): void
store.checkAndSetWinner(): void
store.resolveDeadlock(): void

// Called by TitleScreen / FullscreenButton
store.setFullscreen(value: boolean): void
store.setShowTitleScreen(value: boolean): void

// Called by GameOverScreen
store.resetGame(): void
```

### Hook Interface

```typescript
// src/hooks/useFullscreen.ts
export function useFullscreen(): {
  isFullscreen: boolean;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  isSupported: boolean;
}

// src/hooks/useBotTurn.ts
export function useBotTurn(): void
// Subscribes to currentPlayerIndex; if bot's turn, schedules decision

// src/hooks/useGameLoop.ts
export function useGameLoop(): void
// Orchestrates turn flow, checks win/deadlock after each action

// src/hooks/useCardInteraction.ts
export function useCardInteraction(): {
  handleCardTap: (cardId: string) => void;
  isPlayable: (cardId: string) => boolean;
}
```

---

## 12. UI Structure

### Screen Flow

```
┌─────────────────────────┐
│     TITLE SCREEN         │
│                          │
│   "ZINKY ZOOGLE"         │
│                          │
│   [▶ PLAY FULLSCREEN]    │
│                          │
└───────────┬──────────────┘
            │ tap
            ▼
┌─────────────────────────┐
│     GAME SCREEN           │
│                          │
│   [3D Canvas - full]     │
│                          │
│   ┌──────────────────┐   │
│   │  HUD Overlay      │   │
│   │  - Turn Indicator │   │
│   │  - Deck Count     │   │
│   │  - Direction      │   │
│   │  - Player Infos   │   │
│   └──────────────────┘   │
│                          │
│   (Player taps cards     │
│    on the 3D canvas)     │
└───────────┬──────────────┘
            │ game ends
            ▼
┌─────────────────────────┐
│    GAME OVER OVERLAY      │
│                          │
│   "🏆 You Win!"          │
│   or                     │
│   "💀 Bot 3 Wins"        │
│                          │
│   [PLAY AGAIN]           │
└──────────────────────────┘
```

### Touch Target Requirements

- All interactive 3D cards: minimum bounding box of **44×60px** on screen (mapped to 3D size ~0.7×1.0 units)
- HTML buttons: minimum **48×48px** with Tailwind `min-w-12 min-h-12`
- Card tap area: full card face, with `onPointerDown` (supports touch + mouse)

---

## 13. Authentication and Authorization

**Not applicable.** The game has no user accounts, no authentication, no authorization. All state is ephemeral and client-side only. (NG-002, NG-003)

---

## 14. Error Handling

### Strategy: Defensive State + Graceful UI Degradation

| Error Scenario | Handling |
|---|---|
| **Deck is empty, player must draw** | `drawCard()` returns `{ card: null }`; turn proceeds without drawing. UI shows empty deck counter at 0. (FR-023) |
| **Player has no valid cards** | `hasPlayableCard()` returns false; `passTurn()` deducts a life. Turn indicator shows "No playable cards! -1 life" |
| **All alive players stuck (deadlock)** | `isDeadlock()` check after each pass; `resolveDeadlock()` awards win to player with most lives |
| **WebGL context lost** | R3F `<Canvas>` provides `onCreated` hook; listen for `webglcontextlost` event, show "WebGL lost — please reload" message |
| **Fullscreen API failure** | `useFullscreen` catches promise rejections; game proceeds without fullscreen (FR-004) |
| **iOS Safari fullscreen limitation** | Fallback to CSS-based "fullscreen" (100vh/100vw, hide browser chrome via scroll) |
| **Touch event conflicts** | Canvas uses `touch-action: none`; prevent default on `pointerdown` to block browser gestures |
| **State corruption/unexpected** | Zustand `immer` middleware ensures no accidental mutation; store actions are the only mutation path |

### Error Boundary

A React `ErrorBoundary` wraps the `<Canvas>` component. If 3D rendering throws, the boundary shows a fallback message: "Something went wrong with 3D rendering. Please refresh the page."

---

## 15. Fullscreen API Integration

### Implementation (`src/hooks/useFullscreen.ts`)

```typescript
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      !!(document.fullscreenEnabled ||
         (document as any).webkitFullscreenEnabled)
    );

    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement as any;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
    } catch {
      // Fallback: proceed without fullscreen
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    } catch { /* noop */ }
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen, isSupported };
}
```

### iOS Safari Considerations

1. iOS Safari does **not** support the standard Fullscreen API on `<html>` — only on `<video>` elements.
2. **Fallback strategy:** On iOS, the fullscreen button triggers a CSS-based fullscreen experience:
   - `position: fixed; inset: 0; z-index: 9999` on the game container
   - `navigator.standalone` detection for "Add to Home Screen" support
   - Meta tags: `<meta name="apple-mobile-web-app-capable" content="yes">`
3. The game **always proceeds** after the button tap, regardless of fullscreen success (FR-004).

### Entry Flow

```
User taps "PLAY FULLSCREEN" button
  │
  ├─ Fullscreen API supported?
  │   ├─ YES → requestFullscreen() → on fullscreenchange → startGame()
  │   └─ NO  → CSS fullscreen fallback → startGame()
  │
  └─ startGame():
       1. setShowTitleScreen(false)
       2. initGame() — creates deck, deals cards, sets status to 'playing'
       3. R3F Canvas mounts, 3D scene renders
       4. First turn begins (Human player)
```

---

## 16. Testing Strategy

### Layer 1: Unit Tests (`vitest`)

**Target:** All `src/engine/` functions — 100% coverage of game logic.

| Module | Test Cases |
|---|---|
| `deck.ts` | Deck creation (53 cards), shuffle randomness, draw from empty deck, deal to 4 players |
| `cards.ts` | `isCardPlayable` for all combos: number ≥ lastValue, number < lastValue, special always playable, empty pile |
| `turn.ts` | Next active player with eliminations, direction changes, wrap-around |
| `special-cards.ts` | Each effect: Reverse flips direction, Skip advances ×2, Bomb resets value, Nuclear clears pile, Random generates 1–13 |
| `bot-ai.ts` | All 4 decision branches, edge cases (empty hand, all special cards) |
| `win-condition.ts` | Single alive player wins, deadlock resolution, tie-breaker rules |
| `player.ts` | Elimination on 0 lives, canPlayerAct checks |

### Layer 2: Integration Tests (`vitest` + `@testing-library/react`)

**Target:** Store actions + game engine integration.

| Scenario | Test |
|---|---|
| Full game simulation | Automated play-through: init → 100+ turns → game ends with winner |
| Special card chains | Play Reverse then Skip — verify turn order is correct |
| Dead deck + no plays | Simulate deck depletion → deadlock → correct winner by lives |
| Store reset | `resetGame()` produces clean initial state identical to `initGame()` |

### Layer 3: Component Tests (`@testing-library/react`)

**Target:** Critical UI components.

| Component | Test |
|---|---|
| `TitleScreen` | Renders title + button; button triggers fullscreen request |
| `GameOverScreen` | Shows winner name; Play Again button dispatches `resetGame` |
| `TurnIndicator` | Shows correct message for human turn vs bot turn |
| `HUD` | Renders all player info overlays |

### Layer 4: Visual/Manual Testing

| Area | Method |
|---|---|
| 3D rendering | Manual testing on real devices (iPhone SE, Samsung Galaxy A50) |
| Animation timing | Chrome DevTools Performance tab, 60fps timeline |
| Touch interaction | Real device touch testing (no emulators for touch) |
| Fullscreen | Test on Chrome Android, Safari iOS, Firefox Android |

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

---

## 17. Security Considerations

Since the game is fully client-side with no backend, traditional security concerns (SQL injection, XSS via user input, CSRF) do not apply. However:

| Concern | Mitigation |
|---|---|
| **No user input injection** | No forms, no user-typed data rendered. All display text is hardcoded or derived from game state. |
| **No external network calls** | Zero fetch/XHR calls. No data leaves the browser. |
| **No third-party runtime scripts** | All code is bundled at build time. No CDN-loaded scripts. |
| **Fullscreen API abuse prevention** | Fullscreen is requested only on explicit user gesture (button tap), as required by browser security policies. |
| **Content Security Policy (optional)** | Can be configured with strict CSP headers since no external resources are needed. |

---

## 18. Performance Considerations

### Performance Budget

| Metric | Target | Enforcement |
|---|---|---|
| **FPS** | ≥30 FPS on mid-range mobile | Scene complexity limits, `frameloop="demand"` where possible |
| **Initial Load** | ≤5 seconds to interactive | Vite code splitting, no external assets |
| **Bundle Size** | <500KB gzipped (JS) | Tree-shaking, no heavy dependencies |
| **Memory** | ≤150MB | Geometry disposal, no texture files |
| **Touch Response** | ≤200ms tap to animation | Direct state reads, no async validation |

### Mobile Optimization Strategies

#### 3D Rendering

```typescript
// Canvas configuration
<Canvas
  dpr={[1, 1.5]}           // Cap device pixel ratio (don't render at 3x on iOS)
  gl={{
    antialias: false,       // Disable AA on mobile (significant perf cost)
    powerPreference: 'high-performance',
    alpha: false,           // Opaque background
  }}
  camera={{ fov: 50, near: 0.1, far: 100 }}
  frameloop="always"        // Needed for animations; switch to "demand" when idle
>
```

#### Geometry Limits

| Object | Triangle Count | Notes |
|---|---|---|
| Card (RoundedBox) | ~120 tris | `RoundedBox` segments: 2 |
| Table | ~200 tris | Simple plane with rounded edges |
| Life Token | ~60 tris (×20 max) | Low-poly heart/sphere |
| **Total scene max** | **~5,000 tris** | Well within mobile WebGL budget |

#### Memory Management

- **Card meshes**: Reuse shared `BufferGeometry` and `Material` instances across all cards via `useMemo` at the scene level.
- **VFX particles**: Use `Points` geometry (not individual meshes) for particle effects. Dispose on VFX end.
- **Animation cleanup**: `framer-motion-3d` handles animation disposal; no manual cleanup needed.

#### Render Optimization

- **Conditional rendering**: VFX components only mount when `activeVFX` is set (not always in scene).
- **`React.memo`**: Wrap `Card3D`, `PlayerSlot3D`, `LifeTokens` to prevent unnecessary re-renders on unrelated state changes.
- **Zustand selectors**: Components subscribe to only the state slice they need (not the whole store).
- **`useFrame` throttle**: Animation frame callbacks use `delta`-based timing, not per-frame logic.

#### Vite Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'app-vendor': ['react', 'react-dom', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
```

---

## 19. Deployment Notes

### Build Pipeline

```
npm run build
  ├── vite build
  │   ├── TypeScript compilation
  │   ├── ES module bundling with code splitting
  │   ├── CSS optimization (Tailwind purge)
  │   ├── Asset inlining (none — all procedural)
  │   └── Output: dist/
  │       ├── index.html
  │       ├── assets/
  │       │   ├── index-[hash].js      (~200KB)
  │       │   ├── three-vendor-[hash].js (~150KB)
  │       │   ├── app-vendor-[hash].js  (~50KB)
  │       │   └── index-[hash].css      (~5KB)
  │       └── favicon.svg
  └── Ready to deploy to any static host
```

### Hosting Options

| Option | Notes |
|---|---|
| **Vercel** | Zero-config deploy from Git, automatic HTTPS, edge CDN |
| **Netlify** | Similar to Vercel, generous free tier |
| **GitHub Pages** | Free, requires `base` config in Vite |
| **Laragon (local dev)** | Already configured in workspace |

### HTML Meta Tags (index.html)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#1a1a2e">
<title>Zinky Zoogle</title>
```

### Environment Variables

None required. The game is fully static with no environment-specific configuration.

---

## 20. Risks and Trade-Offs

### Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **R3F performance on low-end Android** | Some devices may drop below 30 FPS | Cap DPR at 1.0, disable AA, reduce geometry segments, test early on real devices |
| **iOS Safari Fullscreen API absence** | iOS users don't get true fullscreen | CSS fallback + Apple meta tags; game is fully playable without fullscreen |
| **Touch event conflicts with browser gestures** | Pinch-zoom or pull-to-refresh interrupts gameplay | `touch-action: none` on canvas, `overscroll-behavior: none` on body |
| **Special card chain complexity** | Edge cases in Skip + Reverse combinations | Comprehensive unit tests for all 32+ combinations of chained effects |
| **framer-motion-3d bundle size** | Adds ~80KB to bundle | Evaluate if custom `useFrame` animations can replace it if bundle budget is exceeded |

### Trade-Offs

| Decision | Trade-Off | Rationale |
|---|---|---|
| **No external 3D assets** | Less visual polish vs. zero load time | PRD requirement (NFR-010); instant startup is more important for casual mobile users |
| **Zustand over Redux** | Less dev tooling vs. much simpler codebase | Game state is small (~200 properties); Redux would be over-engineering |
| **Single Zustand store** | Larger single hook vs. simpler mental model | 3 slices keep it organized; avoids cross-store synchronization issues |
| **framer-motion-3d for animations** | Larger bundle vs. declarative, maintainable animations | Development speed matters for MVP; can be replaced with manual `useFrame` later |
| **No sound in MVP** | Less immersive vs. simpler scope | PRD non-goal (NG-007); sound adds a significant asset pipeline |
| **Immer middleware** | ~6KB added bundle vs. much cleaner state updates | Card hand arrays and nested player objects are painful to update immutably without Immer |
| **Portrait-only** | Misses landscape users vs. focused mobile UX | 85%+ mobile usage is portrait; simplifies 3D layout and UI positioning |

---

## 21. Open Questions

| # | Question | Impact | Proposed Resolution | Owner |
|---|---|---|---|---|
| 1 | Should Random card value include special card effects? (e.g., what if random rolls a value that matches the current lastValue?) | Low | Random simply sets `lastValue` to a number 1–13. The number acts as a regular pile value. | Architect |
| 2 | When Nuclear clears the middle pile, should the cleared cards go back into the deck or to a discard pile? | Medium | Nuclear clears cards to a `discardPile` that is NOT reshuffled (per FR-043, "clears all cards"). Deck depletion accelerates as intended. | Product Owner |
| 3 | Should the game animate card drawing from the deck to the hand, or just instantly add the card? | Low | Animate for immersion — card flies from deck pile to hand position (~300ms). | Architect |
| 4 | Do we need a `discardPile` in the data model, or just track it for visual purposes? | Low | Keep it in state for potential future "reshuffle discard into deck" features, but MVP doesn't use it for drawing. | Architect |
| 5 | What happens if fullscreen is already active when the game loads (e.g., user refreshes in fullscreen)? | Low | Check `document.fullscreenElement` on mount; if already fullscreen, skip title screen and show "New Game" button. | Developer |
| 6 | Should bot players' names be customizable or randomized? | Very Low | Hardcoded "Bot 2", "Bot 3", "Bot 4" for MVP. Random names are a post-MVP feature. | Product Owner |

---

## Appendix A: Zustand Store — Complete Initial State

```typescript
const initialState: GameSlice & UISlice & AnimationSlice = {
  // Game Slice
  players: [],
  currentPlayerIndex: 0,
  direction: Direction.Clockwise,
  deck: [],
  middlePile: [],
  lastValue: null,
  gameStatus: GameStatus.Waiting,
  winner: null,

  // UI Slice
  isFullscreen: false,
  showTitleScreen: true,
  turnMessage: '',
  showGameOver: false,
  showMessage: null,
  messageQueue: [],

  // Animation Slice
  isAnimating: false,
  animationQueue: [],
  activeVFX: null,
  vfxPosition: null,
};
```

## Appendix B: Complete Turn Resolution Pseudocode

```
function resolveTurn(store):
  currentPlayer = store.players[store.currentPlayerIndex]
  
  // Step 1: Skip if not alive
  if currentPlayer.status != Alive:
    store.advanceTurn()
    return
  
  // Step 2: Determine action (human waits, bot decides)
  if currentPlayer.type == Human:
    // Human turn — handled by useCardInteraction hook
    return
  
  // Bot turn
  decision = decideBotPlay(currentPlayer.hand, store.lastValue)
  
  // Step 3: Execute action
  if decision.action == 'play':
    result = store.playCard(store.currentPlayerIndex, decision.cardId)
    
    // 3a: Apply special effect
    if result.specialEffectApplied:
      effectResult = applySpecialEffect(result.specialEffectApplied, state)
      store.updateDirection / store.updateLastValue / etc.
      store.enqueueVFX(result.specialEffectApplied)
    
    // 3b: Draw replacement card
    store.drawCard(store.currentPlayerIndex)
    
  else: // pass
    result = store.passTurn(store.currentPlayerIndex)
    // result.livesLost = 1
    if currentPlayer.lives - 1 <= 0:
      store.eliminatePlayer(store.currentPlayerIndex)
      store.enqueueAnimation({ type: 'elimination', playerIndex })
  
  // Step 4: Handle skip effect
  if skipNext:
    store.advanceTurn() // skip one extra
  
  // Step 5: Check win condition
  winner = checkWinCondition(store.players)
  if winner:
    store.winner = winner
    store.gameStatus = 'finished'
    return
  
  // Step 6: Check deadlock
  if isDeadlock(store):
    winner = resolveDeadlock(store.players)
    store.winner = winner
    store.gameStatus = 'finished'
    return
  
  // Step 7: Advance to next player
  store.advanceTurn()
```

---

*End of Architecture Document*
