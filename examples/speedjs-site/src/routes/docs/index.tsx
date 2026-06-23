import { DocsLayout } from '../../components/docs-layout'
import { GlowCard } from '../../components/glow-card'
import { navigate } from '@speedjs/router'

export default function DocsIndex(props: any) {
  const sections = [
    { title: 'Getting Started', desc: 'Install Speed.js, create your first project, and learn the basics.', href: '/docs/getting-started', icon: '\ud83d\ude80' },
    { title: 'Signals', desc: 'Fine-grained reactivity with signal(), computed(), and effect().', href: '/docs/signals', icon: '\u26a1' },
    { title: 'Routing', desc: 'File-based routing, dynamic segments, catch-all routes, nested layouts.', href: '/docs/routing', icon: '\ud83d\udcc2' },
    { title: 'SSR', desc: 'Server-side rendering with renderToString and renderToStream.', href: '/docs/ssr', icon: '\ud83c\udf10' },
    { title: 'API Routes', desc: 'Co-located backend handlers with full request/response control.', href: '/docs/api-routes', icon: '\u2699\ufe0f' },
    { title: 'Performance Budgets', desc: 'Set and enforce budgets on bundle size, build time, and hydration.', href: '/docs/performance-budgets', icon: '\ud83c\udfaf' },
    { title: 'Benchmarking', desc: 'Measure your app with speed bench and track regressions.', href: '/docs/benchmarking', icon: '\ud83d\udcca' },
    { title: 'Deployment', desc: 'Build and deploy Speed.js apps to production.', href: '/docs/deployment', icon: '\u2601\ufe0f' },
  ]

  return (
    <DocsLayout currentPath="/docs">
      <div class="section-label">Documentation</div>
      <h1>Speed.js Docs</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 600, marginBottom: 40 }}>
        Everything you need to build fast web apps with Speed.js — from signals to deployment.
      </p>
      <div className="features-grid">
        {sections.map(s => (
          <GlowCard accent={false} style={{ cursor: 'pointer' }}>
            <a href={s.href} onClick={(e: Event) => { e.preventDefault(); navigate(s.href) }} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 8, color: 'var(--text)' }}>{s.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
            </a>
          </GlowCard>
        ))}
      </div>
    </DocsLayout>
  )
}
