import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioBus } from './audio-bus';
import { soundEventId } from './types';

describe('AudioBus', () => {
  let bus: AudioBus;

  beforeEach(() => {
    bus = new AudioBus();
  });

  it('delivers event to registered listener', () => {
    const fn = vi.fn();
    const id = soundEventId('np:spin-start');
    bus.on('sound:trigger', fn);
    bus.emit('sound:trigger', { eventId: id });
    expect(fn).toHaveBeenCalledWith({ eventId: id });
  });

  it('unsubscribe stops delivery', () => {
    const fn = vi.fn();
    const unsub = bus.on('sound:stop', fn);
    unsub();
    bus.emit('sound:stop', { eventId: soundEventId('np:spin-start') });
    expect(fn).not.toHaveBeenCalled();
  });

  it('once fires exactly one time', () => {
    const fn = vi.fn();
    const id = soundEventId('np:win-small');
    bus.once('sound:trigger', fn);
    bus.emit('sound:trigger', { eventId: id });
    bus.emit('sound:trigger', { eventId: id });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('off removes a specific listener', () => {
    const fn = vi.fn();
    bus.on('mute:master', fn);
    bus.off('mute:master', fn);
    bus.emit('mute:master', { muted: true });
    expect(fn).not.toHaveBeenCalled();
  });

  it('clear removes all listeners', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on('sound:trigger', fn1);
    bus.on('mute:master', fn2);
    bus.clear();
    bus.emit('sound:trigger', { eventId: soundEventId('x') });
    bus.emit('mute:master', { muted: true });
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });

  it('trigger() convenience emits sound:trigger', () => {
    const fn = vi.fn();
    const id = soundEventId('np:ui-click');
    bus.on('sound:trigger', fn);
    bus.trigger(id, 0.5);
    expect(fn).toHaveBeenCalledWith({ eventId: id, volumeOverride: 0.5 });
  });

  it('stop() convenience emits sound:stop', () => {
    const fn = vi.fn();
    const id = soundEventId('np:music-lobby');
    bus.on('sound:stop', fn);
    bus.stop(id);
    expect(fn).toHaveBeenCalledWith({ eventId: id });
  });

  it('stopChannel() emits sound:stop-all-channel', () => {
    const fn = vi.fn();
    bus.on('sound:stop-all-channel', fn);
    bus.stopChannel('MUSIC');
    expect(fn).toHaveBeenCalledWith({ channel: 'MUSIC' });
  });

  it('multiple listeners on same event all fire', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on('mute:master', fn1);
    bus.on('mute:master', fn2);
    bus.emit('mute:master', { muted: false });
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});
