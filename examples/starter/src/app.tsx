import { mount } from '@speedjs/dom';
import { signal, computed, effect } from '@speedjs/core';
import './styles.css';

/* ─── Hero: Typewriter effect ─── */
function TypingText({ text, speed = 35 }: { text: string; speed?: number }) {
  const displayText = signal('');
  let i = 0;
  const timer = setInterval(() => {
    i++;
    displayText.value = text.slice(0, i);
    if (i >= text.length) clearInterval(timer);
  }, speed);
  return <span>{displayText}</span>;
}

/* ─── Hero: Live counter with computed ─── */
function LiveCounter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  const squared = computed(() => count.value ** 2);

  return (
    <div className="demo-panel">
      <div className="demo-panel-header">
        <span className="demo-panel-dot" />
        <span className="demo-panel-dot" />
        <span className="demo-panel-dot" />
        live-counter.tsx
      </div>
      <div className="demo-panel-body">
        <div className="counter-label">Signal value</div>
        <div className="counter-display">{count}</div>
        <div className="counter-computed">
          <div>
            <div className="counter-computed-label">computed → doubled</div>
            <div className="counter-computed-value">{doubled}</div>
          </div>
          <div>
            <div className="counter-computed-label">computed → squared</div>
            <div className="counter-computed-value">{squared}</div>
          </div>
        </div>
        <div className="counter-actions">
          <button className="counter-btn counter-btn-primary" onClick={() => count.value += 1}>+1</button>
          <button className="counter-btn" onClick={() => count.value += 10}>+10</button>
          <button className="counter-btn" onClick={() => count.value = Math.max(0, count.value - 1)}>-1</button>
          <button className="counter-btn counter-btn-danger" onClick={() => count.value = 0}>Reset</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, desc, color = '' }: { icon: string; title: string; desc: string; color?: string }) {
  const hovered = signal(false);
  return (
    <div
      className="feature-card"
      data-active={hovered}
      onMouseEnter={() => hovered.value = true}
      onMouseLeave={() => hovered.value = false}
    >
      <div className={`feature-icon${color ? ` feature-icon-${color}` : ''}`}>{icon}</div>
      <div className="feature-title">{title}</div>
      <div className="feature-desc">{desc}</div>
    </div>
  );
}

/* ─── Interactive playground: reactive text input ─── */
function ReactiveInput() {
  const text = signal('');
  return (
    <div className="playground-card">
      <div className="playground-card-header">
        <span style={{ color: 'var(--accent)' }}>&#9679;</span>
        Reactive text binding
      </div>
      <div className="playground-card-body">
        <div className="input-group">
          <label>Type:</label>
          <input
            className="input-field"
            onInput={(e: any) => text.value = e.target.value}
            placeholder="Watch it update in real-time..."
          />
        </div>
        <div className="counter-label">Signal-as-child binding (live)</div>
        <div className="reactive-text">{text}</div>
      </div>
    </div>
  );
}

/* ─── Interactive playground: counter + computed ─── */
function PlaygroundCounter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  const halved = computed(() => count.value / 2);

  return (
    <div className="playground-card">
      <div className="playground-card-header">
        <span style={{ color: 'var(--accent-3)' }}>&#9679;</span>
        signal + computed()
      </div>
      <div className="playground-card-body">
        <div className="counter-label">count</div>
        <div className="counter-computed-value" style={{ fontSize: 36, margin: '8px 0 16px' }}>{count}</div>
        <div className="counter-computed">
          <div>
            <div className="counter-computed-label">doubled</div>
            <div className="counter-computed-value">{doubled}</div>
          </div>
          <div>
            <div className="counter-computed-label">halved</div>
            <div className="counter-computed-value">{halved}</div>
          </div>
        </div>
        <div className="counter-actions" style={{ marginTop: 16 }}>
          <button className="counter-btn counter-btn-primary" onClick={() => count.value += 1}>+</button>
          <button className="counter-btn" onClick={() => count.value -= 1}>-</button>
          <button className="counter-btn counter-btn-danger" onClick={() => count.value = 0}>0</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Package card ─── */
const packages = [
  { name: '@speedjs/core', desc: 'Reactive primitives — signal, computed, effect, batch, resource. The foundation of every Speed.js app.', exports: 'signal, computed, effect, batch, untrack, resource' },
  { name: '@speedjs/dom', desc: 'DOM renderer and JSX runtime. Mount components, bind signals to text nodes and attributes.', exports: 'mount, jsx, jsxs, Fragment' },
  { name: '@speedjs/compiler', desc: 'Build-time TSX transform and static analysis. Scans routes, identifies static vs dynamic regions.', exports: 'transformTSX, scanRoutes, generateRouteManifest' },
  { name: '@speedjs/router', desc: 'File-based routing with dynamic segments, client-side navigation, and route matching.', exports: 'navigate, matchRoute, generatePath, useLocation' },
  { name: '@speedjs/server', desc: 'HTTP server, SSR (renderToString / renderToStream), API routes, middleware, cookie utilities.', exports: 'renderToString, createServer, createApiHandler, json' },
  { name: '@speedjs/vite', desc: 'Vite plugin that wires JSX, scans routes, transforms TSX, and enables HMR for routes.', exports: 'speed (plugin)' },
  { name: '@speedjs/cli', desc: 'Command-line tools — create, dev, build, preview, routes, bench, doctor.', exports: 'speed (CLI binary)' },
  { name: '@speedjs/bench', desc: 'Benchmark runner with performance budgets, snapshot comparison, and CI integration.', exports: 'runBenchmark, checkBudgets, compareSnapshots' },
  { name: '@speedjs/testing', desc: 'Test utilities — render components in jsdom for unit and integration tests.', exports: 'render' },
];

/* ─── Scroll-reveal component ─── */
function ScrollReveal({ children }: { children: any }) {
  const visible = signal(false);
  let el: HTMLElement | null = null;

  const check = () => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    visible.value = rect.top < window.innerHeight - 80;
  };

  effect(() => {
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    check();
  });

  return (
    <div ref={(e: HTMLElement) => { el = e; check(); }} className="reveal" data-active={visible}>
      {children}
    </div>
  );
}

/* ─── Nav ─── */
function Nav() {
  const sections = [
    { id: 'features', label: 'Features' },
    { id: 'playground', label: 'Playground' },
    { id: 'packages', label: 'Packages' },
    { id: 'quickstart', label: 'Quick Start' },
  ];

  return (
    <nav>
      <a className="nav-logo" href="#hero">
        ⚡<span>Speed</span>.js
      </a>
      <ul className="nav-links">
        {sections.map((s) => (
          <li><a href={`#${s.id}`}>{s.label}</a></li>
        ))}
        <li><a className="nav-cta" href="https://github.com/Nom-nom-hub/speedjs" target="_blank">GitHub</a></li>
      </ul>
    </nav>
  );
}

/* ─── Hero section ─── */
function Hero() {
  return (
    <section id="hero">
      <div className="hero-badge">
        <span className="hero-badge-dot" />
        v0.1.0 — Developer Preview
      </div>
      <h1 className="hero-title">
        Build at the <span className="hero-title-gradient">speed of light</span>
      </h1>
      <div className="hero-typing">
        <TypingText text="A compiler-first, full-stack TypeScript framework for extreme performance." speed={30} />
      </div>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#quickstart">
          Get Started →
        </a>
        <a className="btn btn-secondary" href="#playground">
          Interactive Demo
        </a>
        <a className="btn btn-secondary" href="https://github.com/Nom-nom-hub/speedjs" target="_blank">
          View on GitHub
        </a>
      </div>
      <div className="hero-demo">
        <LiveCounter />
      </div>
    </section>
  );
}

/* ─── Features section ─── */
function Features() {
  const items = [
    { icon: '⚡', title: 'Fine-grained Reactivity', desc: 'Signals update only the DOM nodes that depend on them. No virtual DOM, no diffing — just direct, pinpoint updates.', color: '' },
    { icon: '🧩', title: 'Component-based JSX', desc: 'Familiar React-like components with JSX. Components run once; signals handle all dynamic updates without re-rendering.', color: '2' },
    { icon: '🔮', title: 'Compiler-first', desc: 'Speed.js analyzes your code at build time — automatically scanning routes, optimizing static regions, and minimizing what ships to the browser.', color: '3' },
    { icon: '⚙️', title: 'Full-stack by Design', desc: 'SSR, API routes, middleware, streaming, and a production-ready HTTP server included out of the box.', color: '' },
    { icon: '📦', title: 'Zero Dependencies', desc: 'A from-scratch runtime with zero framework dependencies. Tiny bundles — no React, no virtual DOM overhead.', color: '2' },
    { icon: '📊', title: 'Performance Budgets', desc: 'Built-in benchmarking with snapshot comparison and CI enforcement. Catch regressions before they ship.', color: '3' },
    { icon: '🗂️', title: 'File-based Routing', desc: 'Routes auto-discovered from the filesystem at build time. Dynamic segments, catch-all routes, and nested layouts.', color: '' },
    { icon: '🎨', title: 'Signal-driven Attributes', desc: 'Bind signals directly to HTML attributes. CSS classes, styles, and boolean attributes update reactively without component re-renders.', color: '2' },
    { icon: '🌊', title: 'Streaming SSR', desc: 'Render to streams for progressive HTML delivery. Combine with fine-grained hydration for instant interactivity.', color: '3' },
  ];

  return (
    <section id="features">
      <ScrollReveal>
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything you need, nothing you don&apos;t</h2>
        <p className="section-sub">
          Speed.js combines the best ideas from React, Solid, and Astro into a single, cohesive framework.
        </p>
      </ScrollReveal>
      <div className="features-grid">
        {items.map((item) => (
          <ScrollReveal>
            <FeatureCard icon={item.icon} title={item.title} desc={item.desc} color={item.color} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Code example ─── */
function CodeExample() {
  const code = [
    "import { signal, computed } from '@speedjs/core'",
    "import { mount } from '@speedjs/dom'",
    "",
    "const count = signal(0)",
    "const doubled = computed(() => count.value * 2)",
    "",
    "function Counter() {",
    "  return (",
    "    <div>",
    "      <p>Count: {count}</p>",
    "      <p>Doubled: {doubled}</p>",
    "      <button onClick={() => count.value++}>+</button>",
    "    </div>",
    "  )",
    "}",
    "",
    "mount(Counter, document.getElementById('root'))",
  ].join('\n');

  let el: HTMLElement | null = null;
  setTimeout(() => { if (el) el.textContent = code; }, 0);

  return (
    <div className="code-block" style={{ marginTop: 32 }}>
      <div className="code-block-header">What&apos;s happening under the hood</div>
      <pre><code ref={(e: HTMLElement) => { el = e; }}></code></pre>
    </div>
  );
}

/* ─── Interactive playground section ─── */
function Playground() {
  return (
    <section id="playground">
      <ScrollReveal>
        <div className="section-label">Playground</div>
        <h2 className="section-title">See reactivity in action</h2>
        <p className="section-sub">
          Every interaction below is powered by Speed.js signals and computed values — no re-renders, no framework overhead.
        </p>
      </ScrollReveal>
      <div className="playground-grid">
        <ScrollReveal><PlaygroundCounter /></ScrollReveal>
        <ScrollReveal><ReactiveInput /></ScrollReveal>
      </div>

      <CodeExample />
    </section>
  );
}

/* ─── Packages section ─── */
function Packages() {
  return (
    <section id="packages">
      <ScrollReveal>
        <div className="section-label">Packages</div>
        <h2 className="section-title">Modular by design</h2>
        <p className="section-sub">
          Speed.js is organized into focused packages. Use what you need, tree-shake the rest.
        </p>
      </ScrollReveal>
      <div className="packages-grid">
        {packages.map((pkg) => (
          <ScrollReveal>
            <div className="package-card">
              <div className="package-name">{pkg.name}</div>
              <div className="package-desc">{pkg.desc}</div>
              <div className="package-export">exports: {pkg.exports}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Quick Start section ─── */
function QuickStart() {
  return (
    <section id="quickstart">
      <ScrollReveal>
        <div className="section-label">Quick Start</div>
        <h2 className="section-title">Ship something in 30 seconds</h2>
        <p className="section-sub">
          Create a new Speed.js project and start building with signals and JSX immediately.
        </p>
      </ScrollReveal>
      <div className="quickstart-steps">
        <ScrollReveal>
          <div className="quickstart-step">
            <div className="quickstart-step-num">1</div>
            <div className="quickstart-step-content">
              <h3>Create a new project</h3>
              <p>Run the CLI scaffolder to generate a fully-configured Speed.js project.</p>
              <div className="code-block" style={{ marginTop: 12 }}>
                <pre><code><span className="code-token-comment"># Using pnpm</span>
pnpm create @speedjs/app my-app

<span className="code-token-comment"># Using npm</span>
npm create @speedjs/app my-app

<span className="code-token-comment"># Using bun</span>
bun create @speedjs/app my-app</code></pre>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="quickstart-step">
            <div className="quickstart-step-num">2</div>
            <div className="quickstart-step-content">
              <h3>Start the dev server</h3>
              <p>Speed.js uses Vite under the hood for instant HMR and fast builds.</p>
              <div className="code-block" style={{ marginTop: 12 }}>
                <pre><code>cd my-app
pnpm dev</code></pre>
              </div>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="quickstart-step">
            <div className="quickstart-step-num">3</div>
            <div className="quickstart-step-content">
              <h3>Build for production</h3>
              <p>Optimized builds with automatic route scanning, code splitting, and minification.</p>
              <div className="code-block" style={{ marginTop: 12 }}>
                <pre><code>pnpm build
pnpm preview</code></pre>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="nav-logo">⚡<span>Speed</span>.js</div>
          <p>A compiler-first, full-stack TypeScript framework for extreme performance. MIT licensed.</p>
        </div>
        <div className="footer-col">
          <h4>Framework</h4>
          <a href="#features">Features</a>
          <a href="#playground">Playground</a>
          <a href="#packages">Packages</a>
          <a href="#quickstart">Quick Start</a>
        </div>
        <div className="footer-col">
          <h4>Packages</h4>
          <a href="https://github.com/Nom-nom-hub/speedjs/tree/main/packages/core" target="_blank">@speedjs/core</a>
          <a href="https://github.com/Nom-nom-hub/speedjs/tree/main/packages/dom" target="_blank">@speedjs/dom</a>
          <a href="https://github.com/Nom-nom-hub/speedjs/tree/main/packages/router" target="_blank">@speedjs/router</a>
          <a href="https://github.com/Nom-nom-hub/speedjs/tree/main/packages/server" target="_blank">@speedjs/server</a>
        </div>
        <div className="footer-col">
          <h4>Community</h4>
          <a href="https://github.com/Nom-nom-hub/speedjs" target="_blank">GitHub</a>
          <a href="https://github.com/Nom-nom-hub/speedjs/issues" target="_blank">Issues</a>
          <a href="https://github.com/Nom-nom-hub/speedjs/discussions" target="_blank">Discussions</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Speed.js — MIT License</span>
        <div className="footer-socials">
          <a href="https://github.com/Nom-nom-hub/speedjs" target="_blank">GitHub</a>
          <a href="#" onClick={(e: Event) => e.preventDefault()}>Twitter</a>
          <a href="#" onClick={(e: Event) => e.preventDefault()}>Discord</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── App ─── */
function App() {
  return (
    <div>
      <Nav />
      <Hero />
      <Features />
      <Playground />
      <Packages />
      <QuickStart />
      <Footer />
    </div>
  );
}

mount(App, document.getElementById('app')!);
