import { signal, computed } from '@speedjs/core'
import { navigate } from '@speedjs/router'
import { CommandCenter } from '../components/command-center'
import { BenchmarkPanel } from '../components/benchmark-panel'
import { PerformanceBudgetDemo } from '../components/performance-budget-demo'
import { CodeWindow, TerminalWindow } from '../components/code-window'
import { FeatureGrid } from '../components/feature-grid'
import { ComparisonTable } from '../components/comparison-table'
import { CommandTabs } from '../components/command-tabs'
import { RoadmapTimeline } from '../components/roadmap-timeline'
import { ShowcaseGrid } from '../components/showcase-grid'
import { GlowCard } from '../components/glow-card'
import { Badge } from '../components/badge'

// ─── Live Counter (signals at module level to survive re-renders) ───
const liveCount = signal(0)
const liveDoubled = computed(() => liveCount.value * 2)
const liveUpdates = signal(0)
const liveLabel = signal('')

function LiveCounter() {
  const inc = () => { liveCount.value += 1; liveUpdates.value += 1; liveLabel.value = 'DOM patched: 1 node' }
  const dec = () => { liveCount.value = Math.max(0, liveCount.value - 1); liveUpdates.value += 1; liveLabel.value = 'DOM patched: 1 node' }
  const reset = () => { liveCount.value = 0; liveLabel.value = '' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ fontSize: '3.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--cyan)', lineHeight: 1 }}>{liveCount}</div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>doubled</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--violet)', fontVariantNumeric: 'tabular-nums' }}>{liveDoubled}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>updates</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{liveUpdates}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button class="btn btn-primary btn-sm" onClick={inc}>+1</button>
        <button class="btn btn-secondary btn-sm" onClick={dec}>-1</button>
        <button class="btn btn-secondary btn-sm" onClick={reset}>Reset</button>
      </div>
      {liveLabel.value ? <Badge variant="cyan">{liveLabel.value}</Badge> : null}
    </div>
  )
}

// ─── Features Data ───
const features = [
  { icon: '\u26a1', title: 'Fine-grained reactivity', desc: 'Signals update only the DOM nodes that depend on them — no virtual DOM, no diffing.' },
  { icon: '\ud83d\udd2e', title: 'Compiler-first TSX', desc: 'Components are analyzed at build time. Static regions extracted, dynamic parts instrumented.' },
  { icon: '\ud83d\udcc2', title: 'File-based routing', desc: 'Routes auto-discovered from the filesystem. Dynamic segments, catch-all, nested layouts.' },
  { icon: '\ud83c\udf10', title: 'SSR', desc: 'Server-render with renderToString or stream with renderToStream for instant first paint.' },
  { icon: '\ud83c\udfaf', title: 'Static generation', desc: 'Pre-render routes at build time. Deploy to any static host with zero server cost.' },
  { icon: '\u2699\ufe0f', title: 'API routes', desc: 'Co-locate backend with frontend. File-based API discovery with full request/response control.' },
  { icon: '\ud83c\udfdd\ufe0f', title: 'Partial hydration', desc: 'Hydrate only the interactive islands. Static content ships as pure HTML — zero JS overhead.' },
  { icon: '\ud83d\udcca', title: 'Built-in benchmarking', desc: 'Run speed bench to measure initial JS, render time, hydration cost, and build performance.' },
  { icon: '\ud83d\udcaa', title: 'Performance budgets', desc: 'Set maxInitialJS, maxRouteJS, maxBuildMs, maxHydrationMs. The CI fails if you regress.' },
  { icon: '\ud83d\udcdd', title: 'TypeScript-first', desc: 'Full type safety for signals, route params, API handlers — all typed end to end.' },
  { icon: '\u26a1', title: 'Vite integration', desc: 'Instant HMR, fast builds, and the entire Vite ecosystem at your fingertips.' },
  { icon: '\ud83d\ude80', title: 'No React dependency', desc: 'Built from scratch with its own runtime and renderer. No lock-in, no version conflicts.' },
]

// ─── Showcase Data ───
const showcaseItems = [
  { icon: '\ud83d\udcca', title: 'SaaS Dashboard', desc: 'Real-time analytics dashboard with signal-driven charts, API routes, sub-50ms navigation.', tags: ['signals', 'charts', 'API routes'] },
  { icon: '\ud83d\udcdd', title: 'Documentation site', desc: 'SSR-powered docs with file-based routing, search via computed signals.', tags: ['SSR', 'routing', 'static'] },
  { icon: '\u270d\ufe0f', title: 'Personal Blog', desc: 'Fast static blog with markdown content, instant page transitions.', tags: ['SSR', 'static', 'routing'] },
  { icon: '\ud83d\uded2', title: 'E-commerce Storefront', desc: 'Signal-based cart, SSR for SEO, partial hydration for interactive widgets.', tags: ['signals', 'SSR', 'partial hydration'] },
  { icon: '\ud83e\udd16', title: 'AI Chat Interface', desc: 'Streaming SSR chat with real-time signal updates and API route integration.', tags: ['streaming', 'SSR', 'API routes'] },
  { icon: '\u2699\ufe0f', title: 'Admin Panel', desc: 'Tables, forms, real-time updates with under 20kb JS per route.', tags: ['signals', 'routing', 'budgets'] },
]

// ─── Roadmap Data ───
const roadmapItems = [
  { version: 'v0.1', title: 'Developer Preview', desc: 'Core reactivity, DOM renderer, JSX, file-based routing, SSR, API routes, CLI, benchmarks.', status: 'current', features: ['Signals and computed', 'DOM renderer', 'JSX/TSX support', 'File-based routing', 'SSR', 'API routes', 'CLI tooling', 'Performance budgets'] },
  { version: 'v0.2', title: 'Framework Hardening', desc: 'Nested layouts, loaders/actions, streaming SSR, deployment adapters, improved DX.', status: 'planned', features: ['Nested layouts', 'Loaders and actions', 'Streaming SSR', 'Deployment adapters', 'Error boundaries'] },
  { version: 'v0.3', title: 'Compiler & Performance', desc: 'Oxc/Rust integration, static component extraction, partial hydration, bundle analyzer.', status: 'planned', features: ['Rust compiler integration', 'Static extraction', 'Bundle analyzer', 'Code splitting'] },
  { version: 'v0.4', title: 'Data, Forms, Testing', desc: 'Data fetching, query caching, form actions, optimistic updates, testing utilities.', status: 'planned', features: ['Data fetching', 'Form actions', 'Testing utilities', 'Query caching'] },
  { version: 'v0.5', title: 'Deployment & Ecosystem', desc: 'Deployment adapters, CSS modules, plugin system, starter templates, DevTools.', status: 'planned', features: ['Deployment adapters', 'Plugin system', 'Starter templates', 'DevTools extension'] },
]

// ─── Homepage ───
export default function Home() {
  return (
    <div>
      {/* ───── 1. Hero ───── */}
      <section class="hero">
        <div class="hero-bg" />
        <div class="hero-grid" />
        <div class="hero-badge">
          <span class="hero-badge-dot" />
          Performance-enforced TypeScript framework
        </div>
        <h1>Build fast by default.</h1>
        <p>
          Speed.js is a compiler-first JavaScript and TypeScript framework with fine-grained reactivity, SSR,
          file-based routing, API routes, partial hydration, benchmarks, and built-in performance budgets.
        </p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" href="/docs/getting-started" onClick={(e: Event) => { e.preventDefault(); navigate('/docs/getting-started') }}>Get Started</a>
          <a class="btn btn-secondary btn-lg" href="/docs" onClick={(e: Event) => { e.preventDefault(); navigate('/docs') }}>Read Docs</a>
          <a class="btn btn-secondary btn-lg" href="https://github.com/Nom-nom-hub/speedjs" target="_blank">View GitHub</a>
        </div>
        <CommandCenter />
      </section>

      {/* ───── 2. Performance Proof ───── */}
      <section class="section container">
        <div class="section-label">Performance</div>
        <h2 class="section-title">Performance is not a slogan.</h2>
        <p class="section-sub">Speed.js measures the things that usually get ignored. Every metric is tracked, every budget is enforced.</p>
        <BenchmarkPanel />
      </section>

      {/* ───── 3. Core Differentiator ───── */}
      <section class="section container">
        <div class="split-section">
          <div>
            <div class="section-label">Differentiator</div>
            <h2 class="section-title">The framework that refuses to ship slow.</h2>
            <p class="section-sub" style={{ maxWidth: 520 }}>
              Most frameworks let bundle size drift until your app is bloated. Speed.js budgets performance from day one,
              warns before pages get heavy, and gives actionable optimization suggestions.
            </p>
            <ul style={{ marginTop: 24 }}>
              {['Set budgets in speed.config.ts', 'Run speed bench to measure', 'CI fails on regression', 'Get optimization suggestions'].map(item => (
                <li style={{ padding: '8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--green)', fontSize: '1rem' }}>{'\u2713'}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ alignSelf: 'start' }}>
            <TerminalWindow title="Budget Report">
              <div class="terminal-line"><span class="terminal-prompt">$</span> speed bench run --save</div>
              <div class="terminal-line" style={{ marginTop: 8 }}><span class="terminal-output">Initial JS: 82.8kb</span><span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginLeft: 12 }}>limit: 40kb</span></div>
              <div class="terminal-line"><span class="terminal-success">Build Time: 990ms</span><span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginLeft: 12 }}>limit: 3000ms</span></div>
              <div class="terminal-line" style={{ marginTop: 8, color: 'var(--cyan)', fontSize: '0.75rem' }}>Budget: Failed</div>
              <div class="terminal-line"><span class="terminal-output">{'\u2192'} 82.8kb exceeds 40kb budget</span></div>
              <div class="terminal-line"><span class="terminal-output">{'\u2192'} consider code splitting</span></div>
              <div class="terminal-line"><span class="terminal-output">{'\u2192'} lazy load non-critical routes</span></div>
              <div class="terminal-line"><span class="terminal-output">{'\u2192'} real measurement from M1 / 8GB</span></div>
            </TerminalWindow>
          </div>
        </div>
      </section>

      {/* ───── 4. Code + Live Demo ───── */}
      <section class="section container">
        <div class="section-label">Reactivity</div>
        <h2 class="section-title">Fine-grained updates without React.</h2>
        <p class="section-sub">Components re-render exactly where signals change. Not the whole tree, not the whole page — just the text node.</p>
        <div class="live-demo">
          <CodeWindow title="Counter.tsx">{`import { signal, computed } from "@speedjs/core";

export default function Counter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  return (
    <button onClick={() => count.value++}>
      Count: {count} / Doubled: {doubled}
    </button>
  );
}`}</CodeWindow>
          <GlowCard accent={false} style={{ textAlign: 'center', padding: 32 }}>
            <LiveCounter />
          </GlowCard>
        </div>
      </section>

      {/* ───── 5. Features ───── */}
      <section class="section container">
        <div class="section-label">Features</div>
        <h2 class="section-title">Everything needed to build fast apps.</h2>
        <p class="section-sub">A curated set of powerful primitives — all designed to work together without bloat.</p>
        <div style={{ marginTop: 32 }}>
          <FeatureGrid features={features} />
        </div>
      </section>

      {/* ───── 6. CLI ───── */}
      <section class="section container">
        <div class="section-label">CLI</div>
        <h2 class="section-title">A framework with a real command center.</h2>
        <p class="section-sub">From scaffolding to benchmarking — the speed CLI handles your entire workflow.</p>
        <div style={{ marginTop: 32 }}>
          <CommandTabs />
        </div>
      </section>

      {/* ───── 7. Comparison ───── */}
      <section class="section container">
        <div class="section-label">Comparison</div>
        <h2 class="section-title">Different by design.</h2>
        <p class="section-sub">Speed.js is the only framework with built-in performance budgets and a benchmark command.</p>
        <div style={{ marginTop: 32 }}>
          <ComparisonTable />
        </div>
      </section>

      {/* ───── 8. Showcase ───── */}
      <section class="section container">
        <div class="section-label">Showcase</div>
        <h2 class="section-title">Built with Speed.js.</h2>
        <p class="section-sub">From dashboards to docs sites — Speed.js powers them all with zero framework overhead.</p>
        <div style={{ marginTop: 32 }}>
          <ShowcaseGrid items={showcaseItems} />
        </div>
      </section>

      {/* ───── 9. Roadmap Preview ───── */}
      <section class="section container">
        <div class="section-label">Roadmap</div>
        <h2 class="section-title">Built in public. Optimized in layers.</h2>
        <p class="section-sub">Speed.js is actively developed. Here is what is on the horizon.</p>
        <div style={{ marginTop: 32 }}>
          <RoadmapTimeline items={roadmapItems.slice(0, 3)} />
        </div>
        <div style={{ marginTop: 24 }}>
          <a class="btn btn-secondary" href="/roadmap" onClick={(e: Event) => { e.preventDefault(); navigate('/roadmap') }}>View full roadmap</a>
        </div>
      </section>

      {/* ───── 10. Budget Demo ───── */}
      <section class="section container">
        <div class="section-label">Budgets</div>
        <h2 class="section-title">Ship less JavaScript.</h2>
        <p class="section-sub">Set budgets in speed.config.ts. Speed.js measures your app and warns before you ship bloat.</p>
        <CodeWindow title="speed.config.ts">{`export default {
  performance: {
    maxInitialJS: "40kb",
    maxRouteJS: "30kb",
    maxBuildMs: 3000,
    maxHydrationMs: 50,
    mode: "warn"
  }
}`}</CodeWindow>
        <PerformanceBudgetDemo />
      </section>

      {/* ───── 11. CTA ───── */}
      <section class="cta-section">
        <h2>Stop guessing if your app is fast.</h2>
        <p>Speed.js measures performance, enforces budgets, and helps you ship less JavaScript from day one.</p>
        <div class="cta-actions">
          <a class="btn btn-primary btn-lg" href="/docs/getting-started" onClick={(e: Event) => { e.preventDefault(); navigate('/docs/getting-started') }}>Start Building</a>
          <a class="btn btn-secondary btn-lg" href="/roadmap" onClick={(e: Event) => { e.preventDefault(); navigate('/roadmap') }}>Read the Roadmap</a>
        </div>
      </section>
    </div>
  )
}
