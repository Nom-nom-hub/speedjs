/**
 * Real v1 bench runner — invokes the new collector against examples/starter.
 * Writes the artifact to both .benchmarks/ (local) AND examples/speedjs-site/public/benchmarks/ (the website mirror).
 *
 * Usage: npx tsx scripts/refresh-bench.ts
 */
import { runBenchmark } from '../packages/bench/src/bench'
import { saveBenchmarkResult, savePublicBenchmarkData } from '../packages/bench/src/storage'

async function main() {
  const app = process.argv[2] || `${process.cwd()}/examples/starter`
  console.log('Speed.js v1 bench runner')
  console.log('========================')
  console.log(`App: ${app}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('')

  const result = await runBenchmark(app)

  // Capture stdout-style logs into the raw form saveBenchmarkResult expects.
  const rawLog = result.methodology.notes.join('\n')
  saveBenchmarkResult(result, rawLog)
  savePublicBenchmarkData(result)

  console.log('')
  console.log('Saved:')
  console.log('  .benchmarks/latest.json')
  console.log('  .benchmarks/budget-latest.json')
  console.log('  examples/speedjs-site/public/benchmarks/latest.json')
  console.log('  examples/speedjs-site/public/benchmarks/budget-latest.json')
  console.log('  examples/speedjs-site/public/benchmarks/history/*.json')
  console.log('')
  console.log(`Budget: ${result.budget.status} (${result.budget.dataQuality})`)
  console.log(`Measured: ${result.budget.measuredCount} of ${Object.keys(result.metrics).length} core metrics`)
  console.log(`Unmeasured: ${result.budget.unmeasuredMetrics.join(', ') || 'none'}`)
  console.log(`Failures: ${result.budget.failures.length}`)
  for (const f of result.budget.failures) {
    console.log(`  ${f.metric}: ${f.actual.value}${f.actual.unit} > ${f.limit.value}${f.limit.unit} (+${f.overBy.value}${f.overBy.unit}, +${f.overByPercent}%)`)
  }
}

main().catch((e) => {
  console.error('Bench run failed:', e)
  process.exit(1)
})
