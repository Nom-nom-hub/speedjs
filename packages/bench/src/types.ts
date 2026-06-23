export interface MachineInfo {
  platform: string
  cpu: string
  cores: number
  memory: string
  node: string
  bun: string
  pnpm: string
}

export interface MetricSample {
  median: number
  min: number
  max: number
  unit: string
  samples: number[]
}

export interface BenchmarkMetrics {
  initialJsKb: MetricSample
  routeRenderMs: MetricSample
  hydrationMs: MetricSample
  apiLatencyMs: MetricSample
  buildTimeMs: MetricSample
  devServerBootMs: MetricSample
  ssrRenderMs: MetricSample
  staticGenTimeMs: MetricSample
  memoryUsageMb: MetricSample
}

export interface BenchmarkCommands {
  install: string
  build: string
  bench: string
}

export interface MethodologyInfo {
  runs: number
  warmups: number
  reportedValue: string
  notes: string[]
}

export interface BudgetStatus {
  status: 'passed' | 'failed'
  failures: Array<{ metric: string; actual: number; limit: number; unit: string }>
}

export interface BenchmarkResult {
  framework: string
  app: string
  commit: string
  branch: string
  timestamp: string
  machine: MachineInfo
  commands: BenchmarkCommands
  metrics: BenchmarkMetrics
  budget: BudgetStatus
  methodology: MethodologyInfo
}

export interface PerformanceBudget {
  maxInitialJS: string
  maxRouteJS: string
  maxBuildMs: number
  maxHydrationMs: number
}

export interface BudgetCheckResult {
  passed: boolean
  failures: Array<{ metric: string; actual: number | string; limit: number | string }>
}

export interface ComparisonResult {
  framework: string
  comparedTo: string
  timestamp: string
  commit: string
  machine: MachineInfo
  metrics: Record<string, { current: number; other: number; diff: number; unit: string }>
  methodology: MethodologyInfo
}
