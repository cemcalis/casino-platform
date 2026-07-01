import { createNeonPalaceConfig, type SlotConfig } from '@casino/slot-runtime';

export type PaylineCount = 20 | 40 | 50 | 100;

export interface GameDefinition {
  readonly id: string;
  readonly build: (paylines?: PaylineCount) => SlotConfig;
}

// Registry of runtime configs available to the simulator. Extend as new
// @casino/slot-runtime configs are added.
export const GAMES: Readonly<Record<string, GameDefinition>> = {
  'neon-palace': {
    id: 'neon-palace',
    build: (paylines) => createNeonPalaceConfig(paylines ?? 20),
  },
};

export function resolveGame(gameId: string, paylines?: PaylineCount): SlotConfig {
  const game = GAMES[gameId];
  if (!game) {
    const available = Object.keys(GAMES).join(', ');
    throw new Error(`Unknown gameId "${gameId}". Available: ${available}`);
  }
  return game.build(paylines);
}
