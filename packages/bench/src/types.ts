/**
 * Speed.js benchmark artifact schema (v1).
 *
 * Honesty rules:
 *   - Numeric values are ALWAYS a real number (or null). Never embed a unit in the string.
 *     e.g. { value: 82.7, unit: 'kb' } instead of "82.7kb".
 *   - If a metric could not be measured, value is null and `measured` is false.
 *     Display code MUST render "Not measured" (not "—" or "n/a") and tag it as unmeasured.
 *   - Budget status reflects only the metrics that WERE measured. Unmeasured metrics
 *     contribute to `unmeasuredMetrics` and never silently pass.
 *   - `dataQuality` is derived: 'complete' when all metrics measured, 'partial' when
 *     some measured, 'insufficient' when fewer than half are measured.
 */

export type SizeUnit = 'b' | 'kb' | 'mb' | 'gb'
export type TimeUnit = 'ns' | 'us' | 'ms' | 's'
export type Unit = SizeUnit | TimeUnit

/** A numeric value with explicit unit. Decimal-friendly. */
export interface Quant {
  value: number
  unit: Unit
}

/**
 * One metric result. `value` is the median of `samples` (when measured).
 * `unit` is the measurement unit (e.g. 'kb', 'ms'). If `measured` is false,
 * `value` must be `null` and `reason` should explain why.
 */
export interface Metric {
  value: number | null
  unit: Unit
  min?: number
  max?: number
  samples?: number[]
  measured: boolean
  /** How this metric was measured. Free-form, but stable across runs. */
  source: string
  /** Only present when `measured` is false. */
  reason?: string
}

export type MetricKey =
  | 'initialJsKb'
  | 'buildTimeMs'
  | 'hydrationMs'
  | 'routeRenderMs'
  | 'apiLatencyMs'
  | 'devServerBootMs'
  | 'ssrRenderMs'
  | 'staticGenTimeMs'
  | 'memoryUsageMb'

export type Metrics = Record<MetricKey, Metric>

export interface MachineInfo {
  platform: string
  cpu: string
  cores: number
  memory: string
  node: string
  bun: string
  pnpm: string
}

/** Benchmarks are produced by the `@speedjs/bench` collector. */
export interface BenchmarkCommands {
  install: string
  build: string
  bench: string
}

export interface MethodologyInfo {
  runs: number
  warmups: number
  reportedValue: 'median' | 'mean' | 'p95'
  notes: string[]
}

/** Limits defined by the user / framework. All structured — no string concatenation. */
export interface BudgetLimits {
  initialJsKb: Quant
  buildTimeMs: Quant
  hydrationMs: Quant
  routeJsKb?: Quant
}

/**
 * One budget failure. `overBy` and `overByPercent` are precomputed so the website
 * doesn't need to do math (and doesn't accidentally disagree with the CI).
 */
export interface BudgetFailure {
  metric: MetricKey
  actual: Quant
  limit: Quant
  overBy: Quant
  overByPercent: number
}

/**
 * Result of evaluating the measured metrics against the budget.
 * `dataQuality` distinguishes "every metric was measured and budgets all passed"
 * from "some metrics couldn't be measured — we can't be sure".
 */
export interface BudgetEvaluation {
  status: 'passed' | 'failed'
  dataQuality: 'complete' | 'partial' | 'insufficient'
  measuredCount: number
  unmeasuredMetrics: MetricKey[]
  failures: BudgetFailure[]
  actionable: string[]
  limits: BudgetLimits
}

/**
 * The full normalized benchmark artifact published from CI.
 * This is what consumers (website, dashboards, regression alerts) read.
 */
export interface BenchmarkResult {
  schemaVersion: '1.0'
  framework: string
  app: string
  /** Where this artifact comes from — e.g. "@speedjs/bench + starter app". */
  source: string
  commit: string
  branch: string
  timestamp: string
  machine: MachineInfo
  commands: BenchmarkCommands
  metrics: Metrics
  budget: BudgetEvaluation
  methodology: MethodologyInfo
}

/** User-defined performance budget (typed). */
export interface PerformanceBudget {
  maxInitialJS: string
  maxRouteJS?: string
  maxBuildMs: number
  maxHydrationMs: number
}

/** Reported result of `checkBudgets`. Mirrors `BudgetEvaluation` but on a typed input. */
export interface BudgetCheckResult {
  passed: boolean
  failures: BudgetFailure[]
  unmeasured: MetricKey[]
  dataQuality: 'complete' | 'partial' | 'insufficient'
  actionable: string[]
}

export interface ComparisonResult {
  framework: string
  comparedTo: string
  timestamp: string
  commit: string
  machine: MachineInfo
  metrics: Record<
    string,
    { speedjs: Quant | null; other: Quant | null; measured: boolean }
  >
  methodology: MethodologyInfo
}
