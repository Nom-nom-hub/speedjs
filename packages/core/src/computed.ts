import { signal, Signal, effect } from './signal';

export interface Computed<T> extends Signal<T> {
  readonly value: T;
}

export function computed<T>(fn: () => T): Computed<T> {
  const computedSignal = signal<T>(undefined as T);

  effect(() => {
    computedSignal.value = fn();
  });

  return {
    get value(): T {
      return computedSignal.value;
    },
    subscribe(callback: () => void): () => void {
      return computedSignal.subscribe(callback);
    },
    unsubscribe(callback: () => void): void {
      computedSignal.unsubscribe(callback);
    },
  };
}
