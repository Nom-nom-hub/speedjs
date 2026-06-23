import { navigate } from '@speedjs/router'

export default function Blog(props: any) {
  const posts = [
    { slug: 'announcing-speed-js', title: 'Announcing Speed.js v0.1.0', date: '2025-06-15', excerpt: 'Speed.js is the first web framework with built-in performance budgets and a benchmark command.' },
    { slug: 'why-signals', title: 'Why signals beat virtual DOM for performance', date: '2025-06-10', excerpt: 'A deep dive into fine-grained reactivity and why it eliminates the overhead of diffing.' },
    { slug: 'performance-budgets-in-ci', title: 'Enforcing performance budgets in CI', date: '2025-06-05', excerpt: 'How to integrate speed bench into your GitHub Actions pipeline.' },
    { slug: 'compiler-first-design', title: 'Compiler-first: what it means and why it matters', date: '2025-05-28', excerpt: 'How Speed.js analyzes your components at build time for optimal output.' },
  ]

  return (
    <div style={{ marginTop: 'var(--header-height)' }}>
      <section class="page-hero">
        <div class="container">
          <div class="badge badge-violet">Blog</div>
          <h1>Latest posts</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 560, marginTop: 12 }}>
            Updates, deep dives, and guides from the Speed.js team.
          </p>
        </div>
      </section>

      <section class="section container" style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 700 }}>
          {posts.map(p => (
            <div
              style={{ padding: '24px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'opacity 150ms' }}
              onClick={() => navigate('/blog/' + p.slug)}
              onMouseOver={(e: any) => e.target.style.opacity = '0.8'}
              onMouseOut={(e: any) => e.target.style.opacity = '1'}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted-2)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{p.date}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{p.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{p.excerpt}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
