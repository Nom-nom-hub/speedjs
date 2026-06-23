# Benchmarking

Speed.js includes built-in benchmarking to measure and track performance.

## Running Benchmarks

Run the full benchmark suite:

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
```

## Individual Metrics

The benchmark measures:

- **Dev server boot** - Time to start development server
- **Production build** - Time to build for production
- **Initial JS** - Size of initial JavaScript bundle
- **Route render** - Time to render a route on the client
- **API response** - Time to respond to API requests

## Snapshots

Save benchmark results for comparison:

```bash
speed bench --save snapshot.json
```

## Comparison

Compare current results with a snapshot:

```bash
speed bench --compare snapshot.json
```

Output:

```
Benchmark Comparison

Dev server boot: 320ms (-20ms)
Production build: 1.8s (+100ms)
Initial JS: 14.2kb (-0.5kb)
Route render: 4ms (0ms)
API response: 2ms (+1ms)
```

## Programmatic API

Use the benchmark API programmatically:

```typescript
import { runBenchmark, saveSnapshot, loadSnapshot, compareSnapshots } from '@speedjs/bench';

// Run benchmark
const results = await runBenchmark();

// Save snapshot
await saveSnapshot(results, './snapshot.json');

// Load snapshot
const previous = loadSnapshot('./snapshot.json');

// Compare
compareSnapshots(results, previous);
```

## Custom Benchmarks

Add custom benchmarks:

```typescript
import { Bench } from 'tinybench';

const bench = new Bench({ time: 100 });

bench
  .add('Signal read', () => {
    const count = signal(0);
    const value = count.value;
  })
  .add('Signal write', () => {
    const count = signal(0);
    count.value = 1;
  });

await bench.run();
console.table(bench.table());
```

## Performance Budgets

Benchmark results are checked against performance budgets:

```typescript
import { checkBudgets, printBudgetReport } from '@speedjs/bench';

const budget = {
  maxInitialJS: '40kb',
  maxBuildMs: 3000,
  maxHydrationMs: 50,
};

const check = checkBudgets(results, budget);
printBudgetReport(check);
```

## CI/CD Integration

Add benchmarks to your CI pipeline:

```yaml
# .github/workflows/bench.yml
name: Benchmark

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm bench
```

## Tracking Over Time

Track benchmarks over time to detect regressions:

1. Save snapshots on every build
2. Compare against baseline
3. Alert on significant regressions
4. Monitor trends

## Best Practices

- Run benchmarks regularly
- Compare against a stable baseline
- Monitor trends over time
- Alert on regressions
- Optimize based on data
- Keep hardware consistent
- Use realistic test cases

## Interpreting Results

### Good Results

- Dev server boot: < 500ms
- Production build: < 3s
- Initial JS: < 50kb
- Route render: < 10ms
- API response: < 5ms

### Needs Improvement

- Dev server boot: > 1s
- Production build: > 5s
- Initial JS: > 100kb
- Route render: > 50ms
- API response: > 20ms

## Troubleshooting

### Slow Dev Server Boot

- Reduce number of routes
- Optimize configuration
- Use faster hardware
- Clear cache

### Slow Production Build

- Enable incremental builds
- Reduce TypeScript strictness
- Exclude unnecessary files
- Use parallel builds

### Large Bundle Size

- Enable code splitting
- Remove unused dependencies
- Use tree shaking
- Minimize vendor bundles
