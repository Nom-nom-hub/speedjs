# Performance Budgets

Speed.js has first-class support for performance budgets. Enforce limits on bundle size, build time, and render time.

## Configuration

Configure performance budgets in `speed.config.ts`:

```typescript
import type { PerformanceBudget } from '@speedjs/bench';

export default {
  performance: {
    maxInitialJS: '40kb',
    maxRouteJS: '25kb',
    maxBuildMs: 3000,
    maxHydrationMs: 50,
  } as PerformanceBudget,
};
```

## Budget Options

- `maxInitialJS` - Maximum size of initial JavaScript bundle
- `maxRouteJS` - Maximum size of any route bundle
- `maxBuildMs` - Maximum build time in milliseconds
- `maxHydrationMs` - Maximum hydration time in milliseconds

## Size Units

Size budgets support the following units:

- `b` - bytes
- `kb` - kilobytes (default)
- `mb` - megabytes
- `gb` - gigabytes

```typescript
maxInitialJS: '40kb'   // 40 kilobytes
maxInitialJS: '40960b' // 40960 bytes
maxInitialJS: '0.04mb' // 0.04 megabytes
```

## Checking Budgets

Run the benchmark to check against budgets:

```bash
speed bench
```

Output:

```
Speed.js Benchmark Report

Dev server boot: 320ms
Production build: 1.8s
Initial JS: 14.2kb
Route render: 4ms
API response: 2ms

✓ All performance budgets passed
```

## Budget Failures

When a budget fails, you'll see:

```
Performance budget failed

Route: /dashboard
Initial JS: 92kb
Limit: 40kb

Suggestions:
- Split heavy components
- Lazy load charts
- Convert interactive widgets into islands
- Move non-interactive work to the server
```

## Build-time Enforcement

Configure the build to fail when budgets are exceeded:

```typescript
// speed.config.ts
export default {
  performance: {
    maxInitialJS: '40kb',
    failOnBudgetExceeded: true,
  },
};
```

## CI/CD Integration

Add budget checks to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Run benchmarks
  run: pnpm bench

- name: Check budgets
  run: pnpm build
```

## Snapshot Comparison

Compare benchmarks over time:

```bash
speed bench --snapshot
speed bench --compare
```

Output:

```
Benchmark Comparison

Dev server boot: 320ms (+20ms)
Production build: 1.8s (-100ms)
Initial JS: 14.2kb (+0.5kb)
Route render: 4ms (0ms)
API response: 2ms (-1ms)
```

## Best Practices

- Start with conservative budgets
- Tighten budgets as you optimize
- Monitor budgets in CI/CD
- Use code splitting to reduce bundle size
- Lazy load heavy components
- Move work to the server when possible
- Regularly review budget failures

## Troubleshooting

### Bundle Size Too Large

- Enable compression (gzip/brotli)
- Split routes dynamically
- Use tree shaking
- Remove unused dependencies
- Minimize vendor bundles

### Build Time Too Slow

- Use incremental builds
- Reduce TypeScript strictness
- Exclude unnecessary files
- Use faster hardware
- Parallelize builds

### Hydration Too Slow

- Reduce component complexity
- Minimize signal dependencies
- Use static regions
- Lazy load components
- Defer non-critical work
