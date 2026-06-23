import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow, TerminalWindow } from '../../components/code-window'

export default function DeploymentDocs(props: any) {
  return (
    <DocsLayout currentPath="/docs/deployment">
      <div class="section-label">Docs / Deployment</div>
      <h1>Deployment</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Speed.js apps are standard Node.js web apps. Deploy them anywhere you deploy JavaScript.
      </p>

      <h2>Production build</h2>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed build</div>
        <div class="terminal-line"><span class="terminal-success">24 modules transformed</span></div>
        <div class="terminal-line"><span class="terminal-success">dist/index.html (0.4kb)</span></div>
        <div class="terminal-line"><span class="terminal-success">dist/assets/ (42.1kb)</span></div>
        <div class="terminal-line"><span class="terminal-success">Built in 1.8s</span></div>
      </TerminalWindow>

      <h2>Build output</h2>
      <CodeWindow title="dist/">{`dist/
  index.html
  assets/
    index-abc123.js     # Main bundle (14.2kb)
    page-blog-xyz456.js # Code-split route (8.1kb)`}</CodeWindow>

      <h2>Deployment targets</h2>
      <h3>Node.js server (SSR)</h3>
      <ul>
        <li><strong>Railway</strong> — Set start command to <code>speed start</code></li>
        <li><strong>Fly.io</strong> — Deploy with Node.js builder, start command <code>speed start</code></li>
        <li><strong>Render</strong> — Web Service with start command <code>speed start</code></li>
        <li><strong>VPS</strong> — Use PM2 or systemd to run <code>speed start</code></li>
      </ul>

      <h3>Static hosting</h3>
      <CodeWindow title="speed.config.ts">{`export default defineConfig({
  ssr: { static: true } // Pre-render all routes
})`}</CodeWindow>
      <p>Then deploy <code>dist/</code> to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any S3-compatible storage.</p>

      <h2>Environment variables</h2>
      <CodeWindow title=".env">{`PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgres://...`}</CodeWindow>

      <h2>Pre-deployment checks</h2>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed build    # Production build</div>
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed bench    # Check budgets</div>
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed doctor   # Verify environment</div>
      </TerminalWindow>
    </DocsLayout>
  )
}
