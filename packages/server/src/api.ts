export type ApiHandler = (request: Request) => Promise<Response> | Response;

export interface ApiRoute {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  PATCH?: ApiHandler;
  DELETE?: ApiHandler;
}

export type Middleware = (request: Request, next: () => Promise<Response>) => Promise<Response>;

export function createRequestContext(request: Request): RequestContext {
  const url = new URL(request.url);
  return {
    request,
    url,
    params: {},
    cookies: parseCookies(request.headers.get('cookie') || ''),
  };
}

export interface RequestContext {
  request: Request;
  url: URL;
  params: Record<string, string>;
  cookies: Record<string, string>;
}

export function json(data: any, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export function redirect(url: string, init: ResponseInit = {}): Response {
  return new Response(null, {
    ...init,
    status: 302,
    headers: {
      Location: url,
      ...init.headers,
    },
  });
}

export function notFound(): Response {
  return new Response('Not Found', { status: 404 });
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const cookie of cookieHeader.split(';')) {
    const [name, ...values] = cookie.trim().split('=');
    if (name) {
      cookies[name] = values.join('=');
    }
  }

  return cookies;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): string {
  let cookie = `${name}=${value}`;

  if (options.maxAge) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.secure) {
    cookie += '; Secure';
  }

  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  return cookie;
}

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}
