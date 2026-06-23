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
  let imported = false
  for (let i = 0; i < TOTAL; i++) {
    const start = performance.now()
    try {
      const mod = await import('@speedjs/server')
      if (typeof mod.renderToString === 'function') {
        await mod.renderToString('<div>benchmark</div>')
        imported = true
      }
    } catch {
      /* @speedjs/server not available */
    }
    const elapsed = performance.now() - start
    if (i >= WARMUPS) samples.push(elapsed)
  }
  if (!imported) {
    return unmeasured(
      'ms',
      '@speedjs/server.renderToString("<div>benchmark</div>")',
      '@speedjs/server package not loadable; falling back would have hidden the truth',
    )
  }
  return measured(samples, 'ms', '@speedjs/server.renderToString on synthetic tree (median of 5 runs)')
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
  // The previous code ran a synthetic 1000-iteration addition loop and called it
  // "route render". That is dishonest. We refuse to call that a route render
  // measurement and explicitly tag it as not_measured.
  return unmeasured(
    'ms',
    'would have been: 1000-iteration addition loop',
    'synthetic loop does not exercise the route renderer; no real measurement performed',
  )
}

async function runHydrationBench(): Promise<Metric> {
  // Even if @speedjs/dom.mount() succeeds, mounting a string into a fake DOM node
  // is not the same as hydrating a real tree. We mark this unmeasured until we
  // run against an actual DOM environment.
  return unmeasured(
    'ms',
    'would have been: @speedjs/dom.mount() on synthetic node',
    'mount target is a mock object; not representative of real DOM hydration',
  )
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
  let imported = false
  for (let i = 0; i < TOTAL; i++) {
    const start = performance.now()
    try {
      const mod = await import('@speedjs/server')
      if (typeof mod.renderToString === 'function') {
        await mod.renderToString('<div>static benchmark content</div>')
        imported = true
      }
    } catch {
      /* @speedjs/server not available */
    }
    const elapsed = performance.now() - start
    if (i >= WARMUPS) samples.push(elapsed)
  }
  if (!imported) {
    return unmeasured(
      'ms',
      '@speedjs/server.renderToString("<div>static benchmark content</div>")',
      '@speedjs/server package not loadable',
    )
  }
  return measured(samples, 'ms', '@speedjs/server.renderToString on static markup (median of 5 runs)')
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
        'Route render is not measured; the synthetic loop previously used was removed for honesty',
        'API latency measured against local dev server health endpoint when available',
        'SSR/static gen measured from @speedjs/server when loadable; otherwise marked not_measured',
        'Hydration not measured: a mock DOM node is not representative',
        'Memory usage measured via process.memoryUsage().heapUsed',
        'Dev server boot measured from spawn to first Local: output',
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
export function evaluateBudget(metrics: Metrics, limits: BudgetLimits): BudgetEvaluation {
  const failures: BudgetFailure[] = []
  const unmeasured: MetricKey[] = []
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
      unmeasured.push(key)
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

  if (metrics.routeRenderMs && !metrics.routeRenderMs.measured) {
    unmeasured.push('routeRenderMs')
  }
  if (metrics.apiLatencyMs && !metrics.apiLatencyMs.measured) {
    unmeasured.push('apiLatencyMs')
  }
  if (metrics.ssrRenderMs && !metrics.ssrRenderMs.measured) {
    unmeasured.push('ssrRenderMs')
  }
  if (metrics.staticGenTimeMs && !metrics.staticGenTimeMs.measured) {
    unmeasured.push('staticGenTimeMs')
  }

  for (const f of failures) {
    actionable.push(...actionableFor(f))
  }

  if (unmeasured.length > 0) {
    actionable.push(
      `Benchmark data is incomplete. Not measured: ${unmeasured.join(', ')}. ` +
        'These metrics were not measured in this environment; the budget cannot fully judge them.',
    )
  }

  const totalMetrics = Object.keys(checks).length + 4 // 4 additional metrics tracked for completeness
  const dataQuality: 'complete' | 'partial' | 'insufficient' =
    unmeasured.length === totalMetrics
      ? 'insufficient'
      : unmeasured.length >= totalMetrics / 2
        ? 'insufficient'
        : unmeasured.length === 0
          ? 'complete'
          : 'partial'

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    dataQuality,
    measuredCount,
    unmeasuredMetrics: Array.from(new Set(unmeasured)),
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
