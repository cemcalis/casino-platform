import type { EventListener, UnsubscribeFn } from './types';

// TEventMap is intentionally unconstrained — callers may use interface or type aliases
export class TypedEventBus<TEventMap> {
  private readonly listeners = new Map<keyof TEventMap, Set<EventListener<unknown>>>();

  on<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as EventListener<unknown>);
    return () => set.delete(listener as EventListener<unknown>);
  }

  once<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): UnsubscribeFn {
    const unsub = this.on(event, (payload) => {
      unsub();
      listener(payload);
    });
    return unsub;
  }

  emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }

  off<K extends keyof TEventMap>(event: K, listener: EventListener<TEventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as EventListener<unknown>);
  }

  clear(): void {
    this.listeners.clear();
  }
}
