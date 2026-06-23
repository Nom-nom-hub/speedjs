export function RoadmapTimeline({ items }: { items: { version: string; title: string; desc: string; status: string; features: string[] }[] }) {
  return (
    <div class="roadmap">
      {items.map((item, i) => (
        <div class="roadmap-item">
          <div class={`roadmap-dot${i > 0 ? ' roadmap-dot-' + (i + 1) : ''}`}
               style={item.status === 'current' ? { borderColor: 'var(--cyan)', boxShadow: '0 0 12px rgba(40,216,255,0.3)' } : undefined}>
            {i + 1}
          </div>
          <div class="roadmap-content" style={i < items.length - 1 ? {} : { paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{item.version}: {item.title}</h3>
              <span class={`badge badge-${item.status === 'current' ? 'cyan' : 'default'}`}>
                <span class={`badge-dot badge-dot-${item.status === 'current' ? 'cyan' : 'green'}`} />
                {item.status === 'current' ? 'In Progress' : item.status === 'completed' ? 'Completed' : 'Planned'}
              </span>
            </div>
            <p>{item.desc}</p>
            {item.features.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {item.features.map(f => <span class="badge badge-violet">{f}</span>)}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
