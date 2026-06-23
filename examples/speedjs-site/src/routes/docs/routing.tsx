import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow, TerminalWindow } from '../../components/code-window'

export default function RoutingDocs(props: any) {
  return (
    <DocsLayout currentPath="/docs/routing">
      <div class="section-label">Docs / Routing</div>
      <h1>File-based Routing</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Speed.js uses a file-based routing system where your route structure is determined by the file structure in <code>src/routes/</code>.
      </p>

      <h2>Basic routes</h2>
      <CodeWindow title="routes/">{`src/routes/
  index.tsx        -> /
  about.tsx        -> /about
  blog/
    index.tsx      -> /blog
    hello.tsx      -> /blog/hello
  docs/
    index.tsx      -> /docs
    signals.tsx    -> /docs/signals`}</CodeWindow>

      <h2>Dynamic segments</h2>
      <CodeWindow title="dynamic">{`src/routes/
  blog/
    [slug].tsx     -> /blog/:slug
  users/
    [id].tsx       -> /users/:id
    [id]/
      settings.tsx -> /users/:id/settings`}</CodeWindow>

      <h2>Catch-all routes</h2>
      <CodeWindow title="catch-all">{`src/routes/
  docs/
    [...slug].tsx  -> /docs/a/b/c`}</CodeWindow>

      <h2>Route params</h2>
      <CodeWindow title="[slug].tsx">{`import { useParams } from '@speedjs/router'

export default function BlogPost(props: { slug: string }) {
  const params = useParams()
  return <h1>Post: {params.slug || props.slug}</h1>
}`}</CodeWindow>

      <h2>Navigation</h2>
      <CodeWindow title="navigation">{`import { navigate, Link } from '@speedjs/router'

// Programmatic
navigate('/docs/signals')

// Link component
<Link to="/about">About</Link>`}</CodeWindow>

      <h2>Layouts</h2>
      <CodeWindow title="docs/_layout.tsx">{`export default function DocLayout(props: { children: any }) {
  return (
    <div className="docs-layout">
      <aside>Sidebar</aside>
      <main>{props.children}</main>
    </div>
  )
}`}</CodeWindow>

      <h2>Route discovery</h2>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed routes</div>
        <div class="terminal-line"><span class="terminal-success">/</span></div>
        <div class="terminal-line"><span class="terminal-success">/about</span></div>
        <div class="terminal-line"><span class="terminal-success">/blog</span></div>
        <div class="terminal-line"><span class="terminal-success">/docs/signals</span></div>
        <div class="terminal-line"><span class="terminal-success">12 routes found</span></div>
      </TerminalWindow>
    </DocsLayout>
  )
}
