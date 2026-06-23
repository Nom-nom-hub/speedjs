# Introduction to Speed.js

Speed.js is a compiler-first, full-stack TypeScript framework focused on extreme speed, small bundles, and fine-grained DOM updates.

## What is Speed.js?

Speed.js combines the best ideas from modern frameworks:

- **Simple like React** - component-based UI with JSX
- **Updates like Solid** - fine-grained signal-driven DOM updates
- **Ships like Astro** - static HTML with opt-in hydration
- **Builds fast** - Vite/Rolldown-compatible tooling

## Why Speed.js?

Modern frameworks often trade one performance metric for another. React's virtual DOM is easy to use but can be slow with large trees. Solid is fast but has a steeper learning curve. Astro ships static HTML but lacks interactivity.

Speed.js aims to provide:
- **Developer experience** that feels familiar to React developers
- **Runtime performance** that matches or beats SolidJS
- **Build performance** that leverages modern tooling
- **Bundle sizes** that stay small by design

## Core Principles

1. **Compiler-first** - The framework analyzes your code at build time to optimize output
2. **Signal-based reactivity** - Fine-grained updates without virtual DOM diffing
3. **File-based routing** - Automatic route discovery and generation
4. **Type-safe** - Full TypeScript support throughout
5. **Performance budgets** - First-class enforcement of performance goals

## How it Works

Speed.js uses a unique approach:

1. **Signals track dependencies** at the component level
2. **Components execute once** where possible, avoiding unnecessary re-renders
3. **The compiler optimizes** static regions at build time
4. **The router generates** optimal client and server bundles

This combination results in:
- Fast initial page loads
- Minimal JavaScript shipped to the browser
- Instant UI updates without virtual DOM
- Simple, predictable mental model

## What's Next?

- [Quickstart](./quickstart.md) - Get up and running in 5 minutes
- [Signals](./signals.md) - Learn the reactive system
- [Components](./components.md) - Build UI components
- [Routing](./routing.md) - Set up file-based routing
