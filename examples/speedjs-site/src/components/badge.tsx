export function Badge({ variant = 'default', dot, children }: { variant?: 'default' | 'cyan' | 'green' | 'violet' | 'amber' | 'red'; dot?: boolean; children: any }) {
  return (
    <span class={`badge${variant !== 'default' ? ' badge-' + variant : ''}`}>
      {dot ? <span class={`badge-dot badge-dot-${variant === 'default' ? 'cyan' : variant}`} /> : null}
      {children}
    </span>
  )
}
