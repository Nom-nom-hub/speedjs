import { signal, computed } from '@speedjs/core'
import { mount } from '@speedjs/dom'
import { SiteHeader } from './components/site-header'
import { SiteFooter } from './components/site-footer'

// Route pages
import Home from './routes/index'
import DocsIndex from './routes/docs/index'
import GettingStarted from './routes/docs/getting-started'
import Signals from './routes/docs/signals'
import Routing from './routes/docs/routing'
import SsrDocs from './routes/docs/ssr'
import ApiRoutes from './routes/docs/api-routes'
import PerfBudgets from './routes/docs/performance-budgets'
import Benchmarking from './routes/docs/benchmarking'
import Deployment from './routes/docs/deployment'
import Benchmarks from './routes/benchmarks'
import BenchmarksMethodology from './routes/benchmarks/methodology'
import Roadmap from './routes/roadmap'
import Playground from './routes/playground'
import Showcase from './routes/showcase/index'
import Blog from './routes/blog/index'

type RouteComponent = (props?: any) => any

const routes: Record<string, RouteComponent> = {
  '/': Home,
  '/docs': DocsIndex,
  '/docs/getting-started': GettingStarted,
  '/docs/signals': Signals,
  '/docs/routing': Routing,
  '/docs/ssr': SsrDocs,
  '/docs/api-routes': ApiRoutes,
  '/docs/performance-budgets': PerfBudgets,
  '/docs/benchmarking': Benchmarking,
  '/docs/deployment': Deployment,
  '/benchmarks': Benchmarks,
  '/benchmarks/methodology': BenchmarksMethodology,
  '/roadmap': Roadmap,
  '/playground': Playground,
  '/showcase': Showcase,
  '/blog': Blog,
}

const currentPage = signal(window.location.pathname)

window.addEventListener('popstate', () => {
  currentPage.value = window.location.pathname
})

export function navigate(path: string) {
  window.history.pushState({}, '', path)
  currentPage.value = path
}

const page = computed(() => {
  const path = currentPage.value
  return routes[path] || (() => (
    <section class="section container" style={{ marginTop: 'var(--header-height)', paddingTop: 80 }}>
      <h1>404 — Page not found</h1>
      <p>The route <code>{path}</code> does not exist.</p>
      <a href="/" onClick={(e: Event) => { e.preventDefault(); navigate('/') }}>Go home</a>
    </section>
  ))
})

export default function App() {
  const Component = page.value
  const path = currentPage.value
  const isDocs = path.startsWith('/docs')

  return (
    <div>
      <SiteHeader />
      <main style={{ minHeight: '100vh' }}>
        <Component currentPath={path} />
      </main>
      <SiteFooter />
    </div>
  )
}

const root = document.getElementById('app')
if (root) mount(App, root)
