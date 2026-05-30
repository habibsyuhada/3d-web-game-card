// src/types/player.ts — Player-related enums and interfaces

import type { Card } from './card';

export enum PlayerType {
  Human = 'human',
  Bot = 'bot',
}

export enum PlayerStatus {
  Alive = 'alive',
  Eliminated = 'eliminated',
  Spectator = 'spectator',
}

export interface Player {
  id: number;                // 1–4
  name: string;              // "You" | "Bot 2" | "Bot 3" | "Bot 4"
  type: PlayerType;
  hand: Card[];              // max 3 cards
  lives: number;             // 0–5
  status: PlayerStatus;
}
