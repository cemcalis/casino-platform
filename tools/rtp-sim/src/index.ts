export { runMonteCarloSimulation } from './simulate';
export type {
  SimulationOptions,
  SimulationResult,
  PaylineStat,
  SymbolStat,
  MaxWinSample,
} from './simulate';

export { describe, classifyVolatility } from './stats';
export type { DescriptiveStats, VolatilityClass } from './stats';

export { toJson, toCsv } from './report';

export { GAMES, resolveGame } from './games';
export type { GameDefinition, PaylineCount } from './games';
