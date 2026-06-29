import { describe, it, expect } from 'vitest';
import { StateMachine } from './state-machine';
import type { StateMachineConfig } from './state-machine';

type Phase = 'IDLE' | 'WAITING_FOR_BET' | 'PLAYING' | 'COMPLETE';
type Event = 'START' | 'PLACE_BET' | 'FINISH' | 'RESET';

const config: StateMachineConfig<Phase, Event> = {
  initial: 'IDLE',
  transitions: [
    { from: 'IDLE', on: 'START', to: 'WAITING_FOR_BET' },
    { from: 'WAITING_FOR_BET', on: 'PLACE_BET', to: 'PLAYING' },
    { from: 'PLAYING', on: 'FINISH', to: 'COMPLETE' },
    { from: '*', on: 'RESET', to: 'IDLE' },
  ],
};

describe('StateMachine', () => {
  it('starts in the initial state', () => {
    const sm = new StateMachine(config);
    expect(sm.state).toBe('IDLE');
  });

  it('transitions to the next state on a valid event', () => {
    const sm = new StateMachine(config);
    sm.send('START');
    expect(sm.state).toBe('WAITING_FOR_BET');
  });

  it('throws on an invalid transition', () => {
    const sm = new StateMachine(config);
    expect(() => sm.send('PLACE_BET')).toThrow("No transition from 'IDLE' on event 'PLACE_BET'");
  });

  it('can() returns true for valid transitions only', () => {
    const sm = new StateMachine(config);
    expect(sm.can('START')).toBe(true);
    expect(sm.can('PLACE_BET')).toBe(false);
  });

  it('wildcard from handles RESET from any state', () => {
    const sm = new StateMachine(config);
    sm.send('START');
    sm.send('PLACE_BET');
    sm.send('RESET');
    expect(sm.state).toBe('IDLE');
  });

  it('guard prevents transition when condition is false', () => {
    const cfg: StateMachineConfig<Phase, Event> = {
      initial: 'IDLE',
      transitions: [
        {
          from: 'IDLE',
          on: 'START',
          to: 'WAITING_FOR_BET',
          guard: () => false,
        },
      ],
    };
    const sm = new StateMachine(cfg);
    expect(sm.can('START')).toBe(false);
    expect(() => sm.send('START')).toThrow();
  });

  it('reset() forces state to the given value', () => {
    const sm = new StateMachine(config);
    sm.send('START');
    sm.reset('IDLE');
    expect(sm.state).toBe('IDLE');
  });
});
