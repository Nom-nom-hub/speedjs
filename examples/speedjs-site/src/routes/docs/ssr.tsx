import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow } from '../../components/code-window'

export default function SSR(props: any) {
  return (
    <DocsLayout currentPath="/docs/ssr">
      <div class="section-label">Docs / SSR</div>
      <h1>Server-Side Rendering</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Speed.js supports server-side rendering out of the box, giving you fast initial page loads and SEO-friendly output.
      </p>

      <h2>renderToString</h2>
      <CodeWindow title="server.ts">{`import { renderToString } from '@speedjs/server'
import Home from './src/routes/index.tsx'

const html = await renderToString(<Home />)
// Returns fully rendered HTML`}</CodeWindow>

      <h2>renderToStream</h2>
      <CodeWindow title="streaming">{`import { renderToStream } from '@speedjs/server'
import Home from './src/routes/index.tsx'

const stream = await renderToStream(<Home />)
stream.pipe(res)`}</CodeWindow>

      <h2>Partial hydration</h2>
      <CodeWindow title="island">{`import { Island } from '@speedjs/core'

export default function Page() {
  return (
    <div>
      <p>Static content — no JS needed</p>
      <Island load={import('./counter.tsx')}>
        <Counter />
      </Island>
    </div>
  )
}`}</CodeWindow>

      <div class="callout callout-info">
        <strong>Note:</strong> Only interactive components (those using signals or event handlers) are hydrated by default. Static content ships as pure HTML with zero JavaScript overhead.
      </div>

      <h2>Best practices</h2>
      <ul>
        <li>Avoid browser-only APIs (<code>window</code>, <code>document</code>) during rendering. Use effects to access them after hydration.</li>
        <li>Use <code>renderToStream</code> for content-heavy pages to reduce TTFB.</li>
        <li>Wrap interactive components in <code>Island</code> to keep the initial JS payload small.</li>
        <li>Set <code>maxHydrationMs</code> in your performance budget to catch hydration regressions.</li>
      </ul>
    </DocsLayout>
  )
}
