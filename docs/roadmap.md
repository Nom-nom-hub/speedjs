# Speed.js Roadmap

Speed.js is actively developed. The roadmap below outlines the planned direction for the framework. Version plans may change as the compiler, runtime, and server architecture mature.

## v0.1 — Developer Preview

Focus: establish the working framework foundation.

* [x] Core reactive system: signals, computed values, effects
* [x] Fine-grained DOM renderer
* [x] JSX/TSX runtime without React dependency
* [x] Basic file-based routing
* [x] Static and dynamic route matching
* [x] Basic SSR support
* [x] API route handlers
* [x] Vite plugin foundation
* [x] CLI commands: create, dev, build, preview
* [x] Starter application
* [x] Initial benchmark command
* [x] Initial performance budget support
* [x] Documentation foundation

## v0.2 — Framework Hardening

Focus: make Speed.js usable for real applications.

### Routing

* [ ] Nested route layouts
* [ ] Route loaders
* [ ] Route actions
* [ ] Route transitions
* [ ] Route-level code splitting
* [ ] Link prefetching
* [ ] Client-side navigation cache
* [ ] Typed route generation

### Server Runtime

* [ ] Streaming SSR
* [ ] Static export
* [ ] Server functions
* [ ] Form actions
* [ ] Cookie/session helpers
* [ ] Middleware improvements
* [ ] Node deployment adapter
* [ ] Vercel deployment adapter
* [ ] Cloudflare deployment adapter

### Developer Experience

* [ ] Improved error messages
* [ ] Error boundaries
* [ ] Suspense-style async rendering
* [ ] HMR improvements
* [ ] Tailwind integration
* [ ] TypeScript strict mode template
* [ ] Better CLI diagnostics through `speed doctor`

## v0.3 — Compiler and Performance

Focus: make Speed.js meaningfully faster and easier to optimize.

### Compiler

* [ ] Oxc integration
* [ ] Static component extraction
* [ ] Compiler-assisted dead code elimination
* [ ] Inline helper optimization
* [ ] Automatic route splitting
* [ ] Static/dynamic region analysis
* [ ] Compiler diagnostics with actionable suggestions
* [ ] Source map improvements

### Performance Tooling

* [ ] Bundle analyzer
* [ ] Hydration cost report
* [ ] Route performance report
* [ ] Asset optimization
* [ ] Font optimization
* [ ] Image optimization
* [ ] Benchmark snapshot comparison
* [ ] Performance budget enforcement modes: warn, fail, strict

### Partial Hydration

* [ ] Islands API
* [ ] Lazy hydration
* [ ] Visibility-based hydration
* [ ] Interaction-based hydration
* [ ] Server-rendered static islands

## v0.4 — Data, Forms, and Testing

Focus: provide the application-level tools needed for production apps.

### Data Layer

* [ ] Built-in data fetching helpers
* [ ] Query caching
* [ ] Mutation helpers
* [ ] Optimistic updates
* [ ] Real-time subscription primitives
* [ ] Request deduplication
* [ ] Cache invalidation APIs

### Forms

* [ ] Form actions
* [ ] Form validation helpers
* [ ] Progressive enhancement
* [ ] Optimistic form submissions
* [ ] Typed form results

### Testing

* [ ] Component testing utilities
* [ ] SSR testing utilities
* [ ] Route testing utilities
* [ ] E2E testing integration
* [ ] Visual regression testing support
* [ ] Coverage report integration

## v0.5 — Deployment and Ecosystem

Focus: make Speed.js easier to adopt across platforms and projects.

### Deployment

* [ ] Netlify adapter
* [ ] Bun adapter
* [ ] Docker adapter
* [ ] Static hosting adapter
* [ ] Edge runtime support
* [ ] ISR-style regeneration
* [ ] Deployment documentation

### Styling

* [ ] CSS modules support
* [ ] Scoped styles
* [ ] CSS-in-JS utilities
* [ ] PostCSS integration
* [ ] Design-system starter template

### Ecosystem

* [ ] Plugin system
* [ ] Middleware ecosystem
* [ ] Official starter templates
* [ ] Auth example
* [ ] Database example
* [ ] Dashboard example
* [ ] Blog example
* [ ] E-commerce example

## Future Exploration

These are longer-term research areas and are not guaranteed for a specific release.

### Advanced Framework Features

* [ ] Server-only component model
* [ ] Micro-frontend support
* [ ] WASM-powered compiler paths
* [ ] Rust-based compiler backend
* [ ] Advanced build graph optimizer
* [ ] Persistent build cache

### Tooling

* [ ] VS Code extension
* [ ] Speed.js DevTools
* [ ] Visual route explorer
* [ ] Performance profiler
* [ ] Bundle analyzer UI
* [ ] Migration tools

### Ecosystem

* [ ] Official component library
* [ ] Community plugin registry
* [ ] Theme system
* [ ] Template marketplace
* [ ] Framework benchmark dashboard
