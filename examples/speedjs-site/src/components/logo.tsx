export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#28d8ff" />
          <stop offset="100%" stopColor="#9b5cff" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#logo-grad)" strokeWidth="2" fill="none" />
      <path d="M10 22V10h4l4 8 4-8h4v12h-4V14l-4 8-4-8v8h-4z" fill="url(#logo-grad)" />
      <path d="M10 22V10l4 8 4-8 4 8 4-8v12" stroke="url(#logo-grad)" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  )
}
