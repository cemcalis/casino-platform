import { StateMachine } from '@casino/engine';
import type { Transition } from '@casino/engine';
import type { SlotState, SlotEvent } from './types';

const TRANSITIONS: ReadonlyArray<Transition<SlotState, SlotEvent>> = [
  // Normal spin flow
  { from: 'IDLE',         on: 'PLACE_BET',          to: 'BETTING' },
  { from: 'BETTING',      on: 'SPIN',                to: 'SPINNING' },
  { from: 'SPINNING',     on: 'RESOLVE',             to: 'EVALUATING' },
  { from: 'EVALUATING',   on: 'COLLECT',             to: 'PAYING_OUT' },
  { from: 'PAYING_OUT',   on: 'RESET',               to: 'IDLE' },

  // Free spin path
  { from: 'IDLE',                  on: 'SPIN',               to: 'FREE_SPIN' },
  { from: 'EVALUATING',            on: 'TRIGGER_FREE_SPINS', to: 'AWARDING_FREE_SPINS' },
  { from: 'PAYING_OUT',            on: 'TRIGGER_FREE_SPINS', to: 'AWARDING_FREE_SPINS' },
  { from: 'AWARDING_FREE_SPINS',   on: 'SPIN',               to: 'FREE_SPIN' },
  { from: 'FREE_SPIN',             on: 'RESOLVE',            to: 'EVALUATING' },
  { from: 'FREE_SPIN',             on: 'END_FREE_SPINS',     to: 'PAYING_OUT' },

  // Bonus path
  { from: 'EVALUATING', on: 'TRIGGER_BONUS', to: 'BONUS' },
  { from: 'PAYING_OUT', on: 'TRIGGER_BONUS', to: 'BONUS' },
  { from: 'BONUS',      on: 'END_BONUS',     to: 'PAYING_OUT' },

  // Error + recovery
  { from: '*', on: 'ERROR', to: 'ERROR' },
  { from: 'ERROR', on: 'RESET', to: 'IDLE' },
  { from: 'PAYING_OUT', on: 'RESET', to: 'IDLE' },
];

export function createSlotStateMachine(): StateMachine<SlotState, SlotEvent> {
  return new StateMachine<SlotState, SlotEvent>({
    initial: 'IDLE',
    transitions: TRANSITIONS,
  });
}
