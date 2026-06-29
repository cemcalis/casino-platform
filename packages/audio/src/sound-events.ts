import { soundEventId } from './types';
import type { SoundEvent } from './types';

function sfx(id: string, label: string, priority = 5): SoundEvent {
  return { id: soundEventId(id), channel: 'SFX', label, loop: false, priority };
}

function music(id: string, label: string): SoundEvent {
  return { id: soundEventId(id), channel: 'MUSIC', label, loop: true, priority: 1 };
}

function ambient(id: string, label: string): SoundEvent {
  return { id: soundEventId(id), channel: 'AMBIENT', label, loop: true, priority: 2 };
}

export const NEON_PALACE_SOUNDS = {
  // Gameplay — reel events
  SPIN_START:      sfx('np:spin-start',      'Reel spin begins',          6),
  SPIN_TICK:       sfx('np:spin-tick',       'Reel tick per symbol',      4),
  SPIN_STOP_1:     sfx('np:spin-stop-1',     'Reel 1 stops',              5),
  SPIN_STOP_2:     sfx('np:spin-stop-2',     'Reel 2 stops',              5),
  SPIN_STOP_3:     sfx('np:spin-stop-3',     'Reel 3 stops',              5),

  // Win celebrations
  WIN_SMALL:       sfx('np:win-small',       'Small win chime',           7),
  WIN_MEDIUM:      sfx('np:win-medium',      'Medium win fanfare',        8),
  WIN_BIG:         sfx('np:win-big',         'Big win celebration',       9),
  WIN_JACKPOT:     sfx('np:win-jackpot',     'Jackpot explosion',        10),
  WIN_COINS:       sfx('np:win-coins',       'Coins cascading',           6),

  // UI interactions
  UI_CLICK:        sfx('np:ui-click',        'Button click',              3),
  UI_HOVER:        sfx('np:ui-hover',        'Button hover',              2),
  UI_OPEN:         sfx('np:ui-open',         'Panel opens',               3),
  UI_CLOSE:        sfx('np:ui-close',        'Panel closes',              3),
  UI_ERROR:        sfx('np:ui-error',        'Error feedback',            5),
  UI_SUCCESS:      sfx('np:ui-success',      'Success feedback',          5),

  // Bet panel
  BET_INCREASE:    sfx('np:bet-increase',    'Bet amount increased',      4),
  BET_DECREASE:    sfx('np:bet-decrease',    'Bet amount decreased',      4),
  BET_MAX:         sfx('np:bet-max',         'Max bet selected',          5),

  // Game events
  BONUS_TRIGGER:   sfx('np:bonus-trigger',   'Bonus round triggered',     9),
  SCATTER_LAND:    sfx('np:scatter-land',    'Scatter symbol lands',      7),
  WILD_LAND:       sfx('np:wild-land',       'Wild symbol lands',         6),
  ANTICIPATION:    sfx('np:anticipation',    'Near-win buildup',          6),
  COLLECT:         sfx('np:collect',         'Balance collected',         7),

  // Countup
  COUNTER_TICK:    sfx('np:counter-tick',    'Win counter increment',     4),
  COUNTER_END:     sfx('np:counter-end',     'Win counter finishes',      5),

  // Music tracks
  LOBBY_THEME:     music('np:music-lobby',   'Lobby ambient music'),
  GAME_THEME:      music('np:music-game',    'In-game background music'),
  WIN_THEME:       music('np:music-win',     'Big win musical sting'),

  // Ambient layers
  AMBIENT_CASINO:  ambient('np:ambient-casino',  'Casino floor atmosphere'),
  AMBIENT_MACHINE: ambient('np:ambient-machine', 'Machine hum'),
} as const satisfies Record<string, SoundEvent>;

export type NeonPalaceSoundKey = keyof typeof NEON_PALACE_SOUNDS;
