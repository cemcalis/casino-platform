import type { ReducedMotionPolicy, TransitionSpec } from './types';
import { toReducedMotionSpec } from './timing';

export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyReducedMotionPolicy(
  spec: TransitionSpec,
  policy: ReducedMotionPolicy,
): TransitionSpec {
  switch (policy) {
    case 'NONE':
      return { durationMs: 0, easing: 'linear', delayMs: 0 };
    case 'REDUCED':
      return toReducedMotionSpec(spec);
    case 'FULL':
      return spec;
  }
}

export function policyFromPreference(prefersReduced: boolean): ReducedMotionPolicy {
  return prefersReduced ? 'REDUCED' : 'FULL';
}

export function scaleParticlesToPolicy(count: number, policy: ReducedMotionPolicy): number {
  switch (policy) {
    case 'NONE':    return 0;
    case 'REDUCED': return Math.max(1, Math.round(count * 0.25));
    case 'FULL':    return count;
  }
}
