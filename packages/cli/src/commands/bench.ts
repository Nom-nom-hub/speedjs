import { runBenchmark, checkBudgets, printBenchmarkReport, printBudgetReport, saveBenchmarkResult, loadLatestBenchmark, savePublicBenchmarkData, loadHistoryBenchmarks } from '@speedjs/bench'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export async function bench(options: { save?: boolean; json?: boolean; compare?: boolean; fail?: boolean }) {
  console.log('Running benchmarks...\n')

  const result = await runBenchmark()

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  await printBenchmarkReport(result)

  if (options.save) {
    saveBenchmarkResult(result, `Benchmark run at ${result.timestamp}\nMachine: ${result.machine.platform} / ${result.machine.cpu}\n`)
    savePublicBenchmarkData(result)
    console.log('✓ Saved benchmark snapshot to .benchmarks/latest.json')
    console.log('✓ Updated public benchmark data at examples/speedjs-site/public/benchmarks/')
  }

  const configPath = join(process.cwd(), 'speed.config.ts')
  if (existsSync(configPath)) {
    try {
      const configStr = readFileSync(configPath, 'utf-8')
      const budgetMatch = configStr.match(/maxInitialJS:\s*["']([^"']+)["']/)
      const maxRouteMatch = configStr.match(/maxRouteJS:\s*["']([^"']+)["']/)
      const buildMsMatch = configStr.match(/maxBuildMs:\s*(\d+)/)
      const hydMsMatch = configStr.match(/maxHydrationMs:\s*(\d+)/)

      if (budgetMatch) {
        const budget = {
          maxInitialJS: budgetMatch[1],
          maxRouteJS: maxRouteMatch?.[1] || '999kb',
          maxBuildMs: buildMsMatch ? parseInt(buildMsMatch[1]) : 99999,
          maxHydrationMs: hydMsMatch ? parseInt(hydMsMatch[1]) : 99999,
        }
        const check = checkBudgets(result.metrics, budget)
        await printBudgetReport(check)
        if (!check.passed && options.fail) process.exit(1)
      }
    } catch {}
  }

  if (options.compare) {
    const prev = loadLatestBenchmark()
    if (prev) {
      console.log('\nComparison with previous build:')
      for (const [key, metric] of Object.entries(result.metrics) as [string, any][]) {
        const prevMetric = (prev.metrics as any)[key]
        if (prevMetric) {
          const diff = metric.median - prevMetric.median
          const sign = diff > 0 ? '+' : ''
          const color = diff > 0 ? 'worsened' : diff < 0 ? 'improved' : 'unchanged'
          console.log(`  ${key}: ${metric.median.toFixed(1)}${metric.unit} (${sign}${diff.toFixed(1)}${metric.unit}, ${color})`)
        }
      }
    } else {
      console.log('\nNo previous benchmark data to compare against.')
    }
  }
}

export async function benchSave() {
  const result = await runBenchmark()
  saveBenchmarkResult(result, `Benchmark run at ${result.timestamp}`)
  savePublicBenchmarkData(result)
  await printBenchmarkReport(result)
  console.log('\n✓ Benchmark data saved to .benchmarks/ and public/benchmarks/')
}

export async function benchServe() {
  const { createServer } = await import('vite')
  const server = await createServer({
    root: process.cwd(),
    server: { port: 5198 },
  })
  await server.listen()
  console.log('Benchmark API server: http://localhost:5198/api/benchmarks')
}

export async function benchUpdate() {
  console.log('Running benchmarks and updating public data...')
  const result = await runBenchmark()
  saveBenchmarkResult(result, `Benchmark update at ${result.timestamp}`)
  savePublicBenchmarkData(result)
  await printBenchmarkReport(result)
  console.log('\n✓ Public benchmark data updated')
}
