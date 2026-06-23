import { Route, Match } from './types';

export function matchRoute(routes: Route[], pathname: string): Match | null {
  for (const route of routes) {
    const match = matchSingleRoute(route, pathname);
    if (match) {
      return match;
    }
  }
  return null;
}

function matchSingleRoute(route: Route, pathname: string): Match | null {
  const segments = route.path.split('/').filter(Boolean);
  const pathSegments = pathname.split('/').filter(Boolean);

  // Check for exact match or with children
  const params: Record<string, string> = {};
  let matched = true;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const pathSegment = pathSegments[i];

    if (!pathSegment) {
      matched = false;
      break;
    }

    if (segment.startsWith('[') && segment.endsWith(']')) {
      // Dynamic segment
      const paramName = segment.slice(1, -1);
      if (paramName.startsWith('...')) {
        // Catch-all route
        const catchAllName = paramName.slice(3);
        params[catchAllName] = pathSegments.slice(i).join('/');
        return { route, params };
      }
      params[paramName] = pathSegment;
    } else if (segment !== pathSegment) {
      matched = false;
      break;
    }
  }

  if (!matched) return null;

  // Check if exact match or check children
  if (segments.length === pathSegments.length) {
    return { route, params };
  }

  // Check children
  if (route.children) {
    const remainingPath = '/' + pathSegments.slice(segments.length).join('/');
    const childMatch = matchRoute(route.children, remainingPath);
    if (childMatch) {
      return { route, params: { ...params, ...childMatch.params } };
    }
  }

  return null;
}

export function generatePath(route: Route, params: Record<string, string> = {}): string {
  let path = route.path;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`[${key}]`, value).replace(`[...${key}]`, value);
  }
  return path;
}
