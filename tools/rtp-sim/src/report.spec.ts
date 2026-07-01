import { describe, it, expect } from 'vitest';
import { createNeonPalaceConfig } from '@casino/slot-runtime';
import { runMonteCarloSimulation } from './simulate';
import { toCsv, toJson } from './report';

describe('report formatters', () => {
  const config = createNeonPalaceConfig(20);
  const result = runMonteCarloSimulation({
    config,
    gameId: 'neon-palace',
    spins: 1000,
    seed: 'report-test',
  });

  it('serializes to valid, round-trippable JSON', () => {
    const json = toJson(result);
    const parsed = JSON.parse(json);
    expect(parsed.gameId).toBe('neon-palace');
    expect(parsed.spins).toBe(1000);
    expect(parsed.paylineStats).toEqual(result.paylineStats);
  });

  it('serializes to CSV with summary and breakdown sections', () => {
    const csv = toCsv(result);
    expect(csv).toContain('section,key,value');
    expect(csv).toContain('summary,gameId,neon-palace');
    expect(csv).toContain('paylineIndex,hitCount,totalPayout');
    expect(csv).toContain('symbolId,hitCount,totalPayout');
  });
});
