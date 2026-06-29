import { describe, it, expect, beforeEach } from 'vitest';
import { GameRegistry } from './game-registry';
import type { GameDefinition } from './types';

function makeGame(id: string): GameDefinition {
  return {
    meta: {
      id,
      version: '1.0.0',
      name: `Game ${id}`,
      description: 'Test game',
      category: 'SLOTS',
      volatility: 'MEDIUM',
      rtpPercent: 96,
      minBet: 1,
      maxBet: 1000,
      defaultBet: 10,
    },
    createInitialState: () => ({}),
    validateBet: (bet) => bet >= 1 && bet <= 1000,
    resolveRound: (_state, seed, nonce) => ({
      multiplier: 1,
      payoutVirtualCoins: 0,
      rngSeed: seed,
      nonce,
    }),
    applyOutcome: (state) => state,
  };
}

describe('GameRegistry', () => {
  let registry: GameRegistry;

  beforeEach(() => {
    registry = new GameRegistry();
  });

  it('registers a game and retrieves it', () => {
    const game = makeGame('slots-001');
    registry.register(game);
    expect(registry.get('slots-001')).toBe(game);
  });

  it('throws when registering a duplicate id', () => {
    registry.register(makeGame('slots-001'));
    expect(() => registry.register(makeGame('slots-001'))).toThrow("already registered");
  });

  it('getOrThrow throws for unknown game', () => {
    expect(() => registry.getOrThrow('missing')).toThrow("not found");
  });

  it('list() returns all registered games', () => {
    registry.register(makeGame('a'));
    registry.register(makeGame('b'));
    expect(registry.list()).toHaveLength(2);
  });

  it('unregister() removes a game', () => {
    registry.register(makeGame('slots-001'));
    registry.unregister('slots-001');
    expect(registry.has('slots-001')).toBe(false);
  });

  it('rejects invalid rtpPercent', () => {
    const bad = makeGame('bad');
    (bad.meta as { rtpPercent: number }).rtpPercent = 110;
    expect(() => registry.register(bad)).toThrow('rtpPercent');
  });

  it('rejects maxBet < minBet', () => {
    const bad: GameDefinition = {
      ...makeGame('bad2'),
      meta: { ...makeGame('bad2').meta, minBet: 100, maxBet: 10, defaultBet: 50 },
    };
    expect(() => registry.register(bad)).toThrow('maxBet');
  });
});
