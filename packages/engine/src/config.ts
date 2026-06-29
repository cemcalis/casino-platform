export interface FeatureFlags {
  readonly provablyFairEnabled: boolean;
  readonly leaderboardEnabled: boolean;
  readonly achievementsEnabled: boolean;
  readonly tournamentsEnabled: boolean;
  readonly soundEnabled: boolean;
  readonly animationsEnabled: boolean;
}

export interface EngineConfig {
  readonly maxConcurrentSessions: number;
  readonly sessionTimeoutMs: number;
  readonly defaultCurrency: string;
  readonly featureFlags: FeatureFlags;
}

const DEFAULT_CONFIG: EngineConfig = {
  maxConcurrentSessions: 1000,
  sessionTimeoutMs: 30 * 60 * 1000,
  defaultCurrency: 'VCOIN',
  featureFlags: {
    provablyFairEnabled: true,
    leaderboardEnabled: true,
    achievementsEnabled: false,
    tournamentsEnabled: false,
    soundEnabled: true,
    animationsEnabled: true,
  },
};

export class ConfigSystem {
  private readonly config: EngineConfig;

  constructor(overrides: Partial<Omit<EngineConfig, 'featureFlags'>> & { featureFlags?: Partial<FeatureFlags> } = {}) {
    const { featureFlags, ...rest } = overrides;
    this.config = {
      ...DEFAULT_CONFIG,
      ...rest,
      featureFlags: {
        ...DEFAULT_CONFIG.featureFlags,
        ...(featureFlags ?? {}),
      },
    };
  }

  get<K extends keyof EngineConfig>(key: K): EngineConfig[K] {
    return this.config[key];
  }

  isFeatureEnabled(flag: keyof FeatureFlags): boolean {
    return this.config.featureFlags[flag];
  }

  toJSON(): EngineConfig {
    return this.config;
  }
}
