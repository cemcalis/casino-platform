import type { AudioEventMap, AudioChannel, SoundEventId } from './types';

type Listener<T> = (payload: T) => void;
type UnsubFn = () => void;

export class AudioBus {
  private readonly listeners = new Map<keyof AudioEventMap, Set<Listener<unknown>>>();

  on<K extends keyof AudioEventMap>(event: K, listener: Listener<AudioEventMap[K]>): UnsubFn {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<unknown>);
    return () => set!.delete(listener as Listener<unknown>);
  }

  once<K extends keyof AudioEventMap>(event: K, listener: Listener<AudioEventMap[K]>): UnsubFn {
    const unsub = this.on(event, (payload) => {
      unsub();
      (listener as Listener<AudioEventMap[K]>)(payload);
    });
    return unsub;
  }

  emit<K extends keyof AudioEventMap>(event: K, payload: AudioEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) listener(payload);
  }

  off<K extends keyof AudioEventMap>(event: K, listener: Listener<AudioEventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown>);
  }

  clear(): void {
    this.listeners.clear();
  }

  trigger(eventId: SoundEventId, volumeOverride?: number): void {
    this.emit('sound:trigger', { eventId, volumeOverride });
  }

  stop(eventId: SoundEventId): void {
    this.emit('sound:stop', { eventId });
  }

  stopChannel(channel: AudioChannel): void {
    this.emit('sound:stop-all-channel', { channel });
  }
}
