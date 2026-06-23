import { Badge } from './badge'

export function ShowcaseGrid({ items }: { items: { icon: string; title: string; desc: string; tags: string[] }[] }) {
  return (
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
            <div class="showcase-title">{item.title}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{item.desc}</p>
            <div class="showcase-tags">
              {item.tags.map(t => <span class="showcase-tag">{t}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
