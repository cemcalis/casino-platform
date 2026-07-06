import { describe, expect, it } from 'vitest';
import { simulate, formatReport } from './simulate';
import { emberFalls, sugarRealm } from './reference-manifests';

const GATE_SPINS = 200_000;

describe('RTP gate', () => {
  it('ember-falls (lines/tumble) lands in the target band', () => {
    const manifest = emberFalls();
    const report = simulate(manifest, { spins: GATE_SPINS, seed: 1337 });
    // eslint-disable-next-line no-console
    console.log('\n' + formatReport(manifest, report));
    expect(report.rtp).toBeGreaterThanOrEqual(manifest.targetRtp.min);
    expect(report.rtp).toBeLessThanOrEqual(manifest.targetRtp.max);
  });

  it('sugar-realm (scatterPays/tumble) lands in the target band', () => {
    const manifest = sugarRealm();
    const report = simulate(manifest, { spins: GATE_SPINS, seed: 1337 });
    // eslint-disable-next-line no-console
    console.log('\n' + formatReport(manifest, report));
    expect(report.rtp).toBeGreaterThanOrEqual(manifest.targetRtp.min);
    expect(report.rtp).toBeLessThanOrEqual(manifest.targetRtp.max);
  });
});

describe('simulation sanity', () => {
  it('reports coherent shape metrics', () => {
    const report = simulate(sugarRealm(), { spins: 20_000, seed: 7 });
    expect(report.hitFrequency).toBeGreaterThan(0.05);
    expect(report.hitFrequency).toBeLessThan(0.9);
    expect(report.freeSpinTriggerRate).toBeGreaterThan(0);
    expect(report.freeSpinTriggerRate).toBeLessThan(0.05);
    expect(report.baseRtp + report.freeSpinRtp).toBeCloseTo(report.rtp, 1);
  });

  it('ante bet raises trigger rate', () => {
    const base = simulate(sugarRealm(), { spins: 40_000, seed: 21 });
    const ante = simulate(sugarRealm(), { spins: 40_000, seed: 21, anteActive: true });
    expect(ante.freeSpinTriggerRate).toBeGreaterThan(base.freeSpinTriggerRate * 1.4);
  });
});
