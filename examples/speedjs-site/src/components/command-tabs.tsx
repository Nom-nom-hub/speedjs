import { signal } from '@speedjs/core'

const commandTab = signal('create')

export function CommandTabs() {

  const tabs = [
    { id: 'create', cmd: 'speed create my-app', desc: 'Scaffold a new Speed.js project.', output: ['Creating project...', 'Created my-app/', 'Configured routing', 'Installed dependencies', 'Done in 1.3s'] },
    { id: 'dev', cmd: 'speed dev', desc: 'Start the dev server with instant HMR.', output: ['Vite dev server ready', 'Local: http://localhost:5173', 'Found 12 routes', 'Watching for changes...'] },
    { id: 'build', cmd: 'speed build', desc: 'Production build with code splitting.', output: ['Building...', '24 modules transformed', 'dist/index.html (0.4kb)', 'dist/assets/ (42.1kb)', 'Built in 1.8s'] },
    { id: 'routes', cmd: 'speed routes', desc: 'List all discovered routes.', output: ['/', '/docs', '/docs/getting-started', '/docs/signals', '/benchmarks', '/playground', '/api/health', '12 routes found'] },
    { id: 'bench', cmd: 'speed bench', desc: 'Run benchmarks against budgets.', output: ['Initial JS:    14.2kb  (limit: 40kb)', 'Route render:  4ms', 'Hydration:     18ms  (limit: 50ms)', 'Build:         1.8s  (limit: 3s)', 'Budget:        Passed'] },
    { id: 'doctor', cmd: 'speed doctor', desc: 'Check environment compatibility.', output: ['Node.js:  22.x', 'pnpm:     9.x', 'TypeScript: 5.x', 'Config:   Found', 'All checks passed'] },
  ]

  return (
    <div class="cli-tabs">
      <div class="cli-tab-bar">
        {tabs.map(t => (
          <button class="cli-tab" data-active={commandTab.value === t.id ? true : undefined} onClick={() => commandTab.value = t.id}>
            {t.id}
          </button>
        ))}
      </div>
      {tabs.filter(t => t.id === commandTab.value).map(t => (
        <div class="terminal" style={{ marginTop: 0, borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
          <div class="terminal-body">
            <div class="terminal-line"><span class="terminal-prompt">$</span> {t.cmd}</div>
            <div class="terminal-line"><span class="terminal-output">{t.desc}</span></div>
            <div style={{ height: 8 }} />
            {t.output.map(o => <div class="terminal-line"><span class="terminal-success">{o}</span></div>)}
          </div>
        </div>
      ))}
    </div>
  )
}
