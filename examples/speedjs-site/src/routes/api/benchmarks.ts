import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const benchDir = join(process.cwd(), 'public', 'benchmarks')

function loadJson<T = any>(filename: string): T | null {
  const p = join(benchDir, filename)
  if (!existsSync(p)) return null
  return JSON.parse(readFileSync(p, 'utf-8')) as T
}

/**
 * Schema v1 normalized artifact. Numeric values are separate from units;
 * `measured:false` means value is null and `reason` explains why.
 */
type Metric = {
  value: number | null
  unit: string
  measured: boolean
  source: string
  reason?: string
  min?: number
  max?: number
  samples?: number[]
}

type BudgetFailure = {
  metric: string
  actual: { value: number; unit: string }
  limit: { value: number; unit: string }
  overBy: { value: number; unit: string }
  overByPercent: number
}

type NormBench = {
  schemaVersion: '1.0'
  framework: string
  app: string
  source: string
  commit: string
  branch: string
  timestamp: string
  machine: any
  commands: any
  methodology: any
  metrics: Record<string, Metric>
  budget: {
    status: 'passed' | 'failed'
    dataQuality: 'complete' | 'partial' | 'insufficient'
    measuredCount: number
    unmeasuredMetrics: string[]
    failures: BudgetFailure[]
    actionable: string[]
    limits: Record<string, { value: number; unit: string }>
  }
}

function loadHistoryDir(dir: string, limit = 20): NormBench[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .slice(0, limit)
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf-8')) as NormBench)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function GET(): Response {
  const latest = loadJson<NormBench>('latest.json')
  const historyFile = loadJson<NormBench[]>('history.json') || []
  const budget = loadJson<any>('budget-latest.json')

  if (!latest) {
    return new Response(
      JSON.stringify({
        status: 'sample',
        warning:
          'Sample developer-preview data. Real benchmark artifacts were not found. Run `speed bench run --save` to produce one.',
        metrics: null,
        budget: null,
        history: [],
        schemaVersion: null,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const age = Date.now() - new Date(latest.timestamp).getTime()
  const status =
    age > 7 * 24 * 60 * 60 * 1000 ? 'stale' : latest.budget.status === 'failed' ? 'failed' : 'real'

  const history =
    historyFile.length > 0
      ? historyFile.slice(0, 10).map((h) => ({
          timestamp: h.timestamp,
          commit: h.commit,
          branch: h.branch,
          budget: {
            status: h.budget.status,
            dataQuality: h.budget.dataQuality,
            failures: h.budget.failures,
            unmeasured: h.budget.unmeasuredMetrics,
          },
        }))
      : loadHistoryDir(join(benchDir, 'history')).slice(0, 10).map((h) => ({
          timestamp: h.timestamp,
          commit: h.commit,
          branch: h.branch,
          budget: {
            status: h.budget.status,
            dataQuality: h.budget.dataQuality,
            failures: h.budget.failures,
            unmeasured: h.budget.unmeasuredMetrics,
          },
        }))

  return new Response(
    JSON.stringify({
      status,
      lastUpdated: latest.timestamp,
      timestamp: latest.timestamp,
      commit: latest.commit,
      branch: latest.branch,
      framework: latest.framework,
      app: latest.app,
      schemaVersion: latest.schemaVersion,
      // Forward the full normalized shape — never substitute fake numbers for
      // unmeasured ones; the dashboard renders "Not measured" itself.
      metrics: latest.metrics,
      budget: latest.budget,
      history,
      machine: latest.machine,
      methodology: latest.methodology,
      // Convenience: the trimmed budget summary lives next door in
      // budget-latest.json for pure budget consumers.
      budgetSummary: budget,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
