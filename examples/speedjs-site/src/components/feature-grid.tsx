export function FeatureGrid({ features }: {
  features: { icon: string; title: string; desc: string; color?: string }[]
}) {
  return (
    <div class="features-grid">
      {features.map(f => (
        <div class="feature-card">
          <div class="feature-card-icon">{f.icon}</div>
          <div class="feature-card-title">{f.title}</div>
          <div class="feature-card-desc">{f.desc}</div>
        </div>
      ))}
    </div>
  )
}
