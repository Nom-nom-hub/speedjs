import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow, TerminalWindow } from '../../components/code-window'

export default function PerfBudgets(props: any) {
  return (
    <DocsLayout currentPath="/docs/performance-budgets">
      <div class="section-label">Docs / Performance Budgets</div>
      <h1>Performance Budgets</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Speed.js is the only framework with built-in performance budgets. Set limits in config, and the framework enforces them in CI.
      </p>

      <div class="callout callout-info">
        JavaScript bundle size is the \#1 performance killer on the web. Budgets make performance a first-class concern — not an afterthought.
      </div>

      <h2>Configuration</h2>
      <CodeWindow title="speed.config.ts">{`import { defineConfig } from 'speed'

export default defineConfig({
  performance: {
    maxInitialJS: '40kb',    // Total JS on first visit
    maxRouteJS:  '25kb',     // Per-route JS budget
    maxBuildMs:   3000,      // Max build time
    maxHydrationMs: 50,      // Max hydration cost
    mode: 'warn'             // 'error' or 'warn'
  }
})`}</CodeWindow>

      <h2>Metrics explained</h2>
      <table>
        <thead>
          <tr><th>Metric</th><th>What it measures</th><th>Why it matters</th></tr>
        </thead>
        <tbody>
          <tr><td><code>maxInitialJS</code></td><td>Total JS loaded on first page visit</td><td>Larger bundles = slower LCP</td></tr>
          <tr><td><code>maxRouteJS</code></td><td>JavaScript for a single route</td><td>Keeps code splitting effective</td></tr>
          <tr><td><code>maxBuildMs</code></td><td>Time to build the production bundle</td><td>Slow builds kill productivity</td></tr>
          <tr><td><code>maxHydrationMs</code></td><td>Time to hydrate a route</td><td>Hydration blocks TTI</td></tr>
        </tbody>
      </table>

      <h2>Running budgets</h2>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed bench</div>
        <div class="terminal-line"><span class="terminal-success">Initial JS:    14.2kb  (limit: 40kb)</span></div>
        <div class="terminal-line"><span class="terminal-success">Route render:  4ms</span></div>
        <div class="terminal-line"><span class="terminal-success">Hydration:     18ms  (limit: 50ms)</span></div>
        <div class="terminal-line"><span class="terminal-success">Build:         1.8s  (limit: 3s)</span></div>
        <div class="terminal-line"><span class="terminal-success">Result:        Passed</span></div>
      </TerminalWindow>

      <h2>CI integration</h2>
      <CodeWindow title=".github/workflows/ci.yml">{`- run: npm install
- run: npm run build
- run: speed bench   # fails if budgets exceeded`}</CodeWindow>

      <h2>Fixing failures</h2>
      <ul>
        <li><strong>maxInitialJS too high</strong> — Lazy load routes, reduce dependencies, use partial hydration.</li>
        <li><strong>maxHydrationMs exceeded</strong> — Convert heavy components to islands, reduce signal subscribers.</li>
        <li><strong>maxBuildMs too high</strong> — Check for large static imports, consider lazy loading.</li>
      </ul>
    </DocsLayout>
  )
}
