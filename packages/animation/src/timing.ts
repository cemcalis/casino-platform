import type { EasingName, TransitionSpec } from './types';

export const EASING: Record<EasingName, string> = {
  'linear':           'linear',
  'ease-in':          'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out':         'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out':      'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-out-bounce':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-out-elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'ease-in-back':     'cubic-bezier(0.36, 0, 0.66, -0.56)',
  'ease-out-back':    'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const DURATION = {
  instant:    0,
  ultraFast:  80,
  fast:       150,
  normal:     300,
  slow:       500,
  slower:     800,
  slowest:    1200,
  celebration: 2000,
} as const;

export type DurationName = keyof typeof DURATION;

export function makeTransitionSpec(
  durationMs: number,
  easing: EasingName = 'ease-out',
  delayMs = 0,
): TransitionSpec {
  return { durationMs, easing, delayMs };
}

export function scaleDuration(spec: TransitionSpec, factor: number): TransitionSpec {
  return { ...spec, durationMs: Math.round(spec.durationMs * factor), delayMs: Math.round(spec.delayMs * factor) };
}

export function toReducedMotionSpec(spec: TransitionSpec): TransitionSpec {
  return { durationMs: 1, easing: 'linear', delayMs: 0 };
}

export function toCssTransition(spec: TransitionSpec, property = 'all'): string {
  return `${property} ${spec.durationMs}ms ${EASING[spec.easing]} ${spec.delayMs}ms`;
}
