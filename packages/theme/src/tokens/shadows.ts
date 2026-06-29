export const shadows = {
  // Elevation — purple-tinted dark shadows for depth
  sm: '0 1px 3px rgba(13, 6, 24, 0.8), 0 1px 2px rgba(13, 6, 24, 0.6)',
  md: '0 4px 6px rgba(13, 6, 24, 0.7), 0 2px 4px rgba(13, 6, 24, 0.5)',
  lg: '0 10px 15px rgba(13, 6, 24, 0.6), 0 4px 6px rgba(13, 6, 24, 0.5)',
  xl: '0 20px 25px rgba(13, 6, 24, 0.7), 0 10px 10px rgba(13, 6, 24, 0.5)',
  '2xl': '0 25px 50px rgba(13, 6, 24, 0.8)',

  // Neon glow — NEON PALACE signature effects
  'glow-gold': [
    '0 0 8px rgba(244, 196, 48, 0.4)',
    '0 0 20px rgba(244, 196, 48, 0.4)',
    '0 0 40px rgba(244, 196, 48, 0.2)',
  ].join(', '),
  'glow-gold-strong': [
    '0 0 12px rgba(244, 196, 48, 0.7)',
    '0 0 30px rgba(244, 196, 48, 0.7)',
    '0 0 60px rgba(244, 196, 48, 0.3)',
  ].join(', '),
  'glow-teal': [
    '0 0 8px rgba(0, 212, 200, 0.35)',
    '0 0 20px rgba(0, 212, 200, 0.35)',
    '0 0 40px rgba(0, 212, 200, 0.15)',
  ].join(', '),
  'glow-teal-strong': [
    '0 0 12px rgba(0, 212, 200, 0.6)',
    '0 0 30px rgba(0, 212, 200, 0.6)',
  ].join(', '),
  'glow-win': [
    '0 0 15px rgba(255, 215, 0, 0.5)',
    '0 0 35px rgba(255, 215, 0, 0.5)',
    '0 0 70px rgba(255, 215, 0, 0.3)',
  ].join(', '),

  // Inner glow — for card surfaces
  'inner-gold': 'inset 0 0 20px rgba(244, 196, 48, 0.1)',
  'inner-teal': 'inset 0 0 20px rgba(0, 212, 200, 0.1)',
} as const;

export type Shadows = typeof shadows;
