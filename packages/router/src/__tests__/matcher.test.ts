import { describe, it, expect } from 'vitest';
import { matchRoute, generatePath } from '../matcher';
import type { Route } from '../types';

describe('Route Matcher', () => {
  it('should match static routes', () => {
    const routes: Route[] = [
      { id: 'home', path: '/', file: 'index.tsx' },
      { id: 'about', path: '/about', file: 'about.tsx' },
    ];

    const match = matchRoute(routes, '/about');
    expect(match).toBeTruthy();
    expect(match?.route.id).toBe('about');
  });

  it('should match dynamic routes', () => {
    const routes: Route[] = [
      { id: 'user', path: '/users/[id]', file: 'users/[id].tsx' },
    ];

    const match = matchRoute(routes, '/users/123');
    expect(match).toBeTruthy();
    expect(match?.params.id).toBe('123');
  });

  it('should match catch-all routes', () => {
    const routes: Route[] = [
      { id: 'docs', path: '/docs/[...slug]', file: 'docs/[...slug].tsx' },
    ];

    const match = matchRoute(routes, '/docs/getting-started/install');
    expect(match).toBeTruthy();
    expect(match?.params.slug).toBe('getting-started/install');
  });

  it('should match nested routes', () => {
    const routes: Route[] = [
      {
        id: 'dashboard',
        path: '/dashboard',
        file: 'dashboard.tsx',
        children: [
          { id: 'dashboard-settings', path: '/settings', file: 'dashboard/settings.tsx' },
        ],
      },
    ];

    const match = matchRoute(routes, '/dashboard/settings');
    expect(match).toBeTruthy();
    expect(match?.route.id).toBe('dashboard');
  });

  it('should return null for no match', () => {
    const routes: Route[] = [
      { id: 'home', path: '/', file: 'index.tsx' },
    ];

    const match = matchRoute(routes, '/nonexistent');
    expect(match).toBeNull();
  });

  it('should generate path from route', () => {
    const route: Route = { id: 'user', path: '/users/[id]', file: 'users/[id].tsx' };
    const path = generatePath(route, { id: '123' });
    expect(path).toBe('/users/123');
  });

  it('should generate path with catch-all', () => {
    const route: Route = { id: 'docs', path: '/docs/[...slug]', file: 'docs/[...slug].tsx' };
    const path = generatePath(route, { slug: 'a/b/c' });
    expect(path).toBe('/docs/a/b/c');
  });

  it('should prefer more specific routes', () => {
    const routes: Route[] = [
      { id: 'users', path: '/users', file: 'users.tsx' },
      { id: 'user', path: '/users/[id]', file: 'users/[id].tsx' },
    ];

    const match = matchRoute(routes, '/users');
    expect(match?.route.id).toBe('users');

    const matchWithId = matchRoute(routes, '/users/123');
    expect(matchWithId?.route.id).toBe('user');
  });

  it('should handle multiple dynamic segments', () => {
    const routes: Route[] = [
      { id: 'repo', path: '/[org]/[repo]', file: '[org]/[repo].tsx' },
    ];

    const match = matchRoute(routes, '/facebook/react');
    expect(match).toBeTruthy();
    expect(match?.params.org).toBe('facebook');
    expect(match?.params.repo).toBe('react');
  });

  it('should handle trailing slashes', () => {
    const routes: Route[] = [
      { id: 'home', path: '/', file: 'index.tsx' },
    ];

    const match = matchRoute(routes, '/');
    expect(match).toBeTruthy();
  });
});
