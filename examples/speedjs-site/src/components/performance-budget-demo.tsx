import { signal } from '@speedjs/core'

const budgetFail = signal(false)

export function PerformanceBudgetDemo() {

  const budgets = [
    { name: 'maxInitialJS', limit: '40kb', current: () => budgetFail.value ? '92kb' : '14.2kb', pct: () => budgetFail.value ? 230 : 35 },
    { name: 'maxRouteJS', limit: '25kb', current: () => budgetFail.value ? '68kb' : '8.1kb', pct: () => budgetFail.value ? 272 : 32 },
    { name: 'maxBuildMs', limit: '3000ms', current: () => budgetFail.value ? '5200ms' : '1800ms', pct: () => budgetFail.value ? 173 : 60 },
    { name: 'maxHydrationMs', limit: '50ms', current: () => budgetFail.value ? '120ms' : '18ms', pct: () => budgetFail.value ? 240 : 36 },
  ]

  return (
    <div class="budget-demo">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <span class="badge badge-cyan">Live Demo</span>
        <button class="btn btn-secondary btn-sm" onClick={() => budgetFail.value = !budgetFail.value}>
          Toggle {budgetFail.value ? 'Passing' : 'Failing'}
        </button>
      </div>
      {budgets.map(b => (
        <div class="budget-card">
          <div class="budget-header">
            <span class="budget-name">{b.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)' }}>
              {b.current()} / {b.limit}
            </span>
          </div>
          <div class="budget-bar">
            <div class={`budget-fill ${b.pct() > 100 ? 'budget-fill-fail' : 'budget-fill-pass'}`}
                 style={{ width: Math.min(b.pct(), 100) + '%' }} />
          </div>
        </div>
      ))}
      {budgetFail.value ? (
        <div class="budget-fail-warning">
          <div class="budget-fail-title">Performance budget failed for /dashboard</div>
          <div class="budget-fail-item">lazy load charts</div>
          <div class="budget-fail-item">split admin table</div>
          <div class="budget-fail-item">convert widgets into islands</div>
          <div class="budget-fail-item">move static work to the server</div>
        </div>
      ) : null}
    </div>
  )
}
