import { spawn, execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export async function build(): Promise<void> {
  console.log('Building for production...')

  const start = performance.now()

  const vite = spawn('vite', ['build'], {
    stdio: 'inherit',
    shell: true,
  })

  vite.on('error', (err) => {
    console.error('Failed to build:', err)
    process.exit(1)
  })

  vite.on('exit', (code) => {
    if (code !== 0) process.exit(code || 0)

    const buildTime = performance.now() - start
    const distDir = join(process.cwd(), 'dist', 'assets')
    let initialJsBytes = 0
    let routeJsBytes = 0

    if (existsSync(distDir)) {
      const files = readdirSync(distDir).filter((f: string) => f.endsWith('.js'))
      for (const file of files) {
        const size = statSync(join(distDir, file)).size
        initialJsBytes += size
      }
    }

    // Read speed.config.ts for budgets
    const configPath = join(process.cwd(), 'speed.config.ts')
    let budget = { maxInitialJS: '999kb', maxRouteJS: '999kb', maxBuildMs: 99999, maxHydrationMs: 99999 }

    if (existsSync(configPath)) {
      try {
        const configStr = readFileSync(configPath, 'utf-8')
        const maxInitialMatch = configStr.match(/maxInitialJS:\s*["']([^"']+)["']/)
        const maxRouteMatch = configStr.match(/maxRouteJS:\s*["']([^"']+)["']/)
        const buildMsMatch = configStr.match(/maxBuildMs:\s*(\d+)/)
        const hydMsMatch = configStr.match(/maxHydrationMs:\s*(\d+)/)
        budget = {
          maxInitialJS: maxInitialMatch?.[1] || budget.maxInitialJS,
          maxRouteJS: maxRouteMatch?.[1] || budget.maxRouteJS,
          maxBuildMs: buildMsMatch ? parseInt(buildMsMatch[1]) : budget.maxBuildMs,
          maxHydrationMs: hydMsMatch ? parseInt(hydMsMatch[1]) : budget.maxHydrationMs,
        }
      } catch {}
    }

    function parseSize(size: string): number {
      const m = size.match(/^(\d+(?:\.\d+)?)\s*(kb|mb|b)?$/i)
      if (!m) return 999999
      const v = parseFloat(m[1])
      const u = (m[2] || 'b').toLowerCase()
      if (u === 'kb') return v * 1024
      if (u === 'mb') return v * 1024 * 1024
      return v
    }

    const maxInitialBytes = parseSize(budget.maxInitialJS)
    const maxRouteBytes = parseSize(budget.maxRouteJS)
    const initialJsKb = initialJsBytes / 1024

    const failures: Array<{ metric: string; actual: string; limit: string; suggestion: string }> = []

    if (initialJsBytes > maxInitialBytes) {
      failures.push({
        metric: 'maxInitialJS',
        actual: `${initialJsKb.toFixed(1)}kb`,
        limit: budget.maxInitialJS,
        suggestion: 'Split heavy components. Lazy load non-critical modules.',
      })
    }

    if (buildTime > budget.maxBuildMs) {
      failures.push({
        metric: 'maxBuildMs',
        actual: `${buildTime.toFixed(0)}ms`,
        limit: `${budget.maxBuildMs}ms`,
        suggestion: 'Optimize build configuration. Reduce module count.',
      })
    }

    const budgetResult = {
      timestamp: new Date().toISOString(),
      maxInitialJS: budget.maxInitialJS,
      actualInitialJS: `${initialJsKb.toFixed(1)}kb`,
      maxRouteJS: budget.maxRouteJS,
      actualRouteJS: '— (not measured)',
      maxBuildMs: budget.maxBuildMs,
      actualBuildMs: buildTime,
      maxHydrationMs: budget.maxHydrationMs,
      actualHydrationMs: '— (not measured)',
      status: failures.length === 0 ? 'passed' : 'failed',
      failures,
      suggestions: failures.length > 0
        ? ['Split heavy components', 'Lazy load non-critical modules', 'Review bundle composition']
        : [],
    }

    // Save budget result
    const benchDir = join(process.cwd(), '.benchmarks')
    if (!existsSync(benchDir)) mkdirSync(benchDir, { recursive: true })
    writeFileSync(join(benchDir, 'budget-latest.json'), JSON.stringify(budgetResult, null, 2))
    console.log(`\n✓ Budget result saved to .benchmarks/budget-latest.json`)

    // Also save to public directory for website
    const publicBenchDir = join(process.cwd(), 'examples', 'speedjs-site', 'public', 'benchmarks')
    if (existsSync(join(process.cwd(), 'examples', 'speedjs-site'))) {
      if (!existsSync(publicBenchDir)) mkdirSync(publicBenchDir, { recursive: true })
      writeFileSync(join(publicBenchDir, 'budget-latest.json'), JSON.stringify(budgetResult, null, 2))
      console.log(`✓ Budget result saved to public/benchmarks/budget-latest.json`)
    }

    console.log(`\nBudget: ${budgetResult.status === 'passed' ? '✓ Passed' : '✗ Failed'}`)
    if (failures.length > 0) {
      for (const f of failures) {
        console.log(`  ✗ ${f.metric}: ${f.actual} (limit: ${f.limit})`)
        console.log(`    Suggestion: ${f.suggestion}`)
      }
    }
  })
}
