// src/types/card.ts — Card-related enums and interfaces

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
