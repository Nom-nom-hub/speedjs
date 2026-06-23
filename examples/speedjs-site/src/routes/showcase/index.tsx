import { Badge } from '../../components/badge'
import { Button } from '../../components/button'

export default function Showcase(props: any) {
  const items = [
    { icon: '\ud83d\udcca', name: 'SaaS Dashboard', desc: 'Real-time analytics dashboard with live signal-driven charts, API routes for data, and sub-50ms navigation.', tags: ['signals', 'charts', 'API routes'] },
    { icon: '\ud83d\udcdd', name: 'Documentation Site', desc: 'Full documentation platform with SSR, file-based routing, and search powered by computed signals.', tags: ['SSR', 'routing', 'static'] },
    { icon: '\u270d\ufe0f', name: 'Personal Blog', desc: 'Fast blog with static generation, markdown content, and instant page transitions.', tags: ['SSR', 'static', 'routing'] },
    { icon: '\ud83d\uded2', name: 'E-commerce Storefront', desc: 'Product catalog with signal-based cart, SSR for SEO, and partial hydration for interactive widgets.', tags: ['signals', 'SSR', 'partial hydration'] },
    { icon: '\ud83e\udd16', name: 'AI Chat Interface', desc: 'Streaming SSR chat app with real-time signal updates and API route integration.', tags: ['streaming', 'SSR', 'API routes'] },
    { icon: '\u2699\ufe0f', name: 'Admin Panel', desc: 'Full-featured admin with tables, forms, real-time updates, and performance budgets keeping JS under 20kb per route.', tags: ['signals', 'routing', 'budgets'] },
    { icon: '\ud83c\udfae', name: 'Game Leaderboard', desc: 'Live-updating leaderboard with signal-driven scoreboards and server-sent events.', tags: ['signals', 'SSR', 'real-time'] },
    { icon: '\ud83d\udcf1', name: 'API Backend', desc: 'Pure API backend using Speed.js API routes with dynamic segments, middleware, and type-safe handlers.', tags: ['API routes', 'typescript'] },
  ]

  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <section class="page-hero">
        <div class="container">
          <div class="badge badge-green">Showcase</div>
          <h1>Built with Speed.js</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, marginTop: 12 }}>
            A curated collection of apps and sites built with Speed.js — from SSR to real-time signals.
          </p>
        </div>
      </section>

      <section class="section container" style={{ paddingTop: 0 }}>
        <div class="showcase-grid">
          {items.map((item, i) => (
            <div class="showcase-card">
              <div class="showcase-mockup" style={{
                background: `linear-gradient(135deg, rgba(40,216,255,${0.03 + i * 0.01}), rgba(155,92,255,${0.02 + i * 0.01}))`
              }}>
                <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                <span style={{ position: 'absolute', top: 12, right: 12 }}><Badge variant="default">0.1.0</Badge></span>
              </div>
              <div class="showcase-body">
                <div class="showcase-title">{item.name}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{item.desc}</p>
                <div class="showcase-tags">
                  {item.tags.map(t => <span class="showcase-tag">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Built something with Speed.js? Add your project.</p>
          <Button href="https://github.com/Nom-nom-hub/speedjs" variant="primary" target="_blank">Add your project</Button>
        </div>
      </section>
    </div>
  )
}
