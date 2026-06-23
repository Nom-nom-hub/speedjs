import { describe, it, expect, vi } from 'vitest';
import { signal } from '../signal';
import { computed } from '../computed';

describe('computed', () => {
  it('should compute value from signals', () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    expect(doubled.value).toBe(0);
  });

  it('should update when dependencies change', () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    count.value = 1;
    expect(doubled.value).toBe(2);
  });

  it('should only recompute when dependencies change', () => {
    const count = signal(0);
    const computeFn = vi.fn(() => count.value * 2);
    const doubled = computed(computeFn);
    expect(computeFn).toHaveBeenCalledTimes(1);
    doubled.value;
    expect(computeFn).toHaveBeenCalledTimes(1);
    count.value = 1;
    expect(computeFn).toHaveBeenCalledTimes(2);
  });

  it('should support multiple dependencies', () => {
    const a = signal(1);
    const b = signal(2);
    const sum = computed(() => a.value + b.value);
    expect(sum.value).toBe(3);
    a.value = 5;
    expect(sum.value).toBe(7);
    b.value = 3;
    expect(sum.value).toBe(8);
  });

  it('should notify subscribers', () => {
    const count = signal(0);
    const doubled = computed(() => count.value * 2);
    const callback = vi.fn();
    doubled.subscribe(callback);
    count.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
