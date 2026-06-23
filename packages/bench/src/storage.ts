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

export function saveBenchmarkResult(result: BenchmarkResult, rawLog: string) {
  const latestPath = benchPath('latest.json')
  const historyPath = benchPath('history', `${result.timestamp.replace(/[:]/g, '-').replace(/[.]/g, '-')}.json`)
  const rawPath = benchPath('raw', `${result.timestamp.replace(/[:]/g, '-').replace(/[.]/g, '-')}.log`)

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
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(readFileSync(join(dir, f), 'utf-8')))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function loadHistoryForApi() {
  const all = loadHistoryBenchmarks()
  return all.slice(0, 20).map(r => ({
    timestamp: r.timestamp,
    commit: r.commit,
    metrics: r.metrics,
    budget: r.budget,
  }))
}

export function savePublicBenchmarkData(result: BenchmarkResult) {
  const candidates = [
    join(process.cwd(), 'public', 'benchmarks'),
    join(process.cwd(), 'examples', 'speedjs-site', 'public', 'benchmarks'),
  ]
  const publicDir = candidates.find(c => existsSync(c)) || candidates[0]
  ensureDir(publicDir)
  ensureDir(join(publicDir, 'history'))

  writeFileSync(join(publicDir, 'latest.json'), JSON.stringify(result, null, 2))

  const historyPath = join(publicDir, 'history', `${result.timestamp.replace(/[:]/g, '-').replace(/[.]/g, '-')}.json`)
  writeFileSync(historyPath, JSON.stringify(result, null, 2))

  const allHistory = loadHistoryBenchmarks().slice(0, 20)
  writeFileSync(join(publicDir, 'history.json'), JSON.stringify(allHistory, null, 2))
}
