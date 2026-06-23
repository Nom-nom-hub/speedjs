import { NavigateOptions } from './types';

let currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

export function navigate(path: string, options: NavigateOptions = {}): void {
  if (typeof window === 'undefined') return;

  if (options.replace) {
    window.history.replaceState(options.state, '', path);
  } else {
    window.history.pushState(options.state, '', path);
  }

  currentPath = path;
  dispatchEvent(new PopStateEvent('popstate', { state: options.state }));
}

export function getCurrentPath(): string {
  return currentPath;
}

export function useLocation() {
  return {
    pathname: currentPath,
    search: typeof window !== 'undefined' ? window.location.search : '',
  };
}
