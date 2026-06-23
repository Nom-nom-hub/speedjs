import { BenchmarkPanel, MetricCard } from '../components/benchmark-panel'
import { CodeWindow, TerminalWindow } from '../components/code-window'

export default function Benchmarks() {
  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <section class="page-hero">
        <div class="container">
          <h1>Benchmark Dashboard</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, marginTop: 12 }}>
            Live metrics from the Speed.js framework. Data sourced from benchmark artifacts at
            {' '}<code style={{ color: 'var(--cyan)' }}>public/benchmarks/</code>.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <a class="btn btn-secondary btn-sm" href="/benchmarks/methodology" style={{ textDecoration: 'none' }}>View methodology</a>
          </div>
        </div>
      </section>

      <section class="section container" style={{ paddingTop: 0 }}>
        <BenchmarkPanel />

        <h2 style={{ marginTop: 48, marginBottom: 20 }}>Data source</h2>
        <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
          Benchmark data is served as static JSON from <code style={{ color: 'var(--cyan)' }}>public/benchmarks/</code>.
          The dashboard fetches <code style={{ color: 'var(--cyan)' }}>GET /benchmarks/latest.json</code> and refreshes every 30 seconds.
        </p>
        <div style={{ marginTop: 16 }}>
          <CodeWindow title="GET /benchmarks/latest.json">{`{
  "status": "real" | "sample" | "stale" | "error",
  "lastUpdated": "2026-06-23T01:51:49.566Z",
  "commit": "...",
  "metrics": {
    "initialJsKb": { "median": 82.8, "unit": "kb", ... },
    "buildTimeMs": { "median": 990.2, "unit": "ms", ... },
    ...
  },
  "budget": { "status": "passed", "failures": [] },
  "history": [ ... ],
  "machine": { ... }
}`}</CodeWindow>
        </div>

        <div style={{ marginTop: 48 }}>
          <h2 style={{ marginBottom: 12 }}>CLI commands</h2>
          <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
            Run benchmarks locally and update the website data.
          </p>
          <TerminalWindow title="speed bench">
            <div class="terminal-line"><span class="terminal-prompt">$</span> speed bench run --save</div>
            <div class="terminal-line"><span class="terminal-output">Runs 5 measured + 2 warmup iterations</span></div>
            <div class="terminal-line"><span class="terminal-output">Saves to .benchmarks/latest.json</span></div>
            <div class="terminal-line"><span class="terminal-output">Updates public/benchmarks/ for website</span></div>
            <div class="terminal-line" style={{ marginTop: 8 }}><span class="terminal-prompt">$</span> speed bench update</div>
            <div class="terminal-line"><span class="terminal-output">Same as --save but explicit command</span></div>
            <div class="terminal-line" style={{ marginTop: 8 }}><span class="terminal-prompt">$</span> speed bench run --json</div>
            <div class="terminal-line"><span class="terminal-output">Print results as JSON</span></div>
          </TerminalWindow>
        </div>
      </section>
    </div>
  )
}
