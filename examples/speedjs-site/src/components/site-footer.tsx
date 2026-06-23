import { navigate } from '@speedjs/router'
import { Logo } from './logo'

export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 0 32px' }}>
      <div class="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          <div>
            <a href="/" onClick={(e: Event) => { e.preventDefault(); navigate('/') }} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
              <Logo size={24} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                Speed<span style={{ color: 'var(--cyan)' }}>.js</span>
              </span>
            </a>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-2)', maxWidth: 280, lineHeight: 1.7 }}>
              Performance-enforced TypeScript framework with fine-grained reactivity, SSR, and built-in benchmarks.
            </p>
          </div>
          {[
            { title: 'Docs', links: [{ href: '/docs/getting-started', label: 'Getting Started' }, { href: '/docs/signals', label: 'Signals' }, { href: '/docs/routing', label: 'Routing' }, { href: '/docs/ssr', label: 'SSR' }, { href: '/docs/api-routes', label: 'API Routes' }, { href: '/docs/performance-budgets', label: 'Budgets' }] },
            { title: 'Resources', links: [{ href: '/benchmarks', label: 'Benchmarks' }, { href: '/showcase', label: 'Showcase' }, { href: '/roadmap', label: 'Roadmap' }, { href: '/playground', label: 'Playground' }, { href: '/blog', label: 'Blog' }] },
            { title: 'Community', links: [{ href: 'https://github.com/Nom-nom-hub/speedjs', label: 'GitHub' }, { href: 'https://github.com/Nom-nom-hub/speedjs/issues', label: 'Issues' }, { href: 'https://github.com/Nom-nom-hub/speedjs/releases', label: 'Releases' }] },
          ].map(col => (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted-2)', marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <a href={l.href} onClick={(e: Event) => { if (l.href.startsWith('/')) { e.preventDefault(); navigate(l.href) } }}
                   style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', padding: '4px 0', transition: 'color 150ms' }}
                   onMouseOver={(e: any) => e.target.style.color = 'var(--text)'}
                   onMouseOut={(e: any) => e.target.style.color = 'var(--text-muted)'}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)' }}>Speed.js — Developer Preview. MIT License.</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)' }}>Built with Speed.js</p>
        </div>
      </div>
    </footer>
  )
}
