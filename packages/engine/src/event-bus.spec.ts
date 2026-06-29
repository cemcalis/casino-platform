import { describe, it, expect, vi } from 'vitest';
import { TypedEventBus } from './event-bus';

interface TestEvents {
  bet: { amount: number };
  spin: { reel: number };
  win: { payout: number };
}

describe('TypedEventBus', () => {
  it('delivers events to registered listeners', () => {
    const bus = new TypedEventBus<TestEvents>();
    const fn = vi.fn();
    bus.on('bet', fn);
    bus.emit('bet', { amount: 100 });
    expect(fn).toHaveBeenCalledWith({ amount: 100 });
  });

  it('returns an unsubscribe function that stops delivery', () => {
    const bus = new TypedEventBus<TestEvents>();
    const fn = vi.fn();
    const unsub = bus.on('win', fn);
    unsub();
    bus.emit('win', { payout: 500 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('once() fires exactly one time', () => {
    const bus = new TypedEventBus<TestEvents>();
    const fn = vi.fn();
    bus.once('spin', fn);
    bus.emit('spin', { reel: 1 });
    bus.emit('spin', { reel: 2 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ reel: 1 });
  });

  it('off() removes a specific listener', () => {
    const bus = new TypedEventBus<TestEvents>();
    const fn = vi.fn();
    bus.on('bet', fn);
    bus.off('bet', fn);
    bus.emit('bet', { amount: 50 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('clear() removes all listeners', () => {
    const bus = new TypedEventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('bet', a);
    bus.on('win', b);
    bus.clear();
    bus.emit('bet', { amount: 1 });
    bus.emit('win', { payout: 1 });
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('supports multiple listeners for the same event', () => {
    const bus = new TypedEventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('spin', a);
    bus.on('spin', b);
    bus.emit('spin', { reel: 3 });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
