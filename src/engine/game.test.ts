// src/engine/game.test.ts — Tests for game orchestration (initGame, resetGame)

import { describe, it, expect } from 'vitest';
import {
  CardType,
  PlayerType,
  PlayerStatus,
  Direction,
  GameStatus,
  TOTAL_PLAYERS,
  INITIAL_LIVES,
  HAND_SIZE,
} from '../types';
import type { GameState } from '../types';
import { initGame, resetGame } from './game';

describe('initGame', () => {
  it('returns exactly 4 players', () => {
    const state: GameState = initGame();
    expect(state.players).toHaveLength(TOTAL_PLAYERS);
    expect(state.players).toHaveLength(4);
  });

  it('player 1 is Human, players 2-4 are Bot', () => {
    const state = initGame();
    expect(state.players[0].type).toBe(PlayerType.Human);
    expect(state.players[1].type).toBe(PlayerType.Bot);
    expect(state.players[2].type).toBe(PlayerType.Bot);
    expect(state.players[3].type).toBe(PlayerType.Bot);
  });

  it('player names are "You", "Bot 2", "Bot 3", "Bot 4"', () => {
    const state = initGame();
    expect(state.players[0].name).toBe('You');
    expect(state.players[1].name).toBe('Bot 2');
    expect(state.players[2].name).toBe('Bot 3');
    expect(state.players[3].name).toBe('Bot 4');
  });

  it('player IDs are 1, 2, 3, 4', () => {
    const state = initGame();
    expect(state.players[0].id).toBe(1);
    expect(state.players[1].id).toBe(2);
    expect(state.players[2].id).toBe(3);
    expect(state.players[3].id).toBe(4);
  });

  it('all players start with lives = INITIAL_LIVES and status = Alive', () => {
    const state = initGame();
    for (const player of state.players) {
      expect(player.lives).toBe(INITIAL_LIVES);
      expect(player.lives).toBe(5);
      expect(player.status).toBe(PlayerStatus.Alive);
    }
  });

  it('all players have exactly HAND_SIZE (3) cards', () => {
    const state = initGame();
    for (const player of state.players) {
      expect(player.hand).toHaveLength(HAND_SIZE);
      expect(player.hand).toHaveLength(3);
    }
  });

  it('deck has exactly 41 cards remaining (53 - 12 dealt)', () => {
    const state = initGame();
    // 53 total - (4 players * 3 cards) = 53 - 12 = 41
    expect(state.deck).toHaveLength(41);
  });

  it('middlePile is empty and lastValue is null', () => {
    const state = initGame();
    expect(state.middlePile).toEqual([]);
    expect(state.middlePile).toHaveLength(0);
    expect(state.lastValue).toBeNull();
  });

  it('currentPlayerIndex is 0 (human starts)', () => {
    const state = initGame();
    expect(state.currentPlayerIndex).toBe(0);
  });

  it('direction is Direction.Clockwise', () => {
    const state = initGame();
    expect(state.direction).toBe(Direction.Clockwise);
  });

  it('gameStatus is GameStatus.Playing', () => {
    const state = initGame();
    expect(state.gameStatus).toBe(GameStatus.Playing);
  });

  it('winner is null', () => {
    const state = initGame();
    expect(state.winner).toBeNull();
  });

  it('all 53 cards are accounted for (12 in hands + 41 in deck, all unique IDs)', () => {
    const state = initGame();

    // Collect all card IDs from hands
    const handCards = state.players.flatMap((p) => p.hand);
    expect(handCards).toHaveLength(12);

    // Collect all card IDs from deck
    const deckCards = state.deck;
    expect(deckCards).toHaveLength(41);

    // Combine all IDs
    const allIds = [...handCards.map((c) => c.id), ...deckCards.map((c) => c.id)];
    expect(allIds).toHaveLength(53);

    // All IDs must be unique
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(53);
  });

  it('every hand card is a valid Card object (has id, type, value/effect fields)', () => {
    const state = initGame();
    for (const player of state.players) {
      for (const card of player.hand) {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('value');
        expect(card).toHaveProperty('effect');
        expect(typeof card.id).toBe('string');
        expect(card.id.length).toBeGreaterThan(0);
        expect([CardType.Number, CardType.Special]).toContain(card.type);

        // Number cards: value is 1-13, effect is null
        if (card.type === CardType.Number) {
          expect(card.value).toBeGreaterThanOrEqual(1);
          expect(card.value).toBeLessThanOrEqual(13);
          expect(card.effect).toBeNull();
        }

        // Special cards: value is null, effect is defined
        if (card.type === CardType.Special) {
          expect(card.value).toBeNull();
          expect(card.effect).not.toBeNull();
        }
      }
    }
  });

  it('multiple initGame() calls produce different deals (shuffled differently)', () => {
    const deals: string[] = [];
    for (let i = 0; i < 10; i++) {
      const state = initGame();
      const handOrder = state.players
        .flatMap((p) => p.hand.map((c) => c.id))
        .join(',');
      deals.push(handOrder);
    }
    const uniqueDeals = new Set(deals);
    // With 53 cards shuffled, it is astronomically unlikely to get the same deal twice
    expect(uniqueDeals.size).toBeGreaterThanOrEqual(2);
  });
});

describe('resetGame', () => {
  it('returns state identical in structure to initGame()', () => {
    const freshState = initGame();
    const resetState = resetGame();

    // Same structure: same keys, same types
    expect(Object.keys(resetState).sort()).toEqual(
      Object.keys(freshState).sort()
    );

    // Correct number of players
    expect(resetState.players).toHaveLength(4);

    // All structural properties match
    expect(resetState.currentPlayerIndex).toBe(0);
    expect(resetState.direction).toBe(Direction.Clockwise);
    expect(resetState.gameStatus).toBe(GameStatus.Playing);
    expect(resetState.winner).toBeNull();
    expect(resetState.middlePile).toEqual([]);
    expect(resetState.lastValue).toBeNull();
    expect(resetState.deck).toHaveLength(41);

    // All players match expected structure
    for (let i = 0; i < 4; i++) {
      expect(resetState.players[i].hand).toHaveLength(3);
      expect(resetState.players[i].lives).toBe(INITIAL_LIVES);
      expect(resetState.players[i].status).toBe(PlayerStatus.Alive);
      expect(resetState.players[i].id).toBe(i + 1);
    }
    expect(resetState.players[0].type).toBe(PlayerType.Human);
    expect(resetState.players[1].type).toBe(PlayerType.Bot);
    expect(resetState.players[2].type).toBe(PlayerType.Bot);
    expect(resetState.players[3].type).toBe(PlayerType.Bot);
  });

  it('resetGame() produces a new independent state (different card deal)', () => {
    const state1 = resetGame();
    const state2 = resetGame();

    const ids1 = state1.players
      .flatMap((p) => p.hand.map((c) => c.id))
      .join(',');
    const ids2 = state2.players
      .flatMap((p) => p.hand.map((c) => c.id))
      .join(',');

    // Extremely unlikely to be identical
    expect(ids1).not.toBe(ids2);
  });
});
