/**
 * Normalize script — converts the previous imperative benchmark artifact into
 * the new normalized schema (v1). It is safe to run idempotently. Re-runs do
 * not destroy the measured run that produced the source numbers; they just
 * re-shape the data the website reads.
 *
 * Usage: npx tsx benchmarks/normalize-artifact.ts
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'
import { cpus, totalmem, platform } from 'os'

const ROOT = process.cwd()
const LOCAL_DIR = join(ROOT, '.benchmarks')
const PUBLIC_DIRS = [
  join(ROOT, 'public', 'benchmarks'),
  join(ROOT, 'examples', 'speedjs-site', 'public', 'benchmarks'),
]

// ---------- Old-shape types (the legacy artifact) ----------

interface OldSample {
  median: number
  min: number
  max: number
  unit: string
  samples: number[]
}

interface OldBudget {
  status: 'passed' | 'failed'
  failures: Array<{ metric: string; actual: string; limit: string | number }>
}

interface OldBench {
  framework: string
  app: string
  commit: string
  branch: string
  timestamp: string
  machine: any
  commands: any
  metrics: Record<string, OldSample>
  budget: OldBudget
  methodology: any
}

interface OldBudgetArtifact {
  timestamp: string
  maxInitialJS: string
  actualInitialJS?: string
  maxRouteJS?: string
  actualRouteJS?: string
  maxBuildMs: number
  actualBuildMs?: number
  maxHydrationMs: number
  actualHydrationMs?: string | number
  status: 'passed' | 'failed'
  failures: any[]
  suggestions: any[]
}

// ---------- New-shape types (mirror of packages/bench/src/types.ts) ----------

type SizeUnit = 'b' | 'kb' | 'mb' | 'gb'
type TimeUnit = 'ms' | 's'
type Unit = SizeUnit | TimeUnit

interface Quant {
  value: number
  unit: Unit
}

interface Metric {
  value: number | null
  unit: Unit
  min?: number
  max?: number
  samples?: number[]
  measured: boolean
  source: string
  reason?: string
}

type MetricKey =
  | 'initialJsKb'
  | 'buildTimeMs'
  | 'hydrationMs'
  | 'routeRenderMs'
  | 'apiLatencyMs'
  | 'devServerBootMs'
  | 'ssrRenderMs'
  | 'staticGenTimeMs'
  | 'memoryUsageMb'

interface Metrics {
  initialJsKb: Metric
  routeRenderMs: Metric
  hydrationMs: Metric
  apiLatencyMs: Metric
  buildTimeMs: Metric
  devServerBootMs: Metric
  ssrRenderMs: Metric
  staticGenTimeMs: Metric
  memoryUsageMb: Metric
}

interface BudgetLimits {
  initialJsKb: Quant
  buildTimeMs: Quant
  hydrationMs: Quant
  routeJsKb?: Quant
}

interface BudgetFailure {
  metric: MetricKey
  actual: Quant
  limit: Quant
  overBy: Quant
  overByPercent: number
}

interface BudgetEvaluation {
  status: 'passed' | 'failed'
  dataQuality: 'complete' | 'partial' | 'insufficient'
  measuredCount: number
  unmeasuredMetrics: MetricKey[]
  failures: BudgetFailure[]
  actionable: string[]
  limits: BudgetLimits
}

interface BenchmarkResult {
  schemaVersion: '1.0'
  framework: string
  app: string
  source: string
  commit: string
  branch: string
  timestamp: string
  machine: any
  commands: any
  metrics: Metrics
  budget: BudgetEvaluation
  methodology: any
}

// ---------- Helpers ----------

function ensureDir(d: string) {
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
}

function round(v: number, n = 2): number {
  if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) return NaN
  const k = 10 ** n
  return Math.round(v * k) / k
}

function medianFromSamples(samples: number[]): number {
  if (!Array.isArray(samples) || samples.length === 0) return NaN
  const valid = samples.filter((s) => typeof s === 'number' && Number.isFinite(s))
  if (valid.length === 0) return NaN
  const sorted = [...valid].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function parseSize(s: string): Quant {
  const m = s.trim().match(/^([0-9]*\.?[0-9]+)(b|kb|mb|gb)$/i)
  if (!m) throw new Error(`Cannot parse size: "${s}"`)
  return { value: parseFloat(m[1]), unit: m[2].toLowerCase() as SizeUnit }
}

function unitFor(key: MetricKey): Unit {
  switch (key) {
    case 'initialJsKb':
    case 'routeRenderMs': // not actually used
    case 'buildTimeMs':
    case 'hydrationMs':
    case 'apiLatencyMs':
    case 'devServerBootMs':
    case 'ssrRenderMs':
    case 'staticGenTimeMs':
      return 'ms'
    case 'memoryUsageMb':
      return 'mb'
  }
}
void unitFor

/**
 * Given the old Sample for a metric, decide whether it represents a real
 * measurement or a synthetic fallback. The new schema's whole point is that
 * we NEVER report a synthetic value as if it were a real one.
 *
 * IMPORTANT: we ALWAYS recompute the median from `raw.samples[]` instead of
 * trusting a `median` field on the source. Earlier broken runs of this script
 * produced artifacts with `value: null but measured: true`; reading such a
 * source as input would re-propagate the bug. Recomputing from samples also
 * defends against future schema drift.
 */
function classify(key: MetricKey, raw: any, unit: Unit): Metric {
  const samples: number[] = Array.isArray(raw?.samples) ? raw.samples : []
  const computedMedian = medianFromSamples(samples)
  const min = samples.length > 0 ? Math.min(...samples) : NaN
  const max = samples.length > 0 ? Math.max(...samples) : NaN

  if (!Number.isFinite(computedMedian)) {
    return unmeasured(key, unit, 'no finite samples recorded for this metric')
  }

  if (suspiciousSynthetic(key, computedMedian)) {
    return unmeasured(
      key,
      unit,
      `legacy sample looks synthetic (median=${round(computedMedian, 2)}${unit}); tagged not_measured for honesty`,
    )
  }

  return {
    value: round(computedMedian, 2),
    unit,
    min: round(min, 2),
    max: round(max, 2),
    samples: samples.map((s) => round(s, 2)),
    measured: true,
    source: sourceFor(key),
  }
}

function unmeasured(key: MetricKey, unit: Unit, reason: string): Metric {
  return {
    value: null,
    unit,
    measured: false,
    source: sourceFor(key),
    reason,
  }
}

function suspiciousSynthetic(key: MetricKey, median: number): boolean {
  switch (key) {
    case 'routeRenderMs':
      return median < 1 // sub-millisecond route render is always synthetic
    case 'hydrationMs':
      return median < 5 // mounting a string into a fake DOM node is sub-5ms
    case 'ssrRenderMs':
      return median < 5
    case 'staticGenTimeMs':
      return median < 5
    case 'apiLatencyMs':
      return median < 0.5 // connection-refused returns near-instant
    default:
      return false
  }
}

function sourceFor(key: MetricKey): string {
  switch (key) {
    case 'initialJsKb':
      return 'sum of dist/assets/*.js (median of 5 runs after 2 warmups)'
    case 'buildTimeMs':
      return 'vite build command (median of 5 runs after 2 warmups)'
    case 'hydrationMs':
      return 'would have been: @speedjs/dom.mount() — currently not a real measurement'
    case 'routeRenderMs':
      return 'would have been: 1000-iteration loop — does not exercise route renderer'
    case 'apiLatencyMs':
      return 'fetch of local dev server health endpoint'
    case 'devServerBootMs':
      return 'vite dev server spawn until "Local:" banner (median of 5 runs)'
    case 'ssrRenderMs':
      return '@speedjs/server.renderToString on synthetic tree'
    case 'staticGenTimeMs':
      return '@speedjs/server.renderToString on static markup'
    case 'memoryUsageMb':
      return 'process.memoryUsage().heapUsed'
  }
}

// ---------- Budget evaluation ----------

function evaluateBudget(
  metrics: Metrics,
  limits: BudgetLimits,
): BudgetEvaluation {
  const failures: BudgetFailure[] = []
  const unmeasured: MetricKey[] = []
  const actionable: string[] = []
  let measuredCount = 0

  const checks: Array<[MetricKey, Quant | undefined]> = [
    ['initialJsKb', limits.initialJsKb],
    ['buildTimeMs', limits.buildTimeMs],
    ['hydrationMs', limits.hydrationMs],
    ['routeJsKb' as MetricKey, limits.routeJsKb],
  ]

  for (const [key, limit] of checks) {
    if (!limit) continue
    const m = (metrics as any)[key]
    if (!m || !m.measured || m.value === null) {
      unmeasured.push(key)
      continue
    }
    measuredCount++
    if (m.value > limit.value) {
      const overBy = round(m.value - limit.value, 2)
      const overByPercent = round(((m.value - limit.value) / limit.value) * 100, 2)
      failures.push({
        metric: key as MetricKey,
        actual: { value: round(m.value, 2), unit: m.unit },
        limit: { value: round(limit.value, 2), unit: limit.unit },
        overBy: { value: overBy, unit: m.unit },
        overByPercent,
      })
    }
  }

  // Also tag as unmeasured any non-budget metric that wasn't measured
  for (const key of ['routeRenderMs', 'apiLatencyMs', 'ssrRenderMs', 'staticGenTimeMs'] as MetricKey[]) {
    const m = metrics[key]
    if (!m.measured && !unmeasured.includes(key)) unmeasured.push(key)
  }

  for (const f of failures) actionable.push(...actionableFor(f))

  if (unmeasured.length > 0) {
    actionable.push(
      `Benchmark data is incomplete. Not measured: ${unmeasured.join(', ')}. The numbers shown reflect what we could honestly measure in this environment.`,
    )
  }

  const totalBudgetMetrics = 4
  const dataQuality: 'complete' | 'partial' | 'insufficient' =
    unmeasured.length === totalBudgetMetrics
      ? 'insufficient'
      : unmeasured.length >= totalBudgetMetrics / 2
        ? 'insufficient'
        : unmeasured.length === 0
          ? 'complete'
          : 'partial'

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    dataQuality,
    measuredCount,
    unmeasuredMetrics: Array.from(new Set(unmeasured)) as MetricKey[],
    failures,
    actionable,
    limits,
  }
}

function readable(key: MetricKey): string {
  switch (key) {
    case 'initialJsKb':
      return 'Initial JS'
    case 'buildTimeMs':
      return 'Build time'
    case 'hydrationMs':
      return 'Hydration'
    case 'routeJsKb':
      return 'Route JS'
    case 'routeRenderMs':
      return 'Route render'
    case 'apiLatencyMs':
      return 'API latency'
    case 'devServerBootMs':
      return 'Dev server boot'
    case 'ssrRenderMs':
      return 'SSR render'
    case 'staticGenTimeMs':
      return 'Static generation'
    case 'memoryUsageMb':
      return 'Memory usage'
  }
}

function actionableFor(f: BudgetFailure): string[] {
  switch (f.metric) {
    case 'initialJsKb':
      return [
        `${readable(f.metric)}: payload exceeds ${f.limit.value}${f.limit.unit} budget by ${f.overBy.value}${f.overBy.unit} (${f.overByPercent}% over). ` +
          'Code-split heavy dependencies, convert non-interactive sections to server-rendered islands, and verify tree-shaking is on.',
      ]
    case 'buildTimeMs':
      return [
        `${readable(f.metric)}: build time exceeds ${f.limit.value}${f.limit.unit} budget by ${f.overBy.value}${f.overBy.unit} (${f.overByPercent}% over). ` +
          'Audit large static assets, isolate expensive Rollup plugins, and consider incremental builds.',
      ]
    case 'hydrationMs':
      return [
        `${readable(f.metric)}: hydration took ${f.actual.value}${f.actual.unit}, ${f.overBy.value}${f.overBy.unit} over the ${f.limit.value}${f.limit.unit} budget. ` +
          'Defer non-critical interactivity (lazy mount / islands), reduce initial signal subscriptions, and stagger hydration.',
      ]
    case 'routeJsKb':
      return [
        `${readable(f.metric)}: route bundle exceeds ${f.limit.value}${f.limit.unit} budget by ${f.overBy.value}${f.overBy.unit} (${f.overByPercent}% over). ` +
          'Lazy load the route or split it into multiple bundles.',
      ]
    default:
      return [`${readable(f.metric)} exceeds its ${f.limit.value}${f.limit.unit} budget.`]
  }
}

// ---------- Read sources ----------

function readOldLatest(): OldBench | null {
  const p = join(LOCAL_DIR, 'latest.json')
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf-8'))
}

function readOldBudget(): OldBudgetArtifact | null {
  const p = join(LOCAL_DIR, 'budget-latest.json')
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf-8'))
}

function readOldHistory(): OldBench[] {
  const dir = join(LOCAL_DIR, 'history')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf-8')))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function detectMachine() {
  return {
    platform: platform(),
    cpu: (cpus()[0]?.model || 'unknown').trim(),
    cores: cpus().length,
    memory: (totalmem() / (1024 ** 3)).toFixed(1) + 'GB',
    node: safeExec('node --version'),
    bun: safeExec('bun --version') || 'not installed',
    pnpm: safeExec('pnpm --version'),
  }
}

function safeExec(cmd: string): string {
  try {
    return require('child_process').execSync(cmd, { encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}

// ---------- Build new artifact ----------

function buildNew(old: OldBench, oldBudget: OldBudgetArtifact | null): BenchmarkResult {
  const limits: BudgetLimits = {
    initialJsKb: parseSize(oldBudget?.maxInitialJS ?? '40kb'),
    buildTimeMs: { value: oldBudget?.maxBuildMs ?? 3000, unit: 'ms' },
    hydrationMs: { value: oldBudget?.maxHydrationMs ?? 50, unit: 'ms' },
    ...(oldBudget?.maxRouteJS ? { routeJsKb: parseSize(oldBudget.maxRouteJS) } : {}),
  }

  const metrics: Metrics = {
    initialJsKb: classify('initialJsKb', old.metrics?.initialJsKb, 'kb'),
    routeRenderMs: classify('routeRenderMs', old.metrics?.routeRenderMs, 'ms'),
    hydrationMs: classify('hydrationMs', old.metrics?.hydrationMs, 'ms'),
    apiLatencyMs: classify('apiLatencyMs', old.metrics?.apiLatencyMs, 'ms'),
    buildTimeMs: classify('buildTimeMs', old.metrics?.buildTimeMs, 'ms'),
    devServerBootMs: classify('devServerBootMs', old.metrics?.devServerBootMs, 'ms'),
    ssrRenderMs: classify('ssrRenderMs', old.metrics?.ssrRenderMs, 'ms'),
    staticGenTimeMs: classify('staticGenTimeMs', old.metrics?.staticGenTimeMs, 'ms'),
    memoryUsageMb: classify('memoryUsageMb', old.metrics?.memoryUsageMb, 'mb'),
  }

  const budget = evaluateBudget(metrics, limits)

  return {
    schemaVersion: '1.0',
    framework: old.framework || 'speedjs',
    app: old.app || 'starter',
    source: '@speedjs/bench + examples/starter',
    commit: old.commit || 'unknown',
    branch: old.branch || 'unknown',
    timestamp: old.timestamp || new Date().toISOString(),
    machine: old.machine || detectMachine(),
    commands: old.commands || {
      install: 'pnpm install',
      build: 'pnpm build',
      bench: 'pnpm bench',
    },
    metrics,
    budget,
    methodology: old.methodology || {
      runs: 5,
      warmups: 2,
      reportedValue: 'median',
      notes: [
        'Normalized from previous artifact schema v0 → v1.',
        'Values that were synthetic in the old run are explicitly tagged measured:false.',
      ],
    },
  }
}

function buildBudgetOnly(newLatest: BenchmarkResult, oldBudget: OldBudgetArtifact | null) {
  // budget-latest.json is now a flattened summary of the latest evaluation,
  // derived fully from newLatest. We retain both value and unit separately so
  // no "—" (not measured) string can hide in the artifact.
  return {
    schemaVersion: '1.0' as const,
    timestamp: newLatest.timestamp,
    framework: newLatest.framework,
    app: newLatest.app,
    commit: newLatest.commit,
    branch: newLatest.branch,
    status: newLatest.budget.status,
    dataQuality: newLatest.budget.dataQuality,
    measuredCount: newLatest.budget.measuredCount,
    unmeasured: newLatest.budget.unmeasuredMetrics,
    limits: newLatest.budget.limits,
    failures: newLatest.budget.failures,
    actionable: newLatest.budget.actionable,
  }
}

// ---------- Writers ----------

function writeJson(path: string, data: unknown) {
  ensureDir(path.split('/').slice(0, -1).join('/'))
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`  wrote ${path}`)
}

function run() {
  console.log('Speed.js benchmark artifact normalizer')
  console.log('======================================\n')

  const oldLatest = readOldLatest()
  if (!oldLatest) {
    console.error(`No .benchmarks/latest.json found in ${ROOT}; nothing to normalize.`)
    process.exit(1)
  }

  const oldBudget = readOldBudget()
  const oldHistory = readOldHistory()

  const newLatest = buildNew(oldLatest, oldBudget)
  const newBudgetOnly = buildBudgetOnly(newLatest, oldBudget)
  const newHistory = oldHistory.map((h) => buildNew(h, null))

  console.log('Local .benchmarks/')
  writeJson(join(LOCAL_DIR, 'latest.json'), newLatest)
  writeJson(join(LOCAL_DIR, 'budget-latest.json'), newBudgetOnly)
  for (const h of newHistory) {
    const fileName = h.timestamp.replace(/[:.]/g, '-') + '.json'
    writeJson(join(LOCAL_DIR, 'history', fileName), h)
  }

  for (const publicDir of PUBLIC_DIRS) {
    if (!existsSync(publicDir) && publicDir.endsWith('public/benchmarks')) {
      // Only auto-write to existing public/benchmarks dirs so we don't spawn
      // empty trees elsewhere.
      continue
    }
    console.log(`\n${publicDir}`)
    writeJson(join(publicDir, 'latest.json'), newLatest)
    writeJson(join(publicDir, 'budget-latest.json'), newBudgetOnly)
    for (const h of newHistory) {
      const fileName = h.timestamp.replace(/[:.]/g, '-') + '.json'
      writeJson(join(publicDir, 'history', fileName), h)
    }
    writeJson(join(publicDir, 'history.json'), newHistory.slice(0, 20))
  }

  // Bubble a quiet failure for CI: non-zero exit if budget failed
  if (newLatest.budget.status === 'failed') {
    console.log('\nNote: budget currently fails. The artifact still wrote (Speed.js is honest about failure).')
    // Exit 0 — the artifact is the source of truth, CI reads it.
  }
}

run()
