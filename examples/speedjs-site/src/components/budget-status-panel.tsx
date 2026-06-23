import { signal } from '@speedjs/core'

/**
 * Schema v1 normalized metric shape. value is null when not measured; reason
 * is required in that case so we can show real causation in the UI.
 */
interface Metric {
  value: number | null
  unit: string
  measured: boolean
  source?: string
  reason?: string
  min?: number
  max?: number
  samples?: number[]
}

interface BudgetFailure {
  metric: string
  actual: { value: number; unit: string }
  limit: { value: number; unit: string }
  overBy: { value: number; unit: string }
  overByPercent: number
}

interface NormalizedBudget {
  status: 'passed' | 'failed'
  dataQuality: 'complete' | 'partial' | 'insufficient'
  measuredCount: number
  unmeasuredMetrics: string[]
  failures: BudgetFailure[]
  actionable: string[]
  limits: Record<string, { value: number; unit: string }>
}

interface BenchPayload {
  status: 'real' | 'sample' | 'stale' | 'failed' | 'error'
  timestamp: string | null
  commit: string | null
  branch?: string
  framework?: string
  app?: string
  schemaVersion?: '1.0' | null
  warning?: string
  metrics: Record<string, Metric> | null
  budget: NormalizedBudget | null
  machine?: any
  history: any[]
}

const data = signal<BenchPayload | null>(null)
const loading = signal(true)
const error = signal<string | null>(null)
let initialized = false

async function load() {
  loading.value = true
  try {
    const res = await fetch('/benchmarks/latest.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data.value = await res.json()
    error.value = null
  } catch (e: any) {
    error.value = e.message
    data.value = null
  } finally {
    loading.value = false
  }
}

function init() {
  if (initialized) return
  initialized = true
  load()
  setInterval(load, 30_000)
}

const readable: Record<string, string> = {
  initialJsKb: 'Initial JS',
  buildTimeMs: 'Build time',
  hydrationMs: 'Hydration',
  routeJsKb: 'Route JS',
  routeRenderMs: 'Route render',
  apiLatencyMs: 'API latency',
  devServerBootMs: 'Dev server boot',
  ssrRenderMs: 'SSR render',
  staticGenTimeMs: 'Static generation',
  memoryUsageMb: 'Memory usage',
}

function fmtQ(q: { value: number; unit: string }, prec = 2): string {
  const v = q.value
  // Use 2-decimal precision (e.g. 84.7kb) to match the layout the user wrote out.
  return `${v.toFixed(prec)}` + q.unit
}

export function BudgetStatusPanel() {
  init()
  const d = data.value

  if (loading.value && !d) {
    return (
      <div class="budget-status-panel loading">
        <div class="budget-row">
          <span class="budget-row-label">Status</span>
          <span class="budget-row-value">Loading…</span>
        </div>
      </div>
    )
  }

  if (error.value) {
    return (
      <div class="budget-status-panel error">
        <div class="budget-row">
          <span class="budget-row-label">Status</span>
          <span class="budget-row-value budget-failed">Failed to load benchmark data</span>
        </div>
        <div class="budget-row budget-row-detail">{error.value}</div>
      </div>
    )
  }

  if (!d || !d.budget || !d.metrics) {
    return (
      <div class="budget-status-panel empty">
        <div class="budget-row">
          <span class="budget-row-label">Status</span>
          <span class="budget-row-value">No data</span>
        </div>
      </div>
    )
  }

  // Order matches the user's example: Initial JS, Build time, Route JS, Hydration.
  // Other budget-bound metric rows join the list in their declared order if a
  // limit exists for them.
  const orderedBudgetKeys: string[] = []
  const limits = d.budget.limits
  if (limits.initialJsKb) orderedBudgetKeys.push('initialJsKb')
  if (limits.buildTimeMs) orderedBudgetKeys.push('buildTimeMs')
  if (limits.routeJsKb) orderedBudgetKeys.push('routeJsKb')
  if (limits.hydrationMs) orderedBudgetKeys.push('hydrationMs')

  const failures = d.budget.failures
  const unmeasured = new Set<string>([
    'hydrationMs', // hydrationMs is special: if the metric is unmeasured we render it here
    ...d.budget.unmeasuredMetrics.filter((k) => orderedBudgetKeys.includes(k)),
  ])

  const statusLabel = d.budget.status === 'passed' ? 'Passed' : 'Failed'
  const statusVariant = d.budget.status === 'passed' ? 'green' : 'red'
  const qualityVariant =
    d.budget.dataQuality === 'complete'
      ? 'green'
      : d.budget.dataQuality === 'partial'
        ? 'amber'
        : 'red'

  return (
    <div class="budget-status-panel">
      <div class="budget-status-header">
        <div class="budget-header-row">
          <span class="budget-header-label">Status</span>
          <span class={`badge badge-${statusVariant}`}>
            <span class={`badge-dot badge-dot-${statusVariant}`} />
            {statusLabel}
          </span>
        </div>
        <div class="budget-header-row">
          <span class="budget-header-label">Data quality</span>
          <span class={`badge badge-${qualityVariant}`}>
            {d.budget.dataQuality}
          </span>
        </div>
        <div class="budget-header-row budget-header-detail">
          <span class="budget-header-label">
            Measured {d.budget.measuredCount} of {orderedBudgetKeys.length}
          </span>
          {d.commit ? (
            <span class="budget-meta">
              commit {d.commit.slice(0, 8)} · schema {d.schemaVersion ?? '—'}
            </span>
          ) : null}
        </div>
      </div>

      <div class="budget-status-rows">
        {orderedBudgetKeys.map((key) => {
          const failure = failures.find((f) => f.metric === key)
          const limit = (limits as any)[key]
          const metric = d.metrics![key]

          // If we have a real failure, render actual / limit + overBy subrow
          if (failure) {
            return (
              <div class={`budget-row budget-row-failed`} key={key}>
                <div class="budget-row-main">
                  <span class="budget-row-label">{readable[key] ?? key}</span>
                  <span class="budget-row-value">
                    {fmtQ(failure.actual)} <span class="budget-row-limit">/ {fmtQ(failure.limit)}</span>
                  </span>
                </div>
                <div class="budget-row-sub budget-row-overby">
                  Over budget by: {fmtQ(failure.overBy)} (+{failure.overByPercent.toFixed(2)}%)
                </div>
              </div>
            )
          }

          // If there's a limit and metric is measured+within budget, show actual/limit
          if (metric && metric.measured && metric.value !== null && limit) {
            return (
              <div class="budget-row" key={key}>
                <div class="budget-row-main">
                  <span class="budget-row-label">{readable[key] ?? key}</span>
                  <span class="budget-row-value">
                    {metric.value.toFixed(2)}
                    {metric.unit} <span class="budget-row-limit">/ {fmtQ(limit)}</span>
                  </span>
                </div>
                <div class="budget-row-sub">Within budget</div>
              </div>
            )
          }

          // Otherwise not measured
          return (
            <div class="budget-row budget-row-unmeasured" key={key} title={metric?.reason ?? metric?.source ?? ''}>
              <div class="budget-row-main">
                <span class="budget-row-label">{readable[key] ?? key}</span>
                <span class="budget-row-value">Not measured</span>
              </div>
              {metric?.reason ? (
                <div class="budget-row-sub">{metric.reason}</div>
              ) : (
                <div class="budget-row-sub">
                  {limit ? `${limit.value}${limit.unit} limit defined; no measurement produced yet.` : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
