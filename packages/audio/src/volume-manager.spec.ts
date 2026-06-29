import { describe, it, expect, beforeEach } from 'vitest';
import { VolumeManager } from './volume-manager';

describe('VolumeManager', () => {
  let vm: VolumeManager;

  beforeEach(() => {
    vm = new VolumeManager();
  });

  it('starts with sane defaults', () => {
    const state = vm.getState();
    expect(state.masterMuted).toBe(false);
    expect(state.masterVolume).toBe(1.0);
    expect(state.channels['SFX'].volume).toBe(0.8);
    expect(state.channels['MUSIC'].volume).toBe(0.6);
    expect(state.channels['AMBIENT'].volume).toBe(0.4);
  });

  it('clamps volume to [0, 1]', () => {
    vm.setChannelVolume('SFX', 1.5);
    expect(vm.getState().channels['SFX'].volume).toBe(1.0);
    vm.setChannelVolume('SFX', -0.5);
    expect(vm.getState().channels['SFX'].volume).toBe(0.0);
  });

  it('muting master returns zero effective volume for all channels', () => {
    vm.setMasterMuted(true);
    expect(vm.getEffectiveVolume('MUSIC')).toBe(0);
    expect(vm.getEffectiveVolume('SFX')).toBe(0);
    expect(vm.getEffectiveVolume('AMBIENT')).toBe(0);
  });

  it('muting a channel returns zero only for that channel', () => {
    vm.setChannelMuted('MUSIC', true);
    expect(vm.getEffectiveVolume('MUSIC')).toBe(0);
    expect(vm.getEffectiveVolume('SFX')).toBeGreaterThan(0);
  });

  it('effective volume multiplies master by channel', () => {
    vm.setMasterVolume(0.5);
    vm.setChannelVolume('SFX', 0.8);
    expect(vm.getEffectiveVolume('SFX')).toBeCloseTo(0.4);
  });

  it('reset restores defaults', () => {
    vm.setMasterVolume(0.1);
    vm.setMasterMuted(true);
    vm.setChannelVolume('SFX', 0.2);
    vm.reset();
    const state = vm.getState();
    expect(state.masterMuted).toBe(false);
    expect(state.masterVolume).toBe(1.0);
    expect(state.channels['SFX'].volume).toBe(0.8);
  });

  it('setMasterVolume reflected in state', () => {
    vm.setMasterVolume(0.7);
    expect(vm.getState().masterVolume).toBe(0.7);
  });

  it('channel muted flag reflected in state', () => {
    vm.setChannelMuted('AMBIENT', true);
    expect(vm.getState().channels['AMBIENT'].muted).toBe(true);
  });
});
