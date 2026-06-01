// src/test/integration/special-card-chains.test.ts
// STORY-021: Special card chain integration tests
//
// Tests verify that chaining special cards produces correct game state:
// 1. Reverse → Skip → Reverse chain: turn order is correct
// 2. Bomb → Random: pile resets then gets new value
// 3. Nuclear → number card: pile cleared, any card playable
// 4. Multiple Skips in sequence: correct players are skipped
//
// These tests set up explicit game states and verify the store's
// playCard + advanceTurn orchestration matches the expected behavior.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../store';
import {
  SpecialEffect,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
} from '../../types';
import type { Player } from '../../types';
import { createMockPlayer, createNumberCard, createSpecialCard } from '../helpers';

// ── Helpers ─────────────────────────────────────────────────────────────────

let cardCounter = 0;
function nextId(prefix = 'c'): string {
  return `${prefix}-${++cardCounter}`;
}

function makePlayers(): Player[] {
  return [
    createMockPlayer({ id: 1, name: 'You', type: PlayerType.Human }),
    createMockPlayer({ id: 2, name: 'Bot 2', type: PlayerType.Bot }),
    createMockPlayer({ id: 3, name: 'Bot 3', type: PlayerType.Bot }),
    createMockPlayer({ id: 4, name: 'Bot 4', type: PlayerType.Bot }),
  ];
}

function resetStore() {
  cardCounter = 0;
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Playing,
    winner: null,
    isFullscreen: false,
    showTitleScreen: false,
    turnMessage: '',
    showGameOver: false,
    showMessage: '',
    messageQueue: [],
    isAnimating: false,
    animationQueue: [],
    activeVFX: null,
    vfxPosition: null,
  });
}

beforeEach(() => {
  resetStore();
});

afterEach(() => {
  resetStore();
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Special Card: Reverse → Skip → Reverse chain', () => {
  it('Reverse flips direction, Skip skips next in new direction, Reverse flips back', () => {
    // Setup: 4 alive players, clockwise
    // Give player 0 a Reverse card, player 3 a Skip card, player 1 a Reverse card
    const reverseA = createSpecialCard(SpecialEffect.Reverse, nextId());
    const skipA = createSpecialCard(SpecialEffect.Skip, nextId());
    const reverseB = createSpecialCard(SpecialEffect.Reverse, nextId());
    // Filler cards so hands aren't empty
    const filler1 = createNumberCard(1, nextId());
    const filler2 = createNumberCard(2, nextId());
    const filler3 = createNumberCard(3, nextId());

    const players = makePlayers();
    players[0].hand = [reverseA, filler1, filler2]; // Player 0 has Reverse
    players[1].hand = [filler1, filler2, filler3];   // Player 1 — will be skipped
    players[2].hand = [filler1, filler2, filler3];   // Player 2
    players[3].hand = [skipA, filler1, filler2];     // Player 3 has Skip
    // We need more cards for player 1 after skip — give Reverse to player 1
    players[1].hand = [reverseB, filler3, filler1];  // Player 1 has Reverse

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      middlePile: [],
      lastValue: null,
      deck: [createNumberCard(5, nextId()), createNumberCard(6, nextId()), createNumberCard(7, nextId())],
      gameStatus: GameStatus.Playing,
    });

    // ── Step 1: Player 0 plays Reverse ──
    useGameStore.getState().playCard(0, reverseA.id);
    useGameStore.getState().drawCard(0);
    useGameStore.getState().checkAndSetWinner();
    useGameStore.getState().resolveDeadlock();

    // Direction should be CCW
    let state = useGameStore.getState();
    expect(state.direction).toBe(Direction.CounterClockwise);

    // Advance turn: from 0 CCW → next alive = 3
    useGameStore.getState().advanceTurn();
    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(3);

    // ── Step 2: Player 3 plays Skip ──
    useGameStore.getState().playCard(3, skipA.id);
    useGameStore.getState().drawCard(3);
    useGameStore.getState().checkAndSetWinner();
    useGameStore.getState().resolveDeadlock();

    state = useGameStore.getState();
    // Direction still CCW
    expect(state.direction).toBe(Direction.CounterClockwise);
    // Skip sets currentPlayerIndex to the skip target: next alive from 3 in CCW = 2
    expect(state.currentPlayerIndex).toBe(2);

    // Advance turn: from 2 CCW → 1 (player 2 is NOT skipped; player 2 was the skip target)
    // Wait — actually Skip sets the index to the skip target (2), then advanceTurn moves to 1.
    // So player 2 IS the one that's "current" momentarily, then advanceTurn skips to 1.
    // This means player 2 was NOT the skipped player — player 2 is the target we land on, then we advance.
    // 
    // The "skipped" player in the architecture is the one BETWEEN the current and the target.
    // Let me re-trace: After Skip from player 3 (CCW), skipTarget = next alive from 3 CCW = 2.
    // currentPlayerIndex = 2. Then advanceTurn from 2 CCW = 1.
    // So between 3 and 1, player 2 was the "skip target" — the player at index 2 is skipped.
    useGameStore.getState().advanceTurn();
    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(1); // Player 2 was skipped, we're now at player 1

    // ── Step 3: Player 1 plays Reverse ──
    useGameStore.getState().playCard(1, reverseB.id);
    useGameStore.getState().drawCard(1);
    useGameStore.getState().checkAndSetWinner();
    useGameStore.getState().resolveDeadlock();

    state = useGameStore.getState();
    // Direction should flip back to Clockwise
    expect(state.direction).toBe(Direction.Clockwise);

    // Advance turn: from 1 CW → 2
    useGameStore.getState().advanceTurn();
    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(2);
  });
});

describe('Special Card: Bomb → Random chain', () => {
  it('Bomb resets pile value to null, then Random sets a new value (1-13)', () => {
    // Set up pile with value 10
    const pileCard = createNumberCard(10, nextId());
    const bombCard = createSpecialCard(SpecialEffect.Bomb, nextId());
    const randomCard = createSpecialCard(SpecialEffect.Random, nextId());
    const filler = createNumberCard(1, nextId());

    const players = makePlayers();
    players[0].hand = [bombCard, filler, filler];
    players[1].hand = [randomCard, filler, filler];
    players[2].hand = [filler, filler, filler];
    players[3].hand = [filler, filler, filler];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      middlePile: [pileCard],
      lastValue: 10,
      deck: [createNumberCard(5, nextId()), createNumberCard(6, nextId())],
      gameStatus: GameStatus.Playing,
    });

    // ── Step 1: Player 0 plays Bomb → resets lastValue to null ──
    useGameStore.getState().playCard(0, bombCard.id);
    useGameStore.getState().drawCard(0);

    let state = useGameStore.getState();
    expect(state.lastValue).toBeNull();
    expect(state.direction).toBe(Direction.Clockwise);

    // Advance to player 1
    useGameStore.getState().advanceTurn();
    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(1);

    // ── Step 2: Player 1 plays Random → sets lastValue to random(1-13) ──
    // Mock Math.random to return a predictable value
    const originalRandom = Math.random;
    Math.random = () => 0.5; // randomInt(1,13) => floor(0.5 * 13) + 1 = 7
    useGameStore.getState().playCard(1, randomCard.id);
    Math.random = originalRandom;

    state = useGameStore.getState();
    expect(state.lastValue).toBe(7);
    expect(state.lastValue).toBeGreaterThanOrEqual(1);
    expect(state.lastValue).toBeLessThanOrEqual(13);
  });

  it('Bomb resets pile without clearing middlePile cards', () => {
    const pileCard1 = createNumberCard(5, nextId());
    const pileCard2 = createNumberCard(8, nextId());
    const bombCard = createSpecialCard(SpecialEffect.Bomb, nextId());
    const filler = createNumberCard(1, nextId());

    const players = makePlayers();
    players[0].hand = [bombCard, filler, filler];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      middlePile: [pileCard1, pileCard2],
      lastValue: 8,
      deck: [createNumberCard(3, nextId())],
      gameStatus: GameStatus.Playing,
    });

    useGameStore.getState().playCard(0, bombCard.id);

    const state = useGameStore.getState();
    // Bomb: lastValue → null, but cards stay in pile (bomb card is added)
    expect(state.lastValue).toBeNull();
    expect(state.middlePile.length).toBe(3); // 2 original + bomb card
  });
});

describe('Special Card: Nuclear → number card chain', () => {
  it('Nuclear clears entire pile and resets value, next player can play any card', () => {
    const pileCard1 = createNumberCard(5, nextId());
    const pileCard2 = createNumberCard(10, nextId());
    const nuclearCard = createSpecialCard(SpecialEffect.Nuclear, nextId());
    const smallCard = createNumberCard(1, nextId()); // Even a 1 is playable after nuclear
    const filler = createNumberCard(2, nextId());

    const players = makePlayers();
    players[0].hand = [nuclearCard, filler, filler];
    players[1].hand = [smallCard, filler, filler];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      middlePile: [pileCard1, pileCard2],
      lastValue: 10,
      deck: [createNumberCard(4, nextId()), createNumberCard(5, nextId())],
      gameStatus: GameStatus.Playing,
    });

    // ── Step 1: Player 0 plays Nuclear → clears entire pile ──
    useGameStore.getState().playCard(0, nuclearCard.id);
    useGameStore.getState().drawCard(0);

    let state = useGameStore.getState();
    expect(state.lastValue).toBeNull();
    expect(state.middlePile).toHaveLength(0); // Nuclear clears entirely

    // Advance to player 1
    useGameStore.getState().advanceTurn();

    // ── Step 2: Player 1 plays a card with value 1 (playable since pile is empty) ──
    useGameStore.getState().playCard(1, smallCard.id);

    state = useGameStore.getState();
    expect(state.lastValue).toBe(1);
    expect(state.middlePile).toHaveLength(1);
    expect(state.middlePile[0].value).toBe(1);
  });
});

describe('Special Card: Multiple Skips in sequence', () => {
  it('two consecutive Skips skip the correct players (clockwise)', () => {
    const skip1 = createSpecialCard(SpecialEffect.Skip, nextId());
    const skip2 = createSpecialCard(SpecialEffect.Skip, nextId());
    const filler = createNumberCard(3, nextId());

    const players = makePlayers();
    players[0].hand = [skip1, filler, filler];
    players[1].hand = [filler, filler, filler]; // Will be skipped
    players[2].hand = [skip2, filler, filler];
    players[3].hand = [filler, filler, filler]; // Will be skipped

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      middlePile: [],
      lastValue: null,
      deck: [
        createNumberCard(5, nextId()),
        createNumberCard(6, nextId()),
        createNumberCard(7, nextId()),
        createNumberCard(8, nextId()),
      ],
      gameStatus: GameStatus.Playing,
    });

    // ── Player 0 plays Skip ──
    // skipTarget = nextAlive from 0 CW = 1 → currentPlayerIndex = 1
    useGameStore.getState().playCard(0, skip1.id);
    useGameStore.getState().drawCard(0);
    useGameStore.getState().checkAndSetWinner();

    let state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(1); // Skip target

    // Advance: from 1 CW → 2 (player 1 skipped)
    useGameStore.getState().advanceTurn();
    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(2);

    // ── Player 2 plays Skip ──
    // skipTarget = nextAlive from 2 CW = 3 → currentPlayerIndex = 3
    useGameStore.getState().playCard(2, skip2.id);
    useGameStore.getState().drawCard(2);
    useGameStore.getState().checkAndSetWinner();

    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(3); // Skip target

    // Advance: from 3 CW → 0 (player 3 skipped)
    useGameStore.getState().advanceTurn();
    state = useGameStore.getState();
    expect(state.currentPlayerIndex).toBe(0);

    // Verify: players 1 and 3 were skipped, we're back to player 0
    expect(state.currentPlayerIndex).toBe(0);
  });

  it('three Skips in sequence skip three consecutive players (clockwise)', () => {
    const skip1 = createSpecialCard(SpecialEffect.Skip, 'skip-a');
    const skip2 = createSpecialCard(SpecialEffect.Skip, 'skip-b');
    const skip3 = createSpecialCard(SpecialEffect.Skip, 'skip-c');
    const filler = createNumberCard(2, 'filler');

    const players = makePlayers();
    // Player 0 plays Skip (skip-a) then later Skip (skip-c)
    players[0].hand = [skip1, skip3, filler];
    players[1].hand = [filler, filler, filler];
    players[2].hand = [skip2, filler, filler];
    players[3].hand = [filler, filler, filler];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      middlePile: [],
      lastValue: null,
      deck: Array.from({ length: 10 }, (_, i) => createNumberCard(i + 1, `deck-${i}`)),
      gameStatus: GameStatus.Playing,
    });

    // Turn 1: Player 0 plays Skip-a → skipTarget = 1, advance → 2 (player 1 skipped)
    useGameStore.getState().playCard(0, skip1.id);
    useGameStore.getState().drawCard(0);
    useGameStore.getState().advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(2);

    // Turn 2: Player 2 plays Skip-b → skipTarget = 3, advance → 0 (player 3 skipped)
    useGameStore.getState().playCard(2, skip2.id);
    useGameStore.getState().drawCard(2);
    useGameStore.getState().advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);

    // Turn 3: Player 0 plays Skip-c → skipTarget = 1, advance → 2 (player 1 skipped AGAIN)
    useGameStore.getState().playCard(0, skip3.id);
    useGameStore.getState().drawCard(0);
    useGameStore.getState().advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(2);
  });
});

describe('Special Card: Skip with eliminated players', () => {
  it('Skip correctly navigates around eliminated players', () => {
    const skip = createSpecialCard(SpecialEffect.Skip, 'skip-elim');
    const filler = createNumberCard(5, 'filler-elim');

    const players = makePlayers();
    players[0].hand = [skip, filler, filler];
    players[1].hand = []; // No cards to play
    players[1].status = PlayerStatus.Eliminated;
    players[1].lives = 0;
    players[2].hand = [filler, filler, filler];
    players[3].hand = [filler, filler, filler];

    useGameStore.setState({
      players,
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      middlePile: [],
      lastValue: null,
      deck: [createNumberCard(1, 'dk1'), createNumberCard(2, 'dk2')],
      gameStatus: GameStatus.Playing,
    });

    // Player 0 plays Skip → skipTarget = nextAlive from 0 CW = 2 (skips 1, already dead)
    useGameStore.getState().playCard(0, skip.id);
    useGameStore.getState().drawCard(0);

    const state = useGameStore.getState();
    // Since player 1 is eliminated, nextAlive from 0 CW = 2
    // Skip target = 2, so currentPlayerIndex = 2
    expect(state.currentPlayerIndex).toBe(2);

    // Advance from 2 CW → 3
    useGameStore.getState().advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(3);
  });
});
