import { signal } from '@speedjs/core'

/**
 * Schema v1 budget.actions[] — concrete, honest next steps derived from the
 * measured metrics and the failing budgets. Surfaced verbatim so the website
 * stays in lock-step with the bench runner.
 */
interface BenchPayload {
  status: 'real' | 'sample' | 'stale' | 'failed' | 'error'
  timestamp: string | null
  commit: string | null
  warning?: string
  metrics: any | null
  budget:
    | {
        status: 'passed' | 'failed'
        dataQuality: 'complete' | 'partial' | 'insufficient'
        measuredCount: number
        unmeasuredMetrics: string[]
        failures: any[]
        actionable: string[]
        limits: Record<string, { value: number; unit: string }>
      }
    | null
}

const data = signal<BenchPayload | null>(null)
let initialized = false

async function load() {
  try {
    const res = await fetch('/benchmarks/latest.json')
    if (!res.ok) return
    data.value = await res.json()
  } catch {
    /* keep previous on error */
  }
}

function init() {
  if (initialized) return
  initialized = true
  load()
  setInterval(load, 30_000)
}

export function BudgetActionsPanel() {
  init()
  const d = data.value
  const actionable = d?.budget?.actionable ?? []

  if (actionable.length === 0 && d?.budget?.status === 'passed' && d?.budget?.dataQuality === 'complete') {
    return (
      <div class="budget-actions-panel budget-actions-panel-ok">
        <div class="budget-actions-header">
          <span class="badge badge-green">
            <span class="badge-dot badge-dot-green" />
            All budgets passed
          </span>
          <span class="budget-actions-subtitle">
            Every benchmark was measured and every limit is satisfied. No follow-up needed.
          </span>
        </div>
      </div>
    )
  }

  if (actionable.length === 0) {
    return null
  }

  const failuresCount = d?.budget?.failures.length ?? 0
  const unmeasuredCount = d?.budget?.unmeasuredMetrics.length ?? 0
  const headerLabel =
    failuresCount > 0 && unmeasuredCount > 0
      ? `${failuresCount} failure${failuresCount === 1 ? '' : 's'} · ${unmeasuredCount} not measured`
      : failuresCount > 0
        ? `${failuresCount} failure${failuresCount === 1 ? '' : 's'}`
        : `${unmeasuredCount} not measured`

  return (
    <div class="budget-actions-panel">
      <div class="budget-actions-header">
        <span class="badge badge-amber">
          {headerLabel}
        </span>
        <span class="budget-actions-subtitle">
          What Speed.js suggests you do next, derived from the normalized artifact at
          {' '}<code style={{ color: 'var(--cyan)' }}>public/benchmarks/latest.json</code>.
        </span>
      </div>
      <ul class="budget-actions-list" style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
        {actionable.map((a, i) => (
          <li key={i} class="budget-actions-item">
            <span class="budget-actions-bullet" aria-hidden="true">→</span>
            <span class="budget-actions-text">{a}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
