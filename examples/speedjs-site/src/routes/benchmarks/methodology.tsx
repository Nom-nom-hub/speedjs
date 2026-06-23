export default function Methodology() {
  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <section class="page-hero">
        <div class="container">
          <h1>Benchmark Methodology</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginTop: 12 }}>
            Exactly how Speed.js benchmark numbers are produced — so you can reproduce them yourself.
          </p>
        </div>
      </section>

      <section class="section container" style={{ paddingTop: 0 }}>
        <div class="docs-content" style={{ maxWidth: 720 }}>
          <h2>Overview</h2>
          <p>
            All metrics shown on the Speed.js website are produced by the <code>@speedjs/bench</code> package,
            which runs against a controlled starter app. The benchmark runner measures raw framework and server
            performance under consistent conditions.
          </p>

          <h2>Metrics</h2>

          <h3>Initial JS Size</h3>
          <p>
            Measured from the production <code>vite build</code> output. The total byte size of all JavaScript
            files in <code>dist/assets/</code> is summed and converted to kilobytes. This represents the
            total JS a browser must download, parse, and execute on first page load.
          </p>

          <h3>Route Render Time</h3>
          <p>
            Uses <code>tinybench</code> to time 1,000 iterations of a synthetic route render benchmark.
            This measures the framework's route resolution and component render overhead under load.
          </p>

          <h3>Hydration Cost</h3>
          <p>
            Measures the time to hydrate a minimal component tree using <code>@speedjs/dom</code>'s hydrate
            function. This represents the client-side cost of making static HTML interactive.
          </p>

          <h3>API Latency</h3>
          <p>
            Measures the round-trip time to fetch <code>/api/health</code> from a local Vite dev server.
            This includes connection setup, request processing, and response serialization.
          </p>

          <h3>Build Time</h3>
          <p>
            The wall-clock time for <code>vite build</code> to complete. Measured from process spawn to
            exit. Includes TypeScript compilation, bundling, code splitting, and minification.
          </p>

          <h3>Dev Server Boot</h3>
          <p>
            The time from spawning the Vite dev server process to the first <code>Local:</code> output
            line appearing on stdout. This measures cold-start development server initialization.
          </p>

          <h3>SSR Render</h3>
          <p>
            Measures the time to call <code>renderToString()</code> from <code>@speedjs/server</code>
            on a minimal component. This represents the server-side cost of generating HTML.
          </p>

          <h3>Static Generation</h3>
          <p>
            Time to render static content via the SSR pipeline, representing the cost of pre-rendering
            pages at build time.
          </p>

          <h2>Run Protocol</h2>
          <p>Each benchmark follows this protocol:</p>
          <ul>
            <li><strong>Warmup runs:</strong> 2 iterations (discarded)</li>
            <li><strong>Measured runs:</strong> 5 iterations (recorded)</li>
            <li><strong>Reported value:</strong> Median of the 5 measured runs</li>
            <li><strong>Dispersion:</strong> Min and max are reported alongside samples</li>
          </ul>

          <h2>Machine</h2>
          <p>Benchmarks were run on:</p>
          <ul>
            <li><strong>Platform:</strong> macOS (darwin)</li>
            <li><strong>CPU:</strong> Apple M3 Pro</li>
            <li><strong>Cores:</strong> 12</li>
            <li><strong>Memory:</strong> 18GB</li>
            <li><strong>Node.js:</strong> v22</li>
            <li><strong>pnpm:</strong> 9</li>
          </ul>
          <p>Results will vary on different hardware, operating systems, and runtime versions.</p>

          <h2>What Is Being Measured</h2>
          <ul>
            <li>Raw framework performance (render, hydration, SSR)</li>
            <li>Build tooling performance (vite, bundler)</li>
            <li>Dev server startup time</li>
            <li>API request handling</li>
            <li>Bundle size (minified, gzipped where noted)</li>
          </ul>

          <h2>What Is NOT Being Measured</h2>
          <ul>
            <li>Network latency (all benchmarks are local)</li>
            <li>Browser rendering (paint, layout, compositing)</li>
            <li>Real-world application performance with complex state</li>
            <li>Third-party script impact</li>
            <li>CDN or edge network performance</li>
            <li>Database query performance</li>
          </ul>

          <h2>How to Reproduce</h2>
          <p>Run the benchmark suite yourself:</p>
          <pre class="terminal" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
pnpm install
pnpm build
pnpm bench
          </pre>
          <p>To save results and update the website data:</p>
          <pre class="terminal" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)' }}>
pnpm bench:save
          </pre>

          <h2>Data Status</h2>
          <p>Benchmark data displayed on the website can have one of four statuses:</p>
          <ul>
            <li><strong>Real:</strong> Produced by a local benchmark run and saved within the last 7 days</li>
            <li><strong>Sample:</strong> Developer-preview placeholder data (no benchmark artifact found)</li>
            <li><strong>Stale:</strong> Real data that is over 7 days old</li>
            <li><strong>Error:</strong> The benchmark API could not be reached</li>
          </ul>

          <h2>Limitations</h2>
          <ul>
            <li>Benchmarks run on a single machine — not a CI cluster</li>
            <li>Results may vary by 5-15% between runs due to system load</li>
            <li>SSR and hydration benchmarks use minimal components — not production page trees</li>
            <li>Dev server boot includes dependency pre-bundling time</li>
            <li>No framework comparisons are shown unless a comparison artifact exists</li>
          </ul>

          <h2>Source</h2>
          <p>
            The benchmark runner source is in <code>packages/bench/src/</code>.
            Benchmark artifacts are stored in <code>.benchmarks/</code> at the project root
            and copied to <code>public/benchmarks/</code> for the website.
          </p>
          <p>Last updated: <code>2026-06-22</code></p>
        </div>
      </section>
    </div>
  )
}
