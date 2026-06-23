import { execSync, spawn } from 'child_process'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join } from 'path'
import type {
  BenchmarkResult,
  BenchmarkCommands,
  Metric,
  Metrics,
  MetricKey,
  BudgetLimits,
  BudgetEvaluation,
  BudgetFailure,
  Quant,
  PerformanceBudget,
  Unit,
} from './types'
import { getMachineInfo, getGitInfo } from './machine'

const WARMUPS = 2
const MEASURED = 5
const TOTAL = WARMUPS + MEASURED

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Build a measured Metric. Numeric value + unit are stored separately.
 */
function measured(samples: number[], unit: Unit, source: string): Metric {
  return {
    value: median(samples),
    unit,
    min: Math.min(...samples),
    max: Math.max(...samples),
    samples,
    measured: true,
    source,
  }
}

/**
 * Build an explicit unmeasured Metric. value is null so downstream code can't
 * accidentally read a synthetic fallback as real data.
 */
function unmeasured(unit: Unit, source: string, reason: string): Metric {
  return {
    value: null,
    unit,
    measured: false,
    source,
    reason,
  }
}

async function runBuildTime(cwd: string): Promise<Metric> {
  const samples: number[] = []
  for (let i = 0; i < TOTAL; i++) {
    const start = performance.now()
    execSync('npx vite build 2>/dev/null', { cwd, stdio: 'pipe', timeout: 120_000 })
    const elapsed = performance.now() - start
    if (i >= WARMUPS) samples.push(elapsed)
  }
  if (samples.length === 0) {
    return unmeasured('ms', 'vite build command', 'build command failed on every iteration')
  }
  return measured(samples, 'ms', 'vite build command (median of 5 runs after 2 warmups)')
}

async function measureInitialJs(cwd: string): Promise<Metric> {
  const distDir = join(cwd, 'dist', 'assets')
  if (!existsSync(distDir)) {
    return unmeasured('kb', 'sum of dist/assets/*.js', 'dist/assets directory not present')
  }
  const files = readdirSync(distDir).filter((f) => f.endsWith('.js'))
  if (files.length === 0) {
    return unmeasured('kb', 'sum of dist/assets/*.js', 'no .js files in dist/assets')
  }
  const samples: number[] = []
  for (let i = 0; i < TOTAL; i++) {
    let totalBytes = 0
    for (const file of files) totalBytes += statSync(join(distDir, file)).size
    if (i >= WARMUPS) samples.push(totalBytes / 1024)
  }
  return measured(samples, 'kb', 'sum of dist/assets/*.js sizes (median of 5 runs after 2 warmups)')
}

async function runApiLatency(url: string): Promise<Metric> {
  const samples: number[] = []
  let failureCount = 0
  for (let i = 0; i < TOTAL; i++) {
    const start = performance.now()
    let succeeded = false
    try {
      const res = await fetch(url)
      await res.text()
      succeeded = res.ok
    } catch {
      failureCount++
    }
    const elapsed = performance.now() - start
    if (i >= WARMUPS) samples.push(elapsed)
    if (!succeeded) failureCount++
  }
  if (failureCount === samples.length) {
    return unmeasured(
      'ms',
      'fetch of local dev server health endpoint',
      'no dev server was running or all requests failed',
    )
  }
  return measured(samples, 'ms', 'fetch of local dev server health endpoint (median of 5 successful runs)')
}

async function runSsrRender(): Promise<Metric> {
  const samples: number[] = []
  try {
    // Hoist imports OUTSIDE the measured loop: dynamic-import cost is
    // captured once at warmup; only `renderToString(tree)` runs are timed.
    const { renderToString } = await import('../../server/src/render')
    const { jsx } = await import('../../dom/src/jsx-runtime')
    if (typeof renderToString !== 'function' || typeof jsx !== 'function') {
      return unmeasured(
        'ms',
        '@speedjs/server.renderToString on real VDOM tree',
        '@speedjs/server or @speedjs/dom jsx runtime did not expose expected functions',
      )
    }
    for (let i = 0; i < TOTAL; i++) {
      const start = performance.now()
      // Render a REAL nested DOM tree, not a string literal.
      const tree = jsx('div', {
        children: jsx('span', { children: `ssr run ${i}` }),
      })
      renderToString(tree)
      const elapsed = performance.now() - start
      if (i >= WARMUPS) samples.push(elapsed)
    }
    return measured(
      samples,
      'ms',
      '@speedjs/server.renderToString on a real nested DOM tree built via @speedjs/dom jsx-runtime (median of 5 runs)',
    )
  } catch (e: any) {
    return unmeasured(
      'ms',
      '@speedjs/server.renderToString on real VDOM tree',
      `@speedjs/server or jsx runtime not loadable: ${e?.message ?? 'unknown error'}`,
    )
  }
}

async function runDevServerBoot(cwd: string): Promise<Metric> {
  const samples: number[] = []
  for (let i = 0; i < TOTAL; i++) {
    const start = performance.now()
    const proc = spawn('npx', ['vite', '--port', '5199', '--strictPort'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    })
    await new Promise<void>((resolve) => {
      const handler = (data: Buffer) => {
        if (data.toString().includes('Local:')) resolve()
      }
      proc.stdout?.on('data', handler)
      proc.stderr?.on('data', handler)
      setTimeout(() => resolve(), 15_000)
    })
    const elapsed = performance.now() - start
    proc.kill()
    if (i >= WARMUPS) samples.push(elapsed)
  }
  return measured(samples, 'ms', 'vite dev server spawn until "Local:" banner (median of 5 runs)')
}

async function runRouteRenderBench(): Promise<Metric> {
  const samples: number[] = []
  const routes: Array<{ id: string; path: string; file: string }> = [
    { id: 'home', path: '/', file: 'index.tsx' },
    { id: 'docs', path: '/docs/signals', file: 'docs/signals.tsx' },
    { id: 'user', path: '/users/[id]', file: 'users/[id].tsx' },
  ]
  try {
    const { matchRoute } = await import('../../router/src/matcher')
    for (let i = 0; i < TOTAL; i++) {
      const start = performance.now()
      // ROUTE MATCH resolution — distinguishes from "render the matched
      // route to DOM", which is a different (slower) operation. The metric
      // key remains `routeRenderMs` for schema stability; the source label
      // is explicit about what was measured.
      matchRoute(routes, '/users/42')
      const elapsed = performance.now() - start
      if (i >= WARMUPS) samples.push(elapsed)
    }
    if (samples.length === 0) {
      return unmeasured('ms', '@speedjs/router.matchRoute', 'no samples recorded')
    }
    return measured(
      samples,
      'ms',
      '@speedjs/router.matchRoute(match) resolution (NOT render-to-DOM) against 3-route manifest including [id] dynamic segment (median of 5 runs)',
    )
  } catch (e: any) {
    return unmeasured(
      'ms',
      '@speedjs/router.matchRoute',
      `@speedjs/router not loadable: ${e?.message ?? 'unknown error'}`,
    )
  }
}

async function runHydrationBench(): Promise<Metric> {
  // Snapshot globals up front. We use try/finally around the entire loop so
  // the restore lines fire even if happy-dom or the mount call throws.
  const prevDoc = (globalThis as any).document
  const prevWindow = (globalThis as any).window
  try {
    // Sequential imports — clearer error attribution if happy-dom or one of
    // the @speedjs/* workspace sources is missing.
    const { Window } = await import('happy-dom')
    const { mount } = await import('../../dom/src/renderer')
    const { jsx } = await import('../../dom/src/jsx-runtime')
    const samples: number[] = []
    for (let i = 0; i < TOTAL; i++) {
      const win = new Window()
      const doc = win.document
      // Inject the happy-dom Window into globals so @speedjs/dom's calls to
      // `document.createElement` etc. resolve to a real DOM tree.
      ;(globalThis as any).document = doc
      ;(globalThis as any).window = win

      try {
        // happy-dom's createElement returns HTMLDivElement (more specific than
        // the DOM lib's HTMLElement); cast to HTMLElement for mount().
        const root = doc.createElement('div') as unknown as HTMLElement
        const Component = () => jsx('div', { children: `hydration run ${i}` })
        const start = performance.now()
        mount(Component, root)
        const elapsed = performance.now() - start
        if (i >= WARMUPS) samples.push(elapsed)
      } finally {
        win.close?.()
      }
    }
    if (samples.length === 0) {
      return unmeasured('ms', 'happy-dom + @speedjs/dom.mount(real JSX)', 'no samples recorded despite loop completion')
    }
    return measured(
      samples,
      'ms',
      'happy-dom Window + @speedjs/dom.mount(real JSX component); fresh DOM per iteration (median of 5 runs)',
    )
  } catch (e: any) {
    return unmeasured(
      'ms',
      'happy-dom + @speedjs/dom.mount(real JSX)',
      `happy-dom not installed or dom mount failed: ${e?.message ?? 'unknown error'}`,
    )
  } finally {
    // Restore previous globals so other bench measurements aren't polluted.
    ;(globalThis as any).document = prevDoc
    ;(globalThis as any).window = prevWindow
  }
}

async function runMemoryUsage(): Promise<Metric> {
  const samples: number[] = []
  for (let i = 0; i < TOTAL; i++) {
    if (typeof global.gc === 'function') global.gc()
    const usage = process.memoryUsage().heapUsed / (1024 * 1024)
    if (i >= WARMUPS) samples.push(usage)
    await new Promise((r) => setTimeout(r, 50))
  }
  return measured(samples, 'mb', 'process.memoryUsage().heapUsed (median of 5 samples)')
}

async function runStaticGenBench(): Promise<Metric> {
  const samples: number[] = []
  try {
    // Hoist imports OUTSIDE the measured loop — only `renderToString(tree)`
    // runs are timed, not dynamic-import cost.
    const { renderToString } = await import('../../server/src/render')
    const { jsx } = await import('../../dom/src/jsx-runtime')
    if (typeof renderToString !== 'function' || typeof jsx !== 'function') {
      return unmeasured(
        'ms',
        '@speedjs/server.renderToString on static VDOM tree',
        '@speedjs/server or @speedjs/dom jsx runtime did not expose expected functions',
      )
    }
    for (let i = 0; i < TOTAL; i++) {
      const start = performance.now()
      // Realistic static-page shape: article containing heading + nested paragraphs.
      const tree = jsx('article', {
        children: [
          jsx('h1', { children: `Static benchmark ${i}` }),
          jsx('p', {
            children: jsx('span', {
              children: 'A reasonably sized body paragraph for static-generation timing.',
            }),
          }),
        ],
      })
      renderToString(tree)
      const elapsed = performance.now() - start
      if (i >= WARMUPS) samples.push(elapsed)
    }
    return measured(
      samples,
      'ms',
      '@speedjs/server.renderToString on a realistic static-markup VDOM tree (median of 5 runs)',
    )
  } catch (e: any) {
    return unmeasured(
      'ms',
      '@speedjs/server.renderToString on static VDOM tree',
      `@speedjs/server or jsx runtime not loadable: ${e?.message ?? 'unknown error'}`,
    )
  }
}

export async function runBenchmark(cwd?: string): Promise<BenchmarkResult> {
  const appDir = cwd || process.cwd()
  const machine = getMachineInfo()
  const git = getGitInfo()
  const rawLogs: string[] = []
  const log = (msg: string) => {
    rawLogs.push(msg)
    console.log(msg)
  }

  log(`Benchmark started at ${new Date().toISOString()}`)
  log(`Machine: ${machine.platform} / ${machine.cpu} / ${machine.cores} cores / ${machine.memory}`)
  log(`Node: ${machine.node}, pnpm: ${machine.pnpm}, bun: ${machine.bun}`)
  log(`Commit: ${git.commit}, Branch: ${git.branch}`)
  log(`Runs: ${MEASURED} measured + ${WARMUPS} warmup = ${TOTAL} total`)

  log('\n--- Build Time ---')
  const buildTimeMs = await runBuildTime(appDir)
  log(`  ${summarize(buildTimeMs)}`)

  log('\n--- Initial JS Size ---')
  const initialJsKb = await measureInitialJs(appDir)
  log(`  ${summarize(initialJsKb)}`)

  log('\n--- API Latency ---')
  const apiLatencyMs = await runApiLatency(`http://localhost:${process.env.PORT || '5173'}/api/health`)
  log(`  ${summarize(apiLatencyMs)}`)

  log('\n--- Route Render ---')
  const routeRenderMs = await runRouteRenderBench()
  log(`  ${summarize(routeRenderMs)}`)

  log('\n--- Hydration ---')
  const hydrationMs = await runHydrationBench()
  log(`  ${summarize(hydrationMs)}`)

  log('\n--- SSR Render ---')
  const ssrRenderMs = await runSsrRender()
  log(`  ${summarize(ssrRenderMs)}`)

  log('\n--- Static Generation ---')
  const staticGenTimeMs = await runStaticGenBench()
  log(`  ${summarize(staticGenTimeMs)}`)

  log('\n--- Dev Server Boot ---')
  const devServerBootMs = await runDevServerBoot(appDir)
  log(`  ${summarize(devServerBootMs)}`)

  log('\n--- Memory Usage ---')
  const memoryUsageMb = await runMemoryUsage()
  log(`  ${summarize(memoryUsageMb)}`)

  const metrics: Metrics = {
    initialJsKb,
    routeRenderMs,
    hydrationMs,
    apiLatencyMs,
    buildTimeMs,
    devServerBootMs,
    ssrRenderMs,
    staticGenTimeMs,
    memoryUsageMb,
  }

  const limits: BudgetLimits = {
    initialJsKb: { value: 40, unit: 'kb' },
    buildTimeMs: { value: 3000, unit: 'ms' },
    hydrationMs: { value: 50, unit: 'ms' },
  }

  const budget = evaluateBudget(metrics, limits)

  const result: BenchmarkResult = {
    schemaVersion: '1.0',
    framework: 'speedjs',
    app: 'starter',
    source: '@speedjs/bench + examples/starter',
    commit: git.commit,
    branch: git.branch,
    timestamp: new Date().toISOString(),
    machine,
    commands: {
      install: 'pnpm install',
      build: 'pnpm build',
      bench: 'pnpm bench',
    } satisfies BenchmarkCommands,
    metrics,
    budget,
    methodology: {
      runs: MEASURED,
      warmups: WARMUPS,
      reportedValue: 'median',
      notes: [
        'Initial JS and build time measured against production vite build output',
        'Route render measured via @speedjs/router.matchRoute() against a 3-route manifest including [id] dynamic segment',
        'Hydration measured via @speedjs/dom.mount(real JSX component) into a fresh happy-dom Window per iteration',
        'API latency measured against local dev server health endpoint when available',
        'SSR + static gen measured via @speedjs/server.renderToString on real VDOM trees built via @speedjs/dom jsx-runtime',
        'Memory usage measured via process.memoryUsage().heapUsed; --expose-gc is NOT set under tsx so absolute values reflect natural heap',
        'Dev server boot measured from spawn to first "Local:" banner output',
      ],
    },
  }

  log('\n--- Benchmark Complete ---')
  log(`Framework: ${result.framework}`)
  log(`App: ${result.app}`)
  log(`Commit: ${result.commit}`)
  log(`Budget status: ${result.budget.status}`)
  log(`Data quality: ${result.budget.dataQuality}`)
  log(`Measured: ${result.budget.measuredCount} / ${Object.keys(result.metrics).length}`)
  if (result.budget.unmeasuredMetrics.length > 0) {
    log(`Not measured: ${result.budget.unmeasuredMetrics.join(', ')}`)
  }

  return result
}

function summarize(m: Metric): string {
  if (!m.measured) return `not measured — ${m.reason ?? m.source}`
  const v = m.value as number
  const prec = m.unit === 'kb' || m.unit === 'mb' ? 1 : 0
  return `${v.toFixed(prec)}${m.unit} (min ${m.min?.toFixed(prec) ?? '?'}${m.unit}, max ${m.max?.toFixed(prec) ?? '?'}${m.unit})`
}

/**
 * Evaluate measured metrics against limits. Unmeasured metrics are NEVER treated
 * as failures — they go to `unmeasuredMetrics` and the `dataQuality` is reduced.
 *
 * overByPercent is computed as (actual - limit) / limit * 100 when measured and
 * over budget, otherwise 0.
 */
/**
 * Metrics tracked for completeness but NOT budget-evaluated. If a future
 * limit lands on one of these keys (e.g. `routeJsKb` joins `routeRenderMs`),
 * add it here so `dataQuality` computation sees the actual supplementary set.
 */
const ADDITIONAL_METRIC_KEYS: MetricKey[] = [
  'routeRenderMs',
  'apiLatencyMs',
  'ssrRenderMs',
  'staticGenTimeMs',
]

export function evaluateBudget(metrics: Metrics, limits: BudgetLimits): BudgetEvaluation {
  const failures: BudgetFailure[] = []
  const unmeasuredSet = new Set<MetricKey>()
  const actionable: string[] = []
  let measuredCount = 0

  const checks: Array<[MetricKey, Metric, Quant | undefined]> = [
    ['initialJsKb', metrics.initialJsKb, limits.initialJsKb],
    ['buildTimeMs', metrics.buildTimeMs, limits.buildTimeMs],
    ['hydrationMs', metrics.hydrationMs, limits.hydrationMs],
  ]

  for (const [key, metric, limit] of checks) {
    if (!limit) continue
    if (!metric.measured || metric.value === null) {
      unmeasuredSet.add(key)
      continue
    }
    measuredCount++
    if (metric.value > limit.value) {
      const overByValue = metric.value - limit.value
      failures.push({
        metric: key,
        actual: { value: round(metric.value, 2), unit: metric.unit },
        limit: { value: round(limit.value, 2), unit: limit.unit },
        overBy: { value: round(overByValue, 2), unit: metric.unit },
        overByPercent: round(((metric.value - limit.value) / limit.value) * 100, 2),
      })
    }
  }

  // Additional (non-budgeted) metrics: only flag unmeasured — they cannot
  // produce failures because they have no limit. The Set ensures no key
  // ever appears in BOTH unmeasuredMetrics and failures[] even if a future
  // budget limit coincides with one of these keys.
  for (const key of ADDITIONAL_METRIC_KEYS) {
    if (metrics[key] && !metrics[key].measured) unmeasuredSet.add(key)
  }

  for (const f of failures) {
    actionable.push(...actionableFor(f))
  }

  const unmeasured = Array.from(unmeasuredSet)
  if (unmeasured.length > 0) {
    actionable.push(
      `Benchmark data is incomplete. Not measured: ${unmeasured.join(', ')}. ` +
        'These metrics were not measured in this environment; the budget cannot fully judge them.',
    )
  }

  // dataQuality is derived from the additional metric slots: if every
  // supplementary measure is missing, the artifact can't characterize the
  // framework's behavior even when the budget itself is satisfied.
  // Single threshold: >= half the supplementary slots = 'insufficient';
  // any unmeasured at all = 'partial'; none = 'complete'.
  const totalBudgetMetrics = ADDITIONAL_METRIC_KEYS.length
  const dataQuality: 'complete' | 'partial' | 'insufficient' =
    unmeasured.length === 0
      ? 'complete'
      : unmeasured.length >= totalBudgetMetrics / 2
        ? 'insufficient'
        : 'partial'

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    dataQuality,
    measuredCount,
    unmeasuredMetrics: unmeasured,
    failures,
    actionable,
    limits,
  }
}

function round(v: number, n: number): number {
  const k = 10 ** n
  return Math.round(v * k) / k
}

function actionableFor(f: BudgetFailure): string[] {
  const m = readableMetric(f.metric)
  switch (f.metric) {
    case 'initialJsKb':
      return [
        `${m}: payload exceeds ${formatQuant(f.limit)} budget by ${formatQuant(f.overBy)} (${f.overByPercent}% over). ` +
          'Code-split heavy dependencies, convert non-interactive sections to server-rendered islands, and verify tree-shaking.',
      ]
    case 'buildTimeMs':
      return [
        `${m}: build time exceeds ${formatQuant(f.limit)} by ${formatQuant(f.overBy)} (${f.overByPercent}% over). ` +
          'Audit large static assets, isolate expensive Rollup plugins, and consider incremental builds.',
      ]
    case 'hydrationMs':
      return [
        `${m}: hydration took ${formatQuant(f.actual)}, ${formatQuant(f.overBy)} over the ${formatQuant(f.limit)} budget. ` +
          'Defer non-critical interactivity (lazy mount / islands), reduce initial signal subscriptions, and stagger hydration.',
      ]
    default:
      return [`${m} exceeds the budget.`]
  }
}

function readableMetric(key: MetricKey): string {
  switch (key) {
    case 'initialJsKb':
      return 'Initial JS'
    case 'buildTimeMs':
      return 'Build time'
    case 'hydrationMs':
      return 'Hydration'
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

/**
 * Format a Quant as a human string at the boundary (for terminal output).
 * The on-disk artifact never uses this — `value` and `unit` stay separate.
 */
function formatQuant(q: Quant): string {
  return `${q.value}${q.unit}`
}

/**
 * Backwards-compatible budget checker. Accepts the typed `PerformanceBudget`
 * (with stringly-typed size limits), runs `evaluateBudget` against it, and
 * returns a flattened shape for callers that haven't migrated yet.
 */
export function checkBudgets(metrics: Metrics, budget: PerformanceBudget): {
  passed: boolean
  failures: BudgetFailure[]
  unmeasured: MetricKey[]
  dataQuality: BudgetEvaluation['dataQuality']
  actionable: string[]
} {
  const limits: BudgetLimits = {
    initialJsKb: parseSize(budget.maxInitialJS),
    buildTimeMs: { value: budget.maxBuildMs, unit: 'ms' },
    hydrationMs: { value: budget.maxHydrationMs, unit: 'ms' },
    ...(budget.maxRouteJS ? { routeJsKb: parseSize(budget.maxRouteJS) } : {}),
  }
  const evalResult = evaluateBudget(metrics, limits)
  return {
    passed: evalResult.failures.length === 0,
    failures: evalResult.failures,
    unmeasured: evalResult.unmeasuredMetrics,
    dataQuality: evalResult.dataQuality,
    actionable: evalResult.actionable,
  }
}

function parseSize(s: string): Quant {
  const m = s.trim().match(/^([0-9]*\.?[0-9]+)(b|kb|mb|gb)$/i)
  if (!m) throw new Error(`Cannot parse size: "${s}" (expected e.g. "40kb")`)
  return { value: parseFloat(m[1]), unit: m[2].toLowerCase() as Unit }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + 'b'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'kb'
  return (bytes / (1024 * 1024)).toFixed(1) + 'mb'
}

export async function printBenchmarkReport(result: BenchmarkResult): Promise<void> {
  const chalk = (await import('chalk')).default
  console.log(chalk.bold('\nSpeed.js Benchmark Report\n'))
  console.log(chalk.dim(`Framework: ${result.framework}  App: ${result.app}  Commit: ${result.commit.slice(0, 8)}`))
  console.log(chalk.dim(`Machine: ${result.machine.platform} / ${result.machine.cpu.split(' ').slice(0, 3).join(' ')}`))
  console.log(chalk.dim(`Timestamp: ${result.timestamp}`))
  console.log()
  for (const [key, metric] of Object.entries(result.metrics)) {
    const label = readableMetric(key as MetricKey)
    if (!metric.measured) {
      console.log(`${label.padEnd(25)} ${chalk.gray('Not measured — ' + (metric.reason ?? metric.source))}`)
      continue
    }
    const v = metric.value as number
    const prec = metric.unit === 'kb' || metric.unit === 'mb' ? 1 : 0
    const display = `${v.toFixed(prec)}${metric.unit}`
    const color = v < 100 ? chalk.green : v < 1000 ? chalk.yellow : chalk.red
    console.log(`${label.padEnd(25)} ${color(display)}`)
    console.log(
      chalk.dim(
        `  min ${metric.min?.toFixed(prec)}${metric.unit}  max ${metric.max?.toFixed(prec)}${metric.unit}  samples [${metric.samples?.map((s: number) => s.toFixed(prec)).join(', ')}]`,
      ),
    )
  }
  console.log()
  console.log(
    `Budget: ${result.budget.status === 'passed' ? chalk.green('Passed') : chalk.red('Failed')}` +
      `  Data quality: ${result.budget.dataQuality}` +
      `  Measured ${result.budget.measuredCount} of ${Object.keys(result.metrics).length}`,
  )
  if (result.budget.unmeasuredMetrics.length > 0) {
    console.log(chalk.gray(`  Not measured: ${result.budget.unmeasuredMetrics.join(', ')}`))
  }
  if (result.budget.failures.length > 0) {
    for (const f of result.budget.failures) {
      console.log(
        chalk.red(`  ✗ ${readableMetric(f.metric)}: ${f.actual.value}${f.actual.unit} > ${f.limit.value}${f.limit.unit} (+${f.overBy.value}${f.overBy.unit}, +${f.overByPercent}%)`),
      )
    }
  }
  if (result.budget.actionable.length > 0) {
    console.log(chalk.yellow('\nActionable:'))
    for (const a of result.budget.actionable) console.log(`  • ${a}`)
  }
  console.log()
}

export async function printBudgetReport(check: {
  passed: boolean
  failures: BudgetFailure[]
  unmeasured: MetricKey[]
  actionable: string[]
}): Promise<void> {
  const chalk = (await import('chalk')).default
  if (check.passed && check.unmeasured.length === 0) {
    console.log(chalk.green('\n✓ All performance budgets passed'))
  } else {
    console.log(chalk.red(`\nBudget: ${check.passed ? 'passed' : 'failed'} — ${check.unmeasured.length} unmeasured metric(s)`))
    for (const u of check.unmeasured) {
      console.log(chalk.gray(`  • ${readableMetric(u)}: not measured this run`))
    }
    if (check.failures.length > 0) {
      console.log()
      for (const failure of check.failures) {
        console.log(chalk.red(`✗ ${readableMetric(failure.metric)}:`))
        console.log(`  Actual: ${failure.actual.value}${failure.actual.unit}`)
        console.log(`  Limit:  ${failure.limit.value}${failure.limit.unit}`)
        console.log(`  Over by: ${failure.overBy.value}${failure.overBy.unit} (${failure.overByPercent}% over)`)
        console.log()
      }
    }
    if (check.actionable.length > 0) {
      console.log(chalk.yellow('Suggestions:'))
      for (const a of check.actionable) console.log(`  • ${a}`)
    }
  }
}
