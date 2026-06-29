import type { GameDefinition } from './types';

export class GameRegistry {
  private readonly games = new Map<string, GameDefinition>();

  register(definition: GameDefinition): void {
    if (this.games.has(definition.meta.id)) {
      throw new Error(`Game '${definition.meta.id}' is already registered`);
    }
    this.validateDefinition(definition);
    this.games.set(definition.meta.id, definition);
  }

  unregister(gameId: string): void {
    this.games.delete(gameId);
  }

  get(gameId: string): GameDefinition | undefined {
    return this.games.get(gameId);
  }

  getOrThrow(gameId: string): GameDefinition {
    const game = this.games.get(gameId);
    if (!game) throw new Error(`Game '${gameId}' not found in registry`);
    return game;
  }

  list(): readonly GameDefinition[] {
    return Array.from(this.games.values());
  }

  has(gameId: string): boolean {
    return this.games.has(gameId);
  }

  clear(): void {
    this.games.clear();
  }

  private validateDefinition(def: GameDefinition): void {
    const { meta } = def;
    if (!meta.id || !meta.name) throw new Error('Game definition must have id and name');
    if (meta.rtpPercent < 0 || meta.rtpPercent > 100) {
      throw new Error('rtpPercent must be between 0 and 100');
    }
    if (meta.minBet <= 0) throw new Error('minBet must be positive');
    if (meta.maxBet < meta.minBet) throw new Error('maxBet must be >= minBet');
    if (meta.defaultBet < meta.minBet || meta.defaultBet > meta.maxBet) {
      throw new Error('defaultBet must be within [minBet, maxBet]');
    }
  }
}
