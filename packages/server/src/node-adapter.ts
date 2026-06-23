import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'http';
import { ApiRoute, Middleware, RequestContext } from './api';

export interface ServerOptions {
  port?: number;
  hostname?: string;
  middleware?: Middleware[];
}

export function createServer(
  handler: (request: RequestContext) => Promise<Response>,
  options: ServerOptions = {}
): void {
  const { port = 3000, hostname = '127.0.0.1', middleware = [] } = options;

  const server = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const request = new Request(url.toString(), {
        method: req.method || 'GET',
        headers: req.headers as HeadersInit,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? createReadableStream(req) : null,
      });

      let context: RequestContext = { request, url, params: {}, cookies: {} };

      // Run middleware
      let response: Response | null = null;
      for (const mw of middleware) {
        response = await mw(request, async () => {
          return handler(context);
        });
        if (response) break;
      }

      if (!response) {
        response = await handler(context);
      }

      await sendResponse(res, response);
    } catch (error) {
      console.error('Server error:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
  });
}

function createReadableStream(req: IncomingMessage): ReadableStream {
  return new ReadableStream({
    start(controller) {
      req.on('data', (chunk) => controller.enqueue(chunk));
      req.on('end', () => controller.close());
      req.on('error', (err) => controller.error(err));
    },
  });
}

async function sendResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;

  // Set headers
  response.headers.forEach((value, name) => {
    res.setHeader(name, value);
  });

  // Send body
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }

  res.end();
}

export function createApiHandler(routes: ApiRoute): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const method = request.method;

    if (method && method in routes) {
      const handler = routes[method as keyof ApiRoute];
      if (handler) {
        return handler(request);
      }
    }

    return new Response('Method Not Allowed', { status: 405 });
  };
}
