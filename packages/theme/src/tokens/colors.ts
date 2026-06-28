export const neonPalaceColors = {
  bg: {
    deep: '#0d0618',
    medium: '#1a0a2e',
    surface: '#251240',
    elevated: '#2f1855',
    overlay: 'rgba(13, 6, 24, 0.85)',
  },
  border: {
    subtle: '#3d1f6e',
    default: '#5c3192',
    focus: '#9b59f5',
  },
  gold: {
    '50': '#fffbeb',
    '100': '#fef3c7',
    '200': '#fde68a',
    '300': '#fcd34d',
    '400': '#fbbf24',
    '500': '#f4c430',
    '600': '#d97706',
    '700': '#b45309',
    glow: 'rgba(244, 196, 48, 0.4)',
    glow_strong: 'rgba(244, 196, 48, 0.7)',
  },
  teal: {
    '50': '#ecfffe',
    '100': '#ccfffe',
    '200': '#99f9f8',
    '300': '#66f0ef',
    '400': '#22e0de',
    '500': '#00d4c8',
    '600': '#009b91',
    glow: 'rgba(0, 212, 200, 0.35)',
    glow_strong: 'rgba(0, 212, 200, 0.6)',
  },
  magenta: {
    '500': '#ff2d78',
    '600': '#e0155a',
    glow: 'rgba(255, 45, 120, 0.4)',
  },
  win: {
    gold: '#ffd700',
    jackpot: '#ff8c00',
    small: '#4ade80',
    glow: 'rgba(255, 215, 0, 0.5)',
  },
  text: {
    primary: '#f0e8ff',
    secondary: '#9b8ab8',
    muted: '#6b5d8a',
    disabled: '#4a3870',
    inverse: '#0d0618',
    gold: '#f4c430',
    teal: '#00d4c8',
  },
} as const;

export type NeonPalaceColors = typeof neonPalaceColors;
