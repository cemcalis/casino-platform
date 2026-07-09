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


/** Retro fruit hall — chrome sevens and neon bars. */
export function luckySevens(): GameManifest {
  const ids = ['cherry7', 'lemon7', 'plum7', 'bell7', 'bar', 'doublebar', 'seven', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'lucky-7s',
    gameName: 'Lucky 7s Classic',
    tagline: 'Krom yediler, neon barlar — klasik salon ruhu',
    skins: [
      { id: 'cherry7', label: 'CH', color: '#ef4444' },
      { id: 'lemon7', label: 'LE', color: '#fde047' },
      { id: 'plum7', label: 'PL', color: '#c084fc' },
      { id: 'bell7', label: 'BE', color: '#fbbf24' },
      { id: 'bar', label: 'BAR', color: '#e4e4e7' },
      { id: 'doublebar', label: 'DBR', color: '#a5f3fc' },
      { id: 'seven', label: '7', color: '#ef4444' },
      { id: 'wild', label: 'W', color: '#f4c430' },
      { id: 'scatter', label: 'S', color: '#22d3ee' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #5a0020 0%, #2d0010 55%, #1a0010 100%)',
      reelBg: 'rgba(40, 0, 18, 0.85)',
      accentColor: '#f4c430',
      accentColor2: '#ffe088',
      frameColor: '#7a0030',
      music: 'arcade',
      storageKey: 'forge_lucky_7s',
      assets: assetBlock('lucky-7s', ids),
    },
  });
}


/** Bank heist vault — gold bars under laser light. */
export function goldenVault(): GameManifest {
  const ids = ['key', 'blueprint', 'dynamite', 'gembag', 'goldbar', 'safe', 'crownjewel', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'golden-vault',
    gameName: 'Golden Vault',
    tagline: 'Kasanın kapısı açıldı — altın külçe yağmuru',
    skins: [
      { id: 'key', label: 'KE', color: '#a1a1aa' },
      { id: 'blueprint', label: 'BP', color: '#60a5fa' },
      { id: 'dynamite', label: 'DY', color: '#fb923c' },
      { id: 'gembag', label: 'GB', color: '#c084fc' },
      { id: 'goldbar', label: 'GO', color: '#fbbf24' },
      { id: 'safe', label: 'SA', color: '#e4e4e7' },
      { id: 'crownjewel', label: 'CJ', color: '#f472b6' },
      { id: 'wild', label: 'W', color: '#f4c430' },
      { id: 'scatter', label: 'S', color: '#22d3ee' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #3d2800 0%, #1a1000 55%, #0d0800 100%)',
      reelBg: 'rgba(35, 24, 0, 0.85)',
      accentColor: '#f4c430',
      accentColor2: '#ffe088',
      frameColor: '#8a6d1a',
      music: 'epic',
      storageKey: 'forge_golden_vault',
      assets: assetBlock('golden-vault', ids),
    },
  });
}


/** Storm over Olympus — gods hurl thunder. */
export function olympusStrikes(): GameManifest {
  const ids = ['laurel', 'amphora', 'harp', 'helmet', 'pegasus', 'poseidon', 'zeusking', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'olympus-strikes',
    gameName: 'Olympus Strikes',
    tagline: 'Gök gürlüyor — tanrıların gazabı makaralarda',
    skins: [
      { id: 'laurel', label: 'LA', color: '#84cc16' },
      { id: 'amphora', label: 'AM', color: '#d6c391' },
      { id: 'harp', label: 'HA', color: '#fbbf24' },
      { id: 'helmet', label: 'HE', color: '#a1a1aa' },
      { id: 'pegasus', label: 'PE', color: '#e4e4e7' },
      { id: 'poseidon', label: 'PO', color: '#22d3ee' },
      { id: 'zeusking', label: 'ZE', color: '#fde047' },
      { id: 'wild', label: 'W', color: '#00d4c8' },
      { id: 'scatter', label: 'S', color: '#a78bfa' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #003080 0%, #001a3d 55%, #000d26 100%)',
      reelBg: 'rgba(0, 22, 55, 0.85)',
      accentColor: '#00d4c8',
      accentColor2: '#a5f3fc',
      frameColor: '#1e3a8a',
      music: 'epic',
      storageKey: 'forge_olympus_strikes',
      assets: assetBlock('olympus-strikes', ids),
    },
  });
}


/** Nile treasure barge — turquoise river gold. */
export function pharaohsTreasure(): GameManifest {
  const ids = ['reed', 'oar', 'fishnile', 'ibis', 'barge', 'queen', 'treasure', 'wild', 'scatter'];
  return reskin(emberFalls(), {
    gameId: 'pharaohs-treasure',
    gameName: "Pharaoh's Treasure",
    tagline: 'Nil boyunca altın mavna — firavunun hazinesi',
    skins: [
      { id: 'reed', label: 'RE', color: '#84cc16' },
      { id: 'oar', label: 'OA', color: '#d6c391' },
      { id: 'fishnile', label: 'FI', color: '#60a5fa' },
      { id: 'ibis', label: 'IB', color: '#e4e4e7' },
      { id: 'barge', label: 'BA', color: '#fb923c' },
      { id: 'queen', label: 'QU', color: '#f472b6' },
      { id: 'treasure', label: 'TR', color: '#fde047' },
      { id: 'wild', label: 'W', color: '#22d3ee' },
      { id: 'scatter', label: 'S', color: '#f4c430' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #0e5a52 0%, #073d38 55%, #02201d 100%)',
      reelBg: 'rgba(3, 40, 36, 0.85)',
      accentColor: '#22d3ee',
      accentColor2: '#99f6e4',
      frameColor: '#0f766e',
      music: 'serene',
      storageKey: 'forge_pharaohs_treasure',
      assets: assetBlock('pharaohs-treasure', ids),
    },
  });
}


/** Juicy orchard chaos — 6x5 fruit cluster blasts. */
export function fruitFrenzy(): GameManifest {
  const ids = ['kiwi', 'blueberry', 'grapef', 'banana', 'strawberry', 'pineapple', 'watermelon', 'goldapple', 'scatter', 'bomb'];
  return reskin(sugarRealm(), {
    gameId: 'fruit-frenzy',
    gameName: 'Fruit Frenzy',
    tagline: 'Meyve bahçesinde zincirleme patlamalar',
    skins: [
      { id: 'kiwi', label: 'KI', color: '#84cc16' },
      { id: 'blueberry', label: 'BL', color: '#60a5fa' },
      { id: 'grapef', label: 'GR', color: '#c084fc' },
      { id: 'banana', label: 'BA', color: '#fde047' },
      { id: 'strawberry', label: 'ST', color: '#f87171' },
      { id: 'pineapple', label: 'PI', color: '#fbbf24' },
      { id: 'watermelon', label: 'WA', color: '#4ade80' },
      { id: 'goldapple', label: 'GA', color: '#f4c430' },
      { id: 'scatter', label: 'S', color: '#f472b6' },
      { id: 'bomb', label: 'B', color: '#f97316' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #14532d 0%, #052e16 55%, #01140a 100%)',
      reelBg: 'rgba(5, 40, 20, 0.85)',
      accentColor: '#4ade80',
      accentColor2: '#bbf7d0',
      frameColor: '#166534',
      music: 'festive',
      storageKey: 'forge_fruit_frenzy',
      assets: assetBlock('fruit-frenzy', ids),
    },
  });
}


/** Night carnival on the savanna — jackpot beasts. */
export function megaSavanna(): GameManifest {
  const ids = ['paw', 'tusk', 'maskgnu', 'giraffe', 'hippo', 'buffalo', 'elephant', 'lionking', 'scatter', 'bomb'];
  return reskin(sugarRealm(), {
    gameId: 'mega-moolah',
    gameName: 'Mega Savanna',
    tagline: 'Gece savanında dev kazanç sürüsü',
    skins: [
      { id: 'paw', label: 'PA', color: '#d6c391' },
      { id: 'tusk', label: 'TU', color: '#e4e4e7' },
      { id: 'maskgnu', label: 'GN', color: '#a1a1aa' },
      { id: 'giraffe', label: 'GI', color: '#fbbf24' },
      { id: 'hippo', label: 'HI', color: '#c084fc' },
      { id: 'buffalo', label: 'BU', color: '#fb923c' },
      { id: 'elephant', label: 'EL', color: '#60a5fa' },
      { id: 'lionking', label: 'LK', color: '#f59e0b' },
      { id: 'scatter', label: 'S', color: '#fde047' },
      { id: 'bomb', label: 'B', color: '#f97316' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #4a2500 0%, #241100 55%, #0d0600 100%)',
      reelBg: 'rgba(38, 19, 0, 0.85)',
      accentColor: '#f97316',
      accentColor2: '#fed7aa',
      frameColor: '#7c3a12',
      music: 'festive',
      storageKey: 'forge_mega_moolah',
      assets: assetBlock('mega-moolah', ids),
    },
  });
}


/** Frost dragon hoard — icy jade cluster pays. */
export function dragonFortune(): GameManifest {
  const ids = ['snowflake', 'icecoin', 'jadeleaf', 'frostgem', 'silverbell', 'foxspirit', 'icetiger', 'frostdragon', 'scatter', 'bomb'];
  return reskin(sugarRealm(), {
    gameId: 'dragon-fortune',
    gameName: 'Dragon Fortune',
    tagline: 'Buz ejderinin hazinesinde zincirleme donmalar',
    skins: [
      { id: 'snowflake', label: 'SN', color: '#a5f3fc' },
      { id: 'icecoin', label: 'IC', color: '#e4e4e7' },
      { id: 'jadeleaf', label: 'JL', color: '#4ade80' },
      { id: 'frostgem', label: 'FG', color: '#60a5fa' },
      { id: 'silverbell', label: 'SB', color: '#c4b5fd' },
      { id: 'foxspirit', label: 'FX', color: '#f0abfc' },
      { id: 'icetiger', label: 'IT', color: '#93c5fd' },
      { id: 'frostdragon', label: 'FD', color: '#22d3ee' },
      { id: 'scatter', label: 'S', color: '#fde047' },
      { id: 'bomb', label: 'B', color: '#f97316' },
    ],
    theme: {
      bgGradient: 'radial-gradient(ellipse at top, #164e63 0%, #082f3d 55%, #02141a 100%)',
      reelBg: 'rgba(4, 34, 44, 0.85)',
      accentColor: '#22d3ee',
      accentColor2: '#cffafe',
      frameColor: '#155e75',
      music: 'mystic',
      storageKey: 'forge_dragon_fortune',
      assets: assetBlock('dragon-fortune', ids),
    },
  });
}

export const CATALOG = [
  luckySevens,
  goldenVault,
  olympusStrikes,
  pharaohsTreasure,
  fruitFrenzy,
  megaSavanna,
  dragonFortune,
  pyramidQuest,
  tomeOfAnubis,
  dragonsFortune,
  solarWilds,
  starPrism,
  crystalCaverns,
];
