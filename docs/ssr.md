# Server-Side Rendering

Speed.js supports server-side rendering (SSR) out of the box.

## What is SSR?

Server-side rendering generates HTML on the server and sends it to the client. This improves:
- First Contentful Paint (FCP)
- Search engine optimization (SEO)
- Initial page load performance

## Basic SSR

```tsx
import { renderToString } from '@speedjs/server';
import { createServer } from '@speedjs/server';

function App() {
  return <div>Hello World</div>;
}

createServer(async (context) => {
  const html = renderToString(<App />);
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
});
```

## Streaming

Speed.js supports streaming for faster time-to-first-byte:

```tsx
import { renderToStream } from '@speedjs/server';

createServer(async (context) => {
  const stream = renderToStream(<App />);
  return new Response(stream, {
    headers: { 'Content-Type': 'text/html' },
  });
});
```

## SSR with Data Loading

```tsx
import { renderToString } from '@speedjs/server';
import { signal } from '@speedjs/core';

async function loadData() {
  const response = await fetch('/api/data');
  return response.json();
}

async function handler(context) {
  const data = await loadData();
  const dataSignal = signal(data);

  const html = renderToString(
    <div>
      <h1>Data: {dataSignal}</h1>
    </div>
  );

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

## Hydration

Hydration attaches event handlers to server-rendered HTML:

```tsx
import { mount } from '@speedjs/dom';
import { signal } from '@speedjs/core';

// Server
const serverHtml = renderToString(<Counter />);

// Client
function Counter() {
  const count = signal(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}

mount(Counter, document.getElementById('app')!);
```

## Static Generation

Generate static HTML at build time:

```tsx
// build script
import { renderToString } from '@speedjs/server';
import { writeFileSync } from 'fs';
import { glob } from 'glob';

const routes = await glob('src/routes/**/*.tsx');

for (const route of routes) {
  const component = await import(route);
  const html = renderToString(component.default());
  const outputPath = route.replace('src/routes', 'dist').replace('.tsx', '.html');
  writeFileSync(outputPath, html);
}
```

## SSR with Layouts

```tsx
function Layout({ children }: { children: any }) {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <nav>Navigation</nav>
        {children}
        <footer>Footer</footer>
      </body>
    </html>
  );
}

const html = renderToString(
  <Layout>
    <Page />
  </Layout>
);
```

## Best Practices

- Use SSR for public-facing pages
- Stream large pages for better performance
- Preload critical resources
- Opt for static generation when possible
- Handle hydration mismatches
- Keep SSR code synchronous where possible
- Use caching for expensive operations

## Comparison with Client-Side Rendering

| SSR | CSR |
|-----|-----|
| Faster initial load | Slower initial load |
| Better SEO | Poor SEO |
| Requires server | Works without server |
| More complex setup | Simpler setup |
| Better on slow networks | Worse on slow networks |
