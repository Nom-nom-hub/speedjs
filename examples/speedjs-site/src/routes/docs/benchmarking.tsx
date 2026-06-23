import { DocsLayout } from '../../components/docs-layout'
import { CodeWindow, TerminalWindow } from '../../components/code-window'

export default function BenchmarkingDocs(props: any) {
  return (
    <DocsLayout currentPath="/docs/benchmarking">
      <div class="section-label">Docs / Benchmarking</div>
      <h1>Benchmarking</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 32 }}>
        Speed.js includes a built-in benchmarking command that measures real performance metrics. No third-party tools required.
      </p>

      <h2>Running benchmarks</h2>
      <TerminalWindow title="terminal">
        <div class="terminal-line"><span class="terminal-prompt">$</span> speed bench</div>
        <div class="terminal-line"><span class="terminal-success">Initial JS:    14.2kb  (limit: 40kb)</span></div>
        <div class="terminal-line"><span class="terminal-success">Route render:  4ms</span></div>
        <div class="terminal-line"><span class="terminal-success">Hydration:     18ms  (limit: 50ms)</span></div>
        <div class="terminal-line"><span class="terminal-success">Build:         1.8s  (limit: 3s)</span></div>
        <div class="terminal-line"><span class="terminal-success">Result:        Passed</span></div>
      </TerminalWindow>

      <h2>What is measured</h2>
      <table>
        <thead>
          <tr><th>Metric</th><th>How it's measured</th></tr>
        </thead>
        <tbody>
          <tr><td>Initial JS</td><td>Sum of all JavaScript loaded during initial page load (compressed)</td></tr>
          <tr><td>Route render time</td><td>Time to render a route component including its children</td></tr>
          <tr><td>Hydration cost</td><td>Time to attach event listeners and activate signals</td></tr>
          <tr><td>Build time</td><td>Wall-clock time for the production build</td></tr>
          <tr><td>API latency</td><td>Round-trip time for API route requests</td></tr>
        </tbody>
      </table>

      <h2>CI integration</h2>
      <CodeWindow title="package.json">{`{
  "scripts": {
    "bench": "speed bench"
  }
}`}</CodeWindow>

      <h2>JSON output</h2>
      <CodeWindow title="json">{`$ speed bench --format json
{"initialJS":"14.2kb","routeRender":"4ms",
 "hydration":"18ms","build":"1.8s",
 "budget":"Passed"}`}</CodeWindow>

      <h2>Best practices</h2>
      <ul>
        <li>Run <code>speed bench</code> after every production build to catch regressions early.</li>
        <li>Track benchmark results over time — store JSON output in a dashboard.</li>
        <li>Set realistic budgets initially and tighten them as you optimize.</li>
        <li>Use <code>maxInitialJS</code> as your primary budget metric.</li>
      </ul>
    </DocsLayout>
  )
}
