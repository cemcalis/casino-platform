import { describe, it, expect } from 'vitest';
import { createSlotStateMachine } from './slot-state-machine';

describe('createSlotStateMachine', () => {
  it('starts in IDLE state', () => {
    const sm = createSlotStateMachine();
    expect(sm.state).toBe('IDLE');
  });

  it('IDLE → BETTING on PLACE_BET', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    expect(sm.state).toBe('BETTING');
  });

  it('BETTING → SPINNING on SPIN', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    expect(sm.state).toBe('SPINNING');
  });

  it('SPINNING → EVALUATING on RESOLVE', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    expect(sm.state).toBe('EVALUATING');
  });

  it('EVALUATING → PAYING_OUT on COLLECT', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('COLLECT');
    expect(sm.state).toBe('PAYING_OUT');
  });

  it('PAYING_OUT → IDLE on RESET', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('COLLECT');
    sm.send('RESET');
    expect(sm.state).toBe('IDLE');
  });

  it('EVALUATING → AWARDING_FREE_SPINS on TRIGGER_FREE_SPINS', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('TRIGGER_FREE_SPINS');
    expect(sm.state).toBe('AWARDING_FREE_SPINS');
  });

  it('AWARDING_FREE_SPINS → FREE_SPIN on SPIN', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('TRIGGER_FREE_SPINS');
    sm.send('SPIN');
    expect(sm.state).toBe('FREE_SPIN');
  });

  it('FREE_SPIN → EVALUATING on RESOLVE', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('TRIGGER_FREE_SPINS');
    sm.send('SPIN');
    sm.send('RESOLVE');
    expect(sm.state).toBe('EVALUATING');
  });

  it('EVALUATING → BONUS on TRIGGER_BONUS', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('TRIGGER_BONUS');
    expect(sm.state).toBe('BONUS');
  });

  it('BONUS → PAYING_OUT on END_BONUS', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.send('RESOLVE');
    sm.send('TRIGGER_BONUS');
    sm.send('END_BONUS');
    expect(sm.state).toBe('PAYING_OUT');
  });

  it('any state → ERROR on ERROR', () => {
    const sm = createSlotStateMachine();
    sm.send('ERROR');
    expect(sm.state).toBe('ERROR');
  });

  it('ERROR → IDLE on RESET', () => {
    const sm = createSlotStateMachine();
    sm.send('ERROR');
    sm.send('RESET');
    expect(sm.state).toBe('IDLE');
  });

  it('can() reports valid transitions', () => {
    const sm = createSlotStateMachine();
    expect(sm.can('PLACE_BET')).toBe(true);
    expect(sm.can('SPIN')).toBe(true);
    expect(sm.can('RESOLVE')).toBe(false);
  });

  it('throws on invalid transition', () => {
    const sm = createSlotStateMachine();
    expect(() => sm.send('RESOLVE')).toThrow();
  });

  it('reset() forces state to IDLE', () => {
    const sm = createSlotStateMachine();
    sm.send('PLACE_BET');
    sm.send('SPIN');
    sm.reset('IDLE');
    expect(sm.state).toBe('IDLE');
  });
});
