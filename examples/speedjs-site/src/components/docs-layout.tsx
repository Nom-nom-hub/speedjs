import { navigate } from '@speedjs/router'

export function DocsSidebar({ currentPath }: { currentPath?: string }) {
  const sections = [
    { label: 'Getting Started', links: [
      { href: '/docs/getting-started', label: 'Installation' },
    ]},
    { label: 'Core Concepts', links: [
      { href: '/docs/signals', label: 'Signals' },
      { href: '/docs/routing', label: 'Routing' },
      { href: '/docs/ssr', label: 'SSR' },
      { href: '/docs/api-routes', label: 'API Routes' },
    ]},
    { label: 'Performance', links: [
      { href: '/docs/performance-budgets', label: 'Performance Budgets' },
      { href: '/docs/benchmarking', label: 'Benchmarking' },
    ]},
    { label: 'Deployment', links: [
      { href: '/docs/deployment', label: 'Deployment' },
    ]},
  ]

  return (
    <nav class="docs-sidebar">
      {sections.map(s => (
        <div class="docs-sidebar-section">
          <div class="docs-sidebar-label">{s.label}</div>
          {s.links.map(l => (
            <a href={l.href} onClick={(e: Event) => { e.preventDefault(); navigate(l.href) }}
               class={`docs-sidebar-link${currentPath === l.href ? ' active' : ''}`}>
              {l.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function DocsLayout({ currentPath, children }: { currentPath?: string; children: any }) {
  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <div class="docs-layout">
        <DocsSidebar currentPath={currentPath} />
        <main class="docs-content">{children}</main>
      </div>
    </div>
  )
}
