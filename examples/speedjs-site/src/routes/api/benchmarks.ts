import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const benchDir = join(process.cwd(), 'public', 'benchmarks')

function loadJson(filename: string) {
  const path = join(benchDir, filename)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function GET(): Response {
  const latest = loadJson('latest.json')
  const history = loadJson('history.json') || []
  const budget = loadJson('budget-latest.json')

  if (!latest) {
    return new Response(JSON.stringify({
      status: 'sample',
      warning: 'Sample developer-preview data. Real benchmark artifacts were not found.',
      metrics: null,
      budget: null,
      history: [],
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const age = Date.now() - new Date(latest.timestamp).getTime()
  const status = age > 7 * 24 * 60 * 60 * 1000 ? 'stale' : 'real'

  return new Response(JSON.stringify({
    status,
    lastUpdated: latest.timestamp,
    commit: latest.commit,
    metrics: latest.metrics,
    budget: budget || latest.budget,
    history: history.slice(0, 10),
    machine: latest.machine,
    methodology: latest.methodology,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
