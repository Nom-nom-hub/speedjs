# Speed.js Benchmarks

This directory contains the controlled benchmark apps and comparison runner.

## Structure

```
benchmarks/
  config.ts                    — Comparison configuration
  run-comparison.ts           — Comparison runner script
  README.md                   — This file
  apps/
    speedjs-starter/          — Speed.js control app
    nextjs-starter/           — Next.js control app (future)
    react-vite-starter/       — React+Vite control app (future)
    ...
```

## How Comparisons Work

1. Each app in `apps/` implements the same feature set (homepage, counter, dynamic route, API health, SSR, static)
2. The comparison runner builds each app and measures the same metrics
3. Results are saved to `.benchmarks/comparisons/latest-comparison.json`
4. The website reads this file to show comparison data

## Rules

- Same machine
- Same Node version
- Same package manager where possible
- Same route scenarios
- Same number of runs (7 total — 2 warmup, 5 measured)
- Production build only
- Median reported
- Raw logs saved
- App source committed
- Lockfiles committed
- No artificial slowdowns
- No unfair optimizations

## Running

```bash
# Install all benchmark apps
cd benchmarks/apps/speedjs-starter && pnpm install

# Run the comparison
npx tsx benchmarks/run-comparison.ts
```

## Adding a New Framework

1. Create `benchmarks/apps/<name>-starter/` with:
   - Homepage route
   - Counter component
   - Dynamic route `[id]`
   - API health route (where supported)
   - SSR route (where supported)
   - Static route
   - Similar styling
2. Add to `benchmarks/config.ts` `comparisonApps` array
3. Run the comparison

## Current Status

Only `speedjs-starter` is currently available. Comparisons with other frameworks will be added in a future update.
