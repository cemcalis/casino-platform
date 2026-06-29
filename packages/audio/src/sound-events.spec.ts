import { describe, it, expect } from 'vitest';
import { NEON_PALACE_SOUNDS } from './sound-events';

describe('NEON_PALACE_SOUNDS', () => {
  it('has at least 25 named events', () => {
    expect(Object.keys(NEON_PALACE_SOUNDS).length).toBeGreaterThanOrEqual(25);
  });

  it('all events have unique IDs', () => {
    const ids = Object.values(NEON_PALACE_SOUNDS).map((e) => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all IDs start with np:', () => {
    for (const event of Object.values(NEON_PALACE_SOUNDS)) {
      expect(event.id).toMatch(/^np:/);
    }
  });

  it('music events loop', () => {
    expect(NEON_PALACE_SOUNDS.LOBBY_THEME.loop).toBe(true);
    expect(NEON_PALACE_SOUNDS.GAME_THEME.loop).toBe(true);
  });

  it('sfx events do not loop', () => {
    expect(NEON_PALACE_SOUNDS.SPIN_START.loop).toBe(false);
    expect(NEON_PALACE_SOUNDS.WIN_SMALL.loop).toBe(false);
  });

  it('music events are on MUSIC channel', () => {
    expect(NEON_PALACE_SOUNDS.LOBBY_THEME.channel).toBe('MUSIC');
    expect(NEON_PALACE_SOUNDS.GAME_THEME.channel).toBe('MUSIC');
  });

  it('ambient events are on AMBIENT channel', () => {
    expect(NEON_PALACE_SOUNDS.AMBIENT_CASINO.channel).toBe('AMBIENT');
  });

  it('sfx events are on SFX channel', () => {
    expect(NEON_PALACE_SOUNDS.SPIN_START.channel).toBe('SFX');
    expect(NEON_PALACE_SOUNDS.WIN_JACKPOT.channel).toBe('SFX');
  });

  it('jackpot has highest priority among win sounds', () => {
    expect(NEON_PALACE_SOUNDS.WIN_JACKPOT.priority).toBeGreaterThan(
      NEON_PALACE_SOUNDS.WIN_SMALL.priority,
    );
  });
});
