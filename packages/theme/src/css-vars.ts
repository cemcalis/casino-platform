import { neonPalaceColors } from './tokens/colors';
import { motion } from './tokens/motion';
import { spacing } from './tokens/spacing';

type CssVarMap = Record<string, string>;

export function generateColorVars(): CssVarMap {
  return {
    '--np-bg-deep': neonPalaceColors.bg.deep,
    '--np-bg-medium': neonPalaceColors.bg.medium,
    '--np-bg-surface': neonPalaceColors.bg.surface,
    '--np-bg-elevated': neonPalaceColors.bg.elevated,
    '--np-bg-overlay': neonPalaceColors.bg.overlay,
    '--np-border-subtle': neonPalaceColors.border.subtle,
    '--np-border-default': neonPalaceColors.border.default,
    '--np-border-focus': neonPalaceColors.border.focus,
    '--np-gold': neonPalaceColors.gold['500'],
    '--np-gold-600': neonPalaceColors.gold['600'],
    '--np-gold-glow': neonPalaceColors.gold.glow,
    '--np-teal': neonPalaceColors.teal['500'],
    '--np-teal-600': neonPalaceColors.teal['600'],
    '--np-teal-glow': neonPalaceColors.teal.glow,
    '--np-magenta': neonPalaceColors.magenta['500'],
    '--np-text-primary': neonPalaceColors.text.primary,
    '--np-text-secondary': neonPalaceColors.text.secondary,
    '--np-text-muted': neonPalaceColors.text.muted,
    '--np-text-disabled': neonPalaceColors.text.disabled,
    '--np-win-gold': neonPalaceColors.win.gold,
    '--np-win-jackpot': neonPalaceColors.win.jackpot,
    '--np-win-small': neonPalaceColors.win.small,
    '--np-win-glow': neonPalaceColors.win.glow,
  };
}

export function generateMotionVars(): CssVarMap {
  return {
    '--np-duration-instant': `${motion.duration.instant}ms`,
    '--np-duration-fast': `${motion.duration.fast}ms`,
    '--np-duration-medium': `${motion.duration.medium}ms`,
    '--np-duration-slow': `${motion.duration.slow}ms`,
    '--np-duration-celebration': `${motion.duration.celebration}ms`,
    '--np-easing-standard': motion.easing.standard,
    '--np-easing-enter': motion.easing.enter,
    '--np-easing-exit': motion.easing.exit,
    '--np-easing-bounce': motion.easing.bounce,
    '--np-easing-spring': motion.easing.spring,
  };
}

export function generateSpacingVars(): CssVarMap {
  return Object.fromEntries(
    Object.entries(spacing).map(([k, v]) => [`--np-space-${k}`, v]),
  );
}

export function generateAllVars(): CssVarMap {
  return {
    ...generateColorVars(),
    ...generateMotionVars(),
    ...generateSpacingVars(),
  };
}

export function toCssString(vars: CssVarMap): string {
  const entries = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${entries}\n}`;
}
