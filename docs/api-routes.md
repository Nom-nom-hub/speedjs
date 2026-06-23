# API Routes

API routes allow you to create backend endpoints in your Speed.js app.

## Creating API Routes

API routes live in the `src/routes/api` directory:

```
src/routes/api/
├── health.ts      -> /api/health
├── users/
│   ├── index.ts   -> /api/users
│   └── [id].ts    -> /api/users/:id
```

## Basic API Route

```tsx
// src/routes/api/health.ts
export function GET() {
  return Response.json({ ok: true, status: 'healthy' });
}
```

## HTTP Methods

Export named functions for each HTTP method:

```tsx
// src/routes/api/users/index.ts
export async function GET() {
  const users = await db.users.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create(body);
  return Response.json(user, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const user = await db.users.update(body);
  return Response.json(user);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  await db.users.delete(id);
  return new Response(null, { status: 204 });
}
```

## Request Context

Access request details:

```tsx
export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const headers = request.headers;

  return Response.json({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(headers),
  });
}
```

## Dynamic API Routes

```tsx
// src/routes/api/users/[id].ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await db.users.findById(params.id);
  if (!user) {
    return new Response('User not found', { status: 404 });
  }
  return Response.json(user);
}
```

## JSON Responses

```tsx
import { json } from '@speedjs/server';

export async function GET() {
  return json({ message: 'Hello' }, { status: 200 });
}
```

## Error Handling

```tsx
export async function GET() {
  try {
    const data = await fetchData();
    return json(data);
  } catch (error) {
    return json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

## Redirects

```tsx
import { redirect } from '@speedjs/server';

export async function POST(request: Request) {
  // Process data...
  return redirect('/success');
}
```

## Cookies

```tsx
import { setCookie } from '@speedjs/server';

export async function POST(request: Request) {
  const response = json({ success: true });
  response.headers.set(
    'Set-Cookie',
    setCookie('session', 'abc123', { httpOnly: true, secure: true })
  );
  return response;
}
```

## Middleware

Middleware runs before your route handler:

```tsx
// middleware.ts
export async function middleware(request: Request, next: () => Promise<Response>) {
  // Add custom headers
  const response = await next();
  response.headers.set('X-Custom-Header', 'value');
  return response;
}

// Use in server config
import { createServer } from '@speedjs/server';
import { middleware } from './middleware';

createServer(
  (context) => handler(context),
  { middleware: [middleware] }
);
```

## Best Practices

- Use appropriate HTTP methods
- Validate input data
- Handle errors gracefully
- Use JSON responses for APIs
- Secure sensitive endpoints
- Set appropriate status codes
- Use cookies for authentication
- Implement rate limiting for production
