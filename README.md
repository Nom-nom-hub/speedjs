# Speed.js

A compiler-first, full-stack TypeScript framework focused on extreme speed, small bundles, and fine-grained DOM updates.

## Philosophy

Speed.js combines the best ideas from modern frameworks:
- **Simple like React** - component-based UI with JSX
- **Updates like Solid** - fine-grained signal-driven DOM updates
- **Ships like Astro** - static HTML with opt-in hydration
- **Builds fast** - Vite/Rolldown-compatible tooling

## Quick Start

```bash
# Create a new app
pnpm create @speedjs/app my-app

# Or manually
pnpm install
pnpm dev
```

## Features

- **Signal-based reactivity** - fine-grained updates without virtual DOM
- **File-based routing** - automatic route discovery and generation
- **Server-side rendering** - built-in SSR with streaming support
- **API routes** - first-class backend endpoints
- **Performance budgets** - enforce bundle size and build time limits
- **Type-safe** - full TypeScript support throughout
- **Zero React dependency** - lightweight, from-scratch runtime

## Project Structure

```
speed-js/
├── packages/
│   ├── core/         # Reactive engine (signals, computed, effects)
│   ├── dom/          # DOM renderer and JSX runtime
│   ├── compiler/     # TSX transform and optimization pipeline
│   ├── router/       # File-based routing system
│   ├── server/       # SSR, API routes, middleware
│   ├── vite/         # Vite plugin integration
│   ├── cli/          # Command-line interface
│   ├── bench/        # Benchmarking system
│   └── testing/      # Testing utilities
├── examples/
│   └── starter/      # Example application
└── docs/             # Documentation
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build all packages
pnpm build

# Run starter example
pnpm dev

# Run benchmarks
pnpm bench
```

## License

MIT
