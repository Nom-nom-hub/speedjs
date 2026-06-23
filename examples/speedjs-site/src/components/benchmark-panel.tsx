import { signal } from '@speedjs/core'

interface MetricData {
  median: number
  min: number
  max: number
  unit: string
  samples: number[]
}

interface BenchmarkResponse {
  status: 'real' | 'sample' | 'stale' | 'error'
  lastUpdated: string | null
  commit: string | null
  metrics: Record<string, MetricData> | null
  budget: { status: string; failures: any[] } | null
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
  setInterval(() => { if (benchCountdown.value > 0) benchCountdown.value -= 1 }, 1000)
}

export function MetricCard({ label, value, unit, status, subtitle }: { label: string; value: string; unit?: string; status?: string; subtitle?: string; key?: any }) {
  return (
    <div class="metric-card">
      <div class="metric-card-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {label}
        {status ? (
          <span class={`badge badge-${status === 'real' ? 'green' : status === 'stale' ? 'amber' : status === 'error' ? 'red' : 'cyan'}`}
                style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
            {status}
          </span>
        ) : null}
      </div>
      <div class="metric-card-value">{value}{unit ? <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)', marginLeft: 4 }}>{unit}</span> : null}</div>
      {subtitle ? <div style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{subtitle}</div> : null}
    </div>
  )
}

function formatMetric(metric: MetricData): { value: string; unit: string; subtitle: string } {
  const v = metric.median.toFixed(metric.unit === 'kb' ? 1 : metric.unit === 'mb' ? 1 : 0)
  return { value: v, unit: metric.unit, subtitle: `min: ${metric.min.toFixed(1)}  max: ${metric.max.toFixed(1)}  (${metric.samples.length} runs)` }
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

function computeDataStatus(d: any): string {
  if (!d) return 'sample'
  if (d.status === 'sample' || d.warning) return 'sample'
  if (!d.timestamp) return 'sample'
  const age = Date.now() - new Date(d.timestamp).getTime()
  if (age > 7 * 24 * 60 * 60 * 1000) return 'stale'
  return 'real'
}

function statusBadge(): { label: string; variant: string } {
  if (benchLoading.value && !benchData.value) return { label: 'Loading', variant: 'cyan' }
  if (benchError.value) return { label: 'Error', variant: 'red' }
  const s = computeDataStatus(benchData.value)
  if (s === 'stale') return { label: 'Stale', variant: 'amber' }
  if (s === 'sample') return { label: 'Sample', variant: 'cyan' }
  return { label: 'Real', variant: 'green' }
}

export function BenchmarkPanel() {
  initBenchmarks()
  const badge = statusBadge()
  const d = benchData.value

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span class={`badge badge-${badge.variant}`}>
          <span class={`badge-dot badge-dot-${badge.variant}`} />
          {badge.label} benchmark data
        </span>
        {d?.lastUpdated ? (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)' }}>
            Updated {timeAgo(d.lastUpdated)}
          </span>
        ) : null}
        {d?.commit ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)' }}>
            commit {d.commit.slice(0, 8)}
          </span>
        ) : null}
        <button class="btn btn-ghost btn-sm" onClick={fetchBenchData} style={{ marginLeft: 'auto', fontSize: '0.78rem' }}>
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
          {['Initial JS', 'Hydration Cost', 'Route Render', 'API Latency', 'Build Time', 'Budget Status'].map(label => (
            <MetricCard key={label} label={label} value="—" status="sample" subtitle="Loading..." />
          ))}
        </div>
      ) : null}

      {d?.metrics ? (
        <div class="pdp-grid">
          <MetricCard label="Initial JS" {...formatMetric(d.metrics.initialJsKb)} status={d.status} />
          <MetricCard label="Hydration Cost" {...formatMetric(d.metrics.hydrationMs)} status={d.status} />
          <MetricCard label="Route Render" {...formatMetric(d.metrics.routeRenderMs)} status={d.status} />
          <MetricCard label="API Latency" {...formatMetric(d.metrics.apiLatencyMs)} status={d.status} />
          <MetricCard label="Build Time" {...formatMetric(d.metrics.buildTimeMs)} status={d.status} />
          <MetricCard label="Budget Status" value={d.budget?.status === 'passed' ? 'Passed' : 'Failed'} status={d.status}
                      subtitle={d.budget?.failures?.length ? `${d.budget.failures.length} failure(s)` : 'All checks OK'} />
        </div>
      ) : null}

      {d?.machine ? (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--panel)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)' }}>
          {d.machine.platform} / {d.machine.cpu} / {d.machine.memory} / Node {d.machine.node}
        </div>
      ) : null}
    </div>
  )
}
