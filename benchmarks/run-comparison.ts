/**
 * Comparison benchmark runner — runs the same benchmarks across multiple frameworks.
 *
 * Experimental. Requires control apps to be set up in benchmarks/apps/.
 * Currently only speedjs-starter is available.
 *
 * Usage: npx tsx benchmarks/run-comparison.ts
 */

import { execSync } from 'child_process'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { comparisonConfig, comparisonMethodology } from './config'

const ROOT = process.cwd()
const BENCH_DIR = join(ROOT, '.benchmarks', 'comparisons')

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function measureApp(appName: string): Record<string, number> {
  console.log(`\n=== Measuring ${appName} ===`)
  const appDir = join(ROOT, 'benchmarks', 'apps', appName)

  if (!existsSync(appDir)) {
    console.log(`  App directory not found: ${appDir}`)
    console.log(`  Run: benchmarks/apps/setup.sh to create control apps`)
    return {}
  }

  const metrics: Record<string, number> = {}
  const WARMUP = comparisonConfig.warmups
  const MEASURED = comparisonConfig.runs - WARMUP

  // Build time
  const buildSamples: number[] = []
  for (let i = 0; i < comparisonConfig.runs; i++) {
    const start = performance.now()
    try {
      execSync('npx vite build 2>/dev/null', { cwd: appDir, stdio: 'pipe', timeout: 120000 })
    } catch {}
    const elapsed = performance.now() - start
    if (i >= WARMUP) buildSamples.push(elapsed)
  }
  if (buildSamples.length > 0) {
    const sorted = [...buildSamples].sort((a, b) => a - b)
    metrics.buildTimeMs = sorted[Math.floor(sorted.length / 2)]
  }

  return metrics
}

async function runComparison() {
  console.log('Speed.js Framework Comparison Benchmark')
  console.log('======================================\n')
  console.log(`Apps to measure: ${comparisonConfig.apps.join(', ')}`)
  console.log(`Runs: ${comparisonConfig.runs} (${comparisonConfig.warmups} warmup + ${comparisonConfig.runs - comparisonConfig.warmups} measured)`)
  console.log(`Reported value: ${comparisonConfig.reportedValue}\n`)

  if (comparisonConfig.apps.length < 2) {
    console.log('Only one app configured. Add more apps to benchmarks/config.ts for comparisons.')
    console.log('See benchmarks/README.md for setup instructions.\n')
  }

  const results: Record<string, Record<string, number>> = {}

  for (const app of comparisonConfig.apps) {
    results[app] = measureApp(app)
  }

  ensureDir(BENCH_DIR)

  const comparisonResult = {
    timestamp: new Date().toISOString(),
    config: comparisonConfig,
    methodology: comparisonMethodology,
    results,
    comparisons: {} as Record<string, any>,
  }

  // Build comparisons if we have speedjs + at least one other
  if (results['speedjs-starter'] && Object.keys(results).length >= 2) {
    const speedMetrics = results['speedjs-starter']
    for (const [app, appMetrics] of Object.entries(results)) {
      if (app === 'speedjs-starter') continue
      const comparison: Record<string, any> = {}
      for (const [key, speedVal] of Object.entries(speedMetrics)) {
        const otherVal = appMetrics[key]
        if (otherVal) {
          comparison[key] = {
            speedjs: speedVal,
            [app.split('-')[0]]: otherVal,
            diff: otherVal - speedVal,
            diffPct: speedVal > 0 ? (((otherVal - speedVal) / speedVal) * 100).toFixed(1) + '%' : 'N/A',
          }
        }
      }
      comparisonResult.comparisons[app] = comparison
    }
  }

  const outputPath = join(BENCH_DIR, 'latest-comparison.json')
  writeFileSync(outputPath, JSON.stringify(comparisonResult, null, 2))
  console.log(`\n✓ Comparison saved to ${outputPath}`)
}

runComparison().catch(console.error)
