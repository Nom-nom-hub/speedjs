import { RoadmapTimeline } from '../components/roadmap-timeline'
import { Button } from '../components/button'

const phases = [
  {
    version: 'v0.1', title: 'Developer Preview', status: 'current',
    desc: 'Core reactivity, DOM renderer, JSX, file-based routing, SSR, API routes, CLI, benchmarks.',
    features: ['Signals and computed', 'DOM renderer', 'JSX/TSX support', 'File-based routing', 'SSR', 'API routes', 'CLI tooling', 'Performance budgets', 'Benchmark command', 'Documentation'],
  },
  {
    version: 'v0.2', title: 'Framework Hardening', status: 'planned',
    desc: 'Nested layouts, loaders/actions, streaming SSR, deployment adapters, improved DX.',
    features: ['Nested layouts', 'Loaders and actions', 'Streaming SSR', 'Deployment adapters', 'Error boundaries', 'Route middleware'],
  },
  {
    version: 'v0.3', title: 'Compiler & Performance', status: 'planned',
    desc: 'Oxc/Rust integration, static component extraction, partial hydration, bundle analyzer.',
    features: ['Rust compiler integration', 'Static extraction', 'Bundle analyzer', 'Code splitting', 'CSS optimization'],
  },
  {
    version: 'v0.4', title: 'Data, Forms, Testing', status: 'planned',
    desc: 'Data fetching, query caching, form actions, optimistic updates, testing utilities.',
    features: ['Data fetching', 'Form actions', 'Testing utilities', 'Query caching', 'Optimistic updates'],
  },
  {
    version: 'v0.5', title: 'Deployment & Ecosystem', status: 'planned',
    desc: 'Deployment adapters, CSS modules, plugin system, starter templates, DevTools.',
    features: ['Deployment adapters', 'Plugin system', 'Starter templates', 'DevTools extension', 'Stable API'],
  },
]

export default function Roadmap() {
  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <section class="page-hero">
        <div class="container">
          <div class="badge badge-violet">Roadmap</div>
          <h1>Roadmap</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, marginTop: 12 }}>
            Speed.js is actively developed. Here is what we have planned for future releases. Built in public, optimized in layers.
          </p>
        </div>
      </section>

      <section class="section container" style={{ paddingTop: 0 }}>
        <RoadmapTimeline items={phases} />
      </section>

      <section class="section container" style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, maxWidth: 480, margin: '0 auto 24px' }}>
          Have a feature request? Open an issue on GitHub. Speed.js is community-driven and every contribution counts.
        </p>
        <Button href="https://github.com/Nom-nom-hub/speedjs" variant="primary" target="_blank">View on GitHub</Button>
      </section>
    </div>
  )
}
