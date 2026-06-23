import { signal } from '@speedjs/core'

/**
 * Schema v1 metric shape. value is null when not measured; reading code MUST
 * render "Not measured" rather than substitute a placeholder number.
 */
interface Metric {
  value: number | null
  unit: string
  min?: number
  max?: number
  samples?: number[]
  measured: boolean
  source: string
  reason?: string
}

interface BudgetFailure {
  metric: string
  actual: { value: number; unit: string }
  limit: { value: number; unit: string }
  overBy: { value: number; unit: string }
  overByPercent: number
}

interface BenchmarkResponse {
  status: 'real' | 'sample' | 'failed' | 'stale' | 'error'
  lastUpdated: string | null
  timestamp?: string
  commit: string | null
  branch?: string
  framework?: string
  app?: string
  schemaVersion?: '1.0' | null
  metrics: Record<string, Metric> | null
  budget:
    | {
        status: 'passed' | 'failed'
        dataQuality: 'complete' | 'partial' | 'insufficient'
        measuredCount: number
        unmeasuredMetrics: string[]
        failures: BudgetFailure[]
        actionable: string[]
        limits: Record<string, { value: number; unit: string }>
      }
    | null
  history: any[]
  machine: any
  methodology: any
  warning?: string
}

const benchData = signal<BenchmarkResponse | null>(null)
const benchLoading = signal(true)
const benchError = signal<string | null>(null)
const benchCountdown = signal(30)
let benchInitialized = false

async function fetchBenchData() {
  benchLoading.value = true
  try {
    const res = await fetch('/benchmarks/latest.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    benchData.value = await res.json()
    benchError.value = null
  } catch (e: any) {
    benchError.value = e.message || 'Failed to fetch'
    benchData.value = null
  } finally {
    benchLoading.value = false
    benchCountdown.value = 30
  }
}

function initBenchmarks() {
  if (benchInitialized) return
  benchInitialized = true
  fetchBenchData()
  setInterval(() => fetchBenchData(), 30_000)
  setInterval(() => {
    if (benchCountdown.value > 0) benchCountdown.value -= 1
  }, 1000)
}

export function MetricCard({
  label,
  value,
  unit,
  status,
  subtitle,
  unmmeasured,
}: {
  label: string
  value: string
  unit?: string
  status?: string
  subtitle?: string
  unmmeasured?: boolean
  key?: any
}) {
  const valueColor = unmmeasured
    ? 'var(--text-muted-2)'
    : status === 'failed'
      ? 'var(--red, #ef4444)'
      : 'var(--text, #fff)'
  return (
    <div class={`metric-card ${unmmeasured ? 'metric-card-unmeasured' : ''}`}>
      <div class="metric-card-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {label}
        {unmmeasured ? (
          <span class="badge badge-amber" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
            not measured
          </span>
        ) : null}
      </div>
      <div class="metric-card-value" style={{ color: valueColor }}>
        {value}
        {unit && !unmmeasured ? (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)', marginLeft: 4 }}>{unit}</span>
        ) : null}
      </div>
      {subtitle ? (
        <div
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted-2)',
            fontFamily: 'var(--font-mono)',
            marginTop: 4,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  )
}

function formatMetric(metric: Metric): {
  value: string
  unit: string
  subtitle: string
  unmmeasured: boolean
} {
  if (!metric.measured || metric.value === null) {
    return {
      value: 'Not measured',
      unit: '',
      subtitle: metric.reason ?? metric.source,
      unmmeasured: true,
    }
  }
  const v = metric.value
  const prec = metric.unit === 'kb' || metric.unit === 'mb' ? 1 : 0
  return {
    value: v.toFixed(prec),
    unit: metric.unit,
    subtitle: `min: ${metric.min?.toFixed(prec) ?? '?'}  max: ${metric.max?.toFixed(prec) ?? '?'}  (${metric.samples?.length ?? 0} runs)`,
    unmmeasured: false,
  }
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

function computeDataStatus(d: BenchmarkResponse | null): string {
  if (!d) return 'sample'
  if (d.status === 'sample' || d.warning) return 'sample'
  if (!d.timestamp) return 'sample'
  if (d.status === 'stale') return 'stale'
  if (d.status === 'real') return 'real'
  if (d.status === 'failed') return 'failed'
  return 'real'
}

function statusBadge(): { label: string; variant: string } {
  if (benchLoading.value && !benchData.value) return { label: 'Loading', variant: 'cyan' }
  if (benchError.value) return { label: 'Error', variant: 'red' }
  const s = computeDataStatus(benchData.value)
  if (s === 'stale') return { label: 'Stale', variant: 'amber' }
  if (s === 'sample') return { label: 'Sample', variant: 'cyan' }
  if (s === 'failed') return { label: 'Budget failed', variant: 'red' }
  return { label: 'Real', variant: 'green' }
}

export function BenchmarkPanel() {
  initBenchmarks()
  const badge = statusBadge()
  const d = benchData.value

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <span class={`badge badge-${badge.variant}`}>
          <span class={`badge-dot badge-dot-${badge.variant}`} />
          {badge.label}
        </span>
        {d?.lastUpdated ? (
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted-2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Updated {timeAgo(d.lastUpdated)}
          </span>
        ) : null}
        {d?.commit ? (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted-2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            commit {d.commit.slice(0, 8)}
          </span>
        ) : null}
        {d?.schemaVersion ? (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted-2)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            schema {d.schemaVersion}
          </span>
        ) : null}
        <button
          class="btn btn-ghost btn-sm"
          onClick={fetchBenchData}
          style={{ marginLeft: 'auto', fontSize: '0.78rem' }}
        >
          Refresh{benchCountdown.value < 30 ? ` (${benchCountdown.value}s)` : ''}
        </button>
      </div>

      {d?.warning ? (
        <div class="callout callout-info" style={{ marginBottom: 20 }}>
          {d.warning}
        </div>
      ) : null}

      {benchError.value ? (
        <div class="callout callout-error" style={{ marginBottom: 20 }}>
          Failed to load benchmark data: {benchError.value}
        </div>
      ) : null}

      {benchLoading.value && !d ? (
        <div class="pdp-grid">
          {[
            'Initial JS',
            'Hydration Cost',
            'Route Render',
            'API Latency',
            'Build Time',
            'Dev Server Boot',
          ].map((label) => (
            <MetricCard key={label} label={label} value="—" status="sample" subtitle="Loading..." />
          ))}
        </div>
      ) : null}

      {d?.metrics ? (
        <div class="pdp-grid">
          <MetricCard
            label="Initial JS"
            {...formatMetric(d.metrics.initialJsKb)}
            status={d.budget?.failures?.some((f) => f.metric === 'initialJsKb') ? 'failed' : d.status}
          />
          <MetricCard
            label="Build Time"
            {...formatMetric(d.metrics.buildTimeMs)}
            status={d.budget?.failures?.some((f) => f.metric === 'buildTimeMs') ? 'failed' : d.status}
          />
          <MetricCard
            label="Hydration"
            {...formatMetric(d.metrics.hydrationMs)}
            status={d.budget?.failures?.some((f) => f.metric === 'hydrationMs') ? 'failed' : d.status}
          />
          <MetricCard
            label="Route Render"
            {...formatMetric(d.metrics.routeRenderMs)}
          />
          <MetricCard
            label="API Latency"
            {...formatMetric(d.metrics.apiLatencyMs)}
          />
          <MetricCard
            label="Dev Server Boot"
            {...formatMetric(d.metrics.devServerBootMs)}
          />
          <MetricCard
            label="SSR Render"
            {...formatMetric(d.metrics.ssrRenderMs)}
          />
          <MetricCard
            label="Static Gen"
            {...formatMetric(d.metrics.staticGenTimeMs)}
          />
          <MetricCard
            label="Memory"
            {...formatMetric(d.metrics.memoryUsageMb)}
          />
        </div>
      ) : null}

      {d?.budget ? (
        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${d.budget.status === 'failed' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
            background: d.budget.status === 'failed' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.06)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              color: d.budget.status === 'failed' ? 'var(--red, #ef4444)' : 'var(--green, #22c55e)',
              fontWeight: 600,
            }}
          >
            Budget {d.budget.status === 'passed' ? 'passed' : 'failed'}
          </span>
          <span>Data quality: {d.budget.dataQuality}</span>
          <span>Measured {d.budget.measuredCount} of {Object.keys(d.metrics ?? {}).length}</span>
          {d.budget.unmeasuredMetrics.length > 0 ? (
            <span>
              Not measured: {d.budget.unmeasuredMetrics.join(', ')}
            </span>
          ) : null}
        </div>
      ) : null}

      {d?.machine ? (
        <div
          style={{
            marginTop: 24,
            padding: '16px 20px',
            background: 'var(--panel)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontSize: '0.78rem',
            color: 'var(--text-muted-2)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {d.machine.platform} / {d.machine.cpu} / {d.machine.memory} / Node {d.machine.node}
        </div>
      ) : null}
    </div>
  )
}
