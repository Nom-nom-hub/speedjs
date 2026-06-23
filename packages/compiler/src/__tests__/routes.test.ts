import { describe, it, expect } from 'vitest';
import { filePathToRoutePath, generateRouteManifest } from '../routes';
import type { Route } from '@speedjs/router';

describe('Route Path Generation', () => {
  it('should convert index.tsx to /', () => {
    const path = filePathToRoutePath('index.tsx');
    expect(path).toBe('/');
  });

  it('should convert about.tsx to /about', () => {
    const path = filePathToRoutePath('about.tsx');
    expect(path).toBe('/about');
  });

  it('should convert users/[id].tsx to /users/:id', () => {
    const path = filePathToRoutePath('users/[id].tsx');
    expect(path).toBe('/users/:id');
  });

  it('should convert docs/[...slug].tsx to /docs/:slug*', () => {
    const path = filePathToRoutePath('docs/[...slug].tsx');
    expect(path).toBe('/docs/:slug*');
  });

  it('should convert users/index.tsx to /users', () => {
    const path = filePathToRoutePath('users/index.tsx');
    expect(path).toBe('/users');
  });

  it('should convert nested routes', () => {
    const path = filePathToRoutePath('dashboard/settings/index.tsx');
    expect(path).toBe('/dashboard/settings');
  });

  it('should handle nested dynamic routes', () => {
    const path = filePathToRoutePath('users/[id]/posts/[postId].tsx');
    expect(path).toBe('/users/:id/posts/:postId');
  });
});

describe('Route Manifest Generation', () => {
  it('should generate route manifest', () => {
    const routes: Route[] = [
      { id: 'index', path: '/', file: 'src/routes/index.tsx' },
      { id: 'about', path: '/about', file: 'src/routes/about.tsx' },
    ];

    const manifest = generateRouteManifest(routes);
    expect(manifest).toContain('RouteManifest');
    expect(manifest).toContain('index');
    expect(manifest).toContain('about');
  });
});
