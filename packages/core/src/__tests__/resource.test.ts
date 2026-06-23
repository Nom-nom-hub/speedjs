import { describe, it, expect, vi } from 'vitest';
import { resource } from '../resource';

describe('resource', () => {
  it('should start in pending state', () => {
    const asyncFn = vi.fn(() => Promise.resolve(42));
    const res = resource(asyncFn);
    expect(res.state.value.status).toBe('pending');
  });

  it('should resolve to success state', async () => {
    const asyncFn = vi.fn(() => Promise.resolve(42));
    const res = resource(asyncFn);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(res.state.value.status).toBe('success');
    if (res.state.value.status === 'success') {
      expect(res.state.value.value).toBe(42);
    }
  });

  it('should handle errors', async () => {
    const asyncFn = vi.fn(() => Promise.reject(new Error('test error')));
    const res = resource(asyncFn);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(res.state.value.status).toBe('error');
    if (res.state.value.status === 'error') {
      expect(res.state.value.error.message).toBe('test error');
    }
  });

  it('should refresh resource', async () => {
    const asyncFn = vi.fn(() => Promise.resolve(42));
    const res = resource(asyncFn);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(asyncFn).toHaveBeenCalledTimes(1);
    await res.refresh();
    expect(asyncFn).toHaveBeenCalledTimes(2);
  });

  it('should read value when successful', async () => {
    const asyncFn = vi.fn(() => Promise.resolve(42));
    const res = resource(asyncFn);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(res.read()).toBe(42);
  });

  it('should throw when reading pending', () => {
    const asyncFn = vi.fn(() => new Promise(() => {}));
    const res = resource(asyncFn);
    expect(() => res.read()).toThrow();
  });
});
