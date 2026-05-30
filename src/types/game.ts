// src/types/game.ts — Game state, turn, and animation types

import type { Card, SpecialEffect } from './card';
import type { Player } from './player';

export enum GameStatus {
  Waiting = 'waiting',
  Playing = 'playing',
  Finished = 'finished',
}

export enum Direction {
  Clockwise = 1,
  CounterClockwise = -1,
}

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

export interface BotDecision {
  action: 'play' | 'pass';
  cardId?: string;
  reason: string;
}

export interface TurnResult {
  playerId: number;
  action: 'played' | 'passed';
  card: Card | null;
  livesLost: number;
  eliminated: boolean;
  specialEffectApplied: SpecialEffect | null;
  randomValue?: number;
}

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
