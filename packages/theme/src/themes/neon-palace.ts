import { neonPalaceColors } from '../tokens/colors';
import { motion } from '../tokens/motion';
import { shadows } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export const NeonPalaceTheme = {
  name: 'NEON PALACE',
  colors: neonPalaceColors,
  motion,
  shadows,
  spacing,
  typography,
} as const;

export type NeonPalaceTheme = typeof NeonPalaceTheme;
