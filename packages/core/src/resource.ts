import { signal, Signal, effect } from './signal';

export type ResourceState<T, E = Error> =
  | { status: 'pending' }
  | { status: 'success'; value: T }
  | { status: 'error'; error: E };

export interface Resource<T, E = Error> {
  state: Signal<ResourceState<T, E>>;
  read(): T;
  refresh(): Promise<void>;
}

export function resource<T, E = Error>(
  asyncFn: () => Promise<T>
): Resource<T, E> {
  const state = signal<ResourceState<T, E>>({ status: 'pending' });
  let lastPromise: Promise<T> | null = null;

  async function load(): Promise<void> {
    state.value = { status: 'pending' };
    try {
      const promise = asyncFn();
      lastPromise = promise;
      const value = await promise;
      if (promise === lastPromise) {
        state.value = { status: 'success', value };
      }
    } catch (error) {
      if (lastPromise !== null) {
        state.value = { status: 'error', error: error as E };
      }
    }
  }

  // Load on mount
  load();

  return {
    state,
    read(): T {
      const currentState = state.value;
      if (currentState.status === 'success') {
        return currentState.value;
      }
      if (currentState.status === 'error') {
        throw currentState.error;
      }
      throw new Promise((resolve) => {
        effect(() => {
          const s = state.value;
          if (s.status === 'success') {
            resolve(s.value);
          } else if (s.status === 'error') {
            resolve(s.error);
          }
        });
      });
    },
    refresh(): Promise<void> {
      return load();
    },
  };
}
