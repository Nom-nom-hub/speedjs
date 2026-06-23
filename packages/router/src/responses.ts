export class Redirect extends Response {
  constructor(url: string, init: ResponseInit = {}) {
    super('', { ...init, status: 302, headers: { ...init.headers, Location: url } });
  }
}

export function redirect(url: string, init?: ResponseInit): Redirect {
  return new Redirect(url, init);
}

export class NotFound extends Response {
  constructor(init: ResponseInit = {}) {
    super('Not Found', { ...init, status: 404 });
  }
}

export function notFound(init?: ResponseInit): NotFound {
  return new NotFound(init);
}
