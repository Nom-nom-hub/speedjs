import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import type { BenchmarkResult } from './types'

const BENCHMARKS_DIR = '.benchmarks'

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function benchPath(...parts: string[]): string {
  return join(process.cwd(), BENCHMARKS_DIR, ...parts)
}

function tsPath(ts: string): string {
  return ts.replace(/[:]/g, '-').replace(/[.]/g, '-')
}

export function saveBenchmarkResult(result: BenchmarkResult, rawLog: string) {
  const latestPath = benchPath('latest.json')
  const historyPath = benchPath('history', `${tsPath(result.timestamp)}.json`)
  const rawPath = benchPath('raw', `${tsPath(result.timestamp)}.log`)

  ensureDir(benchPath())
  ensureDir(benchPath('history'))
  ensureDir(benchPath('raw'))

  writeFileSync(latestPath, JSON.stringify(result, null, 2))
  writeFileSync(historyPath, JSON.stringify(result, null, 2))
  writeFileSync(rawPath, rawLog)
}

export function loadLatestBenchmark(): BenchmarkResult | null {
  const path = benchPath('latest.json')
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function loadHistoryBenchmarks(): BenchmarkResult[] {
  const dir = benchPath('history')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf-8')))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function loadHistoryForApi() {
  const all = loadHistoryBenchmarks()
  return all.slice(0, 20).map((r) => ({
    timestamp: r.timestamp,
    commit: r.commit,
    branch: r.branch,
    metrics: r.metrics,
    budget: {
      status: r.budget.status,
      dataQuality: r.budget.dataQuality,
      measuredCount: r.budget.measuredCount,
      unmeasured: r.budget.unmeasuredMetrics,
      failures: r.budget.failures,
      actionable: r.budget.actionable,
    },
  }))
}

export function savePublicBenchmarkData(result: BenchmarkResult) {
  const candidates = [
    join(process.cwd(), 'public', 'benchmarks'),
    join(process.cwd(), 'examples', 'speedjs-site', 'public', 'benchmarks'),
  ]
  const publicDir = candidates.find((c) => existsSync(c)) || candidates[0]
  ensureDir(publicDir)
  ensureDir(join(publicDir, 'history'))

  writeFileSync(join(publicDir, 'latest.json'), JSON.stringify(result, null, 2))

  const historyPath = join(join(publicDir, 'history'), `${tsPath(result.timestamp)}.json`)
  writeFileSync(historyPath, JSON.stringify(result, null, 2))

  // Regenerate the top-level history.json from whichever history dir our current
  // .benchmarks/history has, so the website shows a coherent timeline even when
  // we don't re-run all suites.
  const allHistory = loadHistoryBenchmarks().slice(0, 20)
  writeFileSync(join(publicDir, 'history.json'), JSON.stringify(allHistory, null, 2))
}
