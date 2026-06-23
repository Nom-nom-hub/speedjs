export interface Signal<T> {
  value: T;
  subscribe(callback: () => void): () => void;
  unsubscribe(callback: () => void): void;
}

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<() => void>();

  return {
    get value(): T {
      if (currentEffect) {
        currentEffect.track(this);
      }
      return value;
    },
    set value(newValue: T) {
      if (value !== newValue) {
        value = newValue;
        notify();
      }
    },
    subscribe(callback: () => void): () => void {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    unsubscribe(callback: () => void): void {
      subscribers.delete(callback);
    },
  };

  function notify(): void {
    if (batchDepth.value > 0) {
      pendingUpdates.add(notify);
      return;
    }

    for (const callback of Array.from(subscribers)) {
      callback();
    }
  }
}

// Effect tracking
let currentEffect: Effect | null = null;
const batchDepth = { value: 0 };
const pendingUpdates = new Set<() => void>();

class Effect {
  private fn: () => void;
  private dependencies = new Set<Signal<any>>();
  private disposed = false;
  private execute: () => void;

  constructor(fn: () => void) {
    this.fn = fn;
    this.execute = this.run.bind(this);
    this.run();
  }

  run(): void {
    if (this.disposed) return;

    const prevEffect = currentEffect;
    currentEffect = this;

    // Unsubscribe from old dependencies
    for (const dep of this.dependencies) {
      dep.unsubscribe(this.execute);
    }
    this.dependencies.clear();

    try {
      this.fn();
    } finally {
      currentEffect = prevEffect;
    }
  }

  track(signal: Signal<any>): void {
    if (!this.dependencies.has(signal)) {
      this.dependencies.add(signal);
      signal.subscribe(this.execute);
    }
  }

  dispose(): void {
    this.disposed = true;
    for (const dep of this.dependencies) {
      dep.unsubscribe(this.execute);
    }
    this.dependencies.clear();
  }
}

export function effect(fn: () => void): () => void {
  const e = new Effect(fn);
  return () => e.dispose();
}

export function batch<T>(fn: () => T): T {
  batchDepth.value++;
  try {
    return fn();
  } finally {
    batchDepth.value--;
    if (batchDepth.value === 0) {
      const updates = Array.from(pendingUpdates);
      pendingUpdates.clear();
      for (const update of updates) {
        update();
      }
    }
  }
}

export function untrack<T>(fn: () => T): T {
  const prevEffect = currentEffect;
  currentEffect = null;
  try {
    return fn();
  } finally {
    currentEffect = prevEffect;
  }
}

// Cleanup registry
const cleanupCallbacks = new Set<() => void>();

export function cleanup(fn: () => void): () => void {
  cleanupCallbacks.add(fn);
  return () => cleanupCallbacks.delete(fn);
}

export function runCleanup(): void {
  for (const fn of cleanupCallbacks) {
    fn();
  }
  cleanupCallbacks.clear();
}
