export function GlowCard({ children, accent = true, style, class: cls }: { children: any; accent?: boolean; style?: any; class?: string }) {
  return (
    <div class={`glow-card${cls ? ' ' + cls : ''}`} style={style}>
      {accent ? <div class="glow-card-accent" /> : null}
      {children}
    </div>
  )
}
