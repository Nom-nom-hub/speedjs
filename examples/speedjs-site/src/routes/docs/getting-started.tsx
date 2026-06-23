import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow, TerminalWindow } from '../../components/code-window'
import { Badge } from '../../components/badge'
import { Button } from '../../components/button'

export default function GettingStarted(props: any) {
  return (
    <DocsLayout currentPath="/docs/getting-started">
      <div class="section-label">Docs / Getting Started</div>
      <h1>Getting Started</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Create your first Speed.js project and learn the basic concepts. This guide covers installation, project structure, and your first route.
      </p>

      <div class="callout callout-info">
        <strong>Prerequisites:</strong> Node.js 22+, pnpm 9+, and a terminal.
      </div>

      <h2>Create a project</h2>
      <p>Run the create command:</p>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> npm create speedjs@latest my-app</div>
        <div class="terminal-line"><span class="terminal-output">Creating my-app...</span></div>
        <div class="terminal-line"><span class="terminal-success">Done in 1.3s</span></div>
        <div style={{ height: 8 }} />
        <div class="terminal-line"><span class="terminal-prompt">$</span> cd my-app && npm run dev</div>
        <div class="terminal-line"><span class="terminal-success">Local: http://localhost:5173</span></div>
      </TerminalWindow>

      <h2>Project structure</h2>
      <p>Your project will look like this:</p>
      <CodeWindow title="directory">{`my-app/
  src/
    routes/       # File-based routes
      index.tsx
      docs/
    components/   # Reusable components
    app.tsx       # App entry
  public/
  speed.config.ts # Framework config + budgets
  vite.config.ts
  tsconfig.json`}</CodeWindow>

      <h2>Your first route</h2>
      <p>Create <code>src/routes/index.tsx</code>:</p>
      <CodeWindow title="src/routes/index.tsx">{`import { signal } from '@speedjs/core'

export default function Home() {
  const count = signal(0)

  return (
    <button onClick={() => count.value++}>
      Count: {count}
    </button>
  )
}`}</CodeWindow>

      <h2>List routes</h2>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed routes</div>
        <div class="terminal-line"><span class="terminal-success">/</span></div>
        <div class="terminal-line"><span class="terminal-success">/docs</span></div>
        <div class="terminal-line"><span class="terminal-success">/docs/getting-started</span></div>
        <div class="terminal-line"><span class="terminal-success">6 routes found</span></div>
      </TerminalWindow>

      <h2>Next steps</h2>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <Button href="/docs/signals" variant="primary">Learn about signals</Button>
        <Button href="/docs/routing" variant="secondary">Explore routing</Button>
      </div>
    </DocsLayout>
  )
}
