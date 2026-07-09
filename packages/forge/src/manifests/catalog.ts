import type { GameManifest, ForgeSymbol, ThemeSpec } from '../types';
import { emberFalls, sugarRealm } from '../reference-manifests';

/**
 * Themed variants of the two RTP-gated reference profiles. A variant swaps
 * ONLY identity (ids/labels/colors/theme/copy) — weights and payout tables
 * are copied by position from the base, so the calibrated RTP is inherited
 * without re-running the Monte Carlo gate per title.
 */

interface SymbolSkin {
  id: string;
  label: string;
  color: string;
}

interface VariantSpec {
  gameId: string;
  gameName: string;
  tagline: string;
  /** One skin per base symbol, in the base manifest's symbol order. */
  skins: SymbolSkin[];
  theme: ThemeSpec;
}

function reskin(base: GameManifest, spec: VariantSpec): GameManifest {
  if (spec.skins.length !== base.symbols.length) {
    throw new Error(
      `${spec.gameId}: expected ${base.symbols.length} symbol skins, got ${spec.skins.length}`,
    );
  }
  const symbols: ForgeSymbol[] = base.symbols.map((sym, i) => ({
    ...sym,
    id: spec.skins[i].id,
    label: spec.skins[i].label,
    color: spec.skins[i].color,
  }));
  return {
    ...base,
    gameId: spec.gameId,
    gameName: spec.gameName,
    tagline: spec.tagline,
    symbols,
    theme: spec.theme,
  };
}

function assetBlock(gameId: string, symbolIds: string[]): NonNullable<ThemeSpec['assets']> {
  return {
    background: `/assets/${gameId}/backgrounds/background.png`,
    symbols: Object.fromEntries(
      symbolIds.map((id) => [id, `/assets/${gameId}/symbols/${id}.png`]),
    ),
  };
}

/* ── lines/tumble profile (Ember Falls math, RTP ≈ 94.6%) ─────────────── */

/** Egyptian expedition — flagship lines/tumble title. */
export function pyramidQuest(): GameManifest {
  const ids = ['papyrus', 'ankh', 'lotus', 'scarab', 'jackal', 'falcon', 'pharaoh', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'pyramid-quest',
    gameName: 'Pyramid Quest',
    tagline: "Ra'nın mezarında basamaklı kazançlar",
    skins: [
      { id: 'papyrus', label: 'PA', color: '#d6c391' },
      { id: 'ankh', label: 'AN', color: '#f4c430' },
      { id: 'lotus', label: 'LO', color: '#60a5fa' },
      { id: 'scarab', label: 'SC', color: '#34d399' },
      { id: 'jackal', label: 'JA', color: '#a78bfa' },
      { id: 'falcon', label: 'FA', color: '#fb923c' },
      { id: 'pharaoh', label: 'PH', color: '#fde047' },
      { id: 'wild', label: 'W', color: '#f4c430' },
      { id: 'scatter', label: 'S', color: '#22d3ee' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #3a2600 0%, #1c1200 55%, #0a0500 100%)',
      reelBg: 'rgba(28, 18, 0, 0.85)',
      accentColor: '#f4c430',
      accentColor2: '#ffe088',
      frameColor: '#8a6d1a',
      music: 'mystic',
      storageKey: 'forge_pyramid_quest',
      assets: assetBlock('pyramid-quest', ids),
    },
  });
}

/** Dark underworld tome — high-contrast Egyptian night skin. */
export function tomeOfAnubis(): GameManifest {
  const ids = ['bone', 'serpent', 'urn', 'amulet', 'bastet', 'horus', 'anubis', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'book-of-dead',
    gameName: 'Tome of Anubis',
    tagline: 'Ölüler kitabı açıldı — yeraltının bekçisiyle yüzleş',
    skins: [
      { id: 'bone', label: 'BO', color: '#d4d4d8' },
      { id: 'serpent', label: 'SE', color: '#4ade80' },
      { id: 'urn', label: 'UR', color: '#fb923c' },
      { id: 'amulet', label: 'AM', color: '#60a5fa' },
      { id: 'bastet', label: 'BA', color: '#c084fc' },
      { id: 'horus', label: 'HO', color: '#fbbf24' },
      { id: 'anubis', label: 'AN', color: '#818cf8' },
      { id: 'wild', label: 'W', color: '#d4a848' },
      { id: 'scatter', label: 'S', color: '#a78bfa' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #1e1b4b 0%, #171132 55%, #050208 100%)',
      reelBg: 'rgba(20, 14, 40, 0.85)',
      accentColor: '#d4a848',
      accentColor2: '#f5deA0',
      frameColor: '#3f3167',
      music: 'mystic',
      storageKey: 'forge_tome_of_anubis',
      assets: assetBlock('book-of-dead', ids),
    },
  });
}

/** Oriental dragon palace — warm reds and jade. */
export function dragonsFortune(): GameManifest {
  const ids = ['coincharm', 'jade', 'fan', 'lantern', 'koi', 'tiger', 'dragon', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'dragons-fortune',
    gameName: "Dragon's Fortune",
    tagline: 'Ejderhanın sarayında servet rüzgarı',
    skins: [
      { id: 'coincharm', label: 'CO', color: '#fbbf24' },
      { id: 'jade', label: 'JD', color: '#34d399' },
      { id: 'fan', label: 'FN', color: '#f472b6' },
      { id: 'lantern', label: 'LA', color: '#fb923c' },
      { id: 'koi', label: 'KO', color: '#60a5fa' },
      { id: 'tiger', label: 'TI', color: '#f59e0b' },
      { id: 'dragon', label: 'DR', color: '#ef4444' },
      { id: 'wild', label: 'W', color: '#ff6b00' },
      { id: 'scatter', label: 'S', color: '#fde047' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #5a0a00 0%, #2d0000 55%, #1a0000 100%)',
      reelBg: 'rgba(45, 8, 0, 0.85)',
      accentColor: '#ff6b00',
      accentColor2: '#ffd28a',
      frameColor: '#7c2d12',
      music: 'epic',
      storageKey: 'forge_dragons_fortune',
      assets: assetBlock('dragons-fortune', ids),
    },
  });
}

/** Sun-scorched savanna — golden hour wildlife. */
export function solarWilds(): GameManifest {
  const ids = ['acacia', 'horn', 'drum', 'meerkat', 'zebra', 'rhino', 'lion', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'solar-wilds',
    gameName: 'Solar Wilds',
    tagline: 'Altın saatte savan avı',
    skins: [
      { id: 'acacia', label: 'AC', color: '#84cc16' },
      { id: 'horn', label: 'HO', color: '#d6c391' },
      { id: 'drum', label: 'DR', color: '#fb923c' },
      { id: 'meerkat', label: 'ME', color: '#fbbf24' },
      { id: 'zebra', label: 'ZE', color: '#e4e4e7' },
      { id: 'rhino', label: 'RH', color: '#a1a1aa' },
      { id: 'lion', label: 'LI', color: '#f59e0b' },
      { id: 'wild', label: 'W', color: '#ff9500' },
      { id: 'scatter', label: 'S', color: '#fde047' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #6b3a00 0%, #3d2000 55%, #0d0800 100%)',
      reelBg: 'rgba(50, 26, 0, 0.85)',
      accentColor: '#ff9500',
      accentColor2: '#ffe088',
      frameColor: '#92580c',
      music: 'serene',
      storageKey: 'forge_solar_wilds',
      assets: assetBlock('solar-wilds', ids),
    },
  });
}

/* ── scatterPays/tumble profile (Sugar Realm math, RTP ≈ 94.9%) ───────── */

/** Cosmic gems — 6×5 scatter pays with prism bombs. */
export function starPrism(): GameManifest {
  const ids = ['shard-green', 'shard-blue', 'shard-violet', 'nova', 'comet', 'ring', 'pulsar', 'prism', 'scatter', 'bomb'];
  return reskin(sugarRealm(), {
    gameId: 'starburst',
    gameName: 'Star Prism',
    tagline: 'Nebulada zincirleme süpernovalar',
    skins: [
      { id: 'shard-green', label: 'SG', color: '#4ade80' },
      { id: 'shard-blue', label: 'SB', color: '#60a5fa' },
      { id: 'shard-violet', label: 'SV', color: '#c084fc' },
      { id: 'nova', label: 'NO', color: '#fde047' },
      { id: 'comet', label: 'CO', color: '#f87171' },
      { id: 'ring', label: 'RI', color: '#f472b6' },
      { id: 'pulsar', label: 'PU', color: '#fbbf24' },
      { id: 'prism', label: 'PR', color: '#e879f9' },
      { id: 'scatter', label: 'S', color: '#22d3ee' },
      { id: 'bomb', label: 'B', color: '#f97316' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #2d0050 0%, #131318 55%, #0d001a 100%)',
      reelBg: 'rgba(24, 16, 46, 0.85)',
      accentColor: '#e879f9',
      accentColor2: '#f0abfc',
      frameColor: '#581c87',
      music: 'arcade',
      storageKey: 'forge_star_prism',
      assets: assetBlock('starburst', ids),
    },
  });
}

/** Underground crystal caverns — cool teal glow. */
export function crystalCaverns(): GameManifest {
  const ids = ['pebble', 'moss', 'quartz', 'geode', 'stalactite', 'lantern', 'golem', 'heartstone', 'scatter', 'bomb'];
  return reskin(sugarRealm(), {
    gameId: 'crystal-caverns',
    gameName: 'Crystal Caverns',
    tagline: 'Mağaranın derinliklerinde zincirleme kristal patlamaları',
    skins: [
      { id: 'pebble', label: 'PE', color: '#a1a1aa' },
      { id: 'moss', label: 'MO', color: '#4ade80' },
      { id: 'quartz', label: 'QU', color: '#e4e4e7' },
      { id: 'geode', label: 'GE', color: '#c084fc' },
      { id: 'stalactite', label: 'ST', color: '#60a5fa' },
      { id: 'lantern', label: 'LA', color: '#fbbf24' },
      { id: 'golem', label: 'GO', color: '#34d399' },
      { id: 'heartstone', label: 'HS', color: '#22d3ee' },
      { id: 'scatter', label: 'S', color: '#a855f7' },
      { id: 'bomb', label: 'B', color: '#f97316' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #003d3d 0%, #001a1a 55%, #000d0d 100%)',
      reelBg: 'rgba(0, 30, 30, 0.85)',
      accentColor: '#22d3ee',
      accentColor2: '#a5f3fc',
      frameColor: '#155e75',
      music: 'mystic',
      storageKey: 'forge_crystal_caverns',
      assets: assetBlock('crystal-caverns', ids),
    },
  });
}

export const CATALOG = [
  pyramidQuest,
  tomeOfAnubis,
  dragonsFortune,
  solarWilds,
  starPrism,
  crystalCaverns,
];
