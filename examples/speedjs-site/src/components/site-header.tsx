import { signal } from '@speedjs/core'
import { navigate } from '@speedjs/router'
import { Logo } from './logo'

const links = [
  { href: '/docs', label: 'Docs' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/showcase', label: 'Showcase' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/playground', label: 'Playground' },
]

export function SiteHeader() {
  const mobileOpen = signal(false)

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--header-height)',
      background: 'rgba(5,6,10,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div class="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <a href="/" onClick={(e: Event) => { e.preventDefault(); navigate('/') }} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Speed<span style={{ color: 'var(--cyan)' }}>.js</span>
          </span>
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} class="desktop-nav">
          {links.map(l => (
            <a href={l.href} onClick={(e: Event) => { e.preventDefault(); navigate(l.href) }}
               style={{ padding: '6px 14px', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', borderRadius: '6px', transition: 'color 150ms, background 150ms' }}
               onMouseOver={(e: any) => { e.target.style.color = 'var(--text)'; e.target.style.background = 'var(--panel)' }}
               onMouseOut={(e: any) => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'transparent' }}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} class="desktop-nav">
          <a href="https://github.com/Nom-nom-hub/speedjs" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', borderRadius: '6px', transition: 'color 150ms' }}
             onMouseOver={(e: any) => { e.target.style.color = 'var(--text)' }}
             onMouseOut={(e: any) => { e.target.style.color = 'var(--text-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>GitHub</span>
          </a>
          <a href="/docs/getting-started" onClick={(e: Event) => { e.preventDefault(); navigate('/docs/getting-started') }}
             class="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            Get Started
          </a>
        </div>

        <button class="btn btn-ghost btn-icon mobile-nav-toggle"
          onClick={() => mobileOpen.value = !mobileOpen.value}
          style={{ display: 'none' }}
          aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={mobileOpen.value ? "M5 15l10-10M5 5l10 10" : "M3 5h14M3 10h14M3 15h14"} />
          </svg>
        </button>
      </div>

      {mobileOpen.value ? (
        <div style={{
          position: 'fixed', top: 'var(--header-height)', left: 0, right: 0,
          background: 'rgba(5,6,10,0.98)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px', zIndex: 99, animation: 'slideDown 0.2s ease'
        }}>
          {links.map(l => (
            <a href={l.href} onClick={(e: Event) => { e.preventDefault(); navigate(l.href); mobileOpen.value = false }}
               style={{ display: 'block', padding: '10px 0', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {l.label}
            </a>
          ))}
        </div>
      ) : null}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
