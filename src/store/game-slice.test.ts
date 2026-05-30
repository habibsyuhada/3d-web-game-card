// src/store/game-slice.test.ts — Tests for the Zustand GameSlice actions
// Tests all core game actions: initGame, resetGame, playCard, passTurn,
// drawCard, advanceTurn, checkAndSetWinner, resolveDeadlock, eliminatePlayer.

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './index';
import {
  CardType,
  SpecialEffect,
  PlayerType,
  PlayerStatus,
  GameStatus,
  Direction,
  INITIAL_LIVES,
} from '../types';
import type { Card, Player } from '../types';

/**
 * Helper: create a deterministic number card for testing.
 */
function numberCard(id: string, value: number): Card {
  return { id, type: CardType.Number, value, effect: null };
}

/**
 * Helper: create a deterministic special card for testing.
 */
function specialCard(id: string, effect: SpecialEffect): Card {
  return { id, type: CardType.Special, value: null, effect };
}

/**
 * Helper: create a set of 4 test players with known hands.
 */
function createTestPlayers(): Player[] {
  return [
    {
      id: 1,
      name: 'You',
      type: PlayerType.Human,
      hand: [numberCard('c1', 5), numberCard('c2', 8), numberCard('c3', 12)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 2,
      name: 'Bot 2',
      type: PlayerType.Bot,
      hand: [numberCard('c4', 3), numberCard('c5', 10), numberCard('c6', 1)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 3,
      name: 'Bot 3',
      type: PlayerType.Bot,
      hand: [numberCard('c7', 6), numberCard('c8', 9), numberCard('c9', 11)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
    {
      id: 4,
      name: 'Bot 4',
      type: PlayerType.Bot,
      hand: [numberCard('c10', 2), numberCard('c11', 7), numberCard('c12', 13)],
      lives: INITIAL_LIVES,
      status: PlayerStatus.Alive,
    },
  ];
}

/**
 * Helper: build a fresh deck of 20 test cards for drawCard tests.
 */
function createTestDeck(count: number = 20): Card[] {
  return Array.from({ length: count }, (_, i) =>
    numberCard(`deck-${i}`, (i % 13) + 1),
  );
}

/** Reset the store before each test */
beforeEach(() => {
  useGameStore.setState({
    players: [],
    currentPlayerIndex: 0,
    direction: Direction.Clockwise,
    deck: [],
    middlePile: [],
    lastValue: null,
    gameStatus: GameStatus.Waiting,
    winner: null,
    isFullscreen: false,
    showTitleScreen: true,
    turnMessage: '',
    showGameOver: false,
    showMessage: '',
    messageQueue: [],
    isAnimating: false,
    animationQueue: [],
    activeVFX: null,
    vfxPosition: null,
  });
});

describe('GameSlice — initGame()', () => {
  it('populates correct initial state with 4 players, 3 cards each, 5 lives', () => {
    useGameStore.getState().initGame();
    const state = useGameStore.getState();

    expect(state.players).toHaveLength(4);
    state.players.forEach((player) => {
      expect(player.hand).toHaveLength(3);
      expect(player.lives).toBe(INITIAL_LIVES);
      expect(player.status).toBe(PlayerStatus.Alive);
    });

    expect(state.currentPlayerIndex).toBe(0);
    expect(state.direction).toBe(Direction.Clockwise);
    expect(state.lastValue).toBeNull();
    expect(state.middlePile).toHaveLength(0);
    expect(state.gameStatus).toBe(GameStatus.Playing);
    expect(state.winner).toBeNull();

    // 53 total - 12 dealt = 41 remaining
    expect(state.deck.length).toBe(53 - 12);
  });

  it('assigns Player 1 as Human and Players 2-4 as Bots', () => {
    useGameStore.getState().initGame();
    const { players } = useGameStore.getState();

    expect(players[0].type).toBe('human');
    expect(players[0].name).toBe('You');
    expect(players[1].type).toBe('bot');
    expect(players[2].type).toBe('bot');
    expect(players[3].type).toBe('bot');
  });
});

describe('GameSlice — playCard()', () => {
  beforeEach(() => {
    useGameStore.setState({
      players: createTestPlayers(),
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: createTestDeck(),
      middlePile: [],
      lastValue: null,
      gameStatus: GameStatus.Playing,
      winner: null,
    });
  });

  it('removes card from hand, adds to middlePile, and updates lastValue (number card)', () => {
    const store = useGameStore.getState();
    store.playCard(0, 'c1'); // Play card with value 5

    const state = useGameStore.getState();
    expect(state.players[0].hand).toHaveLength(2);
    expect(state.players[0].hand.find((c) => c.id === 'c1')).toBeUndefined();
    expect(state.middlePile).toHaveLength(1);
    expect(state.middlePile[0].id).toBe('c1');
    expect(state.lastValue).toBe(5);
  });

  it('works for bot players: removes card from hand, adds to middlePile', () => {
    const store = useGameStore.getState();

    // First play to set a lastValue
    store.playCard(0, 'c2'); // value 8
    expect(useGameStore.getState().lastValue).toBe(8);

    // Bot plays a card >= 8
    store.playCard(2, 'c8'); // value 9 (Bot 3)
    const state = useGameStore.getState();
    expect(state.players[2].hand).toHaveLength(2);
    expect(state.middlePile).toHaveLength(2);
    expect(state.lastValue).toBe(9);
  });

  it('rejects playing a card that is not in the player hand', () => {
    const store = useGameStore.getState();
    store.playCard(0, 'nonexistent-card');

    const state = useGameStore.getState();
    expect(state.players[0].hand).toHaveLength(3);
    expect(state.middlePile).toHaveLength(0);
    expect(state.lastValue).toBeNull();
  });

  it('rejects playing a card that is not playable (value < lastValue)', () => {
    useGameStore.setState({ lastValue: 10 });

    const store = useGameStore.getState();
    // Card c1 has value 5, which is < lastValue 10
    store.playCard(0, 'c1');

    const state = useGameStore.getState();
    expect(state.players[0].hand).toHaveLength(3); // unchanged
    expect(state.middlePile).toHaveLength(0);
    expect(state.lastValue).toBe(10); // unchanged
  });

  it('Reverse: flips direction, keeps lastValue unchanged', () => {
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          type: PlayerType.Human,
          hand: [specialCard('sp1', SpecialEffect.Reverse), numberCard('c2', 8), numberCard('c3', 12)],
          lives: INITIAL_LIVES,
          status: PlayerStatus.Alive,
        },
        ...createTestPlayers().slice(1),
      ],
      lastValue: 7,
      direction: Direction.Clockwise,
    });

    const store = useGameStore.getState();
    store.playCard(0, 'sp1');

    const state = useGameStore.getState();
    expect(state.direction).toBe(Direction.CounterClockwise);
    expect(state.lastValue).toBe(7); // unchanged
    expect(state.middlePile).toHaveLength(1);
  });

  it('Skip: advances currentPlayerIndex to skip the next player', () => {
    // Setup: Player 0 plays Skip, current direction is Clockwise
    // Normal next after 0 is 1. Skip should advance to 1 (skip target).
    // After advanceTurn, it would go to 2.
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          type: PlayerType.Human,
          hand: [specialCard('sp2', SpecialEffect.Skip), numberCard('c2', 8), numberCard('c3', 12)],
          lives: INITIAL_LIVES,
          status: PlayerStatus.Alive,
        },
        ...createTestPlayers().slice(1),
      ],
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
    });

    const store = useGameStore.getState();
    store.playCard(0, 'sp2');

    const state = useGameStore.getState();
    // Skip pre-advances to the next alive player (index 1)
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('Bomb: lastValue becomes null', () => {
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          type: PlayerType.Human,
          hand: [specialCard('sp3', SpecialEffect.Bomb), numberCard('c2', 8), numberCard('c3', 12)],
          lives: INITIAL_LIVES,
          status: PlayerStatus.Alive,
        },
        ...createTestPlayers().slice(1),
      ],
      lastValue: 10,
    });

    const store = useGameStore.getState();
    store.playCard(0, 'sp3');

    const state = useGameStore.getState();
    expect(state.lastValue).toBeNull();
    expect(state.middlePile).toHaveLength(1);
    expect(state.middlePile[0].effect).toBe(SpecialEffect.Bomb);
  });

  it('Nuclear: lastValue becomes null AND middlePile is cleared', () => {
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          type: PlayerType.Human,
          hand: [specialCard('sp4', SpecialEffect.Nuclear), numberCard('c2', 8), numberCard('c3', 12)],
          lives: INITIAL_LIVES,
          status: PlayerStatus.Alive,
        },
        ...createTestPlayers().slice(1),
      ],
      lastValue: 10,
      middlePile: [numberCard('prev1', 5), numberCard('prev2', 8)],
    });

    const store = useGameStore.getState();
    store.playCard(0, 'sp4');

    const state = useGameStore.getState();
    expect(state.lastValue).toBeNull();
    expect(state.middlePile).toHaveLength(0); // Entire pile cleared
  });

  it('Random: lastValue is set to a new random value between 1 and 13', () => {
    useGameStore.setState({
      players: [
        {
          id: 1,
          name: 'You',
          type: PlayerType.Human,
          hand: [specialCard('sp5', SpecialEffect.Random), numberCard('c2', 8), numberCard('c3', 12)],
          lives: INITIAL_LIVES,
          status: PlayerStatus.Alive,
        },
        ...createTestPlayers().slice(1),
      ],
      lastValue: 5,
    });

    const store = useGameStore.getState();
    store.playCard(0, 'sp5');

    const state = useGameStore.getState();
    expect(state.lastValue).toBeGreaterThanOrEqual(1);
    expect(state.lastValue).toBeLessThanOrEqual(13);
    expect(state.middlePile).toHaveLength(1);
  });

  it('playCard then drawCard: player hand returns to 3 cards', () => {
    const store = useGameStore.getState();

    // Player 0 plays a card (hand goes from 3 to 2)
    store.playCard(0, 'c1');
    expect(useGameStore.getState().players[0].hand).toHaveLength(2);

    // Draw a card (hand goes from 2 to 3)
    store.drawCard(0);
    expect(useGameStore.getState().players[0].hand).toHaveLength(3);
  });

  it('rejects play from eliminated player', () => {
    useGameStore.setState((state) => {
      state.players[0].status = PlayerStatus.Eliminated;
    });

    const store = useGameStore.getState();
    store.playCard(0, 'c1');

    const state = useGameStore.getState();
    // Card not played — hand unchanged (minus nothing, it's 3 cards still if status matters)
    // The player status was changed but hand was unchanged
    expect(state.players[0].hand).toHaveLength(3);
    expect(state.middlePile).toHaveLength(0);
  });
});

describe('GameSlice — passTurn()', () => {
  beforeEach(() => {
    useGameStore.setState({
      players: createTestPlayers(),
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: createTestDeck(),
      middlePile: [],
      lastValue: null,
      gameStatus: GameStatus.Playing,
      winner: null,
    });
  });

  it('decreases player lives by 1', () => {
    const store = useGameStore.getState();
    store.passTurn(0);

    const state = useGameStore.getState();
    expect(state.players[0].lives).toBe(INITIAL_LIVES - 1);
    expect(state.players[0].status).toBe(PlayerStatus.Alive);
  });

  it('eliminates player when lives reach 0 (starting with 1 life)', () => {
    useGameStore.setState((state) => {
      state.players[0].lives = 1;
    });

    const store = useGameStore.getState();
    store.passTurn(0);

    const state = useGameStore.getState();
    expect(state.players[0].lives).toBe(0);
    expect(state.players[0].status).toBe(PlayerStatus.Eliminated);
  });

  it('does not affect other players', () => {
    const store = useGameStore.getState();
    store.passTurn(0);

    const state = useGameStore.getState();
    expect(state.players[1].lives).toBe(INITIAL_LIVES);
    expect(state.players[2].lives).toBe(INITIAL_LIVES);
    expect(state.players[3].lives).toBe(INITIAL_LIVES);
  });
});

describe('GameSlice — drawCard()', () => {
  beforeEach(() => {
    useGameStore.setState({
      players: createTestPlayers(),
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: createTestDeck(5),
      middlePile: [],
      lastValue: null,
      gameStatus: GameStatus.Playing,
      winner: null,
    });
  });

  it('adds a card from the deck to the player hand', () => {
    const store = useGameStore.getState();
    const initialDeckLength = store.deck.length;
    store.drawCard(0);

    const state = useGameStore.getState();
    expect(state.players[0].hand).toHaveLength(4); // was 3, now 4
    expect(state.deck).toHaveLength(initialDeckLength - 1);
  });

  it('does nothing when the deck is empty', () => {
    useGameStore.setState({ deck: [] });

    const store = useGameStore.getState();
    store.drawCard(0);

    const state = useGameStore.getState();
    expect(state.players[0].hand).toHaveLength(3); // unchanged
    expect(state.deck).toHaveLength(0);
  });
});

describe('GameSlice — advanceTurn()', () => {
  beforeEach(() => {
    useGameStore.setState({
      players: createTestPlayers(),
      currentPlayerIndex: 0,
      direction: Direction.Clockwise,
      deck: [],
      middlePile: [],
      lastValue: null,
      gameStatus: GameStatus.Playing,
      winner: null,
    });
  });

  it('moves currentPlayerIndex to the next alive player (clockwise)', () => {
    const store = useGameStore.getState();
    store.advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(1);
  });

  it('wraps around from last player to first player', () => {
    useGameStore.setState({ currentPlayerIndex: 3 });

    const store = useGameStore.getState();
    store.advanceTurn();
    expect(useGameStore.getState().currentPlayerIndex).toBe(0);
  });

  it('skips eliminated players when advancing', () => {
    useGameStore.setState((state) => {
      state.players[1].status = PlayerStatus.Eliminated;
      state.currentPlayerIndex = 0;
    });

    const store = useGameStore.getState();
    store.advanceTurn();
    // Player 1 is eliminated, so should skip to player 2
    expect(useGameStore.getState().currentPlayerIndex).toBe(2);
  });

  it('advances in counter-clockwise direction when reversed', () => {
    useGameStore.setState({
      currentPlayerIndex: 2,
      direction: Direction.CounterClockwise,
    });

    const store = useGameStore.getState();
    store.advanceTurn();
    // Counter-clockwise from 2 should go to 1
    expect(useGameStore.getState().currentPlayerIndex).toBe(1);
  });
});

describe('GameSlice — checkAndSetWinner()', () => {
  it('sets winner and gameStatus when exactly 1 alive player remains', () => {
    const players = createTestPlayers();
    players[1].status = PlayerStatus.Eliminated;
    players[1].lives = 0;
    players[2].status = PlayerStatus.Eliminated;
    players[2].lives = 0;
    players[3].status = PlayerStatus.Eliminated;
    players[3].lives = 0;

    useGameStore.setState({
      players,
      gameStatus: GameStatus.Playing,
      winner: null,
    });

    const store = useGameStore.getState();
    store.checkAndSetWinner();

    const state = useGameStore.getState();
    expect(state.winner).toBe('You');
    expect(state.gameStatus).toBe(GameStatus.Finished);
  });

  it('does not set winner when more than 1 player is alive', () => {
    useGameStore.setState({
      players: createTestPlayers(),
      gameStatus: GameStatus.Playing,
      winner: null,
    });

    const store = useGameStore.getState();
    store.checkAndSetWinner();

    const state = useGameStore.getState();
    expect(state.winner).toBeNull();
    expect(state.gameStatus).toBe(GameStatus.Playing);
  });
});

describe('GameSlice — resolveDeadlock()', () => {
  it('sets winner when all alive players have no playable cards', () => {
    // Create a deadlock: all players have only low number cards, lastValue is high
    const players = createTestPlayers();
    // Give all players only low-value number cards (all < 13)
    players[0].hand = [numberCard('d1', 1), numberCard('d2', 2), numberCard('d3', 3)];
    players[1].hand = [numberCard('d4', 1), numberCard('d5', 2), numberCard('d6', 3)];
    players[2].hand = [numberCard('d7', 1), numberCard('d8', 2), numberCard('d9', 3)];
    players[3].hand = [numberCard('d10', 1), numberCard('d11', 2), numberCard('d12', 3)];
    // Player 3 has more lives — should win deadlock
    players[0].lives = 3;
    players[1].lives = 2;
    players[2].lives = 4; // Most lives
    players[3].lives = 2;

    useGameStore.setState({
      players,
      lastValue: 13, // All cards are < 13, so none are playable
      gameStatus: GameStatus.Playing,
      winner: null,
    });

    const store = useGameStore.getState();
    store.resolveDeadlock();

    const state = useGameStore.getState();
    expect(state.winner).toBe('Bot 3'); // Player with most lives
    expect(state.gameStatus).toBe(GameStatus.Finished);
  });

  it('does nothing when there is no deadlock (players have playable cards)', () => {
    useGameStore.setState({
      players: createTestPlayers(), // Has cards with various values
      lastValue: 1, // Many cards are playable
      gameStatus: GameStatus.Playing,
      winner: null,
    });

    const store = useGameStore.getState();
    store.resolveDeadlock();

    const state = useGameStore.getState();
    expect(state.winner).toBeNull();
    expect(state.gameStatus).toBe(GameStatus.Playing);
  });
});

describe('GameSlice — eliminatePlayer()', () => {
  it('sets lives to 0 and status to Eliminated', () => {
    useGameStore.setState({ players: createTestPlayers() });

    const store = useGameStore.getState();
    store.eliminatePlayer(2);

    const state = useGameStore.getState();
    expect(state.players[2].lives).toBe(0);
    expect(state.players[2].status).toBe(PlayerStatus.Eliminated);
  });
});

describe('GameSlice — applySpecialEffect()', () => {
  it('applies Reverse correctly (flips direction)', () => {
    useGameStore.setState({
      players: createTestPlayers(),
      direction: Direction.Clockwise,
      lastValue: 5,
    });

    const store = useGameStore.getState();
    store.applySpecialEffect(SpecialEffect.Reverse);

    const state = useGameStore.getState();
    expect(state.direction).toBe(Direction.CounterClockwise);
    expect(state.lastValue).toBe(5); // unchanged
  });

  it('applies Bomb correctly (resets lastValue to null)', () => {
    useGameStore.setState({
      players: createTestPlayers(),
      lastValue: 10,
    });

    const store = useGameStore.getState();
    store.applySpecialEffect(SpecialEffect.Bomb);

    const state = useGameStore.getState();
    expect(state.lastValue).toBeNull();
  });

  it('applies Nuclear correctly (clears pile)', () => {
    useGameStore.setState({
      players: createTestPlayers(),
      middlePile: [numberCard('p1', 5), numberCard('p2', 8)],
      lastValue: 8,
    });

    const store = useGameStore.getState();
    store.applySpecialEffect(SpecialEffect.Nuclear);

    const state = useGameStore.getState();
    expect(state.lastValue).toBeNull();
    expect(state.middlePile).toHaveLength(0);
  });
});

describe('GameSlice — resetGame()', () => {
  it('resets all game state to initial values and resets UI/animation state', () => {
    // First init the game
    useGameStore.getState().initGame();

    // Modify some state
    const store = useGameStore.getState();
    store.setShowGameOver(true);
    store.pushMessage('test message');
    store.enqueueAnimation({
      type: 'card-play',
      payload: { cardId: 'test' },
      duration: 400,
    });
    store.setAnimating(true);

    // Now reset
    store.resetGame();

    const state = useGameStore.getState();

    // Game state should be fresh
    expect(state.players).toHaveLength(4);
    state.players.forEach((p) => {
      expect(p.hand).toHaveLength(3);
      expect(p.lives).toBe(INITIAL_LIVES);
      expect(p.status).toBe(PlayerStatus.Alive);
    });
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.direction).toBe(Direction.Clockwise);
    expect(state.lastValue).toBeNull();
    expect(state.middlePile).toHaveLength(0);
    expect(state.gameStatus).toBe(GameStatus.Playing);
    expect(state.winner).toBeNull();

    // UI state should be reset
    expect(state.showTitleScreen).toBe(true);
    expect(state.showGameOver).toBe(false);
    expect(state.turnMessage).toBe('');
    expect(state.showMessage).toBe('');
    expect(state.messageQueue).toHaveLength(0);

    // Animation state should be reset
    expect(state.isAnimating).toBe(false);
    expect(state.animationQueue).toHaveLength(0);
    expect(state.activeVFX).toBeNull();
    expect(state.vfxPosition).toBeNull();
  });
});
