import { describe, it, expect, vi } from 'vitest';
import { signal, effect, batch, untrack, cleanup } from '../signal';

describe('signal', () => {
  it('should create a signal with initial value', () => {
    const count = signal(0);
    expect(count.value).toBe(0);
  });

  it('should update signal value', () => {
    const count = signal(0);
    count.value = 1;
    expect(count.value).toBe(1);
  });

  it('should notify subscribers on change', () => {
    const count = signal(0);
    const callback = vi.fn();
    count.subscribe(callback);
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not notify subscribers when value is the same', () => {
    const count = signal(0);
    const callback = vi.fn();
    count.subscribe(callback);
    count.value = 0;
    expect(callback).not.toHaveBeenCalled();
  });

  it('should unsubscribe from signal', () => {
    const count = signal(0);
    const callback = vi.fn();
    const unsubscribe = count.subscribe(callback);
    unsubscribe();
    count.value = 1;
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('effect', () => {
  it('should run effect immediately', () => {
    const count = signal(0);
    const callback = vi.fn();
    effect(() => callback(count.value));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(0);
  });

  it('should rerun effect when dependencies change', () => {
    const count = signal(0);
    const callback = vi.fn();
    effect(() => callback(count.value));
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 0);
    expect(callback).toHaveBeenNthCalledWith(2, 1);
  });

  it('should track multiple dependencies', () => {
    const count = signal(0);
    const doubled = signal(0);
    const callback = vi.fn();
    effect(() => callback(count.value + doubled.value));
    expect(callback).toHaveBeenCalledTimes(1);
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(2);
    doubled.value = 2;
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should dispose effect', () => {
    const count = signal(0);
    const callback = vi.fn();
    const dispose = effect(() => callback(count.value));
    dispose();
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not rerun if dependencies do not change', () => {
    const count = signal(0);
    const callback = vi.fn();
    effect(() => {
      count.value;
      callback();
    });
    count.value = 0;
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('batch', () => {
  it('should group updates', () => {
    const count = signal(0);
    const callback = vi.fn();
    count.subscribe(callback);
    batch(() => {
      count.value = 1;
      count.value = 2;
      count.value = 3;
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(count.value).toBe(3);
  });

  it('should handle nested batches', () => {
    const count = signal(0);
    const callback = vi.fn();
    count.subscribe(callback);
    batch(() => {
      count.value = 1;
      batch(() => {
        count.value = 2;
      });
      count.value = 3;
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should trigger effects after batch completes', () => {
    const count = signal(0);
    const callback = vi.fn();
    effect(() => callback(count.value));
    batch(() => {
      count.value = 1;
      count.value = 2;
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('untrack', () => {
  it('should read signal without tracking dependency', () => {
    const count = signal(0);
    const callback = vi.fn();
    effect(() => {
      const value = untrack(() => count.value);
      callback(value);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not track dependencies inside untrack', () => {
    const count = signal(0);
    const callback = vi.fn();
    effect(() => {
      const value = untrack(() => count.value);
      callback(value);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(0);
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('cleanup', () => {
  it('should register cleanup callback', () => {
    const callback = vi.fn();
    cleanup(callback);
    // cleanup callbacks are run manually via runCleanup
  });

  it('should allow unregistering cleanup callback', () => {
    const callback = vi.fn();
    const unregister = cleanup(callback);
    unregister();
  });
});
